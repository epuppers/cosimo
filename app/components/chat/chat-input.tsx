// ============================================
// ChatInput — Rich text input area with file strip, model selector, attach menu
// ============================================

import { useState, useRef, useCallback, useEffect, type KeyboardEvent } from 'react';
import {
  ArrowUp,
  Paperclip,
  Monitor,
  Cloud,
  ChevronDown,
  X,
  FileText,
  FileSpreadsheet,
  File,
} from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '~/components/ui/dropdown-menu';
import { cn } from '~/lib/utils';
import { useCommandAutocomplete } from '~/hooks/use-command-autocomplete';
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

/** Get file icon based on file type/extension */
function getFileIcon(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return <FileText className="h-3 w-3 shrink-0" />;
  if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') return <FileSpreadsheet className="h-3 w-3 shrink-0" />;
  return <File className="h-3 w-3 shrink-0" />;
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

  return (
    <div
      className="relative border-t-2 bg-[var(--white)] px-4 py-3 dark:bg-[var(--surface-1)]"
      style={{
        borderImage: 'linear-gradient(90deg, var(--violet-2), var(--berry-2), var(--taupe-2)) 1',
      }}
    >
      {/* File strip */}
      {stagedFiles.length > 0 && (
        <div className="mb-2 flex gap-1.5 overflow-x-auto pb-0.5">
          {stagedFiles.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-[var(--r-sm)] border px-2 py-1',
                'border-[var(--taupe-2)] bg-[var(--off-white)]',
                'hover:bg-[var(--taupe-1)]',
                'dark:border-[var(--taupe-3)] dark:bg-[var(--surface-2)] dark:hover:bg-[var(--surface-3)]',
              )}
            >
              {getFileIcon(file.name)}
              <span className="max-w-[160px] truncate font-[var(--font-mono)] text-[11px] font-semibold text-foreground">
                {file.name}
              </span>
              <span className="shrink-0 font-[var(--font-mono)] text-[10px] text-muted-foreground">
                {file.size}
              </span>
              {onRemoveFile && (
                <button
                  type="button"
                  onClick={() => onRemoveFile(i)}
                  className={cn(
                    'flex h-4 w-4 shrink-0 items-center justify-center rounded-[var(--r-sm)] border border-transparent text-xs text-muted-foreground',
                    'hover:border-[var(--red)] hover:bg-[rgba(var(--red-rgb),0.1)] hover:text-[var(--red)]',
                    'active:bg-[rgba(var(--red-rgb),0.2)]',
                    'focus-visible:outline-2 focus-visible:outline-[var(--violet-3)] focus-visible:outline-offset-1',
                  )}
                  title={`Remove ${file.name}`}
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Command autocomplete dropdown — positioned above the input */}
      {autocomplete.isOpen && autocomplete.filteredItems.length > 0 && (
        <div
          ref={autocompleteRef}
          className={cn(
            'absolute bottom-full left-4 right-4 z-50 mb-1 max-h-[240px] overflow-y-auto',
            'rounded-[var(--r-lg)] border border-[var(--taupe-2)] bg-[var(--white)] shadow-lg',
            'dark:border-[var(--taupe-3)] dark:bg-[var(--surface-2)]',
          )}
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
                'flex w-full cursor-pointer items-start gap-3 px-3 py-2 text-left',
                'border-b border-[var(--taupe-1)] last:border-b-0',
                'dark:border-[var(--surface-3)]',
                i === autocomplete.selectedIndex
                  ? 'bg-[rgba(var(--violet-3-rgb),0.08)] dark:bg-[rgba(var(--violet-3-rgb),0.14)]'
                  : 'hover:bg-[var(--taupe-1)] dark:hover:bg-[var(--surface-3)]',
              )}
              onClick={() => handleSelectCommand(i)}
            >
              <span className="shrink-0 font-[var(--font-mono)] text-[12px] font-bold text-[var(--violet-3)]">
                {cmd.command}
                {cmd.argPlaceholder && (
                  <span className="ml-1 font-normal text-muted-foreground">
                    {cmd.argPlaceholder}
                  </span>
                )}
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="font-[var(--font-mono)] text-[11px] font-semibold text-foreground">
                  {cmd.label}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {cmd.description}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-1.5">
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
            'flex-1 resize-none rounded-[var(--r-md)] border bg-[var(--off-white)] px-2.5 py-2',
            'font-[var(--font-mono)] text-[13px] leading-relaxed text-foreground',
            'outline-none placeholder:text-muted-foreground',
            'focus:border-[var(--violet-3)] focus:ring-1 focus:ring-[var(--violet-3)]',
            'dark:bg-[var(--surface-1)] dark:border-[var(--taupe-3)]',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
          style={{ minHeight: '36px', maxHeight: '160px' }}
        />

        {/* Attach button with dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              'flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-[var(--r-md)] border',
              'border-[var(--white)] border-r-[var(--taupe-3)] border-b-[var(--taupe-3)] border-l-[var(--white)]',
              'bg-[var(--taupe-1)] text-[var(--taupe-4)]',
              'hover:bg-[var(--berry-1)]',
              'focus-visible:outline-2 focus-visible:outline-[var(--violet-3)] focus-visible:outline-offset-2',
              'dark:border-[var(--taupe-3)] dark:bg-[var(--surface-2)] dark:text-[var(--taupe-3)]',
              'dark:hover:bg-[rgba(var(--violet-3-rgb),0.12)]',
              disabled && 'pointer-events-none opacity-50',
            )}
            disabled={disabled}
            title="Attach file"
            aria-label="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="min-w-0">
            <DropdownMenuItem onClick={() => onAttach?.('computer')}>
              <Monitor className="mr-2 h-4 w-4" />
              From computer
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAttach?.('drive')}>
              <Cloud className="mr-2 h-4 w-4" />
              From cloud drive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Send button */}
        <Button
          size="icon"
          className={cn(
            'h-9 w-9 shrink-0',
            'bg-[var(--violet-3)] text-white',
            'border border-[var(--violet-2)] border-r-[var(--violet-5)] border-b-[var(--violet-5)] border-l-[var(--violet-2)]',
            'hover:bg-[var(--violet-4)]',
            'disabled:opacity-50',
          )}
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          title="Send"
          aria-label="Send message"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      </div>

      {/* Footer */}
      <div className="mt-1.5 flex items-center justify-between font-[var(--font-mono)] text-xs text-muted-foreground">
        {/* Model selector */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              'flex cursor-pointer items-center gap-1.5 rounded-[var(--r-md)] border border-[var(--taupe-2)] bg-transparent px-2 py-0.5',
              'text-[11px] font-semibold text-[var(--taupe-4)] transition-all',
              'hover:border-[var(--violet-2)] hover:text-[var(--violet-3)]',
              'focus-visible:outline-2 focus-visible:outline-[var(--violet-3)] focus-visible:outline-offset-1',
              'dark:border-[var(--taupe-2)] dark:text-[var(--taupe-3)]',
              'dark:hover:border-[var(--violet-3)] dark:hover:text-[var(--violet-3)]',
            )}
          >
            <span>{activeModel.name}</span>
            <ChevronDown className="h-2 w-2" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-[260px]">
            {MODEL_OPTIONS.map((model) => (
              <DropdownMenuItem
                key={model.id}
                onClick={() => onModelChange?.(model.id)}
                className={cn(
                  'flex flex-col items-start gap-0.5 py-2',
                  model.id === activeModel.id && 'bg-[rgba(var(--violet-3-rgb),0.06)]',
                )}
              >
                <span className="font-[var(--font-mono)] text-[11px] font-semibold">
                  {model.name}
                  {model.id === activeModel.id && (
                    <span className="ml-1.5 text-[var(--violet-3)]">●</span>
                  )}
                </span>
                <span className="text-[10px] text-muted-foreground">{model.description}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Keyboard hints */}
        <span className="hidden sm:inline">↵ to send, Shift+↵ for new line</span>
      </div>
    </div>
  );
}
