// ============================================
// FilePanel — Right-side resizable panel for file views
// ============================================
// Shows spreadsheet data or a placeholder folder tree.
// Opens via useChatStore.filePanelOpen.

import { useEffect, useState } from 'react';
import { useChatStore } from '~/stores/chat-store';
import { useResizePanel } from '~/hooks/use-resize-panel';
import { getSpreadsheet } from '~/services/panels';
import type { SpreadsheetData, CloudSource, CloudFile } from '~/services/types';
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
  const isOpen = useChatStore((s) => s.filePanelOpen);
  const close = useChatStore((s) => s.closeFilePanel);
  const activeTab = useChatStore((s) => s.filePanelTab);
  const setActiveTab = useChatStore((s) => s.setFilePanelTab);
  const [spreadsheet, setSpreadsheet] = useState<SpreadsheetData | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);

  // Cloud drive state from store
  const cloudDriveMode = useChatStore((s) => s.cloudDriveMode);
  const selectedCloudFiles = useChatStore((s) => s.selectedCloudFiles);
  const cloudActiveSourceId = useChatStore((s) => s.cloudActiveSourceId);
  const cloudBreadcrumb = useChatStore((s) => s.cloudBreadcrumb);
  const cloudSearchQuery = useChatStore((s) => s.cloudSearchQuery);
  const cloudSearchActive = useChatStore((s) => s.cloudSearchActive);
  const setCloudActiveSource = useChatStore((s) => s.setCloudActiveSource);
  const setCloudBreadcrumb = useChatStore((s) => s.setCloudBreadcrumb);
  const toggleCloudFileSelection = useChatStore((s) => s.toggleCloudFileSelection);
  const clearCloudSelection = useChatStore((s) => s.clearCloudSelection);
  const setCloudSearchQuery = useChatStore((s) => s.setCloudSearchQuery);
  const setCloudSearchActive = useChatStore((s) => s.setCloudSearchActive);

  // Cloud drive local state
  const [cloudSources, setCloudSources] = useState<CloudSource[]>([]);
  const [cloudFiles, setCloudFiles] = useState<CloudFile[]>([]);
  const [cloudLoading, setCloudLoading] = useState(false);

  const { currentWidth, isDragging, handleMouseDown } = useResizePanel({
    initialWidth: 560,
    minWidth: 320,
    maxWidth: 800,
    side: 'right',
  });

  // Load spreadsheet data on mount
  useEffect(() => {
    let cancelled = false;
    getSpreadsheet().then((data) => {
      if (!cancelled) setSpreadsheet(data);
    });
    return () => { cancelled = true; };
  }, []);

  // Load cloud sources on mount
  useEffect(() => {
    let cancelled = false;
    getCloudSources().then((data) => {
      if (!cancelled) setCloudSources(data);
    });
    return () => { cancelled = true; };
  }, []);

  // Load cloud files when source or search changes
  useEffect(() => {
    let cancelled = false;
    setCloudLoading(true);
    const load = async () => {
      let result: CloudFile[];
      if (cloudSearchActive && cloudSearchQuery) {
        result = await searchCloudFiles(cloudSearchQuery);
      } else if (cloudActiveSourceId) {
        result = await getCloudFiles(cloudActiveSourceId);
      } else {
        result = await getRecentCloudFiles();
      }
      if (!cancelled) {
        setCloudFiles(result);
        setCloudLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [cloudActiveSourceId, cloudSearchActive, cloudSearchQuery]);

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
          <SpreadsheetView
            data={spreadsheet}
            selectedCell={selectedCell}
            onSelectCell={setSelectedCell}
            cellRef={cellRef}
            cellFormula={cellFormula}
          />
        )}
        {activeTab === 'folder' && (
          <FolderView onFileClick={() => setActiveTab('spreadsheet')} />
        )}
        {activeTab === 'cloud' && (
          <CloudDriveContent
            sources={cloudSources}
            files={cloudFiles}
            isLoading={cloudLoading}
            mode={cloudDriveMode}
            activeSourceId={cloudActiveSourceId}
            selectedFileIds={selectedCloudFiles}
            breadcrumb={cloudBreadcrumb}
            searchQuery={cloudSearchQuery}
            searchActive={cloudSearchActive}
            onSelectSource={(sourceId) => {
              setCloudActiveSource(sourceId);
              setCloudBreadcrumb(buildSourceBreadcrumb(cloudSources, sourceId));
              setCloudSearchQuery('');
              setCloudSearchActive(false);
            }}
            onFileClick={(file) => {
              if (file.isFolder) {
                setCloudActiveSource(file.id);
                setCloudBreadcrumb([...cloudBreadcrumb, file.name]);
              } else {
                setActiveTab('spreadsheet');
              }
            }}
            onToggleSelect={toggleCloudFileSelection}
            onBreadcrumbClick={(index) => {
              if (index === 0) {
                setCloudActiveSource(null);
                setCloudBreadcrumb([]);
              } else {
                setCloudBreadcrumb(cloudBreadcrumb.slice(0, index));
              }
            }}
            onSearchChange={(query) => {
              setCloudSearchQuery(query);
              setCloudSearchActive(query.length > 0);
            }}
            onClearSearch={() => {
              setCloudSearchQuery('');
              setCloudSearchActive(false);
            }}
            onAttach={() => {
              console.log('Attaching cloud files:', selectedCloudFiles);
              clearCloudSelection();
            }}
            onClearSelection={clearCloudSelection}
            providerLabel={findProviderLabel(cloudSources, cloudActiveSourceId)}
            selectedFiles={cloudFiles.filter((f) => selectedCloudFiles.includes(f.id))}
          />
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
}

/** Renders spreadsheet data with file bar, formula bar, and grid. */
function SpreadsheetView({ data, selectedCell, onSelectCell, cellRef, cellFormula }: SpreadsheetViewProps) {
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
        <span className="text-xs text-green">▦</span>
        <span className="font-mono text-[0.6875rem] font-semibold text-taupe-1 dark:text-taupe-4">Hilgard_Fund_II_Fee_Analysis.xlsx</span>
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

/** Folder file list matching reference design. */
function FolderView({ onFileClick }: { onFileClick: () => void }) {
  return (
    <>
      <div className="flex items-center justify-between p-[10px_12px] bg-off-white dark:bg-surface-1 border-b border-taupe-2 dark:border-surface-3">
        <span className="font-mono text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-taupe-3">Thread Files</span>
        <span className="font-mono text-[0.625rem] text-taupe-3">1 file</span>
      </div>
      <div className="p-1.5">
        <div
          className="flex items-center gap-2.5 p-2.5 border border-solid cursor-pointer transition-all duration-[120ms] rounded-[var(--r-md)] bg-off-white dark:bg-surface-2 border-t-taupe-2 border-l-taupe-2 border-b-taupe-3 border-r-taupe-3 dark:border-taupe-2 hover:bg-berry-1 hover:border-taupe-2 dark:hover:bg-surface-2 dark:hover:border-surface-3"
          onClick={onFileClick}
        >
          <div className="w-7 h-7 bg-green flex items-center justify-center text-xs text-white dark:text-off-white shrink-0 rounded-[var(--r-md)]">▦</div>
          <div className="flex-1">
            <div className="font-mono text-[0.6875rem] font-semibold text-taupe-5">Hilgard_Fund_II_Fee_Analysis.xlsx</div>
            <div className="font-mono text-[0.625rem] text-taupe-3 mt-0.5">Generated by Cosimo · Feb 22, 4:16 PM · 12 rows</div>
          </div>
        </div>
      </div>
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

/** Check if a source tree contains a given ID */
function containsSource(node: CloudSource, id: string): boolean {
  if (node.id === id) return true;
  return node.children?.some((c) => containsSource(c, id)) ?? false;
}

/** Build breadcrumb path for a source from the tree */
function buildSourceBreadcrumb(sources: CloudSource[], targetId: string): string[] {
  for (const root of sources) {
    for (const child of root.children ?? []) {
      if (child.id === targetId) return [child.label];
      for (const grandchild of child.children ?? []) {
        if (grandchild.id === targetId) return [child.label, grandchild.label];
      }
    }
  }
  return [];
}

// ============================================
// CloudDriveContent — cloud drive tab layout
// ============================================

interface CloudDriveContentProps {
  sources: CloudSource[];
  files: CloudFile[];
  isLoading: boolean;
  mode: 'browse' | 'attach';
  activeSourceId: string | null;
  selectedFileIds: string[];
  breadcrumb: string[];
  searchQuery: string;
  searchActive: boolean;
  onSelectSource: (sourceId: string) => void;
  onFileClick: (file: CloudFile) => void;
  onToggleSelect: (fileId: string) => void;
  onBreadcrumbClick: (index: number) => void;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
  onAttach: () => void;
  onClearSelection: () => void;
  providerLabel: string;
  selectedFiles: CloudFile[];
}

/** Cloud drive tab layout: left source tree rail + right content area */
function CloudDriveContent({
  sources,
  files,
  isLoading,
  mode,
  activeSourceId,
  selectedFileIds,
  breadcrumb,
  searchQuery,
  searchActive,
  onSelectSource,
  onFileClick,
  onToggleSelect,
  onBreadcrumbClick,
  onSearchChange,
  onClearSearch,
  onAttach,
  onClearSelection,
  providerLabel,
  selectedFiles,
}: CloudDriveContentProps) {
  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Source tree — left rail */}
      <div className="w-[140px] shrink-0 border-r border-taupe-2 dark:border-surface-3 overflow-y-auto bg-off-white dark:bg-surface-1">
        <CloudSourceTree
          sources={sources}
          activeSourceId={activeSourceId}
          onSelectSource={onSelectSource}
        />
      </div>
      {/* Main content — right side */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <CloudNavBar
          breadcrumb={breadcrumb}
          provider={providerLabel}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onBreadcrumbClick={onBreadcrumbClick}
          onClearSearch={onClearSearch}
          searchActive={searchActive}
        />
        <div className="flex-1 overflow-y-auto">
          <CloudFileList
            files={files}
            mode={mode}
            selectedFileIds={selectedFileIds}
            onFileClick={onFileClick}
            onToggleSelect={onToggleSelect}
            isLoading={isLoading}
          />
        </div>
        {mode === 'attach' && (
          <CloudSelectionBar
            selectedFiles={selectedFiles}
            onAttach={onAttach}
            onClear={onClearSelection}
          />
        )}
      </div>
    </div>
  );
}
