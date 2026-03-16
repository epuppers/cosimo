// ============================================
// FilePanel — Right-side resizable panel for file views
// ============================================
// Shows spreadsheet data or a placeholder folder tree.
// Opens via useChatStore.filePanelOpen.

import { useEffect, useState } from 'react';
import { useChatStore } from '~/stores/chat-store';
import { useResizePanel } from '~/hooks/use-resize-panel';
import { getSpreadsheet } from '~/services/panels';
import type { SpreadsheetData } from '~/services/types';
import { cn } from '~/lib/utils';

type PanelTab = 'spreadsheet' | 'folder';

/**
 * FilePanel — resizable right-side panel with spreadsheet and folder views.
 * Controlled by useChatStore.filePanelOpen.
 */
export function FilePanel() {
  const isOpen = useChatStore((s) => s.filePanelOpen);
  const close = useChatStore((s) => s.closeFilePanel);

  const [activeTab, setActiveTab] = useState<PanelTab>('spreadsheet');
  const [spreadsheet, setSpreadsheet] = useState<SpreadsheetData | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const { currentWidth, isDragging, handleMouseDown } = useResizePanel({
    initialWidth: 480,
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
        className={cn('resize-handle resize-handle-filepanel visible', isDragging && 'dragging')}
        onMouseDown={handleMouseDown}
      />

      <div
        className={cn('file-panel h-full', isDragging && 'dragging select-none')}
        style={{ width: currentWidth }}
        aria-label="File panel"
      >
        {/* Header with tabs */}
        <div className="file-panel-header">
          <div className="file-panel-tabs">
            <button
              className={cn('file-panel-tab', activeTab === 'spreadsheet' && 'active')}
              onClick={() => setActiveTab('spreadsheet')}
            >
              Viewer
            </button>
            <button
              className={cn('file-panel-tab', activeTab === 'folder' && 'active')}
              onClick={() => setActiveTab('folder')}
            >
              Files
            </button>
          </div>
          <button
            className="file-panel-close"
            onClick={close}
            aria-label="Close file panel"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        {activeTab === 'spreadsheet' ? (
          <SpreadsheetView
            data={spreadsheet}
            selectedCell={selectedCell}
            onSelectCell={setSelectedCell}
            cellRef={cellRef}
            cellFormula={cellFormula}
          />
        ) : (
          <FolderView />
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
      <div className="flex flex-1 items-center justify-center font-[family-name:var(--mono)] text-[11px] text-[var(--taupe-3)]">
        Loading…
      </div>
    );
  }

  return (
    <>
      {/* Dark file bar */}
      <div className="fp-file-bar">
        <span className="fp-file-icon">▦</span>
        <span className="fp-file-name">Hilgard_Fund_II_Fee_Analysis.xlsx</span>
      </div>

      {/* Formula bar */}
      <div className="fp-formula-bar">
        <span className="fp-cell-ref bevel-inset">{cellRef}</span>
        <span className="fp-formula">{cellFormula}</span>
      </div>

      {/* Spreadsheet grid */}
      <div className="fp-sheet-wrap">
        <table className="fp-sheet">
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
function FolderView() {
  return (
    <>
      <div className="fp-folder-header">
        <span className="fp-folder-title">Thread Files</span>
        <span className="fp-folder-count">1 file</span>
      </div>
      <div className="fp-file-list">
        <div className="fp-file-item active">
          <div className="fp-file-item-icon">▦</div>
          <div className="fp-file-item-info">
            <div className="fp-file-item-name">Hilgard_Fund_II_Fee_Analysis.xlsx</div>
            <div className="fp-file-item-meta">Generated by Cosimo · Feb 22, 4:16 PM · 12 rows</div>
          </div>
        </div>
      </div>
    </>
  );
}
