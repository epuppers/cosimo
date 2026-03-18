import { FolderOpen, Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { useChatStore, EMPTY_ATTACHMENTS } from "~/stores/chat-store";
import { cn } from "~/lib/utils";
import type { Thread } from "~/services/types";

// Shared header button classes
const headerBtnCls =
  "px-1.5 py-1 flex items-center justify-center text-[0.6875rem] font-semibold text-taupe-4 bg-off-white border border-solid border-t-taupe-2 border-l-taupe-2 border-b-taupe-3 border-r-taupe-3 cursor-pointer rounded-[var(--r-md)] hover:bg-berry-1 hover:text-berry-5 active:border-t-taupe-3 active:border-l-taupe-3 active:border-b-taupe-2 active:border-r-taupe-2 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2 dark:border-taupe-2 dark:hover:text-berry-3 dark:hover:bg-berry-1 disabled:text-taupe-2 disabled:border-taupe-1 disabled:bg-off-white disabled:cursor-default disabled:opacity-50 disabled:hover:bg-off-white disabled:hover:text-taupe-2 [&_svg]:block [[data-a11y-labels=show]_&]:w-auto [[data-a11y-labels=show]_&]:h-7 [[data-a11y-labels=show]_&]:px-2";

// Shared icon classes — hidden when labels mode is active
const headerIconCls = "[[data-a11y-labels=show]_&]:hidden";

// Shared label classes — hidden by default, shown when labels mode is active
const headerLabelCls = "hidden [[data-a11y-labels=show]_&]:inline font-[family-name:var(--mono)] font-semibold text-[0.625rem] tracking-[0.03em] whitespace-nowrap";

/** Chat thread header — title + action buttons (Files, Export, Share) */
export function ChatHeader({ thread }: { thread: Thread }) {
  const openFilePanel = useChatStore((s) => s.openFilePanel);
  const pendingFiles = useChatStore((s) => s.pendingFilesByThread[s.activeThreadId ?? ''] ?? EMPTY_ATTACHMENTS);
  const hasPending = pendingFiles.length > 0;
  const hasFiles = !!thread.hasFiles || hasPending;

  return (
    <div
      className="flex justify-between items-center px-4 py-2.5 border-b-2 border-solid bg-white dark:bg-surface-1 min-h-[44px]"
      style={{ borderImage: 'linear-gradient(90deg, var(--taupe-2), var(--berry-2), var(--violet-2)) 1' }}
    >
      <span className="font-[family-name:var(--pixel)] text-base text-taupe-5 tracking-[0.5px]">{thread.title}</span>
      <div className="flex gap-1.5 items-center">
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn(headerBtnCls, hasPending && '!text-violet-3 !border-violet-3 !bg-[rgba(var(--violet-3-rgb),0.08)] dark:!bg-[rgba(var(--violet-3-rgb),0.12)]')}
          disabled={!hasFiles}
          title="Files"
          aria-label="Files"
          data-label="Files"
          onClick={() => hasFiles && openFilePanel('folder')}
        >
          <FolderOpen size={14} className={headerIconCls} />
          <span className={headerLabelCls}>Files</span>
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className={headerBtnCls}
          title="Export"
          aria-label="Export"
          data-label="Export"
          onClick={() => toast("Thread exported to clipboard")}
        >
          <Download size={14} className={headerIconCls} />
          <span className={headerLabelCls}>Export</span>
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className={headerBtnCls}
          title="Share"
          aria-label="Share"
          data-label="Share"
          onClick={() => toast("Share link copied")}
        >
          <Share2 size={14} className={headerIconCls} />
          <span className={headerLabelCls}>Share</span>
        </Button>
      </div>
    </div>
  );
}
