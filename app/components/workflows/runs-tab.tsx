// ============================================
// RunsTab — Run history table
// ============================================

import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '~/components/ui/table';
import type { WorkflowTemplate } from '~/services/types';
import { cn } from '~/lib/utils';

interface RunsTabProps {
  template: WorkflowTemplate;
}

/** Color class for a run status dot */
function statusDotClass(status: string): string {
  const classes: Record<string, string> = {
    success: 'bg-green-500 dark:bg-green-400',
    failed: 'bg-red-500 dark:bg-red-400',
  };
  return classes[status] ?? 'bg-muted-foreground';
}

/** Displays run history table for a workflow template */
export function RunsTab({ template }: RunsTabProps) {
  const navigate = useNavigate();
  const { runs, recentRuns } = template;

  const handleRowClick = useCallback(
    (threadId: string | null) => {
      if (threadId) {
        navigate(`/chat/${threadId}`);
      }
    },
    [navigate]
  );

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-md border border-border bg-background p-2.5 text-center">
          <p className="font-mono text-sm font-bold text-foreground">{runs.total}</p>
          <p className="text-[10px] text-muted-foreground">Total Runs</p>
        </div>
        <div className="rounded-md border border-border bg-background p-2.5 text-center">
          <p className="font-mono text-sm font-bold text-green-600 dark:text-green-400">
            {runs.successRate}%
          </p>
          <p className="text-[10px] text-muted-foreground">Success Rate</p>
        </div>
        <div className="rounded-md border border-border bg-background p-2.5 text-center">
          <p className="font-mono text-sm font-bold text-foreground">{runs.avgDuration}</p>
          <p className="text-[10px] text-muted-foreground">Avg Duration</p>
        </div>
        <div className="rounded-md border border-border bg-background p-2.5 text-center">
          <p className="font-mono text-sm font-bold text-foreground">{runs.filesProcessed}</p>
          <p className="text-[10px] text-muted-foreground">Files Processed</p>
        </div>
      </div>

      {/* Recent runs table */}
      <div>
        <h4 className="mb-2 font-mono text-xs font-semibold text-foreground">
          Recent Runs
        </h4>

        {recentRuns.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No runs yet. Run this workflow to see history here.
          </p>
        ) : (
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8 font-mono text-xs" />
                  <TableHead className="font-mono text-xs">Run</TableHead>
                  <TableHead className="font-mono text-xs">Trigger</TableHead>
                  <TableHead className="font-mono text-xs">Time</TableHead>
                  <TableHead className="font-mono text-xs text-right">Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentRuns.map((run) => (
                  <TableRow
                    key={run.id}
                    className={cn(
                      run.threadId && 'cursor-pointer hover:bg-muted/50'
                    )}
                    onClick={() => handleRowClick(run.threadId)}
                  >
                    <TableCell className="w-8 px-3">
                      <span
                        className={cn(
                          'inline-block size-2 rounded-full',
                          statusDotClass(run.status)
                        )}
                        aria-label={run.status}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-foreground">
                      {run.id}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {run.trigger}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {run.time}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-muted-foreground">
                      {run.duration}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
