// ============================================
// SchemaTab — Template input/output schema
// ============================================

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '~/components/ui/table';
import { Badge } from '~/components/ui/badge';
import type { WorkflowTemplate, SchemaField } from '~/services/types';
import { cn } from '~/lib/utils';

interface SchemaTabProps {
  template: WorkflowTemplate;
}

/** Color class mapping for field type badges */
const typeColors: Record<SchemaField['type'], string> = {
  string: 'bg-secondary text-secondary-foreground',
  number: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  date: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  currency: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  enum: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  boolean: 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300',
};

/** Displays input and output schema for a workflow template */
export function SchemaTab({ template }: SchemaTabProps) {
  const { inputSchema, outputSchema } = template;

  return (
    <div className="space-y-6">
      {/* Input Schema */}
      <div>
        <h4 className="mb-1.5 font-mono text-xs font-semibold text-foreground">
          Input Schema
        </h4>
        <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
          {inputSchema.description}
        </p>

        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-mono text-xs">Field</TableHead>
                <TableHead className="font-mono text-xs">Type</TableHead>
                <TableHead className="font-mono text-xs w-10 text-center">Req</TableHead>
                <TableHead className="font-mono text-xs">Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inputSchema.fields.map((field) => (
                <TableRow key={field.name}>
                  <TableCell className="font-mono text-xs font-bold text-foreground">
                    {field.name}
                    {field.required && (
                      <span className="ml-0.5 text-destructive">*</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        'border-transparent text-[10px] font-medium',
                        typeColors[field.type]
                      )}
                    >
                      {field.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-xs text-muted-foreground">
                    {field.required ? 'Yes' : '—'}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {field.description}
                    {field.options && field.options.length > 0 && (
                      <span className="ml-1 text-[10px] text-muted-foreground/70">
                        ({field.options.join(', ')})
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Output Schema */}
      <div>
        <h4 className="mb-2 font-mono text-xs font-semibold text-foreground">
          Output Schema
        </h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Format:</span>
            <Badge
              variant="outline"
              className="font-mono text-xs uppercase"
            >
              {outputSchema.format}
            </Badge>
          </div>
          <div className="flex items-start gap-2">
            <span className="shrink-0 text-xs text-muted-foreground">Destination:</span>
            <span className="font-mono text-xs text-foreground">
              {outputSchema.destination}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="shrink-0 text-xs text-muted-foreground">Columns:</span>
            <div className="flex flex-wrap gap-1">
              {outputSchema.columns.map((col) => (
                <Badge
                  key={col}
                  variant="secondary"
                  className="text-[10px]"
                >
                  {col}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
