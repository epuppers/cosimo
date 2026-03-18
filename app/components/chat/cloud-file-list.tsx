// ============================================
// CloudFileList — Cloud drive file/folder listing
// ============================================
// Renders a scrollable list of cloud files and folders with
// type icons, metadata, and optional attach-mode checkboxes.

import { ChevronRight } from 'lucide-react';
import { Skeleton } from '~/components/ui/skeleton';
import { cn } from '~/lib/utils';
import type { CloudFile } from '~/services/types';

// ============================================
// File type icon color mapping
// ============================================

/** Map file type to icon color and symbol */
function getFileIcon(type: string): { bg: string; symbol: string } {
  switch (type) {
    case 'xlsx':
    case 'csv':
      return { bg: 'bg-green', symbol: '\u25A6' };
    case 'docx':
    case 'doc':
      return { bg: 'bg-violet-3', symbol: '\u2263' };
    case 'pdf':
      return { bg: 'bg-blue-3', symbol: '\u25A4' };
    case 'folder':
      return { bg: 'bg-amber', symbol: '\u25A3' };
    default:
      return { bg: 'bg-taupe-3', symbol: '\u25A1' };
  }
}

/** Format file type label for display */
function getTypeLabel(type: string): string {
  switch (type) {
    case 'xlsx': return 'Excel';
    case 'csv': return 'CSV';
    case 'docx':
    case 'doc': return 'Word';
    case 'pdf': return 'PDF';
    case 'folder': return 'Folder';
    default: return type.toUpperCase();
  }
}

// ============================================
// Props
// ============================================

interface CloudFileListProps {
  /** Files to display */
  files: CloudFile[];
  /** Current interaction mode */
  mode: 'browse' | 'attach';
  /** Selected file IDs in attach mode */
  selectedFileIds: string[];
  /** Called when a file or folder row is clicked */
  onFileClick: (file: CloudFile) => void;
  /** Called when a file checkbox is toggled in attach mode */
  onToggleSelect: (fileId: string) => void;
  /** Whether files are loading */
  isLoading?: boolean;
}

// ============================================
// CloudFileList
// ============================================

/**
 * CloudFileList — main file/folder listing for the cloud drive tab.
 * Shows files with type icons, name, metadata, and optional checkboxes in attach mode.
 */
export function CloudFileList({
  files,
  mode,
  selectedFileIds,
  onFileClick,
  onToggleSelect,
  isLoading,
}: CloudFileListProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="p-1.5 flex flex-col gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 p-2.5 rounded-[var(--r-md)] bg-off-white dark:bg-surface-2 border border-taupe-2 dark:border-surface-3"
          >
            <Skeleton className="w-7 h-7 rounded-[var(--r-md)] shrink-0" />
            <div className="flex-1 flex flex-col gap-1">
              <Skeleton className="h-3 w-3/4 rounded-[var(--r-sm)]" />
              <Skeleton className="h-2.5 w-1/2 rounded-[var(--r-sm)]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (files.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center py-12">
        <span className="font-mono text-xs text-taupe-3 dark:text-taupe-3">No files found</span>
      </div>
    );
  }

  return (
    <div className="p-1.5 flex flex-col gap-1">
      {files.map((file) => {
        const icon = getFileIcon(file.type);
        const isSelected = selectedFileIds.includes(file.id);
        const isAttachMode = mode === 'attach';
        const showCheckbox = isAttachMode && !file.isFolder;

        return (
          <button
            key={file.id}
            type="button"
            data-slot="cloud-file-row"
            className={cn(
              'group flex items-center gap-2.5 p-2.5 border border-solid cursor-pointer transition-all duration-[120ms] rounded-[var(--r-md)] text-left w-full',
              'bg-off-white dark:bg-surface-2',
              'border-t-taupe-2 border-l-taupe-2 border-b-taupe-3 border-r-taupe-3 dark:border-taupe-2',
              'hover:bg-berry-1 hover:border-taupe-2 dark:hover:bg-[rgba(var(--violet-3-rgb),0.12)] dark:hover:border-surface-3',
              'focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2',
              isSelected && 'bg-berry-1 border-berry-2 dark:bg-[rgba(var(--violet-3-rgb),0.08)] dark:border-violet-3'
            )}
            onClick={() => {
              if (showCheckbox) {
                onToggleSelect(file.id);
              } else {
                onFileClick(file);
              }
            }}
          >
            {/* File type icon */}
            <div className={cn(
              'w-7 h-7 flex items-center justify-center text-xs text-white dark:text-off-white shrink-0 rounded-[var(--r-md)]',
              icon.bg
            )}>
              {icon.symbol}
            </div>

            {/* File info */}
            <div className="flex-1 min-w-0">
              <div className="font-mono text-[0.6875rem] font-semibold text-taupe-5 dark:text-taupe-5 truncate">
                {file.name}
              </div>
              <div className="font-mono text-[0.625rem] text-taupe-3 dark:text-taupe-3 mt-0.5 flex items-center gap-1.5">
                <span>{getTypeLabel(file.type)}</span>
                <span className="text-taupe-2 dark:text-taupe-2">&middot;</span>
                {file.isFolder ? (
                  <span>{file.itemCount ?? 0} items</span>
                ) : (
                  <>
                    <span>{file.size}</span>
                    <span className="text-taupe-2 dark:text-taupe-2">&middot;</span>
                    <span>{file.lastModified}</span>
                  </>
                )}
              </div>
            </div>

            {/* Folder chevron */}
            {file.isFolder && !isAttachMode && (
              <ChevronRight className="h-3.5 w-3.5 text-taupe-3 dark:text-taupe-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}

            {/* Attach mode checkbox */}
            {showCheckbox && (
              <div
                className={cn(
                  'w-3.5 h-3.5 shrink-0 rounded-[3px] border flex items-center justify-center transition-colors duration-100',
                  isSelected
                    ? 'bg-violet-3 border-violet-3'
                    : 'bg-white dark:bg-surface-0 border-taupe-3 dark:border-taupe-2'
                )}
                aria-hidden="true"
              >
                {isSelected && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-white">
                    <path d="M2 5L4.5 7.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
