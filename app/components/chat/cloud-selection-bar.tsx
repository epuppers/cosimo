import { Paperclip } from 'lucide-react';

import { cn } from '~/lib/utils';
import type { CloudFile } from '~/services/types';

// ============================================
// PROPS
// ============================================

interface CloudSelectionBarProps {
  /** Currently selected cloud files */
  selectedFiles: CloudFile[];
  /** Total number of selectable (non-folder) files */
  totalSelectableCount: number;
  /** Fires when user clicks the Attach button */
  onAttach: () => void;
  /** Selects all visible files */
  onSelectAll: () => void;
  /** Clears all selections */
  onClear: () => void;
}

// ============================================
// HELPERS
// ============================================

/** Parse a human-readable size string to bytes for summation */
function parseSizeToBytes(size: string): number {
  const match = size.match(/^([\d.]+)\s*(KB|MB|GB|B)$/i);
  if (!match) return 0;
  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  switch (unit) {
    case 'B':
      return value;
    case 'KB':
      return value * 1024;
    case 'MB':
      return value * 1024 * 1024;
    case 'GB':
      return value * 1024 * 1024 * 1024;
    default:
      return 0;
  }
}

/** Format bytes to a human-readable string */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

// ============================================
// COMPONENT
// ============================================

/** Bottom action bar for cloud drive attach mode — shows selection count and attach/clear buttons */
export function CloudSelectionBar({ selectedFiles, totalSelectableCount, onAttach, onSelectAll, onClear }: CloudSelectionBarProps) {
  const count = selectedFiles.length;
  const totalBytes = selectedFiles.reduce((sum, f) => sum + parseSizeToBytes(f.size), 0);
  const hasSelection = count > 0;
  const allSelected = count > 0 && count >= totalSelectableCount;

  return (
    <div
      data-slot="cloud-selection-bar"
      className="flex flex-col gap-2 border-t border-taupe-2 bg-white px-3 py-2.5 dark:border-surface-3 dark:bg-surface-1"
    >
      {/* Top row — selection info + select/deselect toggle */}
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'font-[family-name:var(--mono)] text-[0.6875rem] whitespace-nowrap',
            hasSelection ? 'text-taupe-4 dark:text-taupe-3' : 'text-taupe-3 dark:text-taupe-4',
          )}
        >
          {hasSelection
            ? `${count} file${count > 1 ? 's' : ''} selected · ${formatBytes(totalBytes)}`
            : 'No files selected'}
        </span>
        <button
          type="button"
          onClick={onSelectAll}
          disabled={allSelected}
          className={cn(
            'whitespace-nowrap rounded-[var(--r-sm)] bg-transparent px-2 py-0.5 font-[family-name:var(--mono)] text-[0.6875rem] font-semibold focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2',
            allSelected
              ? 'text-taupe-2 pointer-events-none dark:text-taupe-3'
              : 'text-violet-3 cursor-pointer hover:text-violet-4 dark:text-violet-3 dark:hover:text-violet-2',
          )}
        >
          Select All
        </button>
      </div>

      {/* Bottom row — clear + attach buttons, always visible side by side */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onClear}
          disabled={!hasSelection}
          className={cn(
            'flex-1 cursor-pointer rounded-[var(--r-sm)] border border-solid border-taupe-2 bg-transparent px-3 py-1.5 font-[family-name:var(--mono)] text-[0.6875rem] font-semibold text-taupe-4 hover:bg-taupe-1 hover:text-taupe-5 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2 dark:border-taupe-2 dark:text-taupe-3 dark:hover:bg-surface-2 dark:hover:text-taupe-2',
            !hasSelection && 'pointer-events-none opacity-40',
          )}
        >
          Clear
        </button>
        <button
          type="button"
          onClick={onAttach}
          disabled={!hasSelection}
          className={cn(
            'flex-1 inline-flex items-center justify-center gap-1.5 rounded-[var(--r-sm)] border px-3 py-1.5 font-[family-name:var(--mono)] text-[0.6875rem] font-semibold text-white',
            'bg-violet-3 border-t-violet-2 border-l-violet-2 border-b-violet-5 border-r-violet-5',
            'hover:bg-violet-4',
            'focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2',
            'dark:border-t-violet-2 dark:border-l-violet-2 dark:border-b-violet-5 dark:border-r-violet-5',
            !hasSelection && 'pointer-events-none cursor-default opacity-40',
          )}
        >
          <Paperclip className="h-3.5 w-3.5" />
          Attach Files
        </button>
      </div>
    </div>
  );
}
