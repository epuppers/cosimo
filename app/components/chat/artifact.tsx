import { useState } from 'react';
import { ChevronDown, ChevronUp, Workflow } from 'lucide-react';
import type { Artifact as ArtifactType, ArtifactTableData, ArtifactMetadataData, ArtifactFlowGraphData } from '~/services/types';
import { DataTable } from '~/components/chat/data-table';
import { cn } from '~/lib/utils';

interface ArtifactProps {
  artifact: ArtifactType;
  className?: string;
}

/**
 * Renders an inline artifact within an AI message.
 * Supports four types: metadata (key-value pairs), table (DataTable),
 * flow-graph (placeholder), and text (formatted content).
 * Styled to match the original .artifact / .art-bar / .art-body pattern.
 */
export function Artifact({ artifact, className }: ArtifactProps) {
  const [collapsed, setCollapsed] = useState(false);

  function handleToggle() {
    setCollapsed((prev) => !prev);
  }

  return (
    <div className={cn('artifact', className)}>
      {/* Art bar — title bar with stripes */}
      <div className="art-bar">
        <div className="art-close" />
        <div className="art-stripe" />
        <span className="art-title">
          {artifact.title}
        </span>
        <div className="art-stripe" />
        <button
          onClick={handleToggle}
          className="art-toggle"
          aria-label={collapsed ? 'Expand artifact' : 'Collapse artifact'}
        >
          {collapsed ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronUp className="h-3.5 w-3.5" />
          )}
          <span className="a11y-label">{collapsed ? 'Expand' : 'Collapse'}</span>
        </button>
      </div>

      {/* Art body */}
      {!collapsed && (
        <div className="art-body">
          <ArtifactBody artifact={artifact} />
        </div>
      )}
    </div>
  );
}

/** Renders the artifact body based on artifact type */
function ArtifactBody({ artifact }: { artifact: ArtifactType }) {
  switch (artifact.type) {
    case 'table': {
      const data = artifact.data as ArtifactTableData;
      return <DataTable columns={data.headers} rows={data.rows} />;
    }

    case 'metadata': {
      const data = artifact.data as ArtifactMetadataData;
      return (
        <div className="space-y-0">
          {data.entries.map((entry, i) => (
            <div key={i} className="kv-row">
              <span className="kv-key">{entry.label}</span>
              <span className="kv-val">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }

    case 'flow-graph': {
      const data = artifact.data as ArtifactFlowGraphData;
      return (
        <div className="flex items-center justify-center rounded-[var(--r-md)] border border-dashed border-[var(--taupe-2)] bg-[rgba(var(--violet-3-rgb),0.04)] dark:bg-[rgba(var(--violet-3-rgb),0.08)] p-8">
          <div className="flex flex-col items-center gap-2 text-[var(--taupe-3)]">
            <Workflow className="h-8 w-8 opacity-50" />
            <span className="font-[family-name:var(--mono)] text-xs">
              Flow Graph: {data.templateId}
            </span>
          </div>
        </div>
      );
    }

    case 'text': {
      const content = artifact.data as string;
      return (
        <div
          className="text-[13px] leading-relaxed font-[family-name:var(--sans)] text-[var(--taupe-5)] [&_p]:mb-2 [&_p:last-child]:mb-0"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }

    default:
      return null;
  }
}
