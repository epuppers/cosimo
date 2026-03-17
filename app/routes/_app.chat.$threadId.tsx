import { useEffect, useRef } from "react";
import { isRouteErrorResponse, useRouteError } from "react-router";
import { toast } from "sonner";
import { ErrorBoundaryContent } from "~/components/ui/error-boundary-content";
import { getThread } from "~/services/threads";
import { getRun } from "~/services/workflows";
import { MessageBlock } from "~/components/chat/message-block";
import { MessageStream, MessageThinking } from "~/components/chat/message-stream";
import { useChatStore } from "~/stores/chat-store";
import type { Route } from "./+types/_app.chat.$threadId";

/** Loader — fetches thread by ID and optionally its workflow run */
export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const thread = await getThread(params.threadId);
  if (!thread) {
    throw new Response("Thread not found", { status: 404 });
  }

  let run = null;
  if (thread.workflowRunId) {
    run = await getRun(thread.workflowRunId);
  }

  return { thread, run };
}

/** Thread detail view — messages + right-side panels */
export default function ChatThreadRoute({ loaderData }: Route.ComponentProps) {
  const { thread, run } = loaderData;
  const isWorkflowThread = !!thread.workflowRunId;
  const openWorkflowPanel = useChatStore((s) => s.openWorkflowPanel);

  // Track previous thread to avoid duplicate toasts on re-renders
  const prevThreadRef = useRef<string | null>(null);

  // Auto-open workflow panel when selecting a thread with a workflow run
  useEffect(() => {
    if (run && thread.workflowRunId) {
      openWorkflowPanel(thread.workflowRunId);

      // Show run status toast (only on thread change)
      if (prevThreadRef.current !== thread.id) {
        const runId = run.runId;
        if (run.status === 'completed') {
          toast(`Run ${runId} completed`);
        } else if (run.status === 'waiting') {
          toast(`Run ${runId} waiting for review`);
        } else if (run.status === 'running') {
          toast(`Run ${runId} in progress`);
        } else if (run.status === 'failed') {
          toast(`Run ${runId} failed`);
        }
      }
    }
    prevThreadRef.current = thread.id;
  }, [run, thread.workflowRunId, thread.id, openWorkflowPanel]);

  return (
    <>
      {thread.messages.map((message) => {
        // Erabor AI message uses streaming animation
        if (thread.id === 'erabor' && message.id === 'erabor-m2') {
          return <MessageStream key={message.id} />;
        }
        // Q4LP AI message shows thinking cubes animation
        if (thread.id === 'q4lp' && message.id === 'q4lp-m2') {
          return <MessageThinking key={message.id} />;
        }
        return (
          <MessageBlock
            key={message.id}
            message={message}
            isWorkflowThread={isWorkflowThread}
          />
        );
      })}
    </>
  );
}

/** Error boundary for thread not found */
export function ErrorBoundary() {
  const error = useRouteError();
  console.error('Thread route error:', error);
  if (isRouteErrorResponse(error) && error.status === 404) {
    return <ErrorBoundaryContent title="Thread not found" message="The thread you're looking for doesn't exist or has been removed." />;
  }
  return <ErrorBoundaryContent message="An unexpected error occurred while loading this thread." />;
}
