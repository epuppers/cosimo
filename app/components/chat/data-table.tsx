import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '~/components/ui/table';
import { cn } from '~/lib/utils';

interface DataTableProps {
  /** Column header labels */
  columns: string[];
  /** Row data — each row is an array of cell values matching column order */
  rows: string[][];
  /** Optional className for the outer wrapper */
  className?: string;
}

/**
 * Renders a data table inside an artifact.
 * Uses shadcn Table with monospace font, alternating row shading,
 * and horizontal scroll on overflow.
 */
export function DataTable({ columns, rows, className }: DataTableProps) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <Table className="font-[var(--font-mono)] text-xs">
        <TableHeader>
          <TableRow className="border-b border-border hover:bg-transparent">
            {columns.map((col, i) => (
              <TableHead
                key={i}
                className="h-8 px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {col}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, rowIdx) => (
            <TableRow
              key={rowIdx}
              className={cn(
                'border-b border-border/50 hover:bg-muted/30',
                rowIdx % 2 === 1 && 'bg-muted/20'
              )}
            >
              {row.map((cell, cellIdx) => (
                <TableCell
                  key={cellIdx}
                  className="px-2.5 py-1.5 text-xs text-foreground"
                >
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
