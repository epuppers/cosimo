import { create } from 'zustand';
import type { Attachment } from '~/services/types';

/** Stable empty array to avoid infinite re-renders in Zustand selectors */
export const EMPTY_ATTACHMENTS: Attachment[] = [];

type FilePanelTab = 'spreadsheet' | 'folder' | 'cloud';

/** A breadcrumb segment with both display name and source ID */
export type BreadcrumbSegment = { id: string; name: string };

interface ChatState {
  /** Currently selected thread ID */
  activeThreadId: string | null;
  /** File panel open/tab state keyed by thread ID */
  filePanelByThread: Record<string, { open: boolean; tab: FilePanelTab }>;
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
  /** Array of breadcrumb segments with IDs and display names */
  cloudBreadcrumb: BreadcrumbSegment[];
  /** Current search input value in cloud drive */
  cloudSearchQuery: string;
  /** Whether search results are being shown in cloud drive */
  cloudSearchActive: boolean;
  /** Files attached but not yet submitted, keyed by thread ID */
  pendingFilesByThread: Record<string, Attachment[]>;

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
  setCloudBreadcrumb: (crumbs: BreadcrumbSegment[]) => void;
  toggleCloudFileSelection: (fileId: string) => void;
  selectAllCloudFiles: (fileIds: string[]) => void;
  clearCloudSelection: () => void;
  setCloudSearchQuery: (query: string) => void;
  setCloudSearchActive: (active: boolean) => void;
  addPendingFiles: (files: Attachment[]) => void;
  removePendingFile: (index: number) => void;
  clearPendingFiles: () => void;
}

/** Chat view state store */
export const useChatStore = create<ChatState>((set) => ({
  activeThreadId: null,
  filePanelByThread: {},
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
  pendingFilesByThread: {},

  selectThread: (threadId) => set({
    activeThreadId: threadId,
    workflowPanelOpen: false,
    activeWorkflowRunId: null,
    autocompleteOpen: false,
    autocompleteIndex: 0,
    selectedCloudFiles: [],
    cloudDriveMode: 'browse' as const,
    cloudSearchQuery: '',
    cloudSearchActive: false,
  }),
  openFilePanel: (tab) => set((state) => {
    const key = state.activeThreadId ?? '';
    const current = state.filePanelByThread[key];
    return {
      filePanelByThread: { ...state.filePanelByThread, [key]: { open: true, tab: tab ?? current?.tab ?? 'spreadsheet' } },
      workflowPanelOpen: false,
    };
  }),
  closeFilePanel: () => set((state) => {
    const key = state.activeThreadId ?? '';
    const current = state.filePanelByThread[key];
    return {
      filePanelByThread: { ...state.filePanelByThread, [key]: { tab: current?.tab ?? 'spreadsheet', open: false } },
    };
  }),
  setFilePanelTab: (tab) => set((state) => {
    const key = state.activeThreadId ?? '';
    const current = state.filePanelByThread[key];
    return {
      filePanelByThread: { ...state.filePanelByThread, [key]: { open: current?.open ?? false, tab } },
    };
  }),
  openWorkflowPanel: (runId) => set((state) => {
    const key = state.activeThreadId ?? '';
    const current = state.filePanelByThread[key];
    return {
      workflowPanelOpen: true,
      activeWorkflowRunId: runId,
      filePanelByThread: { ...state.filePanelByThread, [key]: { tab: current?.tab ?? 'spreadsheet', open: false } },
    };
  }),
  closeWorkflowPanel: () => set({ workflowPanelOpen: false, activeWorkflowRunId: null }),
  showAutocomplete: () => set({ autocompleteOpen: true, autocompleteIndex: 0 }),
  hideAutocomplete: () => set({ autocompleteOpen: false, autocompleteIndex: 0 }),
  setAutocompleteIndex: (index) => set({ autocompleteIndex: index }),
  setStreaming: (streaming) => set({ isStreaming: streaming }),
  openCloudDrive: (mode) => set((state) => {
    const key = state.activeThreadId ?? '';
    return {
      filePanelByThread: { ...state.filePanelByThread, [key]: { open: true, tab: 'cloud' as FilePanelTab } },
      cloudDriveMode: mode,
      workflowPanelOpen: false,
      selectedCloudFiles: [],
      cloudSearchQuery: '',
      cloudSearchActive: false,
    };
  }),
  setCloudActiveSource: (sourceId) => set({ cloudActiveSourceId: sourceId }),
  setCloudBreadcrumb: (crumbs) => set({ cloudBreadcrumb: crumbs }),
  toggleCloudFileSelection: (fileId) => set((state) => ({
    selectedCloudFiles: state.selectedCloudFiles.includes(fileId)
      ? state.selectedCloudFiles.filter((id) => id !== fileId)
      : [...state.selectedCloudFiles, fileId],
  })),
  selectAllCloudFiles: (fileIds) => set({ selectedCloudFiles: fileIds }),
  clearCloudSelection: () => set({ selectedCloudFiles: [] }),
  setCloudSearchQuery: (query) => set({ cloudSearchQuery: query }),
  setCloudSearchActive: (active) => set({ cloudSearchActive: active }),
  addPendingFiles: (files) => set((state) => {
    const key = state.activeThreadId ?? '';
    const current = state.pendingFilesByThread[key] ?? [];
    return { pendingFilesByThread: { ...state.pendingFilesByThread, [key]: [...current, ...files] } };
  }),
  removePendingFile: (index) => set((state) => {
    const key = state.activeThreadId ?? '';
    const current = state.pendingFilesByThread[key] ?? [];
    return { pendingFilesByThread: { ...state.pendingFilesByThread, [key]: current.filter((_, i) => i !== index) } };
  }),
  clearPendingFiles: () => set((state) => {
    const key = state.activeThreadId ?? '';
    const { [key]: _, ...rest } = state.pendingFilesByThread;
    return { pendingFilesByThread: rest };
  }),
}));
