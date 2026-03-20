import { useState, useEffect, useRef } from "react";
import { Outlet, useRouteError, isRouteErrorResponse } from "react-router";
import { AlertCircle } from "lucide-react";
import { AppSidebar, AppSidebarProvider } from "~/components/layout/app-sidebar";
import { AppHeader } from "~/components/layout/app-header";
import { SidebarInset } from "~/components/ui/sidebar";
import { CosimoPanel } from "~/components/layout/cosimo-panel";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { LogoMark } from "~/components/layout/logo";
import { useKeyboard } from "~/hooks/use-keyboard";
import { getThreads } from "~/services/threads";
import { getAllRuns, getTemplates } from "~/services/workflows";
import { getEntitySchema, getEntity } from "~/services/entities";
import { useEntityStore } from "~/stores/entity-store";
import { EntityDetailPanel } from "~/components/rolodex/entity-detail-panel";
import { cn } from "~/lib/utils";
import type { Entity, EntitySchema } from "~/services/types";
import type { Route } from "./+types/_app";

/** Loader — fetches threads, runs, and entity schema for the sidebar and global panels */
export async function clientLoader() {
  const [threads, runs, templates, entitySchema] = await Promise.all([
    getThreads(), getAllRuns(), getTemplates(), getEntitySchema(),
  ]);
  return { threads, runs, templates, entitySchema };
}

/** Global entity detail slide-over — renders on top of any route */
function EntitySlideOver({ schema }: { schema: EntitySchema }) {
  const selectedEntityId = useEntityStore((s) => s.selectedEntityId);
  const selectEntity = useEntityStore((s) => s.selectEntity);
  const [entity, setEntity] = useState<Entity | null>(null);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Fetch entity when selectedEntityId changes
  useEffect(() => {
    if (!selectedEntityId) {
      setEntity(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getEntity(selectedEntityId).then((result) => {
      if (!cancelled) {
        setEntity(result);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [selectedEntityId]);

  // Focus close button on open
  useEffect(() => {
    if (selectedEntityId && !loading && entity) {
      // Focus the close button inside EntityDetailPanel
      const closeBtn = panelRef.current?.querySelector('button[aria-label="Close entity details"]') as HTMLButtonElement | null;
      if (closeBtn) {
        closeBtn.focus();
      }
    }
  }, [selectedEntityId, loading, entity]);

  // Escape key closes
  useEffect(() => {
    if (!selectedEntityId) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') selectEntity(null);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedEntityId, selectEntity]);

  if (!selectedEntityId) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-label={entity ? `${entity.name} details` : 'Entity details'}
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 dark:bg-black/40"
        aria-hidden="true"
        onClick={() => selectEntity(null)}
      />
      {/* Panel */}
      <div
        ref={panelRef}
        className={cn(
          "relative w-[480px] max-w-[90vw] h-full overflow-hidden",
          "bg-white dark:bg-surface-1",
          "shadow-[-4px_0_24px_rgba(0,0,0,0.12)]",
          "border-l border-taupe-2 dark:border-surface-3",
          "translate-x-0 transition-transform duration-200 ease-out",
          "[data-a11y-motion='reduce']:transition-none motion-reduce:transition-none"
        )}
      >
        {loading || !entity ? (
          /* Skeleton loading state */
          <div className="flex flex-col gap-4 p-4">
            {/* Header skeleton */}
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-taupe-1 animate-pulse motion-reduce:animate-none" />
              <div className="flex flex-col gap-1.5 flex-1">
                <div className="h-4 w-32 rounded bg-taupe-1 animate-pulse motion-reduce:animate-none" />
                <div className="h-3 w-48 rounded bg-taupe-1 animate-pulse motion-reduce:animate-none" />
              </div>
              <button
                onClick={() => selectEntity(null)}
                aria-label="Close entity details"
                className={cn(
                  "shrink-0 p-1 rounded-[var(--r-sm)]",
                  "text-taupe-3 hover:text-taupe-5",
                  "focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2"
                )}
              >
                <span className="sr-only">Close</span>
              </button>
            </div>
            {/* Property block skeletons */}
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="h-3 w-20 rounded bg-taupe-1 animate-pulse motion-reduce:animate-none" />
                <div className="h-8 w-full rounded bg-taupe-1 animate-pulse motion-reduce:animate-none" />
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full overflow-y-auto">
            <EntityDetailPanel entity={entity} schema={schema} />
          </div>
        )}
      </div>
    </div>
  );
}

/** App shell layout wrapping all authenticated routes — sidebar, header, main content, Cosimo panel */
export default function AppLayout({ loaderData }: Route.ComponentProps) {
  const { threads, runs, templates, entitySchema } = loaderData;

  // Global keyboard shortcuts (Escape chain, Cmd+K)
  useKeyboard();

  return (
    <div className="app-frame flex w-screen h-screen p-1 overflow-hidden bg-taupe-4">
      <AppSidebarProvider>
        <AppSidebar threads={threads} runs={runs} templates={templates} />
        <SidebarInset>
          <AppHeader />

          {/* Content area */}
          <main className="flex-1 flex flex-col overflow-hidden">
            <Outlet />
          </main>
        </SidebarInset>

        {/* Cosimo slide-in panel */}
        <CosimoPanel />

        {/* Global entity detail slide-over */}
        <EntitySlideOver schema={entitySchema} />
      </AppSidebarProvider>
    </div>
  );
}

/** Catch-all error boundary — full-page error state with app logo and reload button */
export function ErrorBoundary() {
  const error = useRouteError();
  console.error('App error:', error);

  const is404 = isRouteErrorResponse(error) && error.status === 404;
  const title = is404 ? 'Page not found' : 'Something went wrong';
  const description = is404
    ? 'The page you\u2019re looking for doesn\u2019t exist or has been moved.'
    : 'An unexpected error occurred. Please try reloading the page.';

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-background p-8">
      <LogoMark />
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="mt-2">{description}</AlertDescription>
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Reload page
          </Button>
        </div>
      </Alert>
    </div>
  );
}
