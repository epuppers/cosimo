import { FolderOpen, Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useChatStore } from "~/stores/chat-store";
import type { Thread } from "~/services/types";

/** Chat thread header — title + action buttons (Files, Export, Share) */
export function ChatHeader({ thread }: { thread: Thread }) {
  const openFilePanel = useChatStore((s) => s.openFilePanel);
  const hasFiles = !!thread.hasFiles;

  return (
    <div className="main-header">
      <span className="header-title">{thread.title}</span>
      <div className="header-actions">
        <button
          type="button"
          className={`header-btn bevel icon-btn${hasFiles ? "" : " disabled"}`}
          disabled={!hasFiles}
          title="Files"
          aria-label="Files"
          data-label="Files"
          onClick={() => hasFiles && openFilePanel('folder')}
        >
          <FolderOpen size={14} />
          <span className="a11y-label">Files</span>
        </button>
        <button
          type="button"
          className="header-btn bevel icon-btn"
          title="Export"
          aria-label="Export"
          data-label="Export"
          onClick={() => toast("Thread exported to clipboard")}
        >
          <Download size={14} />
          <span className="a11y-label">Export</span>
        </button>
        <button
          type="button"
          className="header-btn bevel icon-btn"
          title="Share"
          aria-label="Share"
          data-label="Share"
          onClick={() => toast("Share link copied")}
        >
          <Share2 size={14} />
          <span className="a11y-label">Share</span>
        </button>
      </div>
    </div>
  );
}
