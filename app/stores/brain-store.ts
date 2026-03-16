import { create } from 'zustand';

type BrainSection = 'memory' | 'lessons' | 'graphs';
type GraphLevel = 'root' | 'cluster' | 'entity';

interface BrainState {
  /** Currently active brain section tab */
  activeBrainSection: BrainSection;
  /** Active memory category filter */
  memoryCategory: string;
  /** Active lesson scope filter */
  lessonScope: string;
  /** Currently selected lesson ID */
  activeLessonId: string | null;
  /** Graph navigation level */
  graphLevel: GraphLevel;
  /** Active category in cluster/entity view */
  graphActiveCategory: string | null;
  /** Currently selected graph entity ID */
  graphSelectedEntity: string | null;
  /** Whether the add-memory form is visible */
  showAddMemoryForm: boolean;

  setBrainSection: (section: BrainSection) => void;
  setMemoryCategory: (category: string) => void;
  setLessonScope: (scope: string) => void;
  setActiveLessonId: (lessonId: string | null) => void;
  selectGraphEntity: (entityId: string | null) => void;
  /** Navigate graph: 'root' resets to root, any other string drills into that category */
  navigateGraph: (target: string) => void;
  /** Open entity detail within a category cluster */
  openGraphEntity: (entityId: string, categoryId: string) => void;
  /** Close entity detail, stay in cluster view */
  closeGraphEntity: () => void;
  toggleAddMemoryForm: () => void;
}

/** Brain view state store */
export const useBrainStore = create<BrainState>((set) => ({
  activeBrainSection: 'memory',
  memoryCategory: 'all',
  lessonScope: 'all',
  activeLessonId: null,
  graphLevel: 'root',
  graphActiveCategory: null,
  graphSelectedEntity: null,
  showAddMemoryForm: false,

  setBrainSection: (section) => set({ activeBrainSection: section }),
  setMemoryCategory: (category) => set({ memoryCategory: category }),
  setLessonScope: (scope) => set({ lessonScope: scope }),
  setActiveLessonId: (lessonId) => set({ activeLessonId: lessonId }),
  selectGraphEntity: (entityId) => set({ graphSelectedEntity: entityId }),

  navigateGraph: (target) => {
    if (target === 'root') {
      set({ graphLevel: 'root', graphActiveCategory: null, graphSelectedEntity: null });
    } else {
      set({ graphLevel: 'cluster', graphActiveCategory: target, graphSelectedEntity: null });
    }
  },

  openGraphEntity: (entityId, categoryId) => {
    set({ graphLevel: 'entity', graphActiveCategory: categoryId, graphSelectedEntity: entityId });
  },

  closeGraphEntity: () => {
    set((state) => ({ graphLevel: 'cluster', graphSelectedEntity: null, graphActiveCategory: state.graphActiveCategory }));
  },

  toggleAddMemoryForm: () => {
    set((state) => ({ showAddMemoryForm: !state.showAddMemoryForm }));
  },
}));
