import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useLocation } from "react-router";
import { toast } from "sonner";
import {
  CheckSquare,
  Calendar,
  BarChart3,
  ChevronRight,
  ArrowLeft,
  Settings,
  LogOut,
  Sun,
  Moon,
  Plus,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { Slider } from "~/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { useUIStore } from "~/stores/ui-store";
import { useThemeStore } from "~/stores/theme-store";
import { getTasks, getCalendar, getUsage } from "~/services/panels";
import type { TaskData, CalendarData, UsageData } from "~/services/types";

// ======== Mode Tabs ========

const TABS = [
  { label: "Chat", path: "/chat" },
  { label: "Workflows", path: "/workflows" },
  { label: "Brain", path: "/brain/memory" },
] as const;

/** Determines which tab is active based on the current route */
function useActiveTab() {
  const location = useLocation();
  const path = location.pathname;
  if (path.startsWith("/workflows")) return "/workflows";
  if (path.startsWith("/brain")) return "/brain/memory";
  return "/chat";
}

// ======== Task Panel Content ========

/** Renders the full task list inside the task popover */
function TaskPanelContent({ tasks }: { tasks: TaskData[] }) {
  return (
    <div>
      <div className="th-dropdown-header flex items-center justify-between">
        <span>Assigned Tasks</span>
        <span className="inline-flex min-w-[14px] items-center justify-center rounded-[var(--r-sm)] bg-[var(--red)] px-[5px] font-[family-name:var(--mono)] text-[9px] font-bold text-white"
          style={{ border: '1px solid', borderColor: 'var(--red-hi) var(--red-lo) var(--red-lo) var(--red-hi)' }}>
          {tasks.length}
        </span>
      </div>

      <div>
        {tasks.map((task, i) => (
          <div
            key={i}
            className={`task-item${task.urgent ? " urgent" : ""}`}
          >
            <div className={`task-dot`} />
            <div className="min-w-0 flex-1">
              <div className="task-title">{task.title}</div>
              <div className="task-meta">{task.meta}</div>
            </div>
            {task.urgent && (
              <span className="task-priority urgent-label">Urgent</span>
            )}
          </div>
        ))}
      </div>

      <button type="button" className="th-dropdown-footer">
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
      <div className="th-dropdown-header">
        {calendar.month}
      </div>

      {/* Mini calendar grid */}
      <div className="mini-cal">
        <div className="mini-cal-days">
          {weekDays.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="mini-cal-grid">
          {cells.map((cell, i) => (
            <div
              key={i}
              className={`mcg-day${
                cell.day === null
                  ? " empty"
                  : cell.isToday
                    ? " today"
                    : ""
              }${cell.hasEvent && !cell.isToday ? " has-event" : ""}`}
            >
              {cell.day}
            </div>
          ))}
        </div>
      </div>

      {/* Events list */}
      <div>
        <div className="th-dropdown-header">Upcoming</div>
        {calendar.events.map((ev, i) => (
          <div key={i} className="cal-event">
            <div
              className="cal-event-dot"
              style={{ background: ev.color }}
            />
            <div>
              <div className="cal-event-title">{ev.title}</div>
              <div className="cal-event-meta">{ev.meta}</div>
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
      <div className="th-dropdown-header">
        Credit Usage — March 2026
      </div>

      {/* Usage gauge readout */}
      <div className="usage-meter-wrap">
        <div className="usage-gauge">
          <div className="usage-gauge-value">{usage.percentUsed}</div>
          <div className="usage-gauge-unit">used this period</div>
        </div>
        {/* Progress bar */}
        <div className="mt-2 h-2 w-full overflow-hidden rounded-[var(--r-sm)] bg-[var(--taupe-1)]">
          <div
            className="h-full rounded-[var(--r-sm)] bg-gradient-to-r from-[var(--violet-3)] via-[var(--berry-3)] to-[var(--red)] transition-all"
            style={{ width: `${Math.min(percent, 100)}%` }}
          />
        </div>
      </div>

      {/* Stats rows */}
      <div className="usage-stats px-3 pb-2">
        <div className="usage-stat-row">
          <span className="usage-stat-label">Plan Limit</span>
          <span className="usage-stat-value">{usage.planLimit}</span>
        </div>
        <div className="usage-stat-row">
          <span className="usage-stat-label">Used</span>
          <span className="usage-stat-value">{usage.used}</span>
        </div>
        <div className="usage-stat-row">
          <span className="usage-stat-label">Remaining</span>
          <span className="usage-stat-value usage-stat-highlight">{usage.remaining}</span>
        </div>
        <div className="usage-stat-divider" />
        <div className="usage-stat-row">
          <span className="usage-stat-label">Overage</span>
          <span className="usage-stat-value">{usage.overage}</span>
        </div>
        <div className="usage-stat-row">
          <span className="usage-stat-label">Renews</span>
          <span className="usage-stat-value">{usage.renews}</span>
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
        className="top-icon-btn"
        aria-label="Assigned Tasks"
      >
        <CheckSquare className="size-3.5" />
        {tasks.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-[14px] h-[14px] items-center justify-center rounded-[var(--r-sm)] bg-[var(--red)] border border-solid border-[var(--red-hi)] font-[family-name:var(--mono)] text-[9px] font-bold text-white px-0.5"
            style={{ borderColor: 'var(--red-hi) var(--red-lo) var(--red-lo) var(--red-hi)' }}>
            {tasks.length}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="th-dropdown-panel w-[300px] p-0">
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
        className="top-icon-btn"
        aria-label="Calendar"
      >
        <Calendar className="size-3.5" />
      </PopoverTrigger>
      <PopoverContent align="end" className="th-dropdown-panel w-[280px] p-0">
        {calendar ? (
          <CalendarPanelContent calendar={calendar} />
        ) : (
          <div className="p-3 font-[family-name:var(--mono)] text-[11px] text-[var(--taupe-3)]">Loading...</div>
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
        className="top-icon-btn"
        aria-label="Usage"
      >
        <BarChart3 className="size-3.5" />
      </PopoverTrigger>
      <PopoverContent align="end" className="th-dropdown-panel w-[300px] p-0">
        {usage ? (
          <UsagePanelContent usage={usage} />
        ) : (
          <div className="p-3 font-[family-name:var(--mono)] text-[11px] text-[var(--taupe-3)]">Loading...</div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// ======== Profile Avatar ========

const FONT_SIZE_LABELS = ["Default", "105%", "110%", "115%", "120%"] as const;

/** Profile menu item row — reusable for main menu items */
function ProfileMenuItem({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground outline-none transition-colors hover:bg-accent focus-visible:bg-accent ${className}`}
    >
      {children}
    </button>
  );
}

/** Appearance & Accessibility sub-panel content */
function AppearancePanel({ onBack }: { onBack: () => void }) {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const purpleIntensity = useThemeStore((s) => s.purpleIntensity);
  const setPurpleIntensity = useThemeStore((s) => s.setPurpleIntensity);
  const fontSizeLevel = useThemeStore((s) => s.fontSizeLevel);
  const cycleFontSize = useThemeStore((s) => s.cycleFontSize);
  const dyslexiaFont = useThemeStore((s) => s.dyslexiaFont);
  const toggleDyslexiaFont = useThemeStore((s) => s.toggleDyslexiaFont);
  const reducedMotion = useThemeStore((s) => s.reducedMotion);
  const toggleReducedMotion = useThemeStore((s) => s.toggleReducedMotion);
  const highContrast = useThemeStore((s) => s.highContrast);
  const toggleHighContrast = useThemeStore((s) => s.toggleHighContrast);

  const handleSliderChange = useCallback(
    (val: number | readonly number[]) => {
      const v = Array.isArray(val) ? val[0] : val;
      setPurpleIntensity(v);
    },
    [setPurpleIntensity],
  );

  return (
    <div className="space-y-3">
      {/* Back header */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Back to profile menu"
        >
          <ArrowLeft className="size-3.5" />
        </button>
        <span className="font-[var(--font-pixel)] text-xs font-semibold text-foreground">
          Appearance
        </span>
      </div>

      {/* Dark mode */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-foreground">
          {theme === "dark" ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
          <span>Dark Mode</span>
        </div>
        <Switch
          size="sm"
          checked={theme === "dark"}
          onCheckedChange={toggleTheme}
        />
      </div>

      {/* Purple intensity */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground">Purple Intensity</span>
          <span className="font-[var(--font-mono)] text-[10px] text-muted-foreground">
            {purpleIntensity}%
          </span>
        </div>
        <Slider
          value={[purpleIntensity]}
          min={0}
          max={100}
          onValueChange={handleSliderChange}
        />
      </div>

      {/* Text size */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground">Text Size</span>
        <div className="flex items-center gap-1.5">
          <span className="font-[var(--font-mono)] text-[10px] text-muted-foreground">
            {FONT_SIZE_LABELS[fontSizeLevel]}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="size-6 p-0"
            onClick={cycleFontSize}
            aria-label="Cycle text size"
          >
            <Plus className="size-3" />
          </Button>
        </div>
      </div>

      {/* Separator */}
      <div className="h-px bg-border" />

      {/* Dyslexia font */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground">Dyslexia Font</span>
        <Switch
          size="sm"
          checked={dyslexiaFont}
          onCheckedChange={toggleDyslexiaFont}
        />
      </div>

      {/* Reduced motion */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground">Reduced Motion</span>
        <Switch
          size="sm"
          checked={reducedMotion}
          onCheckedChange={toggleReducedMotion}
        />
      </div>

      {/* High contrast */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground">High Contrast</span>
        <Switch
          size="sm"
          checked={highContrast}
          onCheckedChange={toggleHighContrast}
        />
      </div>
    </div>
  );
}

/** Profile avatar button with dropdown — main menu + appearance sub-panel */
function ProfileAvatar() {
  const profileMenuOpen = useUIStore((s) => s.profileMenuOpen);
  const toggleProfileMenu = useUIStore((s) => s.toggleProfileMenu);
  const [view, setView] = useState<"main" | "appearance">("main");

  /** Reset to main view when dropdown opens */
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open !== profileMenuOpen) toggleProfileMenu();
      if (open) setView("main");
    },
    [profileMenuOpen, toggleProfileMenu],
  );

  const handleAccountSettings = useCallback(() => {
    toast("Coming soon");
  }, []);

  return (
    <Popover open={profileMenuOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        aria-label="Profile menu"
        className="top-profile-avatar"
      >
        E
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-2">
        {view === "main" ? (
          <div>
            {/* User info */}
            <div className="flex items-center gap-2.5 px-2 py-2">
              <div className="flex size-8 items-center justify-center rounded-[var(--r-md)] bg-[var(--violet-3)] font-[family-name:var(--mono)] text-[11px] font-bold text-white">
                E
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground">Eliot Puplett</div>
                <div className="font-[var(--font-mono)] text-[10px] text-muted-foreground">
                  e.puplett@medici.com
                </div>
              </div>
            </div>

            <div className="-mx-2 my-1 h-px bg-border" />

            {/* Appearance & Accessibility */}
            <ProfileMenuItem onClick={() => setView("appearance")}>
              <Settings className="size-3.5 text-muted-foreground" />
              <span className="flex-1 text-left">Appearance & Accessibility</span>
              <ChevronRight className="size-3.5 text-muted-foreground" />
            </ProfileMenuItem>

            {/* Account Settings */}
            <ProfileMenuItem onClick={handleAccountSettings}>
              <Settings className="size-3.5 text-muted-foreground" />
              <span className="flex-1 text-left">Account Settings</span>
            </ProfileMenuItem>

            <div className="-mx-2 my-1 h-px bg-border" />

            {/* Sign Out */}
            <ProfileMenuItem className="text-destructive hover:text-destructive">
              <LogOut className="size-3.5" />
              <span className="flex-1 text-left">Sign Out</span>
            </ProfileMenuItem>
          </div>
        ) : (
          <AppearancePanel onBack={() => setView("main")} />
        )}
      </PopoverContent>
    </Popover>
  );
}

// ======== App Header ========

/** Top bar with mode tabs (Chat, Workflows) and action icons (Tasks, Calendar, Usage, Profile) */
export function AppHeader() {
  const activeTab = useActiveTab();

  return (
    <header className="top-tab-bar" role="banner">
      {/* Left: Mode tabs */}
      <nav className="contents" aria-label="Main navigation">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.path;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`top-tab${isActive ? " active" : ""}`}
            >
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
        <div className="h-5 w-px bg-[var(--taupe-2)]" />

        <ProfileAvatar />
      </div>
    </header>
  );
}
