import { create } from 'zustand';

interface WorkflowState {
  /** Currently selected workflow template ID */
  activeTemplateId: string | null;
  /** Active tab in the template detail view */
  activeTab: string;
  /** Currently selected node ID in the flow graph */
  selectedNodeId: string | null;
  /** Whether the node popover is open */
  popoverOpen: boolean;
  /** Current zoom level of the flow graph */
  graphZoom: number;
  /** Current pan offset of the flow graph */
  graphPan: { x: number; y: number };

  selectTemplate: (templateId: string | null) => void;
  setTab: (tab: string) => void;
  selectNode: (nodeId: string | null) => void;
  openPopover: () => void;
  closePopover: () => void;
  setGraphZoom: (zoom: number) => void;
  setGraphPan: (pan: { x: number; y: number }) => void;
}

/** Workflow view state store */
export const useWorkflowStore = create<WorkflowState>((set) => ({
  activeTemplateId: null,
  activeTab: 'overview',
  selectedNodeId: null,
  popoverOpen: false,
  graphZoom: 1,
  graphPan: { x: 0, y: 0 },

  selectTemplate: (templateId) => set({
    activeTemplateId: templateId,
    activeTab: 'overview',
    selectedNodeId: null,
    popoverOpen: false,
    graphZoom: 1,
    graphPan: { x: 0, y: 0 },
  }),
  setTab: (tab) => set({ activeTab: tab }),
  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),
  openPopover: () => set({ popoverOpen: true }),
  closePopover: () => set({ popoverOpen: false, selectedNodeId: null }),
  setGraphZoom: (zoom) => set({ graphZoom: zoom }),
  setGraphPan: (pan) => set({ graphPan: pan }),
}));
