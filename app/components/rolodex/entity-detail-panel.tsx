// ============================================
// EntityDetailPanel — Detail view shell with Overview tab
// ============================================

import { useEffect, useCallback } from 'react';
import {
  X,
  MoreHorizontal,
  Mail,
  MessageSquare,
  StickyNote,
  CheckSquare,
  Calendar,
  FileText,
  ArrowDownUp,
  FileSpreadsheet,
  Table,
  Sparkles,
} from 'lucide-react';
import type { Entity, EntitySchema, EntityActionDefinition } from '~/services/types';
import { useEntityStore } from '~/stores/entity-store';
import { EntityInsightBar } from '~/components/rolodex/entity-insight-bar';
import { EntityPropertySection } from '~/components/rolodex/entity-property-section';
import { ActivityTimeline } from '~/components/rolodex/activity-timeline';
import { Button } from '~/components/ui/button';
import { EmptyState } from '~/components/ui/empty-state';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '~/components/ui/dropdown-menu';
import { ENTITY_HEALTH_TEXT, ENTITY_HEALTH_BG } from '~/lib/entity-constants';
import { cn } from '~/lib/utils';

interface EntityDetailPanelProps {
  /** The entity to display */
  entity: Entity;
  /** The entity schema */
  schema: EntitySchema;
  /** Optional additional class names */
  className?: string;
}

/** Map action icon names to Lucide components */
const ACTION_ICON_COMPONENTS: Record<string, React.ComponentType<{ className?: string }>> = {
  Mail,
  MessageSquare,
  StickyNote,
  CheckSquare,
  Calendar,
  FileText,
  ArrowDownUp,
  FileSpreadsheet,
  Table,
};

const DETAIL_TABS = ['overview', 'timeline', 'relationships', 'linked'] as const;
const TAB_LABELS: Record<string, string> = {
  overview: 'Overview',
  timeline: 'Timeline',
  relationships: 'Relationships',
  linked: 'Linked',
};

/** Renders an action button for a primary entity action */
function ActionButton({ action }: { action: EntityActionDefinition }) {
  const IconComponent = ACTION_ICON_COMPONENTS[action.icon];
  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1 font-mono text-[0.625rem] uppercase tracking-[0.05em]"
      onClick={() => console.log(`Action: ${action.id}`)}
    >
      {IconComponent && <IconComponent className="size-3.5" />}
      {action.label}
    </Button>
  );
}

