import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
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
      <div className="usage-stats pb-2">
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
        <span className="th-icon">◈</span>
        <span className="a11y-label">Tasks</span>
        {tasks.length > 0 && (
          <span className="th-badge absolute -right-0.5 -top-0.5 flex min-w-[14px] h-[14px] items-center justify-center rounded-[var(--r-sm)] bg-[var(--red)] border border-solid border-[var(--red-hi)] font-[family-name:var(--mono)] text-[9px] font-bold text-white px-0.5"
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
        <span className="th-icon">▦</span>
        <span className="a11y-label">Calendar</span>
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
        <GaugeIcon />
        <span className="a11y-label">Usage</span>
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
    <div className="profile-menu-subpanel" style={{ display: 'flex' }}>
      {/* Back header */}
      <button
        type="button"
        onClick={onBack}
        className="profile-menu-subpanel-header"
      >
        <span className="profile-menu-back-icon">
          <ArrowLeft className="size-3.5" />
        </span>
        <span className="profile-menu-subpanel-title">Appearance &amp; Accessibility</span>
      </button>

      <div className="profile-menu-divider" />

      {/* Dark mode toggle */}
      <div className="profile-menu-theme" role="button" tabIndex={0} onClick={toggleTheme} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleTheme(); }}>
        <span className="profile-menu-theme-label">
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
      <div className="profile-menu-contrast">
        <div className="profile-menu-contrast-header">
          <span className="profile-menu-theme-label">Purple intensity</span>
          <span className="profile-menu-contrast-value">{purpleIntensity}%</span>
        </div>
        <input
          type="range"
          className="profile-menu-slider"
          min={0}
          max={150}
          value={purpleIntensity}
          onChange={(e) => setPurpleIntensity(Number(e.target.value))}
        />
        <div className="profile-menu-slider-labels">
          <span>Subtle</span>
          <span>Default</span>
          <span>Vivid</span>
        </div>
      </div>

      {/* Text size slider */}
      <div className="profile-menu-contrast">
        <div className="profile-menu-contrast-header">
          <span className="profile-menu-theme-label">Text size</span>
          <span className="profile-menu-contrast-value">{FONT_SIZE_LABELS[fontSizeLevel]}</span>
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
        <div className="profile-menu-slider-labels">
          <span>100%</span>
          <span>110%</span>
          <span>120%</span>
        </div>
      </div>

      <div className="profile-menu-divider" />

      {/* Accessibility section */}
      <div className="profile-menu-section-label">Accessibility</div>

      {/* Dyslexia-friendly font */}
      <div className="profile-menu-theme">
        <span className="profile-menu-theme-label">Dyslexia-friendly font</span>
        <Switch
          size="sm"
          checked={dyslexiaFont}
          onCheckedChange={toggleDyslexiaFont}
        />
      </div>

      {/* Reduced motion */}
      <div className="profile-menu-theme">
        <span className="profile-menu-theme-label">Reduced motion</span>
        <Switch
          size="sm"
          checked={reducedMotion}
          onCheckedChange={toggleReducedMotion}
        />
      </div>

      {/* High contrast & focus */}
      <div className="profile-menu-theme">
        <span className="profile-menu-theme-label">High contrast &amp; focus</span>
        <Switch
          size="sm"
          checked={highContrast}
          onCheckedChange={toggleHighContrast}
        />
      </div>

      {/* Icon labels */}
      <div className="profile-menu-theme">
        <span className="profile-menu-theme-label">Icon labels</span>
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
        className="top-profile"
      >
        <div className="top-profile-avatar">E</div>
        <span className="top-profile-name">Eliot Puplett</span>
      </PopoverTrigger>
      <PopoverContent
          align="end"
          sideOffset={6}
          className={cn(
            "border-2 border-solid",
            "border-t-[var(--taupe-2)] border-r-[var(--taupe-3)] border-b-[var(--taupe-3)] border-l-[var(--taupe-2)]",
            "dark:border-[var(--surface-0)]",
            "bg-[var(--white)] dark:bg-[var(--surface-2)]",
            "shadow-none dark:shadow-none",
            "data-open:animate-none data-closed:animate-none duration-0",
            "overflow-hidden p-0 gap-0 w-auto",
          )}
          style={{ width: view === "appearance" ? 240 : 200 }}
        >
        {view === "main" ? (
          <div className="profile-menu-view">
            {/* User info */}
            <div className="profile-menu-user-info">
              <div className="profile-menu-user-avatar">E</div>
              <div className="min-w-0">
                <div className="profile-menu-user-name">Eliot Puplett</div>
                <div className="profile-menu-user-email">e.puplett@medici.com</div>
              </div>
            </div>

            <div className="profile-menu-divider" />

            {/* Appearance & Accessibility */}
            <button type="button" className="profile-menu-item" onClick={() => setView("appearance")}>
              <span>Appearance &amp; Accessibility</span>
              <span className="profile-menu-item-chevron">
                <ChevronRight className="size-3.5" />
              </span>
            </button>

            {/* Account Settings */}
            <button type="button" className="profile-menu-item" onClick={handleAccountSettings}>
              <span>Account Settings</span>
            </button>

            <div className="profile-menu-divider" />

            {/* Sign Out */}
            <button type="button" className="profile-menu-item profile-menu-signout" onClick={() => navigate("/login")}>
              <span>Sign Out</span>
            </button>
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
          const TabIcon = tab.icon;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`top-tab${isActive ? " active" : ""}`}
            >
              <span className="top-tab-icon"><TabIcon /></span>
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
        <div className="th-divider" />

        <ProfileAvatar />
      </div>
    </header>
  );
}
