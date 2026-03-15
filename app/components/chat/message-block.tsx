import { Copy, RotateCcw, Pencil, ThumbsUp, ThumbsDown } from 'lucide-react';
import type { Message, Attachment } from '~/services/types';
import { Artifact } from '~/components/chat/artifact';
import { cn } from '~/lib/utils';

/** Returns an icon character for a file attachment based on its type */
function fileIconChar(type: string): string {
  switch (type) {
    case 'pdf': return '📄';
    case 'xlsx':
    case 'spreadsheet': return '📊';
    case 'folder': return '📁';
    default: return '📎';
  }
}

/** Returns the CSS class for the file icon color by type */
function fileIconClass(type: string): string {
  switch (type) {
    case 'pdf': return 'file-icon-pdf';
    case 'xlsx':
    case 'spreadsheet': return 'file-icon-xlsx';
    case 'folder': return 'file-icon-folder';
    default: return '';
  }
}

/** Renders a file attachment chip */
function FileAttachment({ attachment }: { attachment: Attachment }) {
  const meta: string[] = [];
  if (attachment.pages) meta.push(`${attachment.pages} pages`);
  if (attachment.sheets?.length) meta.push(`${attachment.sheets.length} sheets`);
  if (attachment.fileCount) meta.push(`${attachment.fileCount} files`);
  if (attachment.size) meta.push(attachment.size);

  return (
    <div className="file-attachment">
      <div className={cn('file-attachment-icon', fileIconClass(attachment.type))}>
        {fileIconChar(attachment.type)}
      </div>
      <div className="file-attachment-info">
        <div className="file-attachment-name">{attachment.name}</div>
        {meta.length > 0 && (
          <div className="file-attachment-meta">{meta.join(' · ')}</div>
        )}
      </div>
      <span className="file-attachment-action">Open ↗</span>
    </div>
  );
}

/** Renders the workflow file chip style (simpler, used in workflow threads) */
function WorkflowFileChip({ attachment }: { attachment: Attachment }) {
  return (
    <div className="file-attachment">
      <div className={cn('file-attachment-icon', fileIconClass(attachment.type))}>
        {fileIconChar(attachment.type)}
      </div>
      <div className="file-attachment-info">
        <div className="file-attachment-name">
          {attachment.name}
          {attachment.fileCount ? ` — ${attachment.fileCount} files` : ''}
        </div>
      </div>
    </div>
  );
}

interface MessageBlockProps {
  message: Message;
  /** Whether this message is in a workflow thread (uses simpler file chips) */
  isWorkflowThread?: boolean;
}

/**
 * Renders a single chat message — either user or AI.
 * Handles command chips, file attachments, artifacts, gate messages, and feedback buttons.
 */
export function MessageBlock({ message, isWorkflowThread }: MessageBlockProps) {
  if (message.type === 'user') {
    return <UserMessage message={message} isWorkflowThread={isWorkflowThread} />;
  }
  return <AIMessage message={message} />;
}

/** Renders a user message with avatar, name, timestamp, content, and attachments */
function UserMessage({ message, isWorkflowThread }: { message: Message; isWorkflowThread?: boolean }) {
  return (
    <div className="msg-block">
      <div className="user-card">
        {/* Header: avatar + name + timestamp */}
        <div className="msg-header">
          <div className="msg-badge msg-badge-human">E</div>
          <span className="msg-sender">Eliot Puplett</span>
          {message.timestamp && (
            <span className="msg-timestamp">{message.timestamp}</span>
          )}
        </div>

        {/* Message body */}
        <div className="msg-body">
          {message.commandChip && (
            <span className="wf-command-chip mr-2">
              {message.commandChip}
            </span>
          )}
          {message.content && (
            <div dangerouslySetInnerHTML={{ __html: message.content }} />
          )}
        </div>

        {/* File attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="msg-file-attachments">
            {message.attachments.map((att, i) =>
              isWorkflowThread ? (
                <WorkflowFileChip key={i} attachment={att} />
              ) : (
                <FileAttachment key={i} attachment={att} />
              )
            )}
          </div>
        )}
      </div>

      {/* Hover actions */}
      <div className="msg-actions">
        <button className="msg-action-btn" title="Copy" aria-label="Copy message">
          <Copy />
        </button>
        <button className="msg-action-btn" title="Edit" aria-label="Edit message">
          <Pencil />
        </button>
      </div>
    </div>
  );
}

/** Renders an AI message with Cosimo avatar, model badge, content, artifacts, and feedback */
function AIMessage({ message }: { message: Message }) {
  const isGate = message.isGate;

  return (
    <div className="msg-block">
      <div className={cn('ai-block', isGate && 'msg-gate')}>
        {/* Header: avatar + name + timestamp + model badge + gate chip */}
        <div className="msg-header flex-wrap">
          <div className="msg-badge msg-badge-ai">◆</div>
          <span className="msg-sender">Cosimo</span>
          {message.timestamp && (
            <span className="msg-timestamp">{message.timestamp}</span>
          )}
          {message.model && (
            <span className="model-badge">{message.model}</span>
          )}
          {isGate && message.gateStatus === 'awaiting' && (
            <span className="msg-gate-chip">⏸ Awaiting Review</span>
          )}
        </div>

        {/* Message body */}
        {message.content && (
          <div className="msg-body">
            <div dangerouslySetInnerHTML={{ __html: message.content }} />
          </div>
        )}

        {/* Artifacts */}
        {message.artifacts && message.artifacts.length > 0 && (
          <div className="ml-[30px]">
            {message.artifacts.map((art, i) => (
              <Artifact key={i} artifact={art} />
            ))}
          </div>
        )}

        {/* Feedback buttons (AI messages only, non-gate) */}
        {!isGate && (
          <div className="msg-feedback">
            <button
              className="feedback-btn up"
              title="Good response"
              aria-label="Good response"
            >
              <ThumbsUp />
            </button>
            <button
              className="feedback-btn down"
              title="Poor response"
              aria-label="Poor response"
            >
              <ThumbsDown />
            </button>
          </div>
        )}
      </div>

      {/* Hover actions */}
      <div className="msg-actions">
        <button className="msg-action-btn" title="Copy" aria-label="Copy message">
          <Copy />
        </button>
        <button className="msg-action-btn" title="Regenerate" aria-label="Regenerate response">
          <RotateCcw />
        </button>
      </div>
    </div>
  );
}