/** EntityDetailPanel — rich detail view with header, insight bar, tabs, and tab content */
export function EntityDetailPanel({ entity, schema, className }: EntityDetailPanelProps) {
  const selectEntity = useEntityStore((s) => s.selectEntity);
  const detailTab = useEntityStore((s) => s.detailTab);
  const setDetailTab = useEntityStore((s) => s.setDetailTab);

  const typeDef = schema.entityTypes.find((t) => t.id === entity.typeId);

  // Escape key closes panel
  const handleEscapeKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') selectEntity(null);
    },
    [selectEntity],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [handleEscapeKey]);

  const primaryActions = typeDef?.actions.filter((a) => a.primary) ?? [];
  const overflowActions = typeDef?.actions.filter((a) => !a.primary) ?? [];
  const healthLabels = typeDef?.healthIndicator?.labels as
    | Record<string, string>
    | undefined;

  return (
    <div
      data-slot="entity-detail-panel"
      className={cn('flex h-full flex-col bg-white dark:bg-surface-1', className)}
    >
      {/* HEADER */}
      <div
        className="sticky top-0 z-10 flex flex-col gap-2 px-4 py-3 border-b-2 border-solid bg-white dark:bg-surface-1"
        style={{
          borderImage:
            'linear-gradient(90deg, var(--taupe-2), var(--berry-2), var(--violet-2)) 1',
        }}
      >
        <div className="flex items-start gap-3">
          {/* Entity type icon */}
          {typeDef && (
            <div
              className={cn(
                'flex size-10 shrink-0 items-center justify-center rounded-full text-lg',
                `bg-[rgba(${typeDef.colorRgb},0.1)]`,
              )}
            >
              {typeDef.icon}
            </div>
          )}

          {/* Name + subtitle */}
          <div className="min-w-0 flex-1">
            <h2 className="font-[family-name:var(--pixel)] text-lg text-taupe-5 tracking-[0.5px] leading-tight">
              {entity.name}
            </h2>
            {entity.subtitle && (
              <p className="font-mono text-[0.6875rem] text-taupe-3 mt-0.5 truncate">
                {entity.subtitle}
              </p>
            )}
          </div>

          {/* Health badge */}
          {entity.health && (
            <span
              className={cn(
                'shrink-0 font-mono text-[0.625rem] uppercase tracking-[0.05em] font-semibold px-2 py-[3px] rounded-[var(--r-sm)]',
                ENTITY_HEALTH_TEXT[entity.health],
                ENTITY_HEALTH_BG[entity.health],
              )}
            >
              {healthLabels?.[entity.health] ?? entity.health}
            </span>
          )}

          {/* Close button */}
          <button
            type="button"
            onClick={() => selectEntity(null)}
            aria-label="Close entity details"
            className="shrink-0 text-taupe-3 hover:text-taupe-5 cursor-pointer focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Action buttons row */}
        {(primaryActions.length > 0 || overflowActions.length > 0) && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {primaryActions.map((action) => (
              <ActionButton key={action.id} action={action} />
            ))}
            {overflowActions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="inline-flex items-center justify-center size-7 rounded-[min(var(--radius-md),12px)] border border-border bg-background hover:bg-muted text-taupe-3 hover:text-taupe-5 cursor-pointer focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2"
                >
                  <MoreHorizontal className="size-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {overflowActions.map((action) => {
                    const OverflowIcon = ACTION_ICON_COMPONENTS[action.icon];
                    return (
                      <DropdownMenuItem
                        key={action.id}
                        onClick={() => console.log(`Action: ${action.id}`)}
                      >
                        {OverflowIcon && <OverflowIcon className="size-3.5" />}
                        {action.label}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </div>

      {/* INSIGHT BAR */}
      <EntityInsightBar
        insights={entity.insights}
        onDismiss={(id) => console.log(`Dismiss insight: ${id}`)}
      />

      {/* TAB BAR */}
      <div className="flex border-b border-taupe-1 dark:border-taupe-2 px-4" role="tablist">
        {DETAIL_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={detailTab === tab}
            onClick={() => setDetailTab(tab)}
            className={cn(
              'px-3 py-2 font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] cursor-pointer border-b-2 -mb-px',
              'focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2',
              detailTab === tab
                ? 'border-violet-3 text-violet-3'
                : 'border-transparent text-taupe-3 hover:text-taupe-5',
            )}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="flex-1 overflow-y-auto p-4">
        {detailTab === 'overview' && (
          <div className="flex flex-col gap-3">
            {/* AI Summary */}
            {entity.aiSummary && (
              <div className="bg-[rgba(var(--violet-3-rgb),0.04)] dark:bg-[rgba(var(--violet-3-rgb),0.08)] rounded-[var(--r-md)] p-3 mb-3 border border-[rgba(var(--violet-3-rgb),0.1)] dark:border-[rgba(var(--violet-3-rgb),0.15)]">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="size-3 text-violet-3" />
                  <span className="font-mono text-[0.625rem] font-semibold uppercase tracking-[0.05em] text-violet-3">
                    AI Summary
                  </span>
                </div>
                <p className="font-sans text-[0.8125rem] text-taupe-5 dark:text-taupe-4 leading-relaxed">
                  {entity.aiSummary}
                </p>
              </div>
            )}

            {/* Property sections */}
            {typeDef?.detailSections.map((section) => (
              <EntityPropertySection
                key={section.label}
                section={section}
                properties={entity.properties}
                propertyDefs={typeDef.properties}
              />
            ))}
          </div>
        )}

        {detailTab === 'timeline' && (
          <ActivityTimeline entityId={entity.id} />
        )}

        {detailTab === 'relationships' && (
          <EmptyState title="Relationships coming next" />
        )}

        {detailTab === 'linked' && (
          <EmptyState title="Linked items coming next" />
        )}
      </div>
    </div>
  );
}
