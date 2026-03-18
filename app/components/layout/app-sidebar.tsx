import { Link, useLocation, useNavigate } from "react-router";
import {
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
import { WorkflowList } from "~/components/workflows/workflow-list";
import type { Thread, WorkflowRun, WorkflowTemplate } from "~/services/types";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarProvider,
  SidebarRail,
  useSidebar,
} from "~/components/ui/sidebar";

// ======== Logo Row ========

/** Logo area: spheres + title text + collapse toggle */
function LogoRow() {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  if (isCollapsed) {
    return (
      <button
        onClick={toggleSidebar}
        aria-label="Expand sidebar"
        className="flex min-h-[33px] items-center justify-center bg-transparent border-none cursor-pointer rounded-[var(--r-sm)] transition-colors hover:bg-[rgba(var(--violet-3-rgb),0.08)] focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-1"
      >
        <LogoMark />
      </button>
    );
  }

  return (
    <div className="flex items-start gap-2 overflow-hidden">
      <div className="mt-[2px]">
        <LogoMark />
      </div>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden whitespace-nowrap">
        <div className="font-[family-name:var(--pixel)] text-[22px] leading-none tracking-[1px] text-taupe-1 [text-shadow:1px_1px_0_rgba(0,0,0,0.4)] dark:text-taupe-5 dark:[text-shadow:1px_1px_0_rgba(0,0,0,0.6)]">
          COSIMO
        </div>
        <div className="mt-px font-[family-name:var(--mono)] text-[9px] tracking-[0.1em] text-taupe-3">
          MEDICI &amp; COMPANY
        </div>
      </div>
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
    <div className="brain-nav mt-auto flex flex-col border-t border-taupe-4 pb-1 min-h-[91px]">
      <button
        onClick={toggleBrainNav}
        aria-label={brainNavCollapsed ? "Expand Brain nav" : "Collapse Brain nav"}
        className={cn(
          "flex w-full items-center justify-between px-3.5 py-1.5",
          "bg-transparent border-none cursor-pointer",
          "transition-colors",
          "hover:bg-[rgba(var(--white-pure-rgb),0.06)]",
          "active:bg-[rgba(var(--white-pure-rgb),0.10)]",
          "focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-[-2px]"
        )}
      >
        <span className="font-[family-name:var(--mono)] text-[0.6875rem] font-semibold tracking-[0.18em] uppercase text-taupe-3">
          Brain
        </span>
        <ChevronDown
          className={cn(
            "size-3 text-taupe-3 a11y-keep transition-transform duration-200",
            brainNavCollapsed && "rotate-180"
          )}
        />
      </button>
      {!brainNavCollapsed && (
        <div className="flex flex-col gap-0.5 px-1.5">
          {brainItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "brain-nav-btn flex items-center gap-2 rounded-[var(--r-md)] px-2.5 py-[7px] font-[family-name:var(--mono)] text-[11px] text-taupe-2 dark:text-taupe-4 no-underline transition-colors",
                  "hover:bg-[rgba(var(--white-pure-rgb),0.06)] hover:text-taupe-1 dark:hover:text-taupe-5",
                  "focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-1",
                  isActive && "bg-berry-5 text-berry-1 dark:text-berry-3"
                )}
              >
                <item.icon className={cn("size-3.5 shrink-0 opacity-70", isActive && "opacity-100")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
      <div className="mt-auto px-3.5 pb-1 pt-3 font-[family-name:var(--mono)] text-[9px] uppercase tracking-[0.1em] text-taupe-3 opacity-60">
        Cosimo v2.1
      </div>
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
  /** Workflow templates for the workflows sidebar */
  templates?: WorkflowTemplate[];
}

/** Application sidebar — logo, search, new button, thread/workflow list, brain nav */
export function AppSidebar({ threads, runs, templates }: AppSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const isWorkflowsView = location.pathname.startsWith("/workflows");

  return (
    <Sidebar
      collapsible="icon"
      className=""
    >
      {/* Logo area */}
      <SidebarHeader className="px-3 pt-3.5 pb-3">
        <LogoRow />
        {/* Search + New button — inside header like the original */}
        {!isCollapsed && (
          <div className="mt-2.5">
            <button
              className={cn(
                "sidebar-new-btn w-full px-2.5 py-[7px] bg-taupe-4 border border-solid rounded-[var(--r-sm)]",
                "font-[family-name:var(--mono)] text-xs font-semibold uppercase text-taupe-1",
                "cursor-pointer text-center flex items-center justify-center gap-1.5",
                "[border-color:var(--taupe-3)_var(--surface-1)_var(--surface-1)_var(--taupe-3)]",
                "hover:bg-chinese-4",
                "active:[border-color:var(--surface-1)_var(--taupe-3)_var(--taupe-3)_var(--surface-1)]",
                "focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2"
              )}
              onClick={() => navigate("/chat")}
            >
              <Plus className="size-3.5" />
              {isWorkflowsView ? "New Workflow" : "New Thread"}
            </button>
            <div className="relative mt-2.5">
              <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-taupe-3" />
              <input
                type="text"
                placeholder="Search..."
                className={cn(
                  "sidebar-search-input w-full py-[7px] pr-2.5 pl-7 font-[family-name:var(--mono)] text-xs",
                  "text-taupe-1 bg-[rgba(var(--black-rgb),0.25)] border border-solid rounded-[var(--r-sm)]",
                  "[border-color:var(--surface-1)_var(--taupe-4)_var(--taupe-4)_var(--surface-1)]",
                  "outline-none h-auto shadow-none",
                  "placeholder:text-taupe-3",
                  "focus:border-violet-3 focus:shadow-[0_0_0_1px_var(--violet-3)] focus:bg-[rgba(var(--black-rgb),0.35)]",
                  "dark:bg-[rgba(var(--black-rgb),0.4)] dark:[border-color:var(--surface-0)_var(--surface-3)_var(--surface-3)_var(--surface-0)]",
                  "dark:focus:bg-[rgba(var(--black-rgb),0.5)]"
                )}
              />
            </div>
          </div>
        )}
      </SidebarHeader>

      {/* Content area — switches based on active route */}
      <SidebarContent>
        <SidebarGroup className="flex-1 px-1.5">
          {!isCollapsed && isWorkflowsView && (
            <div className="font-[family-name:var(--mono)] text-[0.6875rem] font-semibold tracking-[0.18em] uppercase text-taupe-3 px-3 pt-4 pb-1.5 group-data-[collapsible=icon]:hidden">Templates</div>
          )}
          <SidebarGroupContent>
            {isWorkflowsView ? (
              templates && templates.length > 0 ? (
                <WorkflowList templates={templates} runs={runs} />
              ) : (
                <div className="px-2 py-1 font-[family-name:var(--mono)] text-xs text-taupe-3">
                  {isCollapsed ? "" : "No templates yet"}
                </div>
              )
            ) : (
              threads && threads.length > 0 ? (
                <ThreadList threads={threads} runs={runs} />
              ) : (
                <div className="px-2 py-1 font-[family-name:var(--mono)] text-xs text-taupe-3">
                  {isCollapsed ? "" : "No threads yet"}
                </div>
              )
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Brain navigation */}
      <SidebarFooter className="p-0">
        <BrainNav />
      </SidebarFooter>

      {/* Rail — thin hover line at sidebar edge to toggle open/close */}
      <SidebarRail />
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
