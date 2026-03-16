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
 * Uses .data-tbl class for monospace font, clean borders,
 * and horizontal scroll on overflow.
 */
export function DataTable({ columns, rows, className }: DataTableProps) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="data-tbl">
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => (
            <tr key={rowIdx}>
              {row.map((cell, cellIdx) => (
                <td key={cellIdx} dangerouslySetInnerHTML={{ __html: cell }} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
