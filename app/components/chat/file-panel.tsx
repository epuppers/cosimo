// ============================================
// FilePanel — Right-side resizable panel for file views
// ============================================
// Shows spreadsheet data or a placeholder folder tree.
// Opens via useChatStore.filePanelOpen.

import { useEffect, useMemo, useRef, useState } from 'react';
import { useMatches } from 'react-router';
import { FileCheck, FileCode, FileImage, FileSpreadsheet, FileText, Folder, Mail, Paperclip, Presentation, X, type LucideIcon } from 'lucide-react';
import { useChatStore, EMPTY_ATTACHMENTS, type BreadcrumbSegment } from '~/stores/chat-store';
import { useResizePanel } from '~/hooks/use-resize-panel';
import { getSpreadsheet, hasSpreadsheetData } from '~/services/panels';
import type { SpreadsheetData, CloudSource, CloudFile, Attachment, Thread } from '~/services/types';
import { cn } from '~/lib/utils';
import { CloudSourceTree } from '~/components/chat/cloud-source-tree';
import { CloudFileList } from '~/components/chat/cloud-file-list';
import { CloudNavBar } from '~/components/chat/cloud-nav-bar';
import { CloudSelectionBar } from '~/components/chat/cloud-selection-bar';
import { getCloudSources, getCloudFiles, getRecentCloudFiles, searchCloudFiles } from '~/services/cloud-storage';

/**
 * FilePanel — resizable right-side panel with spreadsheet and folder views.
 * Controlled by useChatStore.filePanelOpen.
 */
