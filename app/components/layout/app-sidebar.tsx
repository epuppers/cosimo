import { Link, useLocation } from "react-router";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  Plus,
  Brain,
  BookOpen,
  Network,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { LogoMark } from "~/components/layout/logo";
import { useUIStore } from "~/stores/ui-store";
import { ThreadList } from "~/components/chat/thread-list";
import type { Thread, WorkflowRun } from "~/services/types";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarProvider,
  useSidebar,
} from "~/components/ui/sidebar";

// ======== Sidebar Toggle Button ========

/** Toggle button to collapse/expand the sidebar */
function SidebarToggle() {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <button
      onClick={toggleSidebar}
      aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      className={cn(
        "flex size-[22px] shrink-0 items-center justify-center rounded-[var(--r-sm)] border border-transparent bg-transparent text-[var(--taupe-3)] transition-all",
        "hover:border-[var(--taupe-2)] hover:bg-[rgba(var(--violet-3-rgb),0.08)] hover:text-[var(--violet-3)]",
        "active:bg-[rgba(var(--violet-3-rgb),0.14)]",
        "focus-visible:outline-2 focus-visible:outline-[var(--violet-3)] focus-visible:outline-offset-1",
        "dark:hover:border-[var(--taupe-3)] dark:hover:bg-[rgba(var(--violet-3-rgb),0.12)] dark:active:bg-[rgba(var(--violet-3-rgb),0.2)]",
        isCollapsed ? "mx-auto" : "ml-auto"
      )}
    >
      {isCollapsed ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
    </button>
  );
}

// ======== Logo Row ========

/** Logo area: spheres + title text + collapse toggle */
function LogoRow() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <div className={cn(
      "flex items-center gap-2 overflow-hidden",
      isCollapsed && "justify-center gap-0 min-h-[33px]"
    )}>
      <LogoMark />
      {!isCollapsed && (
        <>
          <div className="min-w-0 flex-1 overflow-hidden whitespace-nowrap">
            <div className="font-[family-name:var(--pixel)] text-[22px] leading-none tracking-[1px] text-[var(--taupe-1)] [text-shadow:1px_1px_0_rgba(0,0,0,0.4)] dark:text-[var(--taupe-5)] dark:[text-shadow:1px_1px_0_rgba(0,0,0,0.6)]">
              COSIMO
            </div>
            <div className="mt-px font-[family-name:var(--mono)] text-[9px] tracking-[0.1em] text-[var(--taupe-3)]">
              MEDICI &amp; COMPANY
            </div>
          </div>
          <SidebarToggle />
        </>
      )}
    </div>
  );
}

// ======== Brain Nav Section ========

/** Brain navigation buttons in the sidebar footer */
function BrainNav() {
  const brainNavCollapsed = useUIStore((s) => s.brainNavCollapsed);
  const toggleBrainNav = useUIStore((s) => s.toggleBrainNav);
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const location = useLocation();

  const brainItems = [
    { label: "Memory", icon: Brain, path: "/brain/memory" },
    { label: "Lessons", icon: BookOpen, path: "/brain/lessons" },
    { label: "Graphs", icon: Network, path: "/brain/graph" },
  ] as const;

  if (isCollapsed) {
    return null;
  }

  return (
    <div className="brain-nav mt-auto border-t border-[var(--taupe-4)] px-1.5 pb-1.5">
      <div className="flex items-center justify-between">
        <div className="sidebar-section-label px-2 pt-2 pb-1">Brain</div>
        <button
          onClick={toggleBrainNav}
          aria-label={brainNavCollapsed ? "Expand Brain nav" : "Collapse Brain nav"}
          className="mr-1.5 flex size-5 items-center justify-center rounded-[var(--r-sm)] border-none bg-transparent text-[var(--taupe-3)] transition-colors hover:bg-[rgba(var(--white-pure-rgb),0.08)] hover:text-[var(--taupe-1)] focus-visible:outline-2 focus-visible:outline-[var(--violet-3)] focus-visible:outline-offset-1 active:bg-[rgba(var(--white-pure-rgb),0.12)]"
        >
          <ChevronDown className={cn("size-2.5 transition-transform", brainNavCollapsed && "-rotate-90")} />
        </button>
      </div>
      {!brainNavCollapsed && (
        <div className="flex flex-col gap-0.5">
          {brainItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "brain-nav-btn flex items-center gap-2 rounded-[var(--r-md)] px-2.5 py-[7px] font-[family-name:var(--mono)] text-[11px] text-[var(--taupe-2)] no-underline transition-colors",
                  "hover:bg-[rgba(var(--white-pure-rgb),0.06)] hover:text-[var(--taupe-1)]",
                  "focus-visible:outline-2 focus-visible:outline-[var(--violet-3)] focus-visible:outline-offset-1",
                  isActive && "bg-[var(--berry-5)] text-[var(--berry-1)]"
                )}
              >
                <item.icon className={cn("size-3.5 shrink-0 opacity-70", isActive && "opacity-100")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ======== Main Sidebar Component ========

/** Props for the AppSidebar */
interface AppSidebarProps {
  /** Threads to display in the sidebar list */
  threads?: Thread[];
  /** Workflow runs keyed by runId, for status indicators */
  runs?: Record<string, WorkflowRun>;
}

/** Application sidebar — logo, search, new button, thread list, brain nav */
export function AppSidebar({ threads, runs }: AppSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-[var(--surface-1)] dark:border-[var(--surface-0)]"
    >
      {/* Logo area */}
      <SidebarHeader className="px-3 pt-3.5 pb-3">
        <LogoRow />
        {isCollapsed && (
          <div className="flex justify-center">
            <SidebarToggle />
          </div>
        )}
        {/* Search + New button — inside header like the original */}
        {!isCollapsed && (
          <div className="mt-2.5">
            <button className="sidebar-new-btn">
              <Plus className="size-3.5" />
              New Thread
            </button>
            <div className="relative mt-2.5">
              <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-[var(--taupe-3)]" />
              <input
                type="text"
                placeholder="Search..."
                className="sidebar-search-input"
              />
            </div>
          </div>
        )}
      </SidebarHeader>

      {/* Thread list area */}
      <SidebarContent>
        <SidebarGroup className="flex-1 px-1.5">
          {!isCollapsed && (
            <div className="sidebar-section-label">Recent</div>
          )}
          <SidebarGroupContent>
            {threads && threads.length > 0 ? (
              <ThreadList threads={threads} runs={runs} />
            ) : (
              <div className="px-2 py-1 font-[family-name:var(--mono)] text-xs text-[var(--taupe-3)]">
                {isCollapsed ? "" : "No threads yet"}
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Brain navigation */}
      <SidebarFooter className="p-0">
        <BrainNav />
      </SidebarFooter>
    </Sidebar>
  );
}

// ======== Sidebar Wrapper ========

/** Wraps the app with SidebarProvider, connecting shadcn sidebar state to UIStore */
export function AppSidebarProvider({ children }: { children: React.ReactNode }) {
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <SidebarProvider
      open={!sidebarCollapsed}
      onOpenChange={(open) => {
        // Only toggle if the state actually differs
        if (open === sidebarCollapsed) {
          toggleSidebar();
        }
      }}
    >
      {children}
    </SidebarProvider>
  );
}
