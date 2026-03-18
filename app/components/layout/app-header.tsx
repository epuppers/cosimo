import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  ChevronRight,
  ArrowLeft,
  Sun,
  Moon,
} from "lucide-react";
import { Switch } from "~/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { CloudStorageSettings } from "~/components/settings/cloud-storage-settings";
import { useUIStore } from "~/stores/ui-store";
import { useThemeStore } from "~/stores/theme-store";
import { getTasks, getCalendar, getUsage } from "~/services/panels";
import type { TaskData, CalendarData, UsageData } from "~/services/types";

// ======== Mode Tabs ========

/** Custom SVG icons matching the reference prototype */
function ChatIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="12" height="12">
      <path d="M1 3h14v9H5l-4 3v-3H1z" />
    </svg>
  );
}

function WorkflowsIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="12" height="12">
      <circle cx="8" cy="8" r="2.5" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" />
    </svg>
  );
}

function GaugeIcon() {
  return (
    <svg viewBox="0 0 16 12" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="11">
      <path d="M1 11 A7 7 0 0 1 15 11" />
      <line x1="8" y1="11" x2="10.5" y2="4" strokeWidth="2" strokeLinecap="square" />
      <rect x="6.5" y="9.5" width="3" height="3" fill="currentColor" stroke="none" />
    </svg>
  );
}

const TABS = [
  { label: "Chat", path: "/chat", icon: ChatIcon },
  { label: "Workflows", path: "/workflows", icon: WorkflowsIcon },
] as const;

/** Determines which tab is active based on the current route */
function useActiveTab() {
  const location = useLocation();
  const path = location.pathname;
  if (path.startsWith("/workflows")) return "/workflows";
  return "/chat";
}

// ======== Task Panel Content ========

/** Renders the full task list inside the task popover */
function TaskPanelContent({ tasks }: { tasks: TaskData[] }) {
  return (
    <div>
      <div className="flex items-center justify-between px-3 py-2 font-mono text-[0.625rem] font-bold uppercase tracking-[0.12em] text-taupe-3 bg-off-white border-b border-taupe-2 dark:bg-surface-2 dark:border-b-surface-3">
        <span>Assigned Tasks</span>
        <span className="inline-flex min-w-[14px] items-center justify-center rounded-[var(--r-sm)] bg-red px-[5px] font-[family-name:var(--mono)] text-[9px] font-bold text-white"
          style={{ border: '1px solid', borderColor: 'var(--red-hi) var(--red-lo) var(--red-lo) var(--red-hi)' }}>
          {tasks.length}
        </span>
      </div>

      <div>
        {tasks.map((task, i) => (
          <div
            key={i}
            className={cn(
              "flex items-start gap-2 p-[8px_12px] border-b border-taupe-2 dark:border-surface-3 cursor-pointer transition-[background] duration-100 hover:bg-off-white dark:hover:bg-surface-2",
              task.urgent && "border-l-[3px] border-l-red"
            )}
          >
            <div className={cn(
              "w-[7px] h-[7px] bg-taupe-3 border border-t-taupe-2 border-l-taupe-2 border-b-taupe-4 border-r-taupe-4 shrink-0 mt-1 rounded-[var(--r-md)]",
              task.urgent && "bg-red border-t-[var(--red-hi)] border-l-[var(--red-hi)] border-b-[var(--red-lo)] border-r-[var(--red-lo)]"
            )} />
            <div className="min-w-0 flex-1">
              <div className="font-mono text-[0.6875rem] font-semibold text-taupe-5">{task.title}</div>
              <div className="font-mono text-[0.625rem] text-taupe-3 mt-0.5">{task.meta}</div>
            </div>
            {task.urgent && (
              <span className="font-mono text-[0.5625rem] font-bold shrink-0 tracking-[0.05em] rounded-[var(--r-sm)] uppercase text-red">Urgent</span>
            )}
          </div>
        ))}
      </div>

      <button type="button" className="px-3 py-2 font-mono text-[0.6875rem] font-semibold text-violet-3 cursor-pointer border-t border-taupe-2 text-center uppercase tracking-[0.05em] bg-transparent w-full hover:bg-berry-1 hover:text-berry-5 dark:border-t-surface-3 dark:hover:text-berry-3">
        View all tasks
      </button>
    </div>
  );
}

