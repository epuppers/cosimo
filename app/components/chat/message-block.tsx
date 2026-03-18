import { useRef } from 'react';
import { Copy, RotateCcw, Pencil, ThumbsUp, ThumbsDown, RotateCw } from 'lucide-react';
import type { Message, Attachment } from '~/services/types';
import { Artifact } from '~/components/chat/artifact';
import { Footnotes, CitationTooltip, useCitationClick } from '~/components/chat/citations';
import { useChatStore } from '~/stores/chat-store';
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

/** Returns Tailwind classes for the file icon background/border colors by type */
function fileIconClasses(type: string): string {
  switch (type) {
    case 'pdf': return 'bg-blue-3 border-t-blue-2 border-l-blue-2 border-r-blue-3 border-b-blue-3';
    case 'folder': return 'bg-amber border-t-taupe-2 border-l-taupe-2 border-r-taupe-3 border-b-taupe-3';
    default: return 'bg-green border-t-taupe-2 border-l-taupe-2 border-r-taupe-3 border-b-taupe-3';
  }
}

/** Returns Tailwind grid classes for file attachment layout based on count */
function attachmentGridCols(count: number): string {
  const cols = Math.min(count, 5);
  const colsClass = ['', 'grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4', 'grid-cols-5'][cols];
  return `grid ${colsClass} gap-1.5`;
}

/** Renders a file attachment chip */
function FileAttachment({ attachment, compact }: { attachment: Attachment; compact?: boolean }) {
  const openFilePanel = useChatStore((s) => s.openFilePanel);
  const meta: string[] = [];
  if (attachment.pages) meta.push(`${attachment.pages} pages`);
  if (attachment.sheets?.length) meta.push(`${attachment.sheets.length} sheets`);
  if (attachment.fileCount) meta.push(`${attachment.fileCount} files`);
  if (attachment.size) meta.push(attachment.size);

  return (
    <div
      className="flex items-center gap-2.5 px-3 py-2 bg-off-white border-2 rounded-r-md cursor-pointer transition-all duration-150 border-t-taupe-2 border-l-taupe-2 border-r-taupe-4 border-b-taupe-4 hover:bg-berry-1 hover:border-t-berry-2 hover:border-l-berry-2 hover:border-r-berry-4 hover:border-b-berry-4 dark:bg-surface-1 dark:border-taupe-3 dark:hover:bg-berry-1 dark:hover:border-berry-2 min-w-0"
      onClick={() => openFilePanel('spreadsheet')}
    >
      <div className={cn(
        'w-8 h-8 flex items-center justify-center text-sm text-white shrink-0 rounded-r-md border',
        fileIconClasses(attachment.type)
      )}>
        {fileIconChar(attachment.type)}
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="font-mono text-xs font-semibold text-taupe-5 truncate">{attachment.name}</div>
        {!compact && meta.length > 0 && (
          <div className="font-mono text-[0.625rem] text-taupe-3 mt-0.5 truncate">{meta.join(' · ')}</div>
        )}
      </div>
      <span className="font-mono text-[0.6875rem] font-semibold text-violet-3 tracking-[0.05em] shrink-0">
        {compact ? '↗' : 'Open ↗'}
      </span>
    </div>
  );
}

