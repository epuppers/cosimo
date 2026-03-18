// ============================================
// ChatInput — Rich text input area with file strip, model selector, attach menu
// ============================================

import { useState, useRef, useCallback, useEffect, type KeyboardEvent, type DragEvent } from 'react';
import {
  ChevronDown,
  X,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '~/components/ui/dropdown-menu';
import { cn } from '~/lib/utils';
import { SendButton } from '~/components/ui/send-button';
import { AttachButton } from '~/components/ui/attach-button';
import { useCommandAutocomplete } from '~/hooks/use-command-autocomplete';
import { getFileTypeIcon, fileIconBevelClasses } from '~/components/chat/file-panel';
import type { WorkflowCommand } from '~/services/types';

// ============================================
// TYPES
// ============================================

/** A staged file ready to be sent with the message */
interface StagedFile {
  name: string;
  type: string;
  size: string;
}

/** Model option for the model selector dropdown */
interface ModelOption {
  id: string;
  name: string;
  description: string;
}

/** Props for the ChatInput component */
interface ChatInputProps {
  /** Callback when user sends a message */
  onSend: (text: string) => void;
  /** Callback when user attaches a file */
  onAttach?: (type: 'computer' | 'drive') => void;
  /** Files staged for sending */
  stagedFiles?: StagedFile[];
  /** Callback to remove a staged file */
  onRemoveFile?: (index: number) => void;
  /** Currently selected model name */
  modelName?: string;
  /** Callback when model changes */
  onModelChange?: (modelId: string) => void;
  /** Callback when slash command is detected */
  onSlashCommand?: (prefix: string) => void;
  /** Available workflow commands for autocomplete */
  commands?: WorkflowCommand[];
  /** Placeholder text for the input */
  placeholder?: string;
  /** Whether input is disabled (e.g., during streaming) */
  disabled?: boolean;
}

// ============================================
// CONSTANTS
// ============================================

const MODEL_OPTIONS: ModelOption[] = [
  { id: 'assistant', name: 'Assistant', description: 'Quick questions and lookups' },
  { id: 'analyst', name: 'Analyst', description: 'Drafts, summaries, and document review' },
  { id: 'expert', name: 'Expert', description: 'Complex analysis and long-form deliverables' },
];

/** Returns grid column classes for staged file layout, capped at 4 columns */
function stagedFileGridCols(count: number): string {
  const cols = Math.min(count, 4);
  return `grid ${['', 'grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4'][cols]} gap-1.5`;
}

// ============================================
// COMPONENT
// ============================================

/**
 * ChatInput — text input area with file strip, attach menu, model selector.
 * Supports auto-growing textarea, slash command detection, and staged file display.
 */
export function ChatInput({
  onSend,
  onAttach,
  stagedFiles = [],
  onRemoveFile,
  modelName = 'Analyst',
  onModelChange,
  onSlashCommand,
  commands = [],
  placeholder = 'Continue this thread...',
  disabled = false,
}: ChatInputProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  const autocomplete = useCommandAutocomplete(commands);

  const handleTextChange = useCallback(
    (value: string) => {
      setText(value);
      autocomplete.handleInputChange(value);
      // Detect slash command at start of input
      if (value.startsWith('/') && onSlashCommand) {
        onSlashCommand(value);
      }
    },
    [onSlashCommand, autocomplete],
  );

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
    autocomplete.close();
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [text, disabled, onSend, autocomplete]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      // Let autocomplete handle keys first when open
      if (autocomplete.isOpen) {
        const result = autocomplete.handleKeyDown(e);
        if (result !== null) {
          // A command was selected
          setText(result);
          return;
        }
        // If handleKeyDown returned null but consumed the event (arrow/escape), stop
        if (e.defaultPrevented) return;
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend, autocomplete],
  );

  /** Handle clicking on an autocomplete item */
  const handleSelectCommand = useCallback(
    (index: number) => {
      const result = autocomplete.selectItem(index);
      if (result) {
        setText(result);
        textareaRef.current?.focus();
      }
    },
    [autocomplete],
  );

  // Scroll the selected item into view
  useEffect(() => {
    if (!autocomplete.isOpen || !autocompleteRef.current) return;
    const items = autocompleteRef.current.querySelectorAll('[data-ac-item]');
    items[autocomplete.selectedIndex]?.scrollIntoView({ block: 'nearest' });
  }, [autocomplete.selectedIndex, autocomplete.isOpen]);

  /** Auto-resize textarea to fit content */
  const handleInput = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, []);

  const activeModel = MODEL_OPTIONS.find((m) => m.name === modelName) ?? MODEL_OPTIONS[1];

  // Drop zone state
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounterRef = useRef(0);

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    dragCounterRef.current++;
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsDragOver(false);
    // TODO: handle dropped files via onAttach
  }, []);

  return (
    <div
      className={cn(
        'relative px-4 py-3 border-t-2 border-solid bg-white dark:bg-surface-1',
        isDragOver && 'after:content-["Drop_files_here"] after:absolute after:inset-0 after:flex after:items-center after:justify-center after:font-[family-name:var(--mono)] after:text-xs after:font-semibold after:text-violet-3 after:bg-[rgba(var(--violet-3-rgb),0.08)] after:dark:bg-[rgba(var(--violet-3-rgb),0.12)] after:border-2 after:border-dashed after:border-violet-3 after:z-5 after:tracking-[0.05em]',
      )}
      style={{ borderImage: 'linear-gradient(90deg, var(--violet-2), var(--berry-2), var(--taupe-2)) 1' }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* File grid */}
      {stagedFiles.length > 0 && (
        <div className={cn(stagedFileGridCols(stagedFiles.length), 'mb-2 max-h-[126px] overflow-y-auto')}>
          {stagedFiles.map((file, i) => {
            const Icon = getFileTypeIcon(file.type);
            return (
              <div key={`${file.name}-${i}`} className="flex items-center gap-2 px-2.5 py-1.5 bg-off-white border border-solid border-t-taupe-2 border-l-taupe-2 border-b-taupe-3 border-r-taupe-3 rounded-[var(--r-sm)] hover:bg-taupe-1 dark:bg-surface-2 dark:border-t-taupe-3 dark:border-l-taupe-3 dark:border-b-taupe-4 dark:border-r-taupe-4 dark:hover:bg-surface-3 min-w-0">
                <div className={cn('w-6 h-6 flex items-center justify-center text-white shrink-0 rounded-[var(--r-sm)] border', fileIconBevelClasses(file.type))}>
                  <Icon className="h-3 w-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-[family-name:var(--mono)] text-[0.6875rem] font-semibold text-taupe-5 truncate">{file.name}</div>
                  <div className="font-[family-name:var(--mono)] text-[0.5625rem] text-taupe-3">{file.size}</div>
                </div>
                {onRemoveFile && (
                  <button
                    type="button"
                    onClick={() => onRemoveFile(i)}
                    className="flex items-center justify-center w-4 h-4 p-0 bg-transparent border border-transparent rounded-[var(--r-sm)] text-xs leading-none text-taupe-3 cursor-pointer shrink-0 hover:bg-[rgba(var(--red-rgb),0.1)] hover:border-red hover:text-red active:bg-[rgba(var(--red-rgb),0.2)] focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-1 dark:hover:bg-[rgba(var(--red-rgb),0.15)]"
                    title={`Remove ${file.name}`}
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="h-2.5 w-2.5" />
                    <span className="a11y-label">Remove</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Command autocomplete dropdown — positioned above the input */}
      {autocomplete.isOpen && autocomplete.filteredItems.length > 0 && (
        <div
          ref={autocompleteRef}
          className="absolute bottom-full left-0 right-0 max-h-60 overflow-y-auto mb-1 py-1 bg-white border-2 border-solid border-t-taupe-2 border-l-taupe-2 border-b-taupe-4 border-r-taupe-4 rounded-[var(--r-md)] shadow-[2px_2px_0_rgba(var(--black-rgb),0.08)] z-200 dark:bg-surface-2 dark:border-t-[var(--surface-4,var(--taupe-3))] dark:border-l-[var(--surface-4,var(--taupe-3))] dark:border-b-surface-1 dark:border-r-surface-1 dark:shadow-[2px_2px_0_rgba(var(--black-rgb),0.2)]"
          role="listbox"
          aria-label="Workflow commands"
        >
          {autocomplete.filteredItems.map((cmd, i) => (
            <button
              key={cmd.command}
              type="button"
              data-ac-item
              role="option"
              aria-selected={i === autocomplete.selectedIndex}
              className={cn(
                'flex flex-col gap-px px-3 py-2 cursor-pointer border-none bg-transparent w-full text-left transition-[background] duration-100 hover:bg-[rgba(var(--violet-3-rgb),0.06)] active:bg-[rgba(var(--violet-3-rgb),0.12)] focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-[-2px] focus-visible:rounded-[var(--r-sm)] dark:hover:bg-[rgba(var(--violet-3-rgb),0.1)] dark:active:bg-[rgba(var(--violet-3-rgb),0.18)]',
                i === autocomplete.selectedIndex && 'bg-[rgba(var(--violet-3-rgb),0.06)] dark:bg-[rgba(var(--violet-3-rgb),0.1)]',
              )}
              onClick={() => handleSelectCommand(i)}
            >
              <span className="font-[family-name:var(--mono)] text-xs font-bold text-violet-3 flex items-center gap-1.5">
                {cmd.command}
                {cmd.argPlaceholder && (
                  <span className="font-[family-name:var(--sans)] text-[0.6875rem] font-normal text-taupe-4 dark:text-taupe-3">{cmd.argPlaceholder}</span>
                )}
              </span>
              <span className="font-[family-name:var(--sans)] text-[0.625rem] text-taupe-3 leading-[1.3]">{cmd.description}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input row */}
      <div className="flex gap-1.5 items-end">
        {/* Text input */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            handleTextChange(e.target.value);
            handleInput();
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          aria-label="Message input"
          className={cn(
            'flex-1 px-2.5 py-2 font-[family-name:var(--mono)] text-[0.8125rem] leading-[1.5] text-taupe-5 bg-off-white border border-solid border-t-taupe-3 border-l-taupe-3 border-b-taupe-1 border-r-taupe-1 outline-none overflow-y-auto min-h-9 max-h-40 break-words whitespace-pre-wrap rounded-[var(--r-md)] resize-none focus:border-violet-3 focus:shadow-[0_0_0_1px_var(--violet-3)] placeholder:text-taupe-3 dark:bg-surface-0 dark:border-taupe-3',
            disabled && 'opacity-50 pointer-events-none bg-taupe-1 cursor-not-allowed dark:bg-surface-2',
          )}
        />

        {/* Attach button with dropdown */}
        <AttachButton onAttach={onAttach} disabled={disabled} />

        {/* Send button */}
        <SendButton onClick={handleSend} disabled={disabled || !text.trim()} />
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-1.5 font-[family-name:var(--mono)] text-xs text-taupe-3">
        {/* Model selector */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-[5px] px-2 py-0.5 font-[family-name:var(--mono)] text-[0.6875rem] font-semibold text-taupe-4 bg-transparent border border-solid border-taupe-2 cursor-pointer transition-all duration-100 whitespace-nowrap rounded-[var(--r-md)] hover:border-t-violet-2 hover:border-l-violet-2 hover:border-b-violet-4 hover:border-r-violet-4 hover:text-violet-3 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-1 dark:border-taupe-2 dark:text-taupe-3 dark:hover:border-violet-3 dark:hover:text-violet-3 [&_svg]:block [&_svg]:w-2 [&_svg]:h-2 [&_svg]:transition-transform [&_svg]:duration-150">
            <span>{activeModel.name}</span>
            <ChevronDown className="h-2 w-2" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="min-w-[260px] bg-white border-2 border-solid border-t-taupe-2 border-l-taupe-2 border-b-taupe-4 border-r-taupe-4 shadow-[2px_2px_0_rgba(var(--black-rgb),0.08)] rounded-[var(--r-md)] p-0 overflow-hidden dark:bg-surface-2 dark:border-taupe-2 dark:shadow-[2px_2px_0_rgba(var(--black-rgb),0.3)]">
            {MODEL_OPTIONS.map((model) => (
              <button
                key={model.id}
                type="button"
                className={cn(
                  'flex flex-col gap-0.5 w-full px-3 py-2 border-none border-b border-b-taupe-1 bg-transparent cursor-pointer text-left transition-[background] duration-100 last:border-b-0 hover:bg-berry-1 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-[-2px] dark:border-b-surface-3 dark:hover:bg-[rgba(var(--violet-3-rgb),0.1)]',
                  model.id === activeModel.id && 'bg-[rgba(var(--violet-3-rgb),0.06)] dark:bg-[rgba(var(--violet-3-rgb),0.08)]',
                )}
                onClick={() => onModelChange?.(model.id)}
              >
                <span className="font-[family-name:var(--mono)] text-xs font-semibold text-taupe-5">
                  {model.name}
                  {model.id === activeModel.id && (
                    <span className="ml-1.5 text-violet-3">●</span>
                  )}
                </span>
                <span className="font-[family-name:var(--mono)] text-[0.625rem] text-taupe-3 leading-[1.3]">{model.description}</span>
              </button>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Keyboard hints */}
        <span className="hidden sm:inline">↵ to send, Shift+↵ for new line</span>
      </div>
    </div>
  );
}
