import { Paperclip } from 'lucide-react';

import { cn } from '~/lib/utils';
import type { CloudFile } from '~/services/types';

// ============================================
// PROPS
// ============================================

interface CloudSelectionBarProps {
  /** Currently selected cloud files */
  selectedFiles: CloudFile[];
  /** Fires when user clicks the Attach button */
  onAttach: () => void;
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
export function CloudSelectionBar({ selectedFiles, onAttach, onClear }: CloudSelectionBarProps) {
  const count = selectedFiles.length;
  const totalBytes = selectedFiles.reduce((sum, f) => sum + parseSizeToBytes(f.size), 0);
  const hasSelection = count > 0;

  return (
    <div
      data-slot="cloud-selection-bar"
      className="flex items-center justify-between border-t border-taupe-2 bg-white px-3 py-2 dark:border-surface-3 dark:bg-surface-1"
    >
      {/* Left — selection info */}
      <span
        className={cn(
          'font-[family-name:var(--mono)] text-[0.6875rem]',
          hasSelection ? 'text-taupe-4 dark:text-taupe-3' : 'text-taupe-3 dark:text-taupe-4',
        )}
      >
        {hasSelection
          ? `${count} file${count > 1 ? 's' : ''} selected (${formatBytes(totalBytes)})`
          : 'No files selected'}
      </span>

      {/* Right — action buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onClear}
          className="cursor-pointer rounded-[var(--r-sm)] bg-transparent px-2 py-1 font-[family-name:var(--mono)] text-[0.6875rem] font-semibold text-taupe-4 hover:text-taupe-5 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2 dark:text-taupe-3 dark:hover:text-taupe-2"
        >
          Clear
        </button>

        <button
          type="button"
          onClick={onAttach}
          disabled={!hasSelection}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-[var(--r-sm)] border px-3 py-1 font-[family-name:var(--mono)] text-[0.6875rem] font-semibold text-white',
            'bg-violet-3 border-t-violet-2 border-l-violet-2 border-b-violet-5 border-r-violet-5',
            'hover:bg-violet-4',
            'focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2',
            'dark:border-t-violet-2 dark:border-l-violet-2 dark:border-b-violet-5 dark:border-r-violet-5',
            !hasSelection && 'pointer-events-none cursor-default opacity-50',
          )}
        >
          <Paperclip className="h-4 w-4" />
          Attach Files
        </button>
      </div>
    </div>
  );
}