/** Renders the workflow file chip style (simpler, used in workflow threads) */
function WorkflowFileChip({ attachment }: { attachment: Attachment }) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2 bg-off-white border-2 rounded-r-md cursor-pointer transition-all duration-150 border-t-taupe-2 border-l-taupe-2 border-r-taupe-4 border-b-taupe-4 hover:bg-berry-1 hover:border-t-berry-2 hover:border-l-berry-2 hover:border-r-berry-4 hover:border-b-berry-4 dark:bg-surface-1 dark:border-taupe-3 dark:hover:bg-berry-1 dark:hover:border-berry-2">
      <div className={cn(
        'w-8 h-8 flex items-center justify-center text-sm text-white shrink-0 rounded-r-md border',
        fileIconClasses(attachment.type)
      )}>
        {fileIconChar(attachment.type)}
      </div>
      <div className="flex-1">
        <div className="font-mono text-xs font-semibold text-taupe-5">
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
    <div className="group mb-4 relative">
      <div className="bg-[rgba(var(--berry-3-rgb),0.05)] border border-[rgba(var(--berry-3-rgb),0.12)] p-[10px_12px] rounded-r-md dark:bg-[rgba(var(--violet-3-rgb),0.08)] dark:border-[rgba(var(--violet-3-rgb),0.15)]">
        {/* Header: avatar + name + timestamp */}
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-[22px] h-[22px] flex items-center justify-center font-mono text-[0.6875rem] font-bold shrink-0 rounded-r-md bg-berry-3 text-white border border-berry-2 border-r-berry-5 border-b-berry-5">E</div>
          <span className="font-mono text-xs font-semibold text-taupe-5">Eliot Puplett</span>
          {message.timestamp && (
            <span className="font-mono text-xs text-taupe-3">{message.timestamp}</span>
          )}
        </div>

        {/* Message body */}
        <div className="msg-body ml-[30px] font-sans text-sm leading-[1.6] text-taupe-5 break-words">
          {message.commandChip && (
            <span className="inline-block font-mono text-xs font-semibold px-2 py-0.5 bg-violet-3 text-white rounded-r-sm tracking-[0.02em] mr-2">
              {message.commandChip}
            </span>
          )}
          {message.content && (
            <div dangerouslySetInnerHTML={{ __html: message.content }} />
          )}
        </div>

        {/* File attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className={cn(attachmentGridCols(message.attachments.length), 'mt-2 ml-[30px]')}>
            {message.attachments.map((att, i) =>
              isWorkflowThread ? (
                <WorkflowFileChip key={i} attachment={att} />
              ) : (
                <FileAttachment key={i} attachment={att} compact={message.attachments!.length >= 3} />
              )
            )}
          </div>
        )}
      </div>

      {/* Hover actions */}
      <div className="hidden group-hover:flex absolute top-1 right-1 gap-0.5 z-5 bg-white border border-taupe-2 p-0.5 shadow-[2px_2px_0_rgba(0,0,0,0.08)] rounded-r-md dark:bg-surface-2 dark:border-taupe-3 dark:shadow-[2px_2px_0_rgba(0,0,0,0.2)]">
        <button className="msg-action-btn w-[26px] h-[26px] flex items-center justify-center bg-transparent border border-transparent cursor-pointer text-taupe-3 transition-all duration-100 p-0 rounded-r-md hover:text-taupe-5 hover:bg-berry-1 hover:border-taupe-2 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-1 [&_svg]:w-[13px] [&_svg]:h-[13px]" title="Copy" aria-label="Copy message">
          <Copy />
          <span className="a11y-label">Copy</span>
        </button>
        <button className="msg-action-btn w-[26px] h-[26px] flex items-center justify-center bg-transparent border border-transparent cursor-pointer text-taupe-3 transition-all duration-100 p-0 rounded-r-md hover:text-taupe-5 hover:bg-berry-1 hover:border-taupe-2 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-1 [&_svg]:w-[13px] [&_svg]:h-[13px]" title="Edit" aria-label="Edit message">
          <Pencil />
          <span className="a11y-label">Edit</span>
        </button>
      </div>
    </div>
  );
}

