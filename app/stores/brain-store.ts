import { create } from 'zustand';

type BrainSection = 'memory' | 'lessons' | 'graphs';

interface BrainState {
  /** Currently active brain section tab */
  activeBrainSection: BrainSection;
  /** Active memory category filter */
  memoryCategory: string;
  /** Active lesson scope filter */
  lessonScope: string;
  /** Currently selected lesson ID */
  activeLessonId: string | null;
  /** Currently selected graph entity ID */
  graphSelectedEntity: string | null;

  setBrainSection: (section: BrainSection) => void;
  setMemoryCategory: (category: string) => void;
  setLessonScope: (scope: string) => void;
  setActiveLessonId: (lessonId: string | null) => void;
  selectGraphEntity: (entityId: string | null) => void;
}

/** Brain view state store */
export const useBrainStore = create<BrainState>((set) => ({
  activeBrainSection: 'memory',
  memoryCategory: 'all',
  lessonScope: 'all',
  activeLessonId: null,
  graphSelectedEntity: null,

  setBrainSection: (section) => set({ activeBrainSection: section }),
  setMemoryCategory: (category) => set({ memoryCategory: category }),
  setLessonScope: (scope) => set({ lessonScope: scope }),
  setActiveLessonId: (lessonId) => set({ activeLessonId: lessonId }),
  selectGraphEntity: (entityId) => set({ graphSelectedEntity: entityId }),
}));
