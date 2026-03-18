import { useCallback, useEffect, useRef } from "react";
import { Outlet, useMatches } from "react-router";
import { ChatHeader } from "~/components/chat/chat-header";
import { ChatInput } from "~/components/chat/chat-input";
import { FilePanel } from "~/components/chat/file-panel";
import { WorkflowPanel } from "~/components/chat/workflow-panel";
import { useChatStore } from "~/stores/chat-store";
import { useGreeting } from "~/hooks/use-greeting";
import { MOCK_USER } from "~/data/mock-user";
import type { Thread, WorkflowRun, Attachment } from "~/services/types";
import { EMPTY_ATTACHMENTS } from "~/stores/chat-store";

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

  // Sync store activeThreadId with the route so per-thread state works
  const selectThread = useChatStore((s) => s.selectThread);
  const routeThreadId = thread?.id ?? null;
  useEffect(() => {
    selectThread(routeThreadId);
  }, [routeThreadId, selectThread]);

  const { salutation, phrase } = useGreeting(MOCK_USER.firstName);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const openCloudDrive = useChatStore((s) => s.openCloudDrive);
  const addPendingFiles = useChatStore((s) => s.addPendingFiles);
  const clearPendingFiles = useChatStore((s) => s.clearPendingFiles);
  const pendingFiles = useChatStore((s) => s.pendingFilesByThread[s.activeThreadId ?? ''] ?? EMPTY_ATTACHMENTS);
  const removePendingFile = useChatStore((s) => s.removePendingFile);
  const openFilePanel = useChatStore((s) => s.openFilePanel);

  const handleAttach = useCallback(
    (type: 'computer' | 'drive') => {
      if (type === 'drive') {
        openCloudDrive('attach');
      } else {
        fileInputRef.current?.click();
      }
    },
    [openCloudDrive],
  );

  /** Format bytes to a human-readable string */
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }, []);

  /** Extract file extension from name */
  const getFileType = useCallback((name: string): string => {
    const ext = name.split('.').pop()?.toLowerCase();
    return ext ?? 'file';
  }, []);

  const handleFileInputChange = useCallback(() => {
    const input = fileInputRef.current;
    if (!input?.files?.length) return;
    const converted: Attachment[] = Array.from(input.files).map((f) => ({
      name: f.name,
      type: getFileType(f.name),
      size: formatFileSize(f.size),
    }));
    addPendingFiles(converted);
    input.value = '';
  }, [addPendingFiles, openFilePanel, formatFileSize, getFileType]);

  const handleSend = useCallback(() => {
    clearPendingFiles();
  }, [clearPendingFiles]);

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {thread && <ChatHeader thread={thread} />}
        <div className="flex-1 flex flex-col overflow-y-auto px-6 py-5">
          {hasChildRoute ? (
            <Outlet />
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 px-5 py-10 text-center">
              <div className="text-[1.75rem] text-[var(--violet-2)] mb-3">◆</div>
              <div className="font-[family-name:var(--mono)] text-sm font-bold text-[var(--taupe-5)] mb-1.5">{salutation}. {phrase}</div>
              <div className="font-[family-name:var(--mono)] text-[0.6875rem] text-[var(--taupe-3)] max-w-xs leading-relaxed">
                Ask about fund performance, document analysis, compliance checks, or anything across your portfolio.
              </div>
              <div className="flex flex-wrap gap-1.5 mt-4 justify-center">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    className="font-[family-name:var(--mono)] text-[0.6875rem] py-[5px] px-3 text-[var(--taupe-4)] bg-[var(--off-white)] border border-[var(--taupe-2)] border-r-[var(--taupe-3)] border-b-[var(--taupe-3)] cursor-pointer transition-all duration-[120ms] rounded-[var(--r-md)] hover:bg-[var(--berry-1)] hover:text-[var(--berry-5)] hover:border-[var(--berry-2)] hover:border-r-[var(--berry-4)] hover:border-b-[var(--berry-4)] dark:bg-[var(--surface-1)] dark:border-[var(--taupe-2)] dark:text-[var(--taupe-3)] dark:hover:bg-[var(--berry-1)] dark:hover:text-[var(--berry-3)] dark:hover:border-[var(--berry-2)] dark:hover:border-r-[var(--berry-4)] dark:hover:border-b-[var(--berry-4)]"
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
          onSend={handleSend}
          onAttach={handleAttach}
          stagedFiles={pendingFiles.map((f) => ({ name: f.name, type: f.type, size: f.size ?? '' }))}
          onRemoveFile={removePendingFile}
          onClearAll={clearPendingFiles}
          placeholder="Ask Cosimo anything..."
        />
      </div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />
      <FilePanel />
      {run && <WorkflowPanel run={run} />}
    </div>
  );
}