export function FilePanel() {
  const isOpen = useChatStore((s) => s.filePanelByThread[s.activeThreadId ?? '']?.open ?? false);
  const close = useChatStore((s) => s.closeFilePanel);
  const activeTab = useChatStore((s) => s.filePanelByThread[s.activeThreadId ?? '']?.tab ?? 'spreadsheet');
  const setActiveTab = useChatStore((s) => s.setFilePanelTab);
  const pendingFiles = useChatStore((s) => s.pendingFilesByThread[s.activeThreadId ?? ''] ?? EMPTY_ATTACHMENTS);
  const removePendingFile = useChatStore((s) => s.removePendingFile);
  const clearPendingFiles = useChatStore((s) => s.clearPendingFiles);

  // Get thread data from route match (same pattern as _app.chat.tsx)
  const matches = useMatches();
  const threadMatch = matches.find((m) => m.id === 'routes/_app.chat.$threadId');
  const thread = (threadMatch?.data as { thread?: Thread } | undefined)?.thread;

  // Split thread attachments by message origin (user-uploaded vs AI-created)
  const { userAttachments, aiAttachments } = useMemo(() => {
    if (!thread) return { userAttachments: [], aiAttachments: [] };
    const user: Attachment[] = [];
    const ai: Attachment[] = [];
    for (const m of thread.messages) {
      if (!m.attachments) continue;
      if (m.type === 'user') user.push(...m.attachments);
      else ai.push(...m.attachments);
    }
    return { userAttachments: user, aiAttachments: ai };
  }, [thread]);

  const [spreadsheet, setSpreadsheet] = useState<SpreadsheetData | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedFile, setSelectedFile] = useState<Attachment | null>(null);

  const { currentWidth, isDragging, handleMouseDown } = useResizePanel({
    initialWidth: 560,
    minWidth: 320,
    maxWidth: 800,
    side: 'right',
  });

  // Load spreadsheet data when selected file changes
  useEffect(() => {
    let cancelled = false;
    getSpreadsheet(selectedFile?.name).then((data) => {
      if (!cancelled) {
        setSpreadsheet(data);
        setSelectedCell(null);
      }
    });
    return () => { cancelled = true; };
  }, [selectedFile]);

  if (!isOpen) return null;

  // Get selected cell display info
  const cellRef = selectedCell
    ? `${String.fromCharCode(65 + selectedCell.col)}${selectedCell.row + 1}`
    : 'A1';
  const cellFormula = selectedCell && spreadsheet
    ? spreadsheet.rows[selectedCell.row]?.cells[selectedCell.col] ?? ''
    : spreadsheet?.columns[0] ?? '';

  return (
    <>
      {/* Resize handle */}
      <div
        className={cn('resize-handle resize-handle-filepanel w-[5px] cursor-col-resize shrink-0 relative z-10 block', isDragging && 'dragging')}
        onMouseDown={handleMouseDown}
      />

      <div
        className={cn(
          'flex flex-col shrink-0 bg-white dark:bg-surface-1 border-l-2 border-l-taupe-2 dark:border-l-surface-0 rounded-[var(--r-lg)] h-full',
          isDragging && 'min-w-[300px] select-none'
        )}
        style={{ width: currentWidth }}
        aria-label="File panel"
      >
        {/* Header with tabs */}
        <div className="flex items-stretch justify-between px-1.5 min-h-[38px] bg-white dark:bg-surface-1 border-b border-taupe-2 dark:border-surface-3 shrink-0 relative">
          <div className="flex gap-0">
            <button
              className={cn(
                'file-panel-tab px-3 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.05em] text-taupe-3 bg-taupe-1 dark:bg-black/25 border border-taupe-2 dark:border-surface-3 border-b-taupe-2 cursor-pointer mb-[-1px] mt-1.5 rounded-t-[var(--r-md)] rounded-b-none transition-[color,background] duration-150 flex items-center relative z-[1] hover:text-taupe-5 hover:bg-berry-1 dark:hover:text-taupe-5 dark:hover:bg-berry-1 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-[-2px]',
                activeTab === 'spreadsheet' && 'active text-berry-3 !bg-off-white dark:!text-taupe-5 dark:!bg-off-white !border-taupe-2 !border-b-transparent dark:!border-surface-3 dark:!border-b-transparent z-[2] !mt-1'
              )}
              onClick={() => setActiveTab('spreadsheet')}
            >
              Viewer
            </button>
            <button
              className={cn(
                'file-panel-tab px-3 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.05em] text-taupe-3 bg-taupe-1 dark:bg-black/25 border border-taupe-2 dark:border-surface-3 border-b-taupe-2 cursor-pointer mb-[-1px] mt-1.5 rounded-t-[var(--r-md)] rounded-b-none transition-[color,background] duration-150 flex items-center relative z-[1] hover:text-taupe-5 hover:bg-berry-1 dark:hover:text-taupe-5 dark:hover:bg-berry-1 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-[-2px]',
                activeTab === 'folder' && 'active text-berry-3 !bg-off-white dark:!text-taupe-5 dark:!bg-off-white !border-taupe-2 !border-b-transparent dark:!border-surface-3 dark:!border-b-transparent z-[2] !mt-1'
              )}
              onClick={() => setActiveTab('folder')}
            >
              Files
            </button>
            <button
              className={cn(
                'file-panel-tab px-3 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.05em] text-taupe-3 bg-taupe-1 dark:bg-black/25 border border-taupe-2 dark:border-surface-3 border-b-taupe-2 cursor-pointer mb-[-1px] mt-1.5 rounded-t-[var(--r-md)] rounded-b-none transition-[color,background] duration-150 flex items-center relative z-[1] hover:text-taupe-5 hover:bg-berry-1 dark:hover:text-taupe-5 dark:hover:bg-berry-1 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-[-2px]',
                activeTab === 'cloud' && 'active text-berry-3 !bg-off-white dark:!text-taupe-5 dark:!bg-off-white !border-taupe-2 !border-b-transparent dark:!border-surface-3 dark:!border-b-transparent z-[2] !mt-1'
              )}
              onClick={() => setActiveTab('cloud')}
            >
              Cloud
            </button>
          </div>
          <button
            className="p-[4px_8px] font-mono text-[0.6875rem] font-semibold text-taupe-4 bg-transparent border border-transparent cursor-pointer transition-all duration-150 flex items-center hover:text-red hover:bg-[rgba(var(--red-rgb),0.08)] hover:border-red"
            onClick={close}
            aria-label="Close file panel"
          >
            <span className="[[data-a11y-labels=show]_&]:hidden">✕</span>
            <span className="hidden [[data-a11y-labels=show]_&]:inline font-[family-name:var(--mono)] font-semibold text-[0.625rem] tracking-[0.03em] whitespace-nowrap">Close</span>
          </button>
        </div>

        {/* Content */}
        {activeTab === 'spreadsheet' && (
          selectedFile && !hasSpreadsheetData(selectedFile.name) ? (
            <FilePlaceholder file={selectedFile} />
          ) : (
            <SpreadsheetView
              data={spreadsheet}
              selectedCell={selectedCell}
              onSelectCell={setSelectedCell}
              cellRef={cellRef}
              cellFormula={cellFormula}
              fileName={selectedFile?.name}
              fileType={selectedFile?.type}
            />
          )
        )}
        {activeTab === 'folder' && (
          <FolderView
            pendingFiles={pendingFiles}
            uploadedFiles={userAttachments}
            createdFiles={aiAttachments}
            onFileClick={(att) => { setSelectedFile(att); setActiveTab('spreadsheet'); }}
            onRemovePending={removePendingFile}
            onClearPending={clearPendingFiles}
          />
        )}
        {activeTab === 'cloud' && (
          <CloudDriveContent onSelectFile={(att) => { setSelectedFile(att); setActiveTab('spreadsheet'); }} />
        )}
      </div>
    </>
  );
}

