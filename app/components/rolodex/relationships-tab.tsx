// ============================================
// RelationshipsTab — Grouped relationship list for entity detail
// ============================================

import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import type { Entity, EntitySchema, EntityRelationship } from '~/services/types';
import { getRelatedEntities } from '~/services/entities';
import { EmptyState } from '~/components/ui/empty-state';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';

interface RelationshipsTabProps {
  /** The entity whose relationships to display */
  entity: Entity;
  /** The entity schema for relationship type labels */
  schema: EntitySchema;
  /** Callback when a related entity is clicked */
  onEntityClick: (entityId: string) => void;
  /** Optional additional class names */
  className?: string;
}

interface RelationshipGroup {
  label: string;
  items: Array<{
    relationship: EntityRelationship;
    relatedEntity: Entity | null;
  }>;
}

/** Groups relationships by type and resolves labels from the schema */
function groupRelationships(
  entity: Entity,
  schema: EntitySchema,
  relatedEntities: Entity[],
): RelationshipGroup[] {
  const relatedMap = new Map(relatedEntities.map((e) => [e.id, e]));
  const groups = new Map<string, RelationshipGroup>();

  for (const rel of entity.relationships) {
    const relType = schema.relationshipTypes.find((rt) => rt.id === rel.relationshipTypeId);
    const label = relType
      ? rel.direction === 'forward'
        ? relType.forwardLabel
        : relType.reverseLabel
      : rel.relationshipTypeId;

    const key = `${rel.relationshipTypeId}-${rel.direction}`;
    if (!groups.has(key)) {
      groups.set(key, { label, items: [] });
    }
    groups.get(key)!.items.push({
      relationship: rel,
      relatedEntity: relatedMap.get(rel.targetEntityId) ?? null,
    });
  }

  return Array.from(groups.values());
}

/** RelationshipsTab — displays entity relationships grouped by type */
export function RelationshipsTab({ entity, schema, onEntityClick, className }: RelationshipsTabProps) {
  const [relatedEntities, setRelatedEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const entities = await getRelatedEntities(entity.id);
        if (!cancelled) {
          setRelatedEntities(entities);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load relationships');
          setLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [entity.id]);

  if (loading) {
    return (
      <div className={cn('flex flex-col gap-3', className)}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2.5 py-2 px-2">
            <div className="size-6 rounded-full bg-taupe-1 animate-pulse motion-reduce:animate-none" />
            <div className="flex-1 h-3 rounded bg-taupe-1 animate-pulse motion-reduce:animate-none" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('flex flex-col items-center gap-2 py-6 text-center', className)}>
        <AlertCircle className="size-4 text-berry-3" />
        <p className="font-mono text-[0.75rem] text-taupe-3">{error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setLoading(true);
            setError(null);
            getRelatedEntities(entity.id)
              .then(setRelatedEntities)
              .catch(() => setError('Failed to load relationships'))
              .finally(() => setLoading(false));
          }}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (entity.relationships.length === 0) {
    return <EmptyState title="No relationships found" description="Relationships will appear here as Cosimo discovers connections." />;
  }

  const groups = groupRelationships(entity, schema, relatedEntities);

  return (
    <div data-slot="relationships-tab" className={cn('flex flex-col', className)}>
      {groups.map((group, gi) => {
        const typeDefs = schema.entityTypes;
        return (
          <div key={`${group.label}-${gi}`}>
            <h3 className={cn(
              'font-mono text-[0.625rem] font-bold uppercase tracking-[0.12em] text-taupe-3 mb-1.5 mt-3',
              gi === 0 && 'mt-0',
            )}>
              {group.label}
            </h3>
            <div role="list">
              {group.items.map((item) => {
                const targetEntity = item.relatedEntity;
                const targetTypeDef = targetEntity
                  ? typeDefs.find((t) => t.id === targetEntity.typeId)
                  : null;

                return (
                  <div
                    key={item.relationship.targetEntityId}
                    role="listitem"
                    tabIndex={0}
                    className="flex items-center gap-2.5 py-2 px-2 rounded-[var(--r-md)] cursor-pointer hover:bg-[rgba(var(--violet-3-rgb),0.04)] dark:hover:bg-[rgba(var(--violet-3-rgb),0.08)] transition-colors focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2"
                    onClick={() => onEntityClick(item.relationship.targetEntityId)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onEntityClick(item.relationship.targetEntityId);
                      }
                    }}
                  >
                    {/* Icon circle */}
                    {targetTypeDef && (
                      <div
                        className={cn(
                          'flex size-6 shrink-0 items-center justify-center rounded-full text-xs',
                          `bg-[rgba(${targetTypeDef.colorRgb},0.1)]`,
                        )}
                      >
                        {targetTypeDef.icon}
                      </div>
                    )}

                    {/* Name + subtitle */}
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[0.8125rem] font-semibold text-taupe-5 dark:text-taupe-4 truncate">
                        {targetEntity?.name ?? item.relationship.targetEntityId}
                      </p>
                      {targetEntity?.subtitle && (
                        <p className="font-mono text-[0.625rem] text-taupe-3 truncate">
                          {targetEntity.subtitle}
                        </p>
                      )}
                    </div>

                    {/* Metadata */}
                    {item.relationship.metadata && (
                      <span className="shrink-0 font-mono text-[0.625rem] text-taupe-2">
                        {item.relationship.metadata}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
