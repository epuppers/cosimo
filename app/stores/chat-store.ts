import { create } from 'zustand';

interface ChatState {
  /** Currently selected thread ID */
  activeThreadId: string | null;
  /** Whether the file panel is open */
  filePanelOpen: boolean;
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

  selectThread: (threadId: string | null) => void;
  openFilePanel: () => void;
  closeFilePanel: () => void;
  openWorkflowPanel: (runId: string) => void;
  closeWorkflowPanel: () => void;
  showAutocomplete: () => void;
  hideAutocomplete: () => void;
  setAutocompleteIndex: (index: number) => void;
  setStreaming: (streaming: boolean) => void;
}

/** Chat view state store */
export const useChatStore = create<ChatState>((set) => ({
  activeThreadId: null,
  filePanelOpen: false,
  workflowPanelOpen: false,
  activeWorkflowRunId: null,
  autocompleteOpen: false,
  autocompleteIndex: 0,
  isStreaming: false,

  selectThread: (threadId) => set({
    activeThreadId: threadId,
    filePanelOpen: false,
    workflowPanelOpen: false,
    activeWorkflowRunId: null,
    autocompleteOpen: false,
    autocompleteIndex: 0,
  }),
  openFilePanel: () => set({ filePanelOpen: true, workflowPanelOpen: false }),
  closeFilePanel: () => set({ filePanelOpen: false }),
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
}));
