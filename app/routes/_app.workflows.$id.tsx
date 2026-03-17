// ============================================
// Workflow Template Detail Route — flow graph + tabbed info panels
// ============================================

import { isRouteErrorResponse, useRouteError } from "react-router";
import { ErrorBoundaryContent } from "~/components/ui/error-boundary-content";
import { getTemplate, getRunsForTemplate } from "~/services/workflows";
import { TemplateDetail } from "~/components/workflows/template-detail";
import type { Route } from "./+types/_app.workflows.$id";

/** Loader — fetches template by ID and its runs, throws 404 if not found */
export async function clientLoader({ params }: Route.ClientLoaderArgs) {
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

/** Error boundary for workflow not found */
export function ErrorBoundary() {
  const error = useRouteError();
  console.error('Workflow detail route error:', error);
  if (isRouteErrorResponse(error) && error.status === 404) {
    return <ErrorBoundaryContent title="Workflow not found" message="The workflow template you're looking for doesn't exist or has been removed." />;
  }
  return <ErrorBoundaryContent message="An unexpected error occurred while loading this workflow." />;
}
