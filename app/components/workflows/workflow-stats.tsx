// ============================================
// WorkflowStats — Stats bar above the workflow library grid
// ============================================

import type { WorkflowTemplate } from '~/services/types';

interface WorkflowStatsProps {
  /** All workflow templates to compute stats from */
  templates: WorkflowTemplate[];
}

/** Stats bar showing Total Templates, Active count, Total Runs, and weighted Success Rate. */
export function WorkflowStats({ templates }: WorkflowStatsProps) {
  const totalTemplates = templates.length;
  const activeCount = templates.filter((t) => t.status === 'active').length;
  const totalRuns = templates.reduce((sum, t) => sum + t.runs.total, 0);

  // Weighted average success rate: sum(rate * runs) / totalRuns
  const weightedSuccessRate =
    totalRuns > 0
      ? templates.reduce((sum, t) => sum + t.runs.successRate * t.runs.total, 0) / totalRuns
      : 0;

  const stats = [
    { label: 'Total Templates', value: totalTemplates.toString() },
    { label: 'Active', value: activeCount.toString() },
    { label: 'Total Runs', value: totalRuns.toLocaleString() },
    { label: 'Success Rate', value: `${weightedSuccessRate.toFixed(1)}%` },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-border bg-card px-3 py-2.5 text-center"
        >
          <div className="font-mono text-lg font-semibold text-foreground">
            {stat.value}
          </div>
          <div className="text-[11px] text-muted-foreground">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
