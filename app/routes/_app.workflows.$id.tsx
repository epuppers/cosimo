// ============================================
// Workflow Template Detail Route — flow graph + tabbed info panels
// ============================================

import { isRouteErrorResponse, useRouteError } from "react-router";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { getTemplate, getRunsForTemplate } from "~/services/workflows";
import { TemplateDetail } from "~/components/workflows/template-detail";
import type { Route } from "./+types/_app.workflows.$id";

/** Loader — fetches template by ID and its runs, throws 404 if not found */
export async function loader({ params }: Route.LoaderArgs) {
  const template = await getTemplate(params.id);
  if (!template) {
    throw new Response("Workflow not found", { status: 404 });
  }

  const runs = await getRunsForTemplate(params.id);
  // Use the first active run if any (for node status overlay)
  const activeRun = runs.find(
    (r) => r.status === "running" || r.status === "waiting"
  );

  return { template, activeRun: activeRun ?? null };
}

/** Template detail view — renders the TemplateDetail component with full template data */
export default function WorkflowDetailRoute({
  loaderData,
}: Route.ComponentProps) {
  const { template, activeRun } = loaderData;

  return (
    <TemplateDetail
      template={template}
      run={activeRun ?? undefined}
    />
  );
}

/** Loading skeleton — two-column layout with graph area + tab content */
export function HydrateFallback() {
  return (
    <div className="flex h-full gap-4 p-6">
      {/* Graph area skeleton */}
      <div className="flex-1 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
      {/* Tab content skeleton */}
      <div className="w-80 shrink-0 space-y-4">
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-md" />
          ))}
        </div>
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    </div>
  );
}

/** Error boundary for workflow not found */
export function ErrorBoundary() {
  const error = useRouteError();
  console.error('Workflow detail route error:', error);

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Workflow not found</AlertTitle>
          <AlertDescription className="mt-2">
            The workflow template you&apos;re looking for doesn&apos;t exist or
            has been removed.
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

  return (
    <div className="flex h-full items-center justify-center p-8">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription className="mt-2">
          An unexpected error occurred while loading this workflow.
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
