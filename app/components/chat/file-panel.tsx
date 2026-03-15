// ============================================
// FilePanel — Right-side resizable panel for file views
// ============================================
// Shows spreadsheet data or a placeholder folder tree.
// Opens via useChatStore.filePanelOpen.

import { useEffect, useState } from 'react';
import { X, Table2, FolderTree, FileSpreadsheet } from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { ScrollArea } from '~/components/ui/scroll-area';
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

  return (
    <div
      className={cn(
        'relative flex h-full flex-col border-l border-border bg-background',
        isDragging && 'select-none'
      )}
      style={{ width: currentWidth }}
    >
      {/* Resize handle */}
      <div
        className="absolute left-0 top-0 z-10 h-full w-1 cursor-col-resize hover:bg-primary/20 active:bg-primary/30"
        onMouseDown={handleMouseDown}
      />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="size-4 text-muted-foreground" />
          <span className="font-[var(--font-mono)] text-xs font-semibold uppercase tracking-wider text-foreground">
            Files
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={close}
          aria-label="Close file panel"
        >
          <X className="size-3.5" />
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 text-xs font-medium transition-colors',
            activeTab === 'spreadsheet'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
          onClick={() => setActiveTab('spreadsheet')}
        >
          <Table2 className="size-3.5" />
          Spreadsheet
        </button>
        <button
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 text-xs font-medium transition-colors',
            activeTab === 'folder'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
          onClick={() => setActiveTab('folder')}
        >
          <FolderTree className="size-3.5" />
          Folder
        </button>
      </div>

      {/* Content */}
      {activeTab === 'spreadsheet' ? (
        <SpreadsheetView data={spreadsheet} />
      ) : (
        <FolderView />
      )}
    </div>
  );
}

// ============================================
// SpreadsheetView — renders MOCK_SPREADSHEET data
// ============================================

interface SpreadsheetViewProps {
  data: SpreadsheetData | null;
}

/** Renders spreadsheet data in a scrollable table. */
function SpreadsheetView({ data }: SpreadsheetViewProps) {
  if (!data) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="min-w-max">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {/* Row number column */}
              <TableHead className="w-8 bg-muted/30 text-center font-[var(--font-mono)] text-[10px] text-muted-foreground">
                #
              </TableHead>
              {data.columns.map((col) => (
                <TableHead
                  key={col}
                  className="bg-muted/30 text-center font-[var(--font-mono)] text-[10px] font-semibold text-muted-foreground"
                >
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.rows.map((row) => {
              const isEmpty = row.cells.every((c) => c === '');
              const isTotal = row.cells[0] === 'TOTAL';
              return (
                <TableRow
                  key={row.row}
                  className={cn(
                    'hover:bg-muted/10',
                    isEmpty && 'h-4',
                    isTotal && 'border-t-2 border-foreground/20 font-semibold'
                  )}
                >
                  <TableCell className="w-8 text-center font-[var(--font-mono)] text-[10px] text-muted-foreground/50">
                    {row.row}
                  </TableCell>
                  {row.cells.map((cell, i) => (
                    <TableCell
                      key={`${row.row}-${i}`}
                      className={cn(
                        'whitespace-nowrap px-2 py-1 font-[var(--font-mono)] text-[11px]',
                        cell.startsWith('$') && 'text-right',
                        cell.endsWith('%') && 'text-right'
                      )}
                    >
                      {cell}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </ScrollArea>
  );
}

// ============================================
// FolderView — placeholder file tree
// ============================================

/** Placeholder folder tree view. */
function FolderView() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 p-4 text-muted-foreground">
      <FolderTree className="size-8 opacity-30" />
      <p className="text-xs">Folder view coming soon</p>
    </div>
  );
}