// ============================================
// FilePlaceholder — shown when no mock viewer data exists
// ============================================

/** Placeholder for files that don't have mock viewer data. */
function FilePlaceholder({ file }: { file: Attachment }) {
  const Icon = getFileTypeIcon(file.type);
  return (
    <>
      <div className="flex items-center gap-2 p-[8px_12px] bg-taupe-5 dark:bg-surface-2 border-b border-taupe-4">
        <Icon className="h-3.5 w-3.5 text-taupe-1 dark:text-taupe-4" />
        <span className="font-mono text-[0.6875rem] font-semibold text-taupe-1 dark:text-taupe-4 truncate">{file.name}</span>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6">
        <Icon className="h-8 w-8 text-taupe-3" />
        <span className="font-mono text-[0.6875rem] font-semibold text-taupe-4">{file.name}</span>
        <span className="font-mono text-[0.625rem] text-taupe-3">File preview would appear here</span>
        {fileSubtitle(file) && (
          <span className="font-mono text-[0.625rem] text-taupe-3">{fileSubtitle(file)}</span>
        )}
      </div>
    </>
  );
}

// ============================================
// SpreadsheetView — renders MOCK_SPREADSHEET data
// ============================================

interface SpreadsheetViewProps {
  data: SpreadsheetData | null;
  selectedCell: { row: number; col: number } | null;
  onSelectCell: (cell: { row: number; col: number } | null) => void;
  cellRef: string;
  cellFormula: string;
  fileName?: string;
  fileType?: string;
}

