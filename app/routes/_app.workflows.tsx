// ============================================
// Workflows Library Route — grid of template cards + stats bar
// ============================================

import { Outlet, useMatches, useNavigate, useRouteError } from "react-router";
import { toast } from "sonner";
import { Workflow } from "lucide-react";
import { ErrorBoundaryContent } from "~/components/ui/error-boundary-content";
import { getTemplates, findRunThread } from "~/services/workflows";
import { getLessons } from "~/services/brain";
import { WorkflowStats } from "~/components/workflows/workflow-stats";
import { WorkflowCard } from "~/components/workflows/workflow-card";
import type { Route } from "./+types/_app.workflows";

/** Loader — fetches all workflow templates and lesson names for card chips */
export async function clientLoader() {
  const [templates, lessons] = await Promise.all([
    getTemplates(),
    getLessons(),
  ]);

  // Build lesson name lookup for WorkflowCard chips
  const lessonNames: Record<string, string> = {};
  for (const lesson of lessons) {
    lessonNames[lesson.id] = lesson.title;
  }

  return { templates, lessonNames };
}

/** Workflows layout route — shows library when at /workflows, detail when at /workflows/:id */
export default function WorkflowsRoute({ loaderData }: Route.ComponentProps) {
  const { templates, lessonNames } = loaderData;
  const navigate = useNavigate();
  const matches = useMatches();

  // Check if a child detail route is matched
  const hasChildRoute = matches.some(
    (m) => m.id === "routes/_app.workflows.$id"
  );

  if (hasChildRoute) {
    return <Outlet />;
  }

  const handleSelect = (id: string) => {
    navigate(`/workflows/${id}`);
  };

  const handleRun = (id: string) => {
    const threadId = findRunThread(id);
    if (threadId) {
      navigate(`/chat/${threadId}`);
    } else {
      toast("No mock run available for this workflow");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-5 px-6">
      {/* Stats bar */}
      <WorkflowStats templates={templates} />

      {/* Template cards */}
      {templates.length > 0 ? (
        <div>
          {templates.map((template) => (
            <WorkflowCard
              key={template.id}
              template={template}
              lessonNames={lessonNames}
              onSelect={handleSelect}
              onRun={handleRun}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center text-center py-10 px-5">
          <Workflow className="size-10 opacity-30" style={{ color: 'var(--taupe-2)' }} />
          <p className="font-[family-name:var(--pixel)] text-taupe-3 dark:text-taupe-3">No workflows yet</p>
        </div>
      )}
    </div>
  );
}

/** Error boundary for workflow library errors */
export function ErrorBoundary() {
  const error = useRouteError();
  console.error('Workflows route error:', error);
  return <ErrorBoundaryContent message="An unexpected error occurred while loading workflows." />;
}
