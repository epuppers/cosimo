// ============================================
// EntityCard — Grid card for an entity
// ============================================

import type { Entity, EntitySchema } from '~/services/types';
import { ENTITY_HEALTH_COLORS, ENTITY_HEALTH_TEXT, ENTITY_HEALTH_BG } from '~/lib/entity-constants';
import { cn } from '~/lib/utils';

interface EntityCardProps {
  /** The entity to display */
  entity: Entity;
  /** The entity schema (used to look up type definition and property labels) */
  schema: EntitySchema;
  /** Called when the card is clicked */
  onClick: (id: string) => void;
  /** Optional additional class names */
  className?: string;
}

/** Formats a property value for card display */
function formatCardValue(value: string | string[] | null, propType?: string): string {
  if (value == null) return '—';
  if (Array.isArray(value)) return value.join(', ');
  if (propType === 'currency') {
    const num = Number(value);
    if (!isNaN(num)) return '$' + num.toLocaleString();
  }
  if (propType === 'percentage') return value + '%';
  return value;
}

/** A grid card for an entity showing icon, name, health, summary properties, and type. */
export function EntityCard({ entity, schema, onClick, className }: EntityCardProps) {
  const typeDef = schema.entityTypes.find((t) => t.id === entity.typeId);

  const handleClick = () => onClick(entity.id);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(entity.id);
    }
  };

  // Health label from schema
  const healthLabels = typeDef?.healthIndicator?.labels;
  const healthLabel =
    entity.health && healthLabels
      ? healthLabels[entity.health]
      : entity.health;

  // Count non-dismissed insights
  const insightCount = entity.insights.filter((i) => !i.dismissed).length;

  return (
    <div
      data-slot="entity-card"
      className={cn(
        'group flex flex-col bg-[var(--white)] border-2 border-t-taupe-2 border-l-taupe-2 border-b-taupe-3 border-r-taupe-3 rounded-[var(--r-md)] cursor-pointer transition-colors duration-150 hover:border-t-violet-2 hover:border-l-violet-2 hover:border-b-violet-4 hover:border-r-violet-4 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2 dark:bg-surface-1 dark:border-taupe-2 dark:hover:border-violet-2',
        className,
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      {/* Header: icon + name + health badge */}
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-taupe-1 dark:border-taupe-2">
        <span
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-full text-sm',
            `bg-[rgba(${typeDef?.colorRgb ?? 'var(--taupe-3-rgb)'},0.1)]`,
          )}
        >
          {typeDef?.icon ?? '?'}
        </span>
        <span className="font-mono text-[0.8125rem] font-semibold text-taupe-5 truncate flex-1 min-w-0">
          {entity.name}
        </span>
        {entity.health && healthLabel && (
          <span
            className={cn(
              'font-mono text-[0.625rem] font-semibold uppercase tracking-[0.05em] px-2 py-[3px] border rounded-[var(--r-sm)] whitespace-nowrap',
              ENTITY_HEALTH_TEXT[entity.health],
              ENTITY_HEALTH_BG[entity.health],
              `border-current`,
            )}
          >
            {healthLabel}
          </span>
        )}
      </div>

      {/* Body: subtitle + summary properties */}
      <div className="flex-1 px-3.5 py-2.5">
        <div className="font-mono text-[0.6875rem] text-taupe-3 truncate mb-2">{entity.subtitle}</div>
        {typeDef && (
          <div className="flex flex-col gap-1">
            {typeDef.summaryProperties.map((propId) => {
              const propDef = typeDef.properties.find((p) => p.id === propId);
              if (!propDef) return null;
              return (
                <div key={propId} className="flex justify-between">
                  <span className="font-mono text-[0.6875rem] text-taupe-3 uppercase tracking-[0.08em]">
                    {propDef.label}
                  </span>
                  <span className="font-mono text-[0.6875rem] font-semibold text-taupe-5">
                    {formatCardValue(entity.properties[propId], propDef.type)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer: entity type pill + insight badge */}
      <div className="flex items-center justify-between px-3.5 pt-1.5 pb-2 border-t border-taupe-1 dark:border-taupe-2">
        <span
          className={cn(
            'font-mono text-[0.625rem] font-semibold px-2 py-[2px] rounded-[var(--r-sm)]',
            `text-${typeDef?.color ?? 'taupe-3'}`,
            `bg-[rgba(${typeDef?.colorRgb ?? 'var(--taupe-3-rgb)'},0.08)]`,
            `dark:bg-[rgba(${typeDef?.colorRgb ?? 'var(--taupe-3-rgb)'},0.12)]`,
          )}
        >
          {typeDef?.label ?? entity.typeId}
        </span>
        {insightCount > 0 && (
          <span className="font-mono text-[0.625rem] font-semibold text-amber bg-[rgba(var(--amber-rgb),0.08)] dark:bg-[rgba(var(--amber-rgb),0.12)] px-1.5 py-[1px] rounded-[var(--r-sm)]">
            {insightCount}
          </span>
        )}
      </div>
    </div>
  );
}
