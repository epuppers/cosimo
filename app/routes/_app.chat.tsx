import { Outlet, useMatches } from "react-router";
import { MessageSquare } from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";

/**
 * Chat layout route — wraps thread detail routes.
 * When no thread is selected (index), shows a centered placeholder.
 */
export default function ChatRoute() {
  const matches = useMatches();
  // Check if a child thread route is matched (has threadId param)
  const hasChildRoute = matches.some(
    (m) => m.id === "routes/_app.chat.$threadId"
  );

  if (!hasChildRoute) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
        <MessageSquare className="size-10 opacity-30" />
        <p className="text-sm">Select a thread or start a new conversation</p>
      </div>
    );
  }

  return <Outlet />;
}

/** Loading skeleton — 6 thread items in sidebar placeholder */
export function HydrateFallback() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
      <div className="w-full max-w-md space-y-3 px-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-md p-3">
            <Skeleton className="size-8 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
