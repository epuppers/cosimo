// ============================================
// ThreadList — Sidebar thread items with workflow indicators
// ============================================
// Renders the thread list in the sidebar. Splits threads into
// "Active Runs" (running/waiting workflow runs) and regular threads.
// Navigates to /chat/:threadId on click.

import { Link, useLocation } from "react-router";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "~/components/ui/sidebar";
import type { Thread, WorkflowRun } from "~/services/types";

// ======== Types ========

interface ThreadListProps {
  /** All threads in display order */
  threads: Thread[];
  /** Workflow runs keyed by runId, for checking active run status */
  runs?: Record<string, WorkflowRun>;
}

// ======== Status Indicator ========

/** Thread indicator badge (ready, error, waiting, running, etc.) */
function ThreadIndicatorBadge({ type, label }: { type: string; label: string }) {
  const colorMap: Record<string, string> = {
    ready: "text-[var(--green)] border-[var(--green)] bg-[rgba(var(--green-rgb),0.15)]",
    error: "text-[var(--red)] border-[var(--red)] bg-[rgba(var(--red-rgb),0.15)]",
    waiting: "text-[var(--amber)] border-[var(--amber)] bg-[rgba(var(--amber-rgb),0.15)]",
    running: "text-[var(--violet-3)] border-[var(--violet-3)] bg-[rgba(var(--violet-3-rgb),0.15)] animate-[wf-pulse_2s_infinite] motion-reduce:animate-none",
    streaming: "text-[var(--violet-3)] border-[var(--violet-3)] bg-[rgba(var(--violet-3-rgb),0.15)]",
  };

  return (
    <span
      className={`inline-block rounded-[var(--r-md)] border px-[5px] py-px font-[family-name:var(--mono)] text-[9px] font-semibold leading-none ${colorMap[type] ?? "text-[var(--taupe-3)] border-[var(--taupe-3)] bg-[rgba(var(--taupe-3-rgb),0.1)]"}`}
    >
      {label}
    </span>
  );
}

// ======== Thread Item ========

/** A single thread item in the sidebar list — matches reference structure:
 *  title text (with optional ⚙ icon inline), timestamp div, indicator badge */
function ThreadItem({
  thread,
  isActive,
  isWorkflowThread,
}: {
  thread: Thread;
  isActive: boolean;
  isWorkflowThread: boolean;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        render={<Link to={`/chat/${thread.id}`} />}
        size="sm"
        className="h-auto items-start rounded-[var(--r-md)] border border-transparent py-2 px-2 font-[family-name:var(--mono)] text-xs leading-[1.3] text-[var(--taupe-2)] dark:text-[var(--taupe-4)]"
      >
        <div className="min-w-0 flex-1">
          {isWorkflowThread && (
            <span
              className="mr-[3px] inline text-[10px] text-[var(--taupe-3)]"
              aria-label="Workflow thread"
            >
              ⚙
            </span>
          )}
          <span className="text-xs">{thread.title}</span>
          <div className="mt-0.5 text-xs text-[var(--taupe-3)]">
            {thread.timestamp}
          </div>
          {thread.indicators.length > 0 && (
            <div className="mt-0.5">
              {thread.indicators.map((ind, i) => (
                <ThreadIndicatorBadge key={i} type={ind.type} label={ind.label} />
              ))}
            </div>
          )}
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

// ======== Active Run Item ========

/** Thread item for active workflow runs — ⚙ icon inline with title,
 *  timestamp below, then run status indicator on its own line */
function ActiveRunItem({
  thread,
  runStatus,
  isActive,
}: {
  thread: Thread;
  runStatus: "running" | "waiting";
  isActive: boolean;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        render={<Link to={`/chat/${thread.id}`} />}
        size="sm"
        className="h-auto items-start rounded-[var(--r-md)] border border-transparent py-1.5 px-2 font-[family-name:var(--mono)] text-xs text-[var(--taupe-2)] dark:text-[var(--taupe-4)]"
      >
        <div className="min-w-0 flex-1">
          <span className="mr-[3px] inline text-[10px] text-[var(--taupe-3)]" aria-label="Workflow thread">⚙</span>
          <span className="text-xs text-[var(--taupe-1)] dark:text-[var(--taupe-5)]">{thread.title}</span>
          <div className="mt-0.5 text-xs text-[var(--taupe-3)]">
            {thread.timestamp}
          </div>
          <div className="mt-0.5">
            <ThreadIndicatorBadge type={runStatus} label={runStatus === "running" ? "Running" : "Waiting"} />
          </div>
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

// ======== Main Component ========

/** Renders the sidebar thread list, split into Active Runs and regular threads */
export function ThreadList({ threads, runs = {} }: ThreadListProps) {
  const location = useLocation();

  // Extract active thread ID from URL
  const activeThreadId = location.pathname.startsWith("/chat/")
    ? location.pathname.split("/chat/")[1]
    : null;

  // Split threads into active runs and regular
  const activeRuns: { thread: Thread; status: "running" | "waiting" }[] = [];
  const regularThreads: Thread[] = [];

  for (const thread of threads) {
    if (thread.workflowRunId) {
      const run = runs[thread.workflowRunId];
      if (run && (run.status === "running" || run.status === "waiting")) {
        activeRuns.push({ thread, status: run.status });
        continue;
      }
    }
    regularThreads.push(thread);
  }

  return (
    <>
      {/* Active Runs Section */}
      {activeRuns.length > 0 && (
        <SidebarMenu>
          <div className="mb-1 rounded-[var(--r-md)] bg-[rgba(var(--violet-3-rgb),0.04)] px-1.5 py-1.5 dark:bg-[rgba(var(--violet-3-rgb),0.06)] border-b border-[var(--chinese-4)] dark:border-[var(--chinese-5)]">
            <div className="sidebar-section-label px-2 pt-1 pb-0.5">
              Active
            </div>
            {activeRuns.map(({ thread, status }) => (
              <ActiveRunItem
                key={thread.id}
                thread={thread}
                runStatus={status}
                isActive={thread.id === activeThreadId}
              />
            ))}
          </div>
        </SidebarMenu>
      )}

      {/* Recent label */}
      <div className="sidebar-section-label">Recent</div>

      {/* Regular Threads */}
      <SidebarMenu>
        {regularThreads.map((thread) => (
          <ThreadItem
            key={thread.id}
            thread={thread}
            isActive={thread.id === activeThreadId}
            isWorkflowThread={!!thread.workflowRunId}
          />
        ))}
      </SidebarMenu>
    </>
  );
}
