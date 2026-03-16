import { Outlet, useMatches } from "react-router";
import { Skeleton } from "~/components/ui/skeleton";
import { ChatHeader } from "~/components/chat/chat-header";
import { ChatInput } from "~/components/chat/chat-input";
import { FilePanel } from "~/components/chat/file-panel";
import { WorkflowPanel } from "~/components/chat/workflow-panel";
import type { Thread, WorkflowRun } from "~/services/types";

/** Suggestion chips for the empty thread state */
const SUGGESTIONS = [
  { label: 'Distribution comparison', prompt: 'Compare Q3 and Q4 distributions across all active funds' },
  { label: 'NAV review', prompt: 'Pull the latest NAV report for Fund IV and flag any valuation changes above 10%' },
  { label: 'Covenant check', prompt: 'Summarize all outstanding covenant violations across the loan book' },
  { label: 'Capital call', prompt: 'Generate a capital call notice for the next tranche' },
];

/**
 * Chat layout route — wraps thread detail routes.
 * Provides shared layout: .chat-with-panel > .chat-main > (.chat-scroll + ChatInput)
 * When no thread is selected (index), shows a centered placeholder.
 */
export default function ChatRoute() {
  const matches = useMatches();
  // Check if a child thread route is matched (has threadId param)
  const threadMatch = matches.find(
    (m) => m.id === "routes/_app.chat.$threadId"
  );
  const hasChildRoute = !!threadMatch;
  const threadData = threadMatch?.data as { thread?: Thread; run?: WorkflowRun | null } | undefined;
  const thread = threadData?.thread;
  const run = threadData?.run;

  return (
    <div className="chat-with-panel">
      <div className="chat-main">
        {thread && <ChatHeader thread={thread} />}
        <div className="chat-scroll">
          {hasChildRoute ? (
            <Outlet />
          ) : (
            <div className="empty-thread">
              <div className="empty-thread-icon">◆</div>
              <div className="empty-thread-title">What can Cosimo help with?</div>
              <div className="empty-thread-sub">
                Ask about fund performance, document analysis, compliance checks, or anything across your portfolio.
              </div>
              <div className="empty-thread-suggestions">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    className="empty-thread-chip"
                    data-suggestion={s.prompt}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <ChatInput
          onSend={() => {}}
          placeholder="Ask Cosimo anything..."
        />
      </div>
      <FilePanel />
      {run && <WorkflowPanel run={run} />}
    </div>
  );
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
