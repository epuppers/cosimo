// ============================================
// Workflows Library Route — grid of template cards + stats bar
// ============================================

import { Outlet, useMatches, useNavigate, useRouteError } from "react-router";
import { toast } from "sonner";
import { AlertCircle, Workflow } from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { getTemplates, findRunThread } from "~/services/workflows";
import { getLessons } from "~/services/brain";
import { WorkflowStats } from "~/components/workflows/workflow-stats";
import { WorkflowCard } from "~/components/workflows/workflow-card";
import type { Route } from "./+types/_app.workflows";

/** Loader — fetches all workflow templates and lesson names for card chips */
export async function loader() {
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
    <div className="wf-listing">
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
        <div className="wf-no-results">
          <Workflow className="size-10 opacity-30" style={{ color: 'var(--taupe-2)' }} />
          <p className="font-[family-name:var(--pixel)] text-[var(--taupe-3)] dark:text-[var(--taupe-3)]">No workflows yet</p>
        </div>
      )}
    </div>
  );
}

/** Error boundary for workflow library errors */
export function ErrorBoundary() {
  const error = useRouteError();
  console.error('Workflows route error:', error);

  return (
    <div className="flex h-full items-center justify-center p-8">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription className="mt-2">
          An unexpected error occurred while loading workflows.
        </AlertDescription>
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Try again
          </Button>
        </div>
      </Alert>
    </div>
  );
}

/** Loading skeleton — grid of 6 workflow cards */
export function HydrateFallback() {
  return (
    <div className="flex h-full flex-col gap-4 p-6">
      {/* Stats bar skeleton */}
      <div className="flex gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 flex-1 rounded-lg" />
        ))}
      </div>
      {/* Card grid skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
