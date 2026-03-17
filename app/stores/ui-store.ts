import { create } from 'zustand';

type ViewMode = 'chat' | 'workflows' | 'brain';

/** Context type for the Cosimo panel — describes what it was opened for */
export type CosimoContextType = 'template' | 'node' | 'lesson' | null;

interface CosimoContext {
  /** What kind of item the panel was opened for */
  type: CosimoContextType;
  /** Human-readable description of the context */
  text: string;
}

interface UIState {
  /** Currently active main view */
  currentMode: ViewMode;
  /** Whether the sidebar is collapsed */
  sidebarCollapsed: boolean;
  /** Whether the Cosimo slide-in panel is open */
  cosimoPanelOpen: boolean;
  /** Context for the Cosimo panel (what it was opened for) */
  cosimoPanelContext: CosimoContext | null;
  /** Whether the task header panel is open */
  taskPanelOpen: boolean;
  /** Whether the calendar header panel is open */
  calendarPanelOpen: boolean;
  /** Whether the usage header panel is open */
  usagePanelOpen: boolean;
  /** Whether the profile dropdown menu is open */
  profileMenuOpen: boolean;
  /** Whether the profile subpanel (a11y settings) is shown instead of the main profile menu */
  profileSubpanelOpen: boolean;
  /** Whether the brain nav section in the sidebar is collapsed */
  brainNavCollapsed: boolean;
  setMode: (mode: ViewMode) => void;
  toggleSidebar: () => void;
  toggleBrainNav: () => void;
  openCosimoPanel: (context?: CosimoContext) => void;
  closeCosimoPanel: () => void;
  closeAllPanels: () => void;
  toggleTaskPanel: () => void;
  toggleCalendarPanel: () => void;
  toggleUsagePanel: () => void;
  toggleProfileMenu: () => void;
  showProfileSubpanel: () => void;
  showProfileMain: () => void;
}

/** UI layout and panel state store */
export const useUIStore = create<UIState>((set) => ({
  currentMode: 'chat',
  sidebarCollapsed: false,
  cosimoPanelOpen: false,
  cosimoPanelContext: null,
  taskPanelOpen: false,
  calendarPanelOpen: false,
  usagePanelOpen: false,
  profileMenuOpen: false,
  profileSubpanelOpen: false,
  brainNavCollapsed: true,

  setMode: (mode) => set({ currentMode: mode }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  toggleBrainNav: () => set((s) => ({ brainNavCollapsed: !s.brainNavCollapsed })),
  openCosimoPanel: (context) => set({ cosimoPanelOpen: true, cosimoPanelContext: context ?? null }),
  closeCosimoPanel: () => set({ cosimoPanelOpen: false, cosimoPanelContext: null }),
  closeAllPanels: () => set({
    cosimoPanelOpen: false,
    cosimoPanelContext: null,
    taskPanelOpen: false,
    calendarPanelOpen: false,
    usagePanelOpen: false,
    profileMenuOpen: false,
    profileSubpanelOpen: false,
  }),
  toggleTaskPanel: () => set((s) => ({
    taskPanelOpen: !s.taskPanelOpen,
    calendarPanelOpen: false,
    usagePanelOpen: false,
    profileMenuOpen: false,
    profileSubpanelOpen: false,
  })),
  toggleCalendarPanel: () => set((s) => ({
    calendarPanelOpen: !s.calendarPanelOpen,
    taskPanelOpen: false,
    usagePanelOpen: false,
    profileMenuOpen: false,
    profileSubpanelOpen: false,
  })),
  toggleUsagePanel: () => set((s) => ({
    usagePanelOpen: !s.usagePanelOpen,
    taskPanelOpen: false,
    calendarPanelOpen: false,
    profileMenuOpen: false,
    profileSubpanelOpen: false,
  })),
  toggleProfileMenu: () => set((s) => ({
    profileMenuOpen: !s.profileMenuOpen,
    taskPanelOpen: false,
    calendarPanelOpen: false,
    usagePanelOpen: false,
    profileSubpanelOpen: false,
  })),
  showProfileSubpanel: () => set({ profileSubpanelOpen: true }),
  showProfileMain: () => set({ profileSubpanelOpen: false }),
}));