/** Renders spreadsheet data with file bar, formula bar, and grid. */
function SpreadsheetView({ data, selectedCell, onSelectCell, cellRef, cellFormula, fileName = 'Hilgard_Fund_II_Fee_Analysis.xlsx', fileType = 'xlsx' }: SpreadsheetViewProps) {
  if (!data) {
    return (
      <div className="flex flex-1 items-center justify-center font-[family-name:var(--mono)] text-[11px] text-taupe-3">
        Loading…
      </div>
    );
  }

  return (
    <>
      {/* Dark file bar */}
      <div className="flex items-center gap-2 p-[8px_12px] bg-taupe-5 dark:bg-surface-2 border-b border-taupe-4">
        {(() => { const Icon = getFileTypeIcon(fileType); return <Icon className="h-3.5 w-3.5 text-green" />; })()}
        <span className="font-mono text-[0.6875rem] font-semibold text-taupe-1 dark:text-taupe-4">{fileName}</span>
      </div>

      {/* Formula bar */}
      <div className="flex items-center gap-2 p-[4px_8px] bg-off-white dark:bg-surface-1 border-b border-taupe-2 dark:border-surface-3 min-h-7">
        <span className="font-mono text-[0.6875rem] font-bold text-taupe-5 bg-white dark:bg-surface-0 border border-solid border-t-taupe-3 border-l-taupe-3 border-b-taupe-1 border-r-taupe-1 dark:border-taupe-2 p-[2px_8px] min-w-9 text-center rounded-[var(--r-md)]">{cellRef}</span>
        <span className="font-mono text-[0.6875rem] text-taupe-4 dark:text-taupe-3 flex-1">{cellFormula}</span>
      </div>

      {/* Spreadsheet grid */}
      <div className="flex-1 overflow-auto">
        <table className="fp-sheet min-w-[600px] border-collapse font-mono text-[0.6875rem]">
          <thead>
            <tr>
              <th className="fp-row-header"></th>
              {data.columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, rowIdx) => {
              const isEmpty = row.cells.every((c) => c === '');
              const isTotal = row.cells[0] === 'TOTAL';
              return (
                <tr
                  key={row.row}
                  className={cn(
                    isEmpty && 'h-4',
                    isTotal && 'font-semibold'
                  )}
                >
                  <td>{row.row}</td>
                  {row.cells.map((cell, colIdx) => {
                    const isSelected = selectedCell?.row === rowIdx && selectedCell?.col === colIdx;
                    const isNumber = cell.startsWith('$') || cell.endsWith('%') || /^[\d,.]+$/.test(cell);
                    return (
                      <td
                        key={`${row.row}-${colIdx}`}
                        className={cn(
                          isSelected && 'fp-cell-selected',
                          isNumber && 'fp-cell-number'
                        )}
                        onClick={() => onSelectCell({ row: rowIdx, col: colIdx })}
                      >
                        {cell}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ============================================
// FolderView — file list with icons
// ============================================

/** Returns the Lucide icon component for a file type */
export function getFileTypeIcon(type: string): LucideIcon {
  switch (type) {
    case 'pdf': return FileCheck;
    case 'xlsx':
    case 'csv':
    case 'spreadsheet': return FileSpreadsheet;
    case 'docx':
    case 'doc': return FileText;
    case 'pptx':
    case 'ppt': return Presentation;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'svg': return FileImage;
    case 'html':
    case 'md':
    case 'tsx':
    case 'ts':
    case 'js':
    case 'css':
    case 'py':
    case 'code': return FileCode;
    case 'eml':
    case 'msg':
    case 'email': return Mail;
    case 'folder': return Folder;
    default: return Paperclip;
  }
}

/** Icon background color class for file type */
export function fileIconBg(type: string): string {
  switch (type) {
    case 'pdf': return 'bg-red';
    case 'xlsx':
    case 'csv':
    case 'spreadsheet': return 'bg-green';
    case 'docx':
    case 'doc': return 'bg-blue-3';
    case 'pptx':
    case 'ppt': return 'bg-amber';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'svg': return 'bg-violet-3';
    case 'html':
    case 'md':
    case 'tsx':
    case 'ts':
    case 'js':
    case 'css':
    case 'py':
    case 'code': return 'bg-taupe-4';
    case 'eml':
    case 'msg':
    case 'email': return 'bg-chinese-3';
    case 'folder': return 'bg-taupe-3';
    default: return 'bg-taupe-3';
  }
}

/** Icon background + bevel border classes for file type (retro 3D style) */
export function fileIconBevelClasses(type: string): string {
  switch (type) {
    case 'pdf': return 'bg-red border-t-[var(--red-hi)] border-l-[var(--red-hi)] border-r-[var(--red-lo)] border-b-[var(--red-lo)]';
    case 'xlsx':
    case 'csv':
    case 'spreadsheet': return 'bg-green border-t-taupe-2 border-l-taupe-2 border-r-taupe-3 border-b-taupe-3';
    case 'docx':
    case 'doc': return 'bg-blue-3 border-t-blue-2 border-l-blue-2 border-r-blue-3 border-b-blue-3';
    case 'pptx':
    case 'ppt': return 'bg-amber border-t-taupe-2 border-l-taupe-2 border-r-taupe-3 border-b-taupe-3';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'svg': return 'bg-violet-3 border-t-violet-2 border-l-violet-2 border-r-violet-3 border-b-violet-3';
    case 'html':
    case 'md':
    case 'tsx':
    case 'ts':
    case 'js':
    case 'css':
    case 'py':
    case 'code': return 'bg-taupe-4 border-t-taupe-3 border-l-taupe-3 border-r-taupe-4 border-b-taupe-4';
    case 'eml':
    case 'msg':
    case 'email': return 'bg-chinese-3 border-t-chinese-2 border-l-chinese-2 border-r-chinese-3 border-b-chinese-3';
    case 'folder': return 'bg-taupe-3 border-t-taupe-2 border-l-taupe-2 border-r-taupe-3 border-b-taupe-3';
    default: return 'bg-taupe-3 border-t-taupe-2 border-l-taupe-2 border-r-taupe-3 border-b-taupe-3';
  }
}

/** Build subtitle string from attachment metadata */
function fileSubtitle(att: Attachment): string {
  const parts: string[] = [];
  if (att.size) parts.push(att.size);
  if (att.pages) parts.push(`${att.pages} pages`);
  if (att.sheets) parts.push(`${att.sheets.length} sheets`);
  if (att.fileCount) parts.push(`${att.fileCount} files`);
  return parts.join(' \u00B7 ');
}

/** A section of files with a header label and file list */
function FileSection({ label, files, onFileClick, onRemove, onClearAll, variant = 'default' }: {
  label: string;
  files: Attachment[];
  onFileClick: (att: Attachment) => void;
  onRemove?: (index: number) => void;
  onClearAll?: () => void;
  variant?: 'pending' | 'default';
}) {
  if (files.length === 0) return null;
  const isPending = variant === 'pending';

  return (
    <div>
      <div className="flex items-center justify-between px-3 py-2 bg-off-white dark:bg-surface-1 border-b border-taupe-2 dark:border-surface-3">
        <span className="font-mono text-[0.625rem] font-bold uppercase tracking-[0.1em] text-taupe-3">{label}</span>
        <div className="flex items-center gap-2.5">
          {isPending && onClearAll && files.length > 1 && (
            <button
              type="button"
              onClick={onClearAll}
              className="font-mono text-[0.625rem] font-semibold text-violet-3 cursor-pointer hover:text-red focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-1 dark:text-violet-3 dark:hover:text-red"
            >
              Clear All
            </button>
          )}
          <span className="font-mono text-[0.5625rem] text-taupe-3 tabular-nums">{files.length}</span>
        </div>
      </div>
      <div className="p-1.5 flex flex-col gap-1.5">
        {files.map((att, i) => {
          const Icon = getFileTypeIcon(att.type);
          return (
            <div
              key={`${att.name}-${i}`}
              className={cn(
                'flex items-center gap-2.5 p-2.5 border transition-all duration-[120ms] rounded-[var(--r-md)] bg-off-white dark:bg-surface-2 border-t-taupe-2 border-l-taupe-2 border-b-taupe-3 border-r-taupe-3 dark:border-taupe-2',
                isPending
                  ? 'border-dashed opacity-50'
                  : 'border-solid cursor-pointer hover:bg-berry-1 hover:border-taupe-2 dark:hover:bg-surface-2 dark:hover:border-surface-3',
              )}
              onClick={isPending ? undefined : () => onFileClick(att)}
            >
              <div className={cn('w-7 h-7 flex items-center justify-center text-white dark:text-off-white shrink-0 rounded-[var(--r-md)]', fileIconBg(att.type))}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-mono text-[0.6875rem] font-semibold text-taupe-5 truncate">{att.name}</div>
                {fileSubtitle(att) && (
                  <div className="font-mono text-[0.625rem] text-taupe-3 mt-0.5">{fileSubtitle(att)}</div>
                )}
              </div>
              {isPending && onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  className="flex items-center justify-center w-5 h-5 p-0 bg-transparent border border-transparent rounded-[var(--r-sm)] text-taupe-3 cursor-pointer shrink-0 opacity-100 hover:bg-[rgba(var(--red-rgb),0.1)] hover:border-red hover:text-red active:bg-[rgba(var(--red-rgb),0.2)] focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-1 dark:hover:bg-[rgba(var(--red-rgb),0.15)]"
                  title={`Remove ${att.name}`}
                  aria-label={`Remove ${att.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Folder file list split into pending, uploaded, and created sections. */
function FolderView({ pendingFiles, uploadedFiles, createdFiles, onFileClick, onRemovePending, onClearPending }: {
  pendingFiles: Attachment[];
  uploadedFiles: Attachment[];
  createdFiles: Attachment[];
  onFileClick: (att: Attachment) => void;
  onRemovePending: (index: number) => void;
  onClearPending: () => void;
}) {
  const totalCount = pendingFiles.length + uploadedFiles.length + createdFiles.length;

  return (
    <>
      <div className="flex items-center justify-between p-[10px_12px] bg-off-white dark:bg-surface-1 border-b border-taupe-2 dark:border-surface-3">
        <span className="font-mono text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-taupe-3">Thread Files</span>
        <span className="font-mono text-[0.625rem] text-taupe-3">{totalCount} {totalCount === 1 ? 'file' : 'files'}</span>
      </div>
      {totalCount === 0 ? (
        <div className="flex flex-1 items-center justify-center p-6">
          <span className="font-mono text-[0.6875rem] text-taupe-3">No files in this thread</span>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <FileSection label="Pending" files={pendingFiles} onFileClick={onFileClick} onRemove={onRemovePending} onClearAll={onClearPending} variant="pending" />
          <FileSection label="Uploaded" files={uploadedFiles} onFileClick={onFileClick} />
          <FileSection label="Created by Cosimo" files={createdFiles} onFileClick={onFileClick} />
        </div>
      )}
    </>
  );
}

// ============================================
// Cloud Drive Helpers
// ============================================

/** Find the provider display label for a source */
function findProviderLabel(sources: CloudSource[], sourceId: string | null): string {
  if (!sourceId) return 'Recent';
  for (const root of sources) {
    if (containsSource(root, sourceId)) {
      return root.provider === 'sharepoint' ? 'SharePoint' : 'Google Drive';
    }
  }
  return 'Cloud';
}

/** Find the root source ID for the provider containing the given source */
function findProviderRoot(sources: CloudSource[], activeSourceId: string | null): string | null {
  if (!activeSourceId) return null;
  for (const root of sources) {
    if (containsSource(root, activeSourceId)) return root.id;
  }
  return null;
}

/** Check if a source tree contains a given ID */
function containsSource(node: CloudSource, id: string): boolean {
  if (node.id === id) return true;
  return node.children?.some((c) => containsSource(c, id)) ?? false;
}

/** Build breadcrumb path for a source from the tree */
function buildSourceBreadcrumb(sources: CloudSource[], targetId: string): BreadcrumbSegment[] {
  for (const root of sources) {
    for (const child of root.children ?? []) {
      if (child.id === targetId) return [{ id: child.id, name: child.label }];
      for (const grandchild of child.children ?? []) {
        if (grandchild.id === targetId) return [{ id: child.id, name: child.label }, { id: grandchild.id, name: grandchild.label }];
      }
    }
  }
  return [];
}

// ============================================
// CloudDriveContent — cloud drive tab layout
// ============================================

/** Cloud drive tab layout: left source tree rail + right content area */
function CloudDriveContent({ onSelectFile }: { onSelectFile: (att: Attachment) => void }) {
  // Store state
  const mode = useChatStore((s) => s.cloudDriveMode);
  const selectedFileIds = useChatStore((s) => s.selectedCloudFiles);
  const activeSourceId = useChatStore((s) => s.cloudActiveSourceId);
  const breadcrumb = useChatStore((s) => s.cloudBreadcrumb);
  const searchQuery = useChatStore((s) => s.cloudSearchQuery);
  const searchActive = useChatStore((s) => s.cloudSearchActive);
  const setCloudActiveSource = useChatStore((s) => s.setCloudActiveSource);
  const setCloudBreadcrumb = useChatStore((s) => s.setCloudBreadcrumb);
  const toggleCloudFileSelection = useChatStore((s) => s.toggleCloudFileSelection);
  const selectAllCloudFiles = useChatStore((s) => s.selectAllCloudFiles);
  const clearCloudSelection = useChatStore((s) => s.clearCloudSelection);
  const setCloudSearchQuery = useChatStore((s) => s.setCloudSearchQuery);
  const setCloudSearchActive = useChatStore((s) => s.setCloudSearchActive);
  const setFilePanelTab = useChatStore((s) => s.setFilePanelTab);

  // Local state
  const [sources, setSources] = useState<CloudSource[]>([]);
  const [files, setFiles] = useState<CloudFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local search query when store changes externally (e.g. clear button)
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  // Load cloud sources on mount
  useEffect(() => {
    let cancelled = false;
    getCloudSources().then((data) => {
      if (!cancelled) setSources(data);
    });
    return () => { cancelled = true; };
  }, []);

  // Load cloud files when source or search changes
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(false);
    const load = async () => {
      try {
        let result: CloudFile[];
        if (searchActive && searchQuery) {
          result = await searchCloudFiles(searchQuery);
        } else if (activeSourceId) {
          result = await getCloudFiles(activeSourceId);
        } else {
          result = await getRecentCloudFiles();
        }
        if (!cancelled) {
          setFiles(result);
          setIsLoading(false);
        }
      } catch {
        if (!cancelled) {
          setIsLoading(false);
          setLoadError(true);
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, [activeSourceId, searchActive, searchQuery, retryKey]);

  // Derived values
  const providerLabel = findProviderLabel(sources, activeSourceId);
  const selectableFiles = files.filter((f) => !f.isFolder);
  const selectedFiles = files.filter((f) => selectedFileIds.includes(f.id));

  const handleSelectAll = () => {
    selectAllCloudFiles(selectableFiles.map((f) => f.id));
  };

  // Cmd/Ctrl+A to select/deselect all in attach mode
  useEffect(() => {
    if (mode !== 'attach') return;
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault();
        const allSelected = selectableFiles.length > 0 && selectedFileIds.length >= selectableFiles.length;
        if (allSelected) {
          clearCloudSelection();
        } else {
          selectAllCloudFiles(selectableFiles.map((f) => f.id));
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [mode, selectableFiles, selectedFileIds, clearCloudSelection, selectAllCloudFiles]);

  // Callbacks
  const handleSelectSource = (sourceId: string) => {
    setCloudActiveSource(sourceId);
    setCloudBreadcrumb(buildSourceBreadcrumb(sources, sourceId));
    setCloudSearchQuery('');
    setCloudSearchActive(false);
  };

  const handleSelectRecent = () => {
    setCloudActiveSource(null);
    setCloudBreadcrumb([]);
    setCloudSearchQuery('');
    setCloudSearchActive(false);
  };

  const handleFileClick = (file: CloudFile) => {
    if (file.isFolder) {
      setCloudActiveSource(file.id);
      setCloudBreadcrumb([...breadcrumb, { id: file.id, name: file.name }]);
    } else {
      onSelectFile({ name: file.name, type: file.type, size: file.size });
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === 0) {
      const rootId = findProviderRoot(sources, activeSourceId);
      if (rootId) {
        setCloudActiveSource(rootId);
        setCloudBreadcrumb([]);
      }
    } else {
      const target = breadcrumb[index - 1];
      setCloudActiveSource(target.id);
      setCloudBreadcrumb(breadcrumb.slice(0, index));
    }
  };

  const handleSearchChange = (query: string) => {
    setLocalSearchQuery(query);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setCloudSearchQuery(query);
      setCloudSearchActive(query.length > 0);
    }, 300);
  };

  const handleClearSearch = () => {
    setCloudSearchQuery('');
    setCloudSearchActive(false);
  };

  const addPendingFiles = useChatStore((s) => s.addPendingFiles);
  const closeFilePanel = useChatStore((s) => s.closeFilePanel);

  const handleAttach = () => {
    const converted: Attachment[] = selectedFiles.map((f) => ({
      name: f.name,
      type: f.type,
      size: f.size,
    }));
    addPendingFiles(converted);
    clearCloudSelection();
    closeFilePanel();
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Source tree — left rail */}
      <div className="w-[140px] shrink-0 border-r border-taupe-2 dark:border-surface-3 overflow-y-auto bg-off-white dark:bg-surface-1">
        <CloudSourceTree
          sources={sources}
          activeSourceId={activeSourceId}
          onSelectSource={handleSelectSource}
          onSelectRecent={handleSelectRecent}
        />
      </div>
      {/* Main content — right side */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <CloudNavBar
          breadcrumb={breadcrumb.map((s) => s.name)}
          provider={providerLabel}
          searchQuery={localSearchQuery}
          onSearchChange={handleSearchChange}
          onBreadcrumbClick={handleBreadcrumbClick}
          onClearSearch={handleClearSearch}
          searchActive={searchActive}
        />
        <div className="flex-1 overflow-y-auto">
          <CloudFileList
            files={files}
            mode={mode}
            selectedFileIds={selectedFileIds}
            onFileClick={handleFileClick}
            onToggleSelect={toggleCloudFileSelection}
            isLoading={isLoading}
            error={loadError}
            onRetry={() => setRetryKey((k) => k + 1)}
            showRecentLabel={activeSourceId === null && !searchActive}
          />
        </div>
        {mode === 'attach' && (
          <CloudSelectionBar
            selectedFiles={selectedFiles}
            totalSelectableCount={selectableFiles.length}
            onAttach={handleAttach}
            onSelectAll={handleSelectAll}
            onClear={clearCloudSelection}
          />
        )}
      </div>
    </div>
  );
}