/** Renders an AI message with Cosimo avatar, model badge, content, artifacts, and feedback */
function AIMessage({ message }: { message: Message }) {
  const isGate = message.isGate;
  const hasCitations = message.citations && message.citations.length > 0;
  const containerRef = useRef<HTMLDivElement>(null);

  useCitationClick(containerRef, message.citations ?? []);

  return (
    <div className="group mb-4 relative">
      <div ref={containerRef} className={cn(
        'p-[10px_12px] border border-transparent',
        isGate && 'border-l-[3px] border-l-amber bg-[rgba(var(--amber-rgb),0.05)] rounded-r-[0_var(--r-md)_var(--r-md)_0] pl-3 dark:bg-[rgba(var(--amber-rgb),0.08)]'
      )}>
        {/* Header: avatar + name + timestamp + model badge + gate chip */}
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <div className="w-[22px] h-[22px] flex items-center justify-center font-mono text-[0.6875rem] font-bold shrink-0 rounded-r-md bg-violet-3 text-white border border-violet-2 border-r-violet-5 border-b-violet-5">◆</div>
          <span className="font-mono text-xs font-semibold text-taupe-5">Cosimo</span>
          {message.timestamp && (
            <span className="font-mono text-xs text-taupe-3">{message.timestamp}</span>
          )}
          {message.latency && (
            <span className="font-mono text-[0.6875rem] text-blue-3 border border-blue-2 px-1.5 py-0.5 bg-blue-1 rounded-r-md">{message.latency}</span>
          )}
          {message.model && (
            <span className="font-mono text-[0.625rem] font-semibold uppercase tracking-[0.05em] text-taupe-3 bg-off-white border border-taupe-2 px-1.5 py-px rounded-r-md dark:bg-surface-2 dark:border-taupe-3">{message.model}</span>
          )}
          {isGate && message.gateStatus === 'awaiting' && (
            <span className="inline-flex items-center gap-1 font-mono text-[0.625rem] font-semibold text-amber bg-[rgba(var(--amber-rgb),0.1)] border border-[rgba(var(--amber-rgb),0.25)] rounded-r-sm px-[7px] py-px whitespace-nowrap dark:bg-[rgba(var(--amber-rgb),0.15)] dark:border-[rgba(var(--amber-rgb),0.3)]">⏸ Awaiting Review</span>
          )}
        </div>

        {/* Error state */}
        {message.isError && message.error && (
          <div className="msg-body ml-[30px] font-sans text-sm leading-[1.6] text-taupe-5 break-words">
            <div className="flex items-start gap-3 p-[12px_14px] my-1 bg-[rgba(var(--red-rgb),0.05)] border-2 border-t-taupe-2 border-l-[3px] border-l-red border-r-taupe-4 border-b-taupe-4 rounded-r-md dark:bg-[rgba(var(--red-rgb),0.08)] dark:border-taupe-2 dark:border-l-red">
              <div className="w-[22px] h-[22px] flex items-center justify-center font-mono text-[0.8125rem] font-extrabold text-white bg-red border shrink-0 rounded-r-md">!</div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-red mb-1.5">{message.error.title}</div>
                <div className="font-sans text-xs leading-[1.6] text-taupe-4 mb-2 dark:text-taupe-3">{message.error.detail}</div>
                <div className="font-mono text-[0.625rem] text-taupe-3 tracking-[0.05em]">{message.error.meta}</div>
              </div>
              <button className="flex items-center gap-1.5 px-3.5 py-1.5 text-[0.6875rem] font-semibold text-taupe-5 bg-taupe-1 border border-t-white border-l-white border-r-taupe-3 border-b-taupe-3 cursor-pointer shrink-0 self-center transition-all duration-150 rounded-r-md hover:bg-berry-1 hover:text-berry-5 hover:border-t-berry-2 hover:border-l-berry-2 hover:border-r-berry-4 hover:border-b-berry-4 active:border-t-taupe-3 active:border-l-taupe-3 active:border-r-white active:border-b-white focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2 font-mono text-[0.625rem] uppercase tracking-[0.05em] dark:text-taupe-4 dark:hover:text-berry-3" aria-label="Retry request">
                <RotateCw className="w-3 h-3" size={12} />
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Message body */}
        {!message.isError && message.content && (
          <div className="msg-body ml-[30px] font-sans text-sm leading-[1.6] text-taupe-5 break-words">
            <div dangerouslySetInnerHTML={{ __html: message.content }} />
          </div>
        )}

        {/* Footnotes (citation sources) */}
        {hasCitations && <Footnotes citations={message.citations!} />}

        {/* File attachments (AI-generated files) */}
        {message.attachments && message.attachments.length > 0 && (
          <div className={cn(attachmentGridCols(message.attachments.length), 'mt-2 ml-[30px]')}>
            {message.attachments.map((att, i) => (
              <FileAttachment key={i} attachment={att} compact={message.attachments!.length >= 3} />
            ))}
          </div>
        )}

        {/* Artifacts */}
        {message.artifacts && message.artifacts.length > 0 &&
          message.artifacts.map((art, i) => (
            <Artifact key={i} artifact={art} />
          ))
        }

        {/* Feedback buttons (AI messages only, non-gate) */}
        {!isGate && (
          <div className="flex gap-1 mt-1.5 ml-[30px]">
            <button
              className="feedback-btn w-6 h-6 flex items-center justify-center bg-transparent border border-transparent cursor-pointer text-taupe-3 transition-all duration-100 p-0 rounded-r-md focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-1 hover:border-taupe-2 hover:text-green hover:bg-[rgba(var(--green-rgb),0.08)] hover:border-green [&_svg]:w-3 [&_svg]:h-3"
              title="Good response"
              aria-label="Good response"
            >
              <ThumbsUp />
              <span className="a11y-label">Good</span>
            </button>
            <button
              className="feedback-btn w-6 h-6 flex items-center justify-center bg-transparent border border-transparent cursor-pointer text-taupe-3 transition-all duration-100 p-0 rounded-r-md focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-1 hover:border-taupe-2 hover:text-red hover:bg-[rgba(var(--red-rgb),0.08)] hover:border-red [&_svg]:w-3 [&_svg]:h-3"
              title="Poor response"
              aria-label="Poor response"
            >
              <ThumbsDown />
              <span className="a11y-label">Bad</span>
            </button>
          </div>
        )}
      </div>

      {/* Citation tooltip (event-delegated, portaled to body) */}
      {hasCitations && (
        <CitationTooltip containerRef={containerRef} citations={message.citations!} />
      )}

      {/* Hover actions */}
      <div className="hidden group-hover:flex absolute top-1 right-1 gap-0.5 z-5 bg-white border border-taupe-2 p-0.5 shadow-[2px_2px_0_rgba(0,0,0,0.08)] rounded-r-md dark:bg-surface-2 dark:border-taupe-3 dark:shadow-[2px_2px_0_rgba(0,0,0,0.2)]">
        <button className="msg-action-btn w-[26px] h-[26px] flex items-center justify-center bg-transparent border border-transparent cursor-pointer text-taupe-3 transition-all duration-100 p-0 rounded-r-md hover:text-taupe-5 hover:bg-berry-1 hover:border-taupe-2 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-1 [&_svg]:w-[13px] [&_svg]:h-[13px]" title="Copy" aria-label="Copy message">
          <Copy />
          <span className="a11y-label">Copy</span>
        </button>
        <button className="msg-action-btn w-[26px] h-[26px] flex items-center justify-center bg-transparent border border-transparent cursor-pointer text-taupe-3 transition-all duration-100 p-0 rounded-r-md hover:text-taupe-5 hover:bg-berry-1 hover:border-taupe-2 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-1 [&_svg]:w-[13px] [&_svg]:h-[13px]" title="Regenerate" aria-label="Regenerate response">
          <RotateCcw />
          <span className="a11y-label">Retry</span>
        </button>
      </div>
    </div>
  );
}