// ======== Calendar Panel Content ========

/** Builds the day cells for March 2026 mini calendar */
function buildMarch2026Grid(eventDays: Set<number>, today: number) {
  // March 1, 2026 = Sunday (day index 0)
  const startDay = 0; // Sunday
  const daysInMonth = 31;
  const cells: { day: number | null; isToday: boolean; hasEvent: boolean }[] = [];

  // Offset cells before the 1st
  for (let i = 0; i < startDay; i++) {
    cells.push({ day: null, isToday: false, hasEvent: false });
  }

  // Day cells
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      day: d,
      isToday: d === today,
      hasEvent: eventDays.has(d),
    });
  }

  return cells;
}

/** Renders the calendar panel with mini grid + event list */
function CalendarPanelContent({ calendar }: { calendar: CalendarData }) {
  // Extract day numbers from event meta strings (e.g. "Mar 12, 10:00 AM" → 12)
  const eventDays = useMemo(() => {
    const days = new Set<number>();
    for (const ev of calendar.events) {
      const match = ev.meta.match(/Mar\s+(\d+)/);
      if (match) days.add(parseInt(match[1], 10));
    }
    return days;
  }, [calendar.events]);

  const cells = useMemo(() => buildMarch2026Grid(eventDays, 14), [eventDays]);
  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div>
      <div className="px-3 py-2 font-mono text-[0.625rem] font-bold uppercase tracking-[0.12em] text-taupe-3 bg-off-white border-b border-taupe-2 dark:bg-surface-2 dark:border-b-surface-3">
        {calendar.month}
      </div>

      {/* Mini calendar grid */}
      <div className="p-[8px_12px]">
        <div className="font-mono text-[0.5625rem] font-bold text-taupe-3 tracking-[0.1em] grid grid-cols-7 text-center mb-1">
          {weekDays.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {cells.map((cell, i) => (
            <div
              key={i}
              className={cn(
                "h-[22px] w-[22px] flex items-center justify-center font-mono text-[0.625rem] text-taupe-5 cursor-pointer mx-auto border border-transparent transition-all duration-100 rounded-[var(--r-md)] hover:bg-berry-1 hover:border-taupe-2",
                cell.day === null && "text-transparent pointer-events-none",
                cell.isToday && "bg-violet-3 text-white font-bold border-t-violet-2 border-l-violet-2 border-b-[var(--violet-5)] border-r-[var(--violet-5)]",
                cell.hasEvent && !cell.isToday && "border-b-2 border-b-blue-3"
              )}
            >
              {cell.day}
            </div>
          ))}
        </div>
      </div>

      {/* Events list */}
      <div>
        <div className="px-3 py-2 font-mono text-[0.625rem] font-bold uppercase tracking-[0.12em] text-taupe-3 bg-off-white border-b border-taupe-2 dark:bg-surface-2 dark:border-b-surface-3">Upcoming</div>
        {calendar.events.map((ev, i) => (
          <div key={i} className="flex items-start gap-2 p-[7px_12px] border-b border-taupe-2 dark:border-surface-3">
            <div
              className="w-[7px] h-[7px] shrink-0 mt-1 border border-black/15 rounded-[var(--r-md)]"
              style={{ background: ev.color }}
            />
            <div>
              <div className="font-mono text-[0.6875rem] font-semibold text-taupe-5">{ev.title}</div>
              <div className="font-mono text-[0.625rem] text-taupe-3 mt-px">{ev.meta}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ======== Usage Panel Content ========

/** Renders the usage statistics panel */
function UsagePanelContent({ usage }: { usage: UsageData }) {
  // Parse the percentage for the bar width
  const percent = parseFloat(usage.percentUsed) || 0;

  return (
    <div>
      <div className="px-3 py-2 font-mono text-[0.625rem] font-bold uppercase tracking-[0.12em] text-taupe-3 bg-off-white border-b border-taupe-2 dark:bg-surface-2 dark:border-b-surface-3">
        Credit Usage — March 2026
      </div>

      {/* Usage gauge readout */}
      <div className="p-[8px_12px_4px]">
        <div className="relative flex flex-col items-center">
          <div className="font-pixel text-[1.375rem] text-taupe-5 tracking-[0.5px]">{usage.percentUsed}</div>
          <div className="font-mono text-[0.625rem] text-taupe-3 uppercase tracking-[0.05em]">used this period</div>
        </div>
        {/* Progress bar */}
        <div className="mt-2 h-2 w-full overflow-hidden rounded-[var(--r-sm)] bg-taupe-1">
          <div
            className="h-full rounded-[var(--r-sm)] bg-gradient-to-r from-violet-3 via-berry-3 to-red transition-all"
            style={{ width: `${Math.min(percent, 100)}%` }}
          />
        </div>
      </div>

      {/* Stats rows */}
      <div className="p-[4px_12px_2px] pb-2">
        <div className="flex justify-between items-center p-[3px_0]">
          <span className="font-mono text-[0.6875rem] text-taupe-3 uppercase tracking-[0.05em]">Plan Limit</span>
          <span className="font-mono text-[0.6875rem] font-semibold text-taupe-5">{usage.planLimit}</span>
        </div>
        <div className="flex justify-between items-center p-[3px_0]">
          <span className="font-mono text-[0.6875rem] text-taupe-3 uppercase tracking-[0.05em]">Used</span>
          <span className="font-mono text-[0.6875rem] font-semibold text-taupe-5">{usage.used}</span>
        </div>
        <div className="flex justify-between items-center p-[3px_0]">
          <span className="font-mono text-[0.6875rem] text-taupe-3 uppercase tracking-[0.05em]">Remaining</span>
          <span className="font-mono text-[0.6875rem] font-semibold text-violet-3">{usage.remaining}</span>
        </div>
        <div className="h-px bg-taupe-1 my-1" />
        <div className="flex justify-between items-center p-[3px_0]">
          <span className="font-mono text-[0.6875rem] text-taupe-3 uppercase tracking-[0.05em]">Overage</span>
          <span className="font-mono text-[0.6875rem] font-semibold text-taupe-5">{usage.overage}</span>
        </div>
        <div className="flex justify-between items-center p-[3px_0]">
          <span className="font-mono text-[0.6875rem] text-taupe-3 uppercase tracking-[0.05em]">Renews</span>
          <span className="font-mono text-[0.6875rem] font-semibold text-taupe-5">{usage.renews}</span>
        </div>
      </div>
    </div>
  );
}


// ======== Header Panel Buttons ========

/** Task panel popover button with badge */
function TaskButton() {
  const taskPanelOpen = useUIStore((s) => s.taskPanelOpen);
  const toggleTaskPanel = useUIStore((s) => s.toggleTaskPanel);
  const [tasks, setTasks] = useState<TaskData[]>([]);

  useEffect(() => {
    getTasks().then(setTasks);
  }, []);

  return (
    <Popover open={taskPanelOpen} onOpenChange={(open) => { if (open !== taskPanelOpen) toggleTaskPanel(); }}>
      <PopoverTrigger
        className="relative size-7 [[data-a11y-labels=show]_&]:size-auto [[data-a11y-labels=show]_&]:h-7 [[data-a11y-labels=show]_&]:px-2 flex items-center justify-center bg-transparent border border-transparent cursor-pointer transition-all duration-150 rounded-[var(--r-md)] p-0 text-taupe-4 hover:bg-berry-1 hover:border-t-taupe-2 hover:border-l-taupe-2 hover:border-b-taupe-3 hover:border-r-taupe-3 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2 dark:hover:bg-berry-1"
        aria-label="Assigned Tasks"
      >
        <span className="text-sm text-taupe-4 [[data-a11y-labels=show]_&]:hidden">◈</span>
        <span className="hidden [[data-a11y-labels=show]_&]:inline font-[family-name:var(--mono)] font-semibold text-[0.625rem] tracking-[0.03em] whitespace-nowrap">Tasks</span>
        {tasks.length > 0 && (
          <span className={cn(
            "th-badge absolute -right-0.5 -top-0.5 flex min-w-[14px] h-[14px] items-center justify-center rounded-[var(--r-sm)] bg-red border border-solid border-[var(--red-hi)] font-[family-name:var(--mono)] text-[9px] font-bold text-white px-0.5",
            "[[data-a11y-labels=show]_&]:relative [[data-a11y-labels=show]_&]:right-auto [[data-a11y-labels=show]_&]:top-auto [[data-a11y-labels=show]_&]:ml-1.5"
          )}
            style={{ borderColor: 'var(--red-hi) var(--red-lo) var(--red-lo) var(--red-hi)' }}>
            {tasks.length}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="bg-white border-2 border-solid border-t-taupe-2 border-l-taupe-2 border-b-taupe-3 border-r-taupe-3 rounded-[var(--r-md)] overflow-hidden dark:border-surface-0 w-[300px] p-0">
        <TaskPanelContent tasks={tasks} />
      </PopoverContent>
    </Popover>
  );
}

/** Calendar panel popover button */
function CalendarButton() {
  const calendarPanelOpen = useUIStore((s) => s.calendarPanelOpen);
  const toggleCalendarPanel = useUIStore((s) => s.toggleCalendarPanel);
  const [calendar, setCalendar] = useState<CalendarData | null>(null);

  useEffect(() => {
    getCalendar().then(setCalendar);
  }, []);

  return (
    <Popover open={calendarPanelOpen} onOpenChange={(open) => { if (open !== calendarPanelOpen) toggleCalendarPanel(); }}>
      <PopoverTrigger
        className="relative size-7 [[data-a11y-labels=show]_&]:size-auto [[data-a11y-labels=show]_&]:h-7 [[data-a11y-labels=show]_&]:px-2 flex items-center justify-center bg-transparent border border-transparent cursor-pointer transition-all duration-150 rounded-[var(--r-md)] p-0 text-taupe-4 hover:bg-berry-1 hover:border-t-taupe-2 hover:border-l-taupe-2 hover:border-b-taupe-3 hover:border-r-taupe-3 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2 dark:hover:bg-berry-1"
        aria-label="Calendar"
      >
        <span className="text-sm text-taupe-4 [[data-a11y-labels=show]_&]:hidden">▦</span>
        <span className="hidden [[data-a11y-labels=show]_&]:inline font-[family-name:var(--mono)] font-semibold text-[0.625rem] tracking-[0.03em] whitespace-nowrap">Calendar</span>
      </PopoverTrigger>
      <PopoverContent align="end" className="bg-white border-2 border-solid border-t-taupe-2 border-l-taupe-2 border-b-taupe-3 border-r-taupe-3 rounded-[var(--r-md)] overflow-hidden dark:border-surface-0 w-[280px] p-0">
        {calendar ? (
          <CalendarPanelContent calendar={calendar} />
        ) : (
          <div className="p-3 font-[family-name:var(--mono)] text-[11px] text-taupe-3">Loading...</div>
        )}
      </PopoverContent>
    </Popover>
  );
}

/** Usage panel popover button */
function UsageButton() {
  const usagePanelOpen = useUIStore((s) => s.usagePanelOpen);
  const toggleUsagePanel = useUIStore((s) => s.toggleUsagePanel);
  const [usage, setUsage] = useState<UsageData | null>(null);

  useEffect(() => {
    getUsage().then(setUsage);
  }, []);

  return (
    <Popover open={usagePanelOpen} onOpenChange={(open) => { if (open !== usagePanelOpen) toggleUsagePanel(); }}>
      <PopoverTrigger
        className="relative size-7 [[data-a11y-labels=show]_&]:size-auto [[data-a11y-labels=show]_&]:h-7 [[data-a11y-labels=show]_&]:px-2 flex items-center justify-center bg-transparent border border-transparent cursor-pointer transition-all duration-150 rounded-[var(--r-md)] p-0 text-taupe-4 hover:bg-berry-1 hover:border-t-taupe-2 hover:border-l-taupe-2 hover:border-b-taupe-3 hover:border-r-taupe-3 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2 dark:hover:bg-berry-1"
        aria-label="Usage"
      >
        <span className="[[data-a11y-labels=show]_&]:hidden"><GaugeIcon /></span>
        <span className="hidden [[data-a11y-labels=show]_&]:inline font-[family-name:var(--mono)] font-semibold text-[0.625rem] tracking-[0.03em] whitespace-nowrap">Usage</span>
      </PopoverTrigger>
      <PopoverContent align="end" className="bg-white border-2 border-solid border-t-taupe-2 border-l-taupe-2 border-b-taupe-3 border-r-taupe-3 rounded-[var(--r-md)] overflow-hidden dark:border-surface-0 w-[300px] p-0">
        {usage ? (
          <UsagePanelContent usage={usage} />
        ) : (
          <div className="p-3 font-[family-name:var(--mono)] text-[11px] text-taupe-3">Loading...</div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// ======== Profile Avatar ========

const FONT_SIZE_LABELS = ["Default", "105%", "110%", "115%", "120%"] as const;

/** Appearance & Accessibility sub-panel content */
function AppearancePanel({ onBack }: { onBack: () => void }) {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const purpleIntensity = useThemeStore((s) => s.purpleIntensity);
  const setPurpleIntensity = useThemeStore((s) => s.setPurpleIntensity);
  const fontSizeLevel = useThemeStore((s) => s.fontSizeLevel);
  const setFontSizeLevel = useThemeStore((s) => s.setFontSizeLevel);
  const dyslexiaFont = useThemeStore((s) => s.dyslexiaFont);
  const toggleDyslexiaFont = useThemeStore((s) => s.toggleDyslexiaFont);
  const reducedMotion = useThemeStore((s) => s.reducedMotion);
  const toggleReducedMotion = useThemeStore((s) => s.toggleReducedMotion);
  const highContrast = useThemeStore((s) => s.highContrast);
  const toggleHighContrast = useThemeStore((s) => s.toggleHighContrast);
  const iconLabels = useThemeStore((s) => s.iconLabels);
  const toggleIconLabels = useThemeStore((s) => s.toggleIconLabels);

  return (
    <div className="flex flex-col" style={{ display: 'flex' }}>
      {/* Back header */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 p-[8px_12px] cursor-pointer transition-[background] duration-100 bg-transparent border-none w-full hover:bg-berry-1 dark:hover:bg-[rgba(var(--berry-3-rgb),0.1)] active:bg-berry-2 dark:active:bg-[rgba(var(--berry-3-rgb),0.15)] focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-[-2px]"
      >
        <span className="text-taupe-4 dark:text-taupe-3 flex items-center">
          <ArrowLeft className="size-3.5" />
        </span>
        <span className="font-mono text-[0.6875rem] font-bold text-taupe-5">Appearance &amp; Accessibility</span>
      </button>

      <div className="h-px bg-taupe-1 dark:bg-taupe-2 my-0.5" />

      {/* Dark mode toggle */}
      <div className="flex items-center justify-between p-[8px_12px] cursor-pointer bg-transparent border-none w-full focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-[-2px] hover:bg-berry-1 dark:hover:bg-[rgba(var(--berry-3-rgb),0.1)]" role="button" tabIndex={0} onClick={toggleTheme} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleTheme(); }}>
        <span className="font-mono text-[0.6875rem] font-semibold text-taupe-5 flex items-center gap-1.5">
          {theme === "dark" ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
          Dark mode
        </span>
        <Switch
          size="sm"
          checked={theme === "dark"}
          onCheckedChange={toggleTheme}
        />
      </div>

      {/* Purple intensity slider */}
      <div className="p-[8px_12px_10px]">
        <div className="flex justify-between items-center mb-1.5">
          <span className="font-mono text-[0.6875rem] font-semibold text-taupe-5 flex items-center gap-1.5">Purple intensity</span>
          <span className="font-mono text-[0.625rem] font-semibold text-violet-3">{purpleIntensity}%</span>
        </div>
        <input
          type="range"
          className="profile-menu-slider"
          min={0}
          max={150}
          value={purpleIntensity}
          onChange={(e) => setPurpleIntensity(Number(e.target.value))}
        />
        <div className="flex justify-between mt-1 font-mono text-[0.5625rem] text-taupe-3 tracking-[0.04em]">
          <span>Subtle</span>
          <span>Default</span>
          <span>Vivid</span>
        </div>
      </div>

      {/* Text size slider */}
      <div className="p-[8px_12px_10px]">
        <div className="flex justify-between items-center mb-1.5">
          <span className="font-mono text-[0.6875rem] font-semibold text-taupe-5 flex items-center gap-1.5">Text size</span>
          <span className="font-mono text-[0.625rem] font-semibold text-violet-3">{FONT_SIZE_LABELS[fontSizeLevel]}</span>
        </div>
        <input
          type="range"
          className="profile-menu-slider"
          min={0}
          max={4}
          step={1}
          value={fontSizeLevel}
          onChange={(e) => setFontSizeLevel(Number(e.target.value))}
        />
        <div className="flex justify-between mt-1 font-mono text-[0.5625rem] text-taupe-3 tracking-[0.04em]">
          <span>100%</span>
          <span>110%</span>
          <span>120%</span>
        </div>
      </div>

      <div className="h-px bg-taupe-1 dark:bg-taupe-2 my-0.5" />

      {/* Accessibility section */}
      <div className="p-[8px_12px_4px] font-mono text-[9px] font-bold text-taupe-3 uppercase tracking-[0.1em]">Accessibility</div>

      {/* Dyslexia-friendly font */}
      <div className="flex items-center justify-between p-[8px_12px] cursor-pointer bg-transparent border-none w-full focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-[-2px] hover:bg-berry-1 dark:hover:bg-[rgba(var(--berry-3-rgb),0.1)]">
        <span className="font-mono text-[0.6875rem] font-semibold text-taupe-5 flex items-center gap-1.5">Dyslexia-friendly font</span>
        <Switch
          size="sm"
          checked={dyslexiaFont}
          onCheckedChange={toggleDyslexiaFont}
        />
      </div>

      {/* Reduced motion */}
      <div className="flex items-center justify-between p-[8px_12px] cursor-pointer bg-transparent border-none w-full focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-[-2px] hover:bg-berry-1 dark:hover:bg-[rgba(var(--berry-3-rgb),0.1)]">
        <span className="font-mono text-[0.6875rem] font-semibold text-taupe-5 flex items-center gap-1.5">Reduced motion</span>
        <Switch
          size="sm"
          checked={reducedMotion}
          onCheckedChange={toggleReducedMotion}
        />
      </div>

      {/* High contrast & focus */}
      <div className="flex items-center justify-between p-[8px_12px] cursor-pointer bg-transparent border-none w-full focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-[-2px] hover:bg-berry-1 dark:hover:bg-[rgba(var(--berry-3-rgb),0.1)]">
        <span className="font-mono text-[0.6875rem] font-semibold text-taupe-5 flex items-center gap-1.5">High contrast &amp; focus</span>
        <Switch
          size="sm"
          checked={highContrast}
          onCheckedChange={toggleHighContrast}
        />
      </div>

      {/* Icon labels */}
      <div className="flex items-center justify-between p-[8px_12px] cursor-pointer bg-transparent border-none w-full focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-[-2px] hover:bg-berry-1 dark:hover:bg-[rgba(var(--berry-3-rgb),0.1)]">
        <span className="font-mono text-[0.6875rem] font-semibold text-taupe-5 flex items-center gap-1.5">Icon labels</span>
        <Switch
          size="sm"
          checked={iconLabels}
          onCheckedChange={toggleIconLabels}
        />
      </div>
    </div>
  );
}

/** Profile avatar button with dropdown — main menu + appearance sub-panel */
function ProfileAvatar() {
  const navigate = useNavigate();
  const profileMenuOpen = useUIStore((s) => s.profileMenuOpen);
  const toggleProfileMenu = useUIStore((s) => s.toggleProfileMenu);
  const [view, setView] = useState<"main" | "appearance">("main");
  const [settingsOpen, setSettingsOpen] = useState(false);

  /** Reset to main view when dropdown opens */
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open !== profileMenuOpen) toggleProfileMenu();
      if (open) setView("main");
    },
    [profileMenuOpen, toggleProfileMenu],
  );

  const handleAccountSettings = useCallback(() => {
    setSettingsOpen(true);
    if (profileMenuOpen) toggleProfileMenu();
  }, [profileMenuOpen, toggleProfileMenu]);

  return (
    <>
    <Popover open={profileMenuOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        aria-label="Profile menu"
        className="flex items-center gap-2 cursor-pointer py-[3px] px-1.5 border border-transparent transition-all duration-150 rounded-[var(--r-md)] hover:bg-berry-1 hover:border-t-taupe-2 hover:border-l-taupe-2 hover:border-b-taupe-3 hover:border-r-taupe-3 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2 dark:hover:bg-berry-1"
      >
        <div className="size-6 bg-berry-3 border border-berry-2 flex items-center justify-center font-mono text-[0.6875rem] font-bold text-white shrink-0 rounded-[var(--r-md)] dark:text-[var(--text-light)]">E</div>
        <span className="font-mono text-[0.6875rem] font-semibold text-taupe-4 dark:text-taupe-5">Eliot Puplett</span>
      </PopoverTrigger>
      <PopoverContent
          align="end"
          sideOffset={6}
          className={cn(
            "border-2 border-solid",
            "border-t-taupe-2 border-r-taupe-3 border-b-taupe-3 border-l-taupe-2",
            "dark:border-surface-0",
            "bg-white dark:bg-surface-2",
            "shadow-none dark:shadow-none",
            "data-open:animate-none data-closed:animate-none duration-0",
            "overflow-hidden p-0 gap-0 w-auto",
          )}
          style={{ width: view === "appearance" ? 240 : 200 }}
        >
        {view === "main" ? (
          <div className="flex flex-col animate-[profile-slide-right_0.15s_ease-out]">
            {/* User info */}
            <div className="flex items-center gap-2.5 p-[12px_12px_10px]">
              <div className="w-8 h-8 rounded-full bg-violet-3 text-white font-mono text-[0.8125rem] font-bold flex items-center justify-center shrink-0">E</div>
              <div className="min-w-0">
                <div className="font-mono text-[0.6875rem] font-bold text-taupe-5 leading-[1.3]">Eliot Puplett</div>
                <div className="font-mono text-[0.625rem] text-taupe-3 leading-[1.3] overflow-hidden text-ellipsis whitespace-nowrap">e.puplett@medici.com</div>
              </div>
            </div>

            <div className="h-px bg-taupe-1 dark:bg-taupe-2 my-0.5" />

            {/* Appearance & Accessibility */}
            <button type="button" className="p-[8px_12px] font-mono text-[0.6875rem] font-semibold text-taupe-4 cursor-pointer transition-all duration-100 flex items-center justify-between uppercase tracking-[0.05em] bg-transparent border-none w-full text-left hover:bg-berry-1 hover:text-taupe-5 dark:hover:text-berry-3 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-[-2px]" onClick={() => setView("appearance")}>
              <span>Appearance &amp; Accessibility</span>
              <span className="text-taupe-3 flex items-center">
                <ChevronRight className="size-3.5" />
              </span>
            </button>

            {/* Account Settings */}
            <button type="button" className="p-[8px_12px] font-mono text-[0.6875rem] font-semibold text-taupe-4 cursor-pointer transition-all duration-100 flex items-center justify-between uppercase tracking-[0.05em] bg-transparent border-none w-full text-left hover:bg-berry-1 hover:text-taupe-5 dark:hover:text-berry-3 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-[-2px]" onClick={handleAccountSettings}>
              <span>Account Settings</span>
            </button>

            <div className="h-px bg-taupe-1 dark:bg-taupe-2 my-0.5" />

            {/* Sign Out */}
            <button type="button" className="p-[8px_12px] font-mono text-[0.6875rem] font-semibold text-red cursor-pointer transition-all duration-100 flex items-center justify-between uppercase tracking-[0.05em] bg-transparent border-none w-full text-left hover:bg-[rgba(var(--red-rgb),0.08)] hover:text-red focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-[-2px]" onClick={() => navigate("/login")}>
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <AppearancePanel onBack={() => setView("main")} />
        )}
      </PopoverContent>
    </Popover>

    <CloudStorageSettings open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}

// ======== App Header ========

/** Top bar with mode tabs (Chat, Workflows) and action icons (Tasks, Calendar, Usage, Profile) */
export function AppHeader() {
  const activeTab = useActiveTab();

  return (
    <header className="flex items-stretch bg-white border-b border-taupe-2 min-h-[38px] shrink-0 pl-1.5 gap-0 relative dark:border-surface-3" role="banner">
      {/* Left: Mode tabs */}
      <nav className="contents" aria-label="Main navigation">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.path;
          const TabIcon = tab.icon;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={cn(
                "top-tab px-4 font-mono text-[0.6875rem] font-semibold tracking-[0.05em] uppercase text-taupe-3 bg-taupe-1 border border-taupe-2 cursor-pointer flex items-center gap-1.5 transition-[color,background] duration-150 -mb-px mt-1.5 rounded-t-[var(--r-md)] relative z-[1] no-underline",
                "hover:text-taupe-5 hover:bg-berry-1",
                "dark:bg-[rgba(var(--black-rgb),0.25)] dark:border-surface-3 dark:text-taupe-3",
                "dark:hover:text-taupe-5 dark:hover:bg-berry-1",
                isActive && "active text-berry-5 bg-off-white border-t-taupe-2 border-r-taupe-2 border-b-transparent border-l-taupe-2 z-[2] mt-1 dark:text-taupe-5 dark:bg-off-white dark:border-t-surface-3 dark:border-r-surface-3 dark:border-b-transparent dark:border-l-surface-3",
              )}
            >
              <span className={cn(
                "text-[0.6875rem] opacity-50 inline-flex align-middle [&_svg]:block",
                isActive && "opacity-100 text-violet-3",
              )}><TabIcon /></span>
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right: Action icons + Profile */}
      <div className="flex items-center gap-2 mr-1.5">
        <TaskButton />
        <CalendarButton />
        <UsageButton />

        {/* Divider */}
        <div className="w-px h-5 bg-taupe-2 mx-0.5" />

        <ProfileAvatar />
      </div>
    </header>
  );
}
