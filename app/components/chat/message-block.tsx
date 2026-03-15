import { Badge } from '~/components/ui/badge';
import { FileText, FileSpreadsheet, Folder, File, ThumbsUp, ThumbsDown } from 'lucide-react';
import type { Message, Attachment } from '~/services/types';
import { Artifact } from '~/components/chat/artifact';
import { cn } from '~/lib/utils';

/** Returns an icon component for a file attachment based on its type */
function fileIcon(type: string) {
  switch (type) {
    case 'pdf':
      return <FileText className="h-4 w-4 text-red-500 dark:text-red-400" />;
    case 'xlsx':
    case 'spreadsheet':
      return <FileSpreadsheet className="h-4 w-4 text-green-600 dark:text-green-400" />;
    case 'folder':
      return <Folder className="h-4 w-4 text-amber-500 dark:text-amber-400" />;
    default:
      return <File className="h-4 w-4 text-muted-foreground" />;
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
    <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm">
      <div className="flex-shrink-0">{fileIcon(attachment.type)}</div>
      <div className="min-w-0 flex-1">
        <div className="truncate font-[var(--font-mono)] text-xs font-medium">
          {attachment.name}
        </div>
        {meta.length > 0 && (
          <div className="text-[10px] text-muted-foreground">{meta.join(' · ')}</div>
        )}
      </div>
      <span className="flex-shrink-0 text-[10px] text-muted-foreground">Open ↗</span>
    </div>
  );
}

/** Renders the workflow file chip style (simpler, used in workflow threads) */
function WorkflowFileChip({ attachment }: { attachment: Attachment }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded border border-border bg-muted/50 px-2 py-1 text-xs">
      <span>{attachment.type === 'folder' ? '📁' : '📄'}</span>
      <span className="font-[var(--font-mono)]">
        {attachment.name}
        {attachment.fileCount ? ` — ${attachment.fileCount} files` : ''}
      </span>
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
    <div className="mb-4 relative">
      <div>
        {/* Header: avatar + name + timestamp */}
        <div className="flex items-center gap-2 mb-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-[var(--r-md)] bg-[var(--berry-3)] text-[10px] font-bold text-white border border-[var(--berry-2)] border-b-[var(--berry-5)] border-r-[var(--berry-5)]">
            E
          </div>
          <span className="font-[var(--font-sans)] text-sm font-medium text-foreground">
            Eliot Puplett
          </span>
          {message.timestamp && (
            <span className="text-xs text-muted-foreground">{message.timestamp}</span>
          )}
        </div>

        {/* Message body */}
        <div className="pl-8">
          {message.commandChip && (
            <span className="mr-2 inline-block rounded-[var(--r-sm)] bg-[var(--violet-3)] px-2 py-0.5 font-[var(--font-mono)] text-xs font-semibold text-white">
              {message.commandChip}
            </span>
          )}
          {message.content && (
            <div
              className="text-sm leading-relaxed text-foreground [&_p]:mb-2 [&_p:last-child]:mb-0"
              dangerouslySetInnerHTML={{ __html: message.content }}
            />
          )}
        </div>

        {/* File attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="pl-8 mt-2 flex flex-col gap-1.5">
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
    </div>
  );
}

/** Renders an AI message with Cosimo avatar, model badge, content, artifacts, and feedback */
function AIMessage({ message }: { message: Message }) {
  const isGate = message.isGate;

  return (
    <div className="mb-4 relative">
      <div
        className={cn(
          isGate &&
            'border-l-[3px] border-l-[var(--amber)] bg-[rgba(var(--amber-rgb),0.05)] dark:bg-[rgba(var(--amber-rgb),0.08)] rounded-r-[var(--r-md)] pl-3'
        )}
      >
        {/* Header: avatar + name + timestamp + model badge + gate chip */}
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <div className="flex h-6 w-6 items-center justify-center rounded-[var(--r-md)] bg-[var(--violet-3)] text-[10px] font-bold text-white border border-[var(--violet-2)] border-b-[var(--violet-5)] border-r-[var(--violet-5)]">
            ◆
          </div>
          <span className="font-[var(--font-sans)] text-sm font-medium text-foreground">
            Cosimo
          </span>
          {message.timestamp && (
            <span className="text-xs text-muted-foreground">{message.timestamp}</span>
          )}
          {message.model && (
            <Badge
              variant="outline"
              className="font-[var(--font-mono)] text-[10px] px-1.5 py-0 h-4 border-border text-muted-foreground"
            >
              {message.model}
            </Badge>
          )}
          {isGate && message.gateStatus === 'awaiting' && (
            <span className="inline-flex items-center gap-1 rounded-[var(--r-sm)] border border-[rgba(var(--amber-rgb),0.3)] bg-[rgba(var(--amber-rgb),0.1)] px-1.5 py-0 font-[var(--font-mono)] text-[10px] font-semibold text-[var(--amber)] dark:bg-[rgba(var(--amber-rgb),0.15)]">
              ⏸ Awaiting Review
            </span>
          )}
        </div>

        {/* Message body */}
        {message.content && (
          <div className="pl-8">
            <div
              className="text-sm leading-relaxed text-foreground [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:font-semibold"
              dangerouslySetInnerHTML={{ __html: message.content }}
            />
          </div>
        )}

        {/* Artifacts */}
        {message.artifacts && message.artifacts.length > 0 && (
          <div className="pl-8">
            {message.artifacts.map((art, i) => (
              <Artifact key={i} artifact={art} />
            ))}
          </div>
        )}

        {/* Feedback buttons (AI messages only, non-gate) */}
        {!isGate && (
          <div className="pl-8 mt-1.5 flex gap-1">
            <button
              className="flex h-6 w-6 items-center justify-center rounded-[var(--r-md)] border border-transparent text-muted-foreground transition-colors hover:border-border hover:text-green-500 hover:bg-green-500/10 dark:hover:text-green-400 dark:hover:bg-green-500/20"
              title="Good response"
              aria-label="Good response"
            >
              <ThumbsUp className="h-3 w-3" />
            </button>
            <button
              className="flex h-6 w-6 items-center justify-center rounded-[var(--r-md)] border border-transparent text-muted-foreground transition-colors hover:border-border hover:text-red-500 hover:bg-red-500/10 dark:hover:text-red-400 dark:hover:bg-red-500/20"
              title="Poor response"
              aria-label="Poor response"
            >
              <ThumbsDown className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
