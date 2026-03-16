// ============================================
// WorkflowList — Sidebar template list for the Workflows view
// ============================================
// Renders active runs (running/waiting) at top, then all templates.
// Matches reference sidebar structure: wf-active-runs + wf-side-item.

import { Link, useLocation } from "react-router";
import {
  FolderOpen,
  Clock,
  MessageSquare,
  Mail,
  Hand,
  Link as LinkIcon,
} from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "~/components/ui/sidebar";
import type { WorkflowTemplate, WorkflowRun } from "~/services/types";

// ======== Trigger Icon Map ========

const TRIGGER_ICONS: Record<string, React.ElementType> = {
  "folder-watch": FolderOpen,
  schedule: Clock,
  "chat-command": MessageSquare,
  email: Mail,
  manual: Hand,
  chained: LinkIcon,
};

// ======== Status Badge ========

/** Colored status badge for template status (active, draft, paused, archived) */
function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    active:
      "text-[var(--green)] border-[var(--green)] bg-[rgba(var(--green-rgb),0.1)]",
    draft:
      "text-[var(--amber)] border-[var(--amber)] bg-[rgba(var(--amber-rgb),0.1)]",
    paused:
      "text-[var(--taupe-3)] border-[var(--taupe-3)] bg-[rgba(var(--taupe-3-rgb),0.1)]",
    archived:
      "text-[var(--taupe-3)] border-[var(--taupe-3)] bg-[rgba(var(--taupe-3-rgb),0.06)]",
  };

  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={`inline-block rounded-[var(--r-md)] border px-[6px] py-[2px] font-[family-name:var(--mono)] text-[11px] font-semibold leading-none ${colorMap[status] ?? colorMap.archived}`}
    >
      {label}
    </span>
  );
}

// ======== Active Run Item ========

/** Active run item — shows template name, status dot, thread title */
function ActiveRunItem({
  run,
  templateName,
}: {
  run: WorkflowRun;
  templateName: string;
}) {
  const statusType = run.status === "running" ? "running" : "waiting";
  const statusLabel = run.status === "running" ? "Running" : "Waiting";
  const colorMap: Record<string, string> = {
    running: "text-[var(--violet-3)] border-[var(--violet-3)] bg-[rgba(var(--violet-3-rgb),0.15)] animate-[wf-pulse_2s_infinite] motion-reduce:animate-none",
    waiting: "text-[var(--amber)] border-[var(--amber)] bg-[rgba(var(--amber-rgb),0.15)]",
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        render={<Link to={`/chat/${run.threadId}`} />}
        size="sm"
        className="h-auto items-start rounded-[var(--r-md)] border border-transparent py-1.5 px-2 font-[family-name:var(--mono)] text-xs text-[var(--taupe-2)] dark:text-[var(--taupe-4)]"
      >
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold text-[var(--taupe-1)] dark:text-[var(--taupe-5)]">
            {templateName}
          </div>
          <div className="mt-1">
            <span className={`inline-block rounded-[var(--r-md)] border px-[5px] py-px font-[family-name:var(--mono)] text-[9px] font-semibold leading-none ${colorMap[statusType]}`}>
              {statusLabel}
            </span>
          </div>
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

// ======== Template Item ========

/** Template sidebar item — trigger icon + title, status badge + last run info */
function TemplateItem({
  template,
  isActive,
}: {
  template: WorkflowTemplate;
  isActive: boolean;
}) {
  const TriggerIcon = TRIGGER_ICONS[template.triggerType] ?? Hand;

  const lastRunInfo =
    template.recentRuns.length > 0
      ? `Last run: ${template.recentRuns[0].time}`
      : "No runs";

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        render={<Link to={`/workflows/${template.id}`} />}
        size="sm"
        className="h-auto items-start rounded-[var(--r-md)] border border-transparent py-2 px-2 font-[family-name:var(--mono)] text-xs leading-[1.3] text-[var(--taupe-2)] dark:text-[var(--taupe-4)]"
      >
        <div className="min-w-0 flex-1">
          <span className="mr-[5px] inline-flex align-middle text-[var(--taupe-3)]">
            <TriggerIcon className="size-3" />
          </span>
          <span className="text-xs">{template.title}</span>
          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-[var(--taupe-3)]">
            <StatusBadge status={template.status} />
            <span>{lastRunInfo}</span>
          </div>
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

// ======== Main Component ========

interface WorkflowListProps {
  /** All workflow templates */
  templates: WorkflowTemplate[];
  /** All runs keyed by runId */
  runs?: Record<string, WorkflowRun>;
}

/** Renders the workflow sidebar — active runs section + template list */
export function WorkflowList({ templates, runs = {} }: WorkflowListProps) {
  const location = useLocation();

  // Active template from URL
  const activeTemplateId = location.pathname.startsWith("/workflows/")
    ? location.pathname.split("/workflows/")[1]
    : null;

  // Find active runs (running or waiting)
  const activeRuns = Object.values(runs).filter(
    (r) => r.status === "running" || r.status === "waiting"
  );

  // Build a template name lookup for active runs
  const templateMap = new Map(templates.map((t) => [t.id, t.title]));

  return (
    <>
      {/* Active Runs Section */}
      {activeRuns.length > 0 && (
        <SidebarMenu>
          <div className="mb-1 rounded-[var(--r-md)] bg-[rgba(var(--violet-3-rgb),0.04)] px-1.5 py-1.5 dark:bg-[rgba(var(--violet-3-rgb),0.06)] border-b border-[var(--chinese-4)] dark:border-[var(--chinese-5)]">
            <div className="mb-1 px-0.5 font-[family-name:var(--mono)] text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--taupe-3)]">
              Active Runs
            </div>
            {activeRuns.map((run) => (
              <ActiveRunItem
                key={run.runId}
                run={run}
                templateName={templateMap.get(run.templateId) ?? run.templateId}
              />
            ))}
          </div>
        </SidebarMenu>
      )}

      {/* Template List */}
      <SidebarMenu>
        {templates.map((template) => (
          <TemplateItem
            key={template.id}
            template={template}
            isActive={template.id === activeTemplateId}
          />
        ))}
      </SidebarMenu>
    </>
  );
}
