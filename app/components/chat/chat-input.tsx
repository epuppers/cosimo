// ============================================
// ChatInput — Rich text input area with file strip, model selector, attach menu
// ============================================

import { useState, useRef, useCallback, useEffect, type KeyboardEvent, type DragEvent } from 'react';
import {
  ArrowUp,
  Paperclip,
  Monitor,
  Cloud,
  ChevronDown,
  X,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
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

/** Get file icon emoji based on file type/extension */
function getFileIconEmoji(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return '📄';
  if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') return '📊';
  return '📎';
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
      className={cn('input-area', isDragOver && 'drop-active')}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* File strip */}
      {stagedFiles.length > 0 && (
        <div className="input-file-strip">
          {stagedFiles.map((file, i) => (
            <div key={`${file.name}-${i}`} className="input-file-chip">
              <span className="input-file-chip-icon">{getFileIconEmoji(file.name)}</span>
              <span className="input-file-chip-name">{file.name}</span>
              <span className="input-file-chip-size">{file.size}</span>
              {onRemoveFile && (
                <button
                  type="button"
                  onClick={() => onRemoveFile(i)}
                  className="input-file-chip-remove"
                  title={`Remove ${file.name}`}
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-2.5 w-2.5" />
                  <span className="a11y-label">Remove</span>
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
          className="wf-command-autocomplete"
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
              className={cn('wf-ac-item', i === autocomplete.selectedIndex && 'active')}
              onClick={() => handleSelectCommand(i)}
            >
              <span className="wf-ac-cmd">
                {cmd.command}
                {cmd.argPlaceholder && (
                  <span className="wf-ac-label">{cmd.argPlaceholder}</span>
                )}
              </span>
              <span className="wf-ac-desc">{cmd.description}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input row */}
      <div className="input-row">
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
          className={cn('text-input', disabled && 'disabled')}
        />

        {/* Attach button with dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn('cmd-btn', disabled && 'disabled')}
            disabled={disabled}
            title="Attach file"
            aria-label="Attach file"
          >
            <Paperclip className="h-4 w-4" />
            <span className="a11y-label">Attach</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="attach-dropdown p-0">
            <button
              type="button"
              className="attach-option"
              onClick={() => onAttach?.('computer')}
            >
              <Monitor className="h-4 w-4" />
              From computer
            </button>
            <button
              type="button"
              className="attach-option"
              onClick={() => onAttach?.('drive')}
            >
              <Cloud className="h-4 w-4" />
              From cloud drive
            </button>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Send button */}
        <button
          type="button"
          className="cmd-btn cmd-primary"
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          title="Send"
          aria-label="Send message"
        >
          <ArrowUp className="h-4 w-4" />
          <span className="a11y-label">Send</span>
        </button>
      </div>

      {/* Footer */}
      <div className="input-footer">
        {/* Model selector */}
        <DropdownMenu>
          <DropdownMenuTrigger className="model-selector-btn">
            <span>{activeModel.name}</span>
            <ChevronDown className="h-2 w-2" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="model-dropdown p-0">
            {MODEL_OPTIONS.map((model) => (
              <button
                key={model.id}
                type="button"
                className={cn('model-option', model.id === activeModel.id && 'selected')}
                onClick={() => onModelChange?.(model.id)}
              >
                <span className="model-option-name">
                  {model.name}
                  {model.id === activeModel.id && (
                    <span className="ml-1.5 text-[var(--violet-3)]">●</span>
                  )}
                </span>
                <span className="model-option-desc">{model.description}</span>
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
