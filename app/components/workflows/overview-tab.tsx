// ============================================
// OverviewTab — Template overview info
// ============================================

import type { WorkflowTemplate } from '~/services/types';

/** Displays template overview with Status, Performance, and Recent Activity sections */
export function OverviewTab({ template }: { template: WorkflowTemplate }) {
  const { runs, recentRuns } = template;
  const lastRun = recentRuns.length > 0 ? recentRuns[0] : null;
  const lastRunTime = lastRun ? lastRun.time : '—';
  const lastRunStatus = lastRun ? lastRun.status : '—';
  const lastRunStatusClass =
    lastRunStatus === 'success' ? 'text-green' : lastRunStatus === 'failed' ? 'text-red' : '';

  return (
    <div className="overview-grid">
      {/* Status section */}
      <div className="detail-section bevel">
        <div className="detail-section-bar">
          <div className="art-stripe" />
          <span className="detail-section-title">Status</span>
          <div className="art-stripe" />
        </div>
        <div className="detail-section-body">
          <div className="kv-row">
            <span className="kv-key">State</span>
            <span className={`kv-val status-${template.status}`}>
              ● {template.status.charAt(0).toUpperCase() + template.status.slice(1)}
            </span>
          </div>
          <div className="kv-row">
            <span className="kv-key">Last Run</span>
            <span className="kv-val">{lastRunTime}</span>
          </div>
          <div className="kv-row">
            <span className="kv-key">Last Result</span>
            <span className={`kv-val ${lastRunStatusClass}`}>
              {lastRunStatus.charAt(0).toUpperCase() + lastRunStatus.slice(1)}
            </span>
          </div>
          <div className="kv-row">
            <span className="kv-key">Avg Duration</span>
            <span className="kv-val">{runs.avgDuration || '—'}</span>
          </div>
        </div>
      </div>

      {/* Performance section */}
      <div className="detail-section bevel">
        <div className="detail-section-bar">
          <div className="art-stripe" />
          <span className="detail-section-title">Performance</span>
          <div className="art-stripe" />
        </div>
        <div className="detail-section-body">
          <div className="kv-row">
            <span className="kv-key">Total Runs</span>
            <span className="kv-val">{runs.total || 0}</span>
          </div>
          <div className="kv-row">
            <span className="kv-key">Success Rate</span>
            <span className="kv-val text-green">
              {runs.successRate ? `${runs.successRate}%` : '—'}
            </span>
          </div>
          <div className="kv-row">
            <span className="kv-key">Files Processed</span>
            <span className="kv-val">{runs.filesProcessed || 0}</span>
          </div>
          <div className="kv-row">
            <span className="kv-key">Created</span>
            <span className="kv-val">{template.createdDate}</span>
          </div>
        </div>
      </div>

      {/* Recent Activity section */}
      {recentRuns.length > 0 && (
        <div className="detail-section bevel overview-full">
          <div className="detail-section-bar">
            <div className="art-stripe" />
            <span className="detail-section-title">Recent Activity</span>
            <div className="art-stripe" />
          </div>
          <div className="detail-section-body">
            {recentRuns.map((run) => {
              const dotClass = run.status === 'success' ? 'success' : 'failed';
              return (
                <div key={run.id} className="run-row">
                  <div className={`run-status-dot ${dotClass}`} />
                  <span className="run-id">{run.id}</span>
                  <span className="run-trigger">{run.trigger}</span>
                  <span className="run-time">{run.time}</span>
                  <span className="run-duration">{run.duration}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
