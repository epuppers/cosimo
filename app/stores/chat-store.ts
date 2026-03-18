import { create } from 'zustand';

type FilePanelTab = 'spreadsheet' | 'folder' | 'cloud';

interface ChatState {
  /** Currently selected thread ID */
  activeThreadId: string | null;
  /** Whether the file panel is open */
  filePanelOpen: boolean;
  /** Active tab in the file panel */
  filePanelTab: FilePanelTab;
  /** Whether the workflow context panel is open */
  workflowPanelOpen: boolean;
  /** Active workflow run ID shown in the workflow context panel */
  activeWorkflowRunId: string | null;
  /** Whether the command autocomplete dropdown is visible */
  autocompleteOpen: boolean;
  /** Currently highlighted index in the autocomplete dropdown */
  autocompleteIndex: number;
  /** Whether a streaming response is in progress */
  isStreaming: boolean;
  /** Whether cloud drive is in browse or attach mode */
  cloudDriveMode: 'browse' | 'attach';
  /** Array of selected CloudFile IDs for multi-select in attach mode */
  selectedCloudFiles: string[];
  /** Currently selected source in the cloud source tree */
  cloudActiveSourceId: string | null;
  /** Array of folder names for breadcrumb display */
  cloudBreadcrumb: string[];
  /** Current search input value in cloud drive */
  cloudSearchQuery: string;
  /** Whether search results are being shown in cloud drive */
  cloudSearchActive: boolean;

  selectThread: (threadId: string | null) => void;
  openFilePanel: (tab?: FilePanelTab) => void;
  closeFilePanel: () => void;
  setFilePanelTab: (tab: FilePanelTab) => void;
  openWorkflowPanel: (runId: string) => void;
  closeWorkflowPanel: () => void;
  showAutocomplete: () => void;
  hideAutocomplete: () => void;
  setAutocompleteIndex: (index: number) => void;
  setStreaming: (streaming: boolean) => void;
  openCloudDrive: (mode: 'browse' | 'attach') => void;
  setCloudActiveSource: (sourceId: string | null) => void;
  setCloudBreadcrumb: (crumbs: string[]) => void;
  toggleCloudFileSelection: (fileId: string) => void;
  clearCloudSelection: () => void;
  setCloudSearchQuery: (query: string) => void;
  setCloudSearchActive: (active: boolean) => void;
}

/** Chat view state store */
export const useChatStore = create<ChatState>((set) => ({
  activeThreadId: null,
  filePanelOpen: false,
  filePanelTab: 'spreadsheet',
  workflowPanelOpen: false,
  activeWorkflowRunId: null,
  autocompleteOpen: false,
  autocompleteIndex: 0,
  isStreaming: false,
  cloudDriveMode: 'browse',
  selectedCloudFiles: [],
  cloudActiveSourceId: null,
  cloudBreadcrumb: [],
  cloudSearchQuery: '',
  cloudSearchActive: false,

  selectThread: (threadId) => set({
    activeThreadId: threadId,
    filePanelOpen: false,
    workflowPanelOpen: false,
    activeWorkflowRunId: null,
    autocompleteOpen: false,
    autocompleteIndex: 0,
  }),
  openFilePanel: (tab) => set({ filePanelOpen: true, workflowPanelOpen: false, ...(tab ? { filePanelTab: tab } : {}) }),
  closeFilePanel: () => set({ filePanelOpen: false }),
  setFilePanelTab: (tab) => set({ filePanelTab: tab }),
  openWorkflowPanel: (runId) => set({
    workflowPanelOpen: true,
    activeWorkflowRunId: runId,
    filePanelOpen: false,
  }),
  closeWorkflowPanel: () => set({ workflowPanelOpen: false, activeWorkflowRunId: null }),
  showAutocomplete: () => set({ autocompleteOpen: true, autocompleteIndex: 0 }),
  hideAutocomplete: () => set({ autocompleteOpen: false, autocompleteIndex: 0 }),
  setAutocompleteIndex: (index) => set({ autocompleteIndex: index }),
  setStreaming: (streaming) => set({ isStreaming: streaming }),
  openCloudDrive: (mode) => set({
    filePanelOpen: true,
    filePanelTab: 'cloud',
    cloudDriveMode: mode,
    workflowPanelOpen: false,
    selectedCloudFiles: [],
    cloudSearchQuery: '',
    cloudSearchActive: false,
  }),
  setCloudActiveSource: (sourceId) => set({ cloudActiveSourceId: sourceId }),
  setCloudBreadcrumb: (crumbs) => set({ cloudBreadcrumb: crumbs }),
  toggleCloudFileSelection: (fileId) => set((state) => ({
    selectedCloudFiles: state.selectedCloudFiles.includes(fileId)
      ? state.selectedCloudFiles.filter((id) => id !== fileId)
      : [...state.selectedCloudFiles, fileId],
  })),
  clearCloudSelection: () => set({ selectedCloudFiles: [] }),
  setCloudSearchQuery: (query) => set({ cloudSearchQuery: query }),
  setCloudSearchActive: (active) => set({ cloudSearchActive: active }),
}));
