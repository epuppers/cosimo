import { create } from 'zustand';

type EntityViewMode = 'list' | 'grid' | 'graph';
type EntitySortBy = 'alphabetical' | 'last-activity' | 'health' | 'created';
type EntityDetailMode = 'slide-over' | 'full-page';
type EntityDetailTab = 'overview' | 'timeline' | 'relationships' | 'linked';
type EntityGraphLevel = 'root' | 'cluster' | 'entity';

interface EntityState {
  /** Current directory view mode */
  viewMode: EntityViewMode;
  /** Active entity type filter (null = all types) */
  activeTypeFilter: string | null;
  /** Current search query */
  searchQuery: string;
  /** Current sort field */
  sortBy: EntitySortBy;
  /** Currently selected entity ID */
  selectedEntityId: string | null;
  /** Detail panel display mode */
  detailMode: EntityDetailMode;
  /** Active tab within the detail panel */
  detailTab: EntityDetailTab;
  /** Graph view zoom level */
  graphZoom: number;
  /** Graph view pan offset */
  graphPan: { x: number; y: number };
  /** Graph navigation depth */
  graphLevel: EntityGraphLevel;

  setViewMode: (mode: EntityViewMode) => void;
  setTypeFilter: (typeId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: EntitySortBy) => void;
  selectEntity: (entityId: string | null) => void;
  setDetailMode: (mode: EntityDetailMode) => void;
  setDetailTab: (tab: EntityDetailTab) => void;
  setGraphZoom: (zoom: number) => void;
  setGraphPan: (pan: { x: number; y: number }) => void;
  setGraphLevel: (level: EntityGraphLevel) => void;
  resetFilters: () => void;
}

/** Entity directory view state store */
export const useEntityStore = create<EntityState>((set) => ({
  viewMode: 'list',
  activeTypeFilter: null,
  searchQuery: '',
  sortBy: 'last-activity',
  selectedEntityId: null,
  detailMode: 'slide-over',
  detailTab: 'overview',
  graphZoom: 1,
  graphPan: { x: 0, y: 0 },
  graphLevel: 'root',

  setViewMode: (mode) => set({ viewMode: mode }),
  setTypeFilter: (typeId) => set({ activeTypeFilter: typeId }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortBy: (sortBy) => set({ sortBy }),
  selectEntity: (entityId) => set({ selectedEntityId: entityId, detailTab: 'overview' }),
  setDetailMode: (mode) => set({ detailMode: mode }),
  setDetailTab: (tab) => set({ detailTab: tab }),
  setGraphZoom: (zoom) => set({ graphZoom: zoom }),
  setGraphPan: (pan) => set({ graphPan: pan }),
  setGraphLevel: (level) => set({ graphLevel: level }),
  resetFilters: () => set({ activeTypeFilter: null, searchQuery: '', sortBy: 'last-activity' }),
}));
