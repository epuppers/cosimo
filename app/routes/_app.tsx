import { Outlet, useRouteError, isRouteErrorResponse } from "react-router";
import { AlertCircle } from "lucide-react";
import { AppSidebar, AppSidebarProvider } from "~/components/layout/app-sidebar";
import { AppHeader } from "~/components/layout/app-header";
import { SidebarInset } from "~/components/ui/sidebar";
import { SidebarResizeHandle } from "~/components/layout/sidebar-resize-handle";
import { CosimoPanel } from "~/components/layout/cosimo-panel";
import { cn } from "~/lib/utils";
import { useUIStore } from "~/stores/ui-store";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { LogoMark } from "~/components/layout/logo";
import { useKeyboard } from "~/hooks/use-keyboard";
import { getThreads } from "~/services/threads";
import { getAllRuns, getTemplates } from "~/services/workflows";
import type { Route } from "./+types/_app";

/** Loader — fetches threads and runs for the sidebar */
export async function clientLoader() {
  const [threads, runs, templates] = await Promise.all([
    getThreads(), getAllRuns(), getTemplates(),
  ]);
  return { threads, runs, templates };
}

/** App shell layout wrapping all authenticated routes — sidebar, header, main content, Cosimo panel */
export default function AppLayout({ loaderData }: Route.ComponentProps) {
  const { threads, runs, templates } = loaderData;
  const sidebarDragState = useUIStore((s) => s.sidebarDragState);

  // Global keyboard shortcuts (Escape chain, Cmd+K)
  useKeyboard();

  return (
    <div className={cn(
      "app-frame flex w-screen h-screen p-1 overflow-hidden bg-taupe-4",
      sidebarDragState === "narrow" && "sidebar-narrow",
      sidebarDragState !== "idle" && "sidebar-dragging"
    )}>
      <AppSidebarProvider>
        <AppSidebar threads={threads} runs={runs} templates={templates} />
        <SidebarResizeHandle />
        <SidebarInset>
          <AppHeader />

          {/* Content area */}
          <main className="flex-1 flex flex-col overflow-hidden">
            <Outlet />
          </main>
        </SidebarInset>

        {/* Cosimo slide-in panel */}
        <CosimoPanel />
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
