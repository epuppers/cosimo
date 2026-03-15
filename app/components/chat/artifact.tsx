import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Workflow } from 'lucide-react';
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
    <div
      className={cn(
        'my-2.5 overflow-hidden rounded-[var(--r-md)] border-2',
        'border-[var(--taupe-2)] border-r-[var(--taupe-4)] border-b-[var(--taupe-4)]',
        'bg-[var(--white)] dark:bg-[var(--surface-1)] dark:border-[var(--taupe-2)]',
        className
      )}
    >
      {/* Art bar — title bar with stripes */}
      <div className="flex items-center gap-2 px-2.5 py-1.5 bg-[var(--taupe-5)] dark:bg-[var(--surface-2)]">
        <div className="h-2.5 w-2.5 rounded-full bg-[var(--taupe-3)]" />
        <ArtStripe />
        <span className="shrink-0 font-[var(--font-mono)] text-[11px] font-semibold text-[var(--taupe-1)] dark:text-[var(--taupe-4)] whitespace-nowrap">
          {artifact.title}
        </span>
        <ArtStripe />
        <button
          onClick={handleToggle}
          className="shrink-0 flex h-5 w-5 items-center justify-center rounded-[var(--r-sm)] text-[var(--taupe-3)] hover:text-[var(--taupe-5)] dark:hover:text-[var(--taupe-1)] transition-colors"
          aria-label={collapsed ? 'Expand artifact' : 'Collapse artifact'}
        >
          {collapsed ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronUp className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Art body */}
      {!collapsed && (
        <div className="p-3 overflow-x-auto">
          <ArtifactBody artifact={artifact} />
        </div>
      )}
    </div>
  );
}

/** Repeating diagonal stripe decoration for the artifact title bar */
function ArtStripe() {
  return (
    <div
      className="h-[6px] min-w-0 flex-1"
      style={{
        background: `repeating-linear-gradient(
          -45deg,
          var(--taupe-3),
          var(--taupe-3) 1px,
          transparent 1px,
          transparent 4px
        )`,
        opacity: 0.3,
      }}
    />
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
        <div className="space-y-1.5">
          {data.entries.map((entry, i) => (
            <div key={i} className="flex gap-3 text-xs">
              <span className="shrink-0 font-[var(--font-mono)] font-semibold text-muted-foreground w-24">
                {entry.label}
              </span>
              <span className="text-foreground">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }

    case 'flow-graph': {
      const data = artifact.data as ArtifactFlowGraphData;
      return (
        <div className="flex items-center justify-center rounded-[var(--r-md)] border border-dashed border-border bg-muted/20 p-8">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Workflow className="h-8 w-8 opacity-50" />
            <span className="font-[var(--font-mono)] text-xs">
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
          className="text-sm leading-relaxed text-foreground [&_p]:mb-2 [&_p:last-child]:mb-0"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }

    default:
      return null;
  }
}
