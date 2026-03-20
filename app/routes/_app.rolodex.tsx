// ============================================
// Rolodex Route — Entity directory with list/grid/graph views
// ============================================

import { useRouteError } from "react-router";
import { List, Grid3x3, GitGraph, Search } from "lucide-react";
import { cn } from "~/lib/utils";
import { getEntitySchema, getEntities } from "~/services/entities";
import { useEntityStore } from "~/stores/entity-store";
import { EntityListItem } from "~/components/rolodex/entity-list-item";
import { EntityCard } from "~/components/rolodex/entity-card";
import { EntityDetailPanel } from "~/components/rolodex/entity-detail-panel";
import { FilterPill } from "~/components/ui/filter-pill";
import { EmptyState } from "~/components/ui/empty-state";
import { Button } from "~/components/ui/button";
import { ErrorBoundaryContent } from "~/components/ui/error-boundary-content";
import type { Route } from "./+types/_app.rolodex";

/** Loader — fetches entity schema and all entities in parallel */
export async function clientLoader() {
  const [schema, entities] = await Promise.all([
    getEntitySchema(),
    getEntities(),
  ]);
  return { schema, entities };
}

/** Rolodex directory route — filterable, searchable entity directory */
export default function RolodexRoute({ loaderData }: Route.ComponentProps) {
  const { schema, entities } = loaderData;

  const viewMode = useEntityStore((s) => s.viewMode);
  const setViewMode = useEntityStore((s) => s.setViewMode);
  const activeTypeFilter = useEntityStore((s) => s.activeTypeFilter);
  const setTypeFilter = useEntityStore((s) => s.setTypeFilter);
  const searchQuery = useEntityStore((s) => s.searchQuery);
  const setSearchQuery = useEntityStore((s) => s.setSearchQuery);
  const sortBy = useEntityStore((s) => s.sortBy);
  const selectedEntityId = useEntityStore((s) => s.selectedEntityId);
  const selectEntity = useEntityStore((s) => s.selectEntity);

  // Filter entities
  let filtered = entities;
  if (activeTypeFilter) {
    filtered = filtered.filter((e) => e.typeId === activeTypeFilter);
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter((e) => {
      if (e.name.toLowerCase().includes(q)) return true;
      if (e.subtitle?.toLowerCase().includes(q)) return true;
      for (const value of Object.values(e.properties)) {
        if (typeof value === 'string' && value.toLowerCase().includes(q)) return true;
      }
      return false;
    });
  }

  // Sort entities
  filtered = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'alphabetical':
        return a.name.localeCompare(b.name);
      case 'health': {
        const order: Record<string, number> = { critical: 0, warning: 1, healthy: 2 };
        return (order[a.health ?? ''] ?? 2) - (order[b.health ?? ''] ?? 2);
      }
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'last-activity':
      default:
        return new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime();
    }
  });

  // Nav types for filter pills
  const navTypes = schema.entityTypes
    .filter((t) => t.showInNav)
    .sort((a, b) => a.navOrder - b.navOrder);

  // View mode toggle buttons
  const viewModes = [
    { mode: 'list' as const, icon: List },
    { mode: 'grid' as const, icon: Grid3x3 },
    { mode: 'graph' as const, icon: GitGraph },
  ];

  // Find selected entity for detail panel
  const selectedEntity = selectedEntityId
    ? entities.find((e) => e.id === selectedEntityId) ?? null
    : null;

  return (
    <div className="flex h-full flex-col bg-off-white dark:bg-surface-0">
      {/* Section header */}
      <div
        className="flex justify-between items-center px-4 py-2.5 border-b-2 border-solid bg-white dark:bg-surface-1 min-h-[44px]"
        style={{ borderImage: 'linear-gradient(90deg, var(--taupe-2), var(--berry-2), var(--violet-2)) 1' }}
      >
        <span className="font-[family-name:var(--pixel)] text-base text-taupe-5 tracking-[0.5px]">
          {schema.tabLabel}
        </span>
        <div className="flex gap-1 items-center">
          {viewModes.map(({ mode, icon: Icon }) => (
            <Button
              key={mode}
              variant="ghost"
              size="icon-xs"
              onClick={() => setViewMode(mode)}
              aria-label={`${mode} view`}
              className={cn(
                viewMode === mode && "bg-[rgba(var(--violet-3-rgb),0.1)] text-violet-3"
              )}
            >
              <Icon className="size-3.5" />
            </Button>
          ))}
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-taupe-1 dark:border-surface-3 bg-white dark:bg-surface-1">
        <FilterPill
          label="All"
          isActive={activeTypeFilter === null}
          onClick={() => setTypeFilter(null)}
        />
        {navTypes.map((typeDef) => (
          <FilterPill
            key={typeDef.id}
            label={typeDef.labelPlural}
            isActive={activeTypeFilter === typeDef.id}
            onClick={() => setTypeFilter(typeDef.id)}
          />
        ))}
        <div className="ml-auto relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 size-3 -translate-y-1/2 text-taupe-3" />
          <input
            type="text"
            placeholder="Search entities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "h-7 w-44 py-1 pr-2 pl-7 font-[family-name:var(--mono)] text-[0.6875rem]",
              "text-taupe-5 bg-off-white border border-taupe-2 rounded-[var(--r-sm)]",
              "outline-none",
              "placeholder:text-taupe-3",
              "focus:border-violet-3 focus:shadow-[0_0_0_1px_var(--violet-3)]",
              "dark:bg-surface-2 dark:border-surface-3 dark:text-taupe-5",
              "dark:focus:border-violet-3"
            )}
          />
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto p-4">
        {viewMode === 'graph' ? (
          <EmptyState
            icon={<GitGraph className="size-10" />}
            title="Entity Graph"
            description="Graph view coming soon. Use list or grid view to browse entities."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No entities found"
            description={searchQuery ? "Try adjusting your search or filters." : "No entities match the current filter."}
          />
        ) : viewMode === 'list' ? (
          <div className="flex flex-col gap-1.5">
            {filtered.map((entity) => (
              <EntityListItem
                key={entity.id}
                entity={entity}
                schema={schema}
                onClick={() => selectEntity(entity.id)}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((entity) => (
              <EntityCard
                key={entity.id}
                entity={entity}
                schema={schema}
                onClick={() => selectEntity(entity.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Entity detail slide-over */}
      {selectedEntity && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          onClick={(e) => {
            if (e.target === e.currentTarget) selectEntity(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') selectEntity(null);
          }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/20" aria-hidden="true" />
          {/* Panel */}
          <div className={cn(
            "relative w-[480px] max-w-[90vw] h-full bg-white dark:bg-surface-1 shadow-xl overflow-y-auto"
          )}>
            <EntityDetailPanel entity={selectedEntity} schema={schema} />
          </div>
        </div>
      )}
    </div>
  );
}

/** Loading skeleton for the rolodex route */
export function HydrateFallback() {
  return (
    <div className="flex h-full flex-col bg-off-white dark:bg-surface-0">
      {/* Skeleton header bar */}
      <div className="flex items-center px-4 py-2.5 border-b-2 border-solid bg-white dark:bg-surface-1 min-h-[44px]">
        <div className="h-4 w-20 rounded bg-taupe-1 animate-pulse motion-reduce:animate-none" />
      </div>
      {/* Skeleton filter bar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-taupe-1 dark:border-surface-3 bg-white dark:bg-surface-1">
        <div className="h-6 w-12 rounded-[var(--r-md)] bg-taupe-1 animate-pulse motion-reduce:animate-none" />
        <div className="h-6 w-16 rounded-[var(--r-md)] bg-taupe-1 animate-pulse motion-reduce:animate-none" />
        <div className="h-6 w-14 rounded-[var(--r-md)] bg-taupe-1 animate-pulse motion-reduce:animate-none" />
      </div>
      {/* Skeleton list items */}
      <div className="flex-1 p-4 flex flex-col gap-1.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-[var(--r-md)] bg-taupe-1 animate-pulse motion-reduce:animate-none"
          />
        ))}
      </div>
    </div>
  );
}

/** Error boundary for rolodex route errors */
export function ErrorBoundary() {
  const error = useRouteError();
  console.error('Rolodex route error:', error);
  return <ErrorBoundaryContent message="An unexpected error occurred while loading the Rolodex." />;
}
