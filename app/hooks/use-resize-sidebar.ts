// ============================================
// useResizeSidebar — Drag-to-resize with narrow snap for the sidebar
// ============================================
// Follows the same mousedown/move/up pattern as useResizePanel.
// Adds narrow-snap behavior: dragging below NARROW_THRESHOLD snaps to
// NARROW_SNAP width; releasing in that zone collapses the sidebar.

import { useCallback, useRef } from 'react';
import { useUIStore } from '~/stores/ui-store';

const NARROW_THRESHOLD = 140;
const NARROW_SNAP = 48;
const MIN_WIDTH = 160;
const MAX_WIDTH = 480;
const DEFAULT_WIDTH = 280;

/**
 * Hook for sidebar drag-to-resize with narrow snap behavior.
 * Reads/writes sidebar state directly from UIStore.
 */
export function useResizeSidebar() {
  const narrowRef = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();

    const startX = e.clientX;
    const startWidth = useUIStore.getState().sidebarWidth;

    useUIStore.getState().setSidebarDragState('dragging');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      const rawWidth = startWidth + delta;

      if (rawWidth < NARROW_THRESHOLD) {
        narrowRef.current = true;
        useUIStore.getState().setSidebarWidth(NARROW_SNAP);
        useUIStore.getState().setSidebarDragState('narrow');
      } else {
        narrowRef.current = false;
        const clamped = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, rawWidth));
        useUIStore.getState().setSidebarWidth(clamped);
        useUIStore.getState().setSidebarDragState('dragging');
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      if (narrowRef.current) {
        // Snap to collapsed — toggle sidebar closed and reset width
        const state = useUIStore.getState();
        if (!state.sidebarCollapsed) {
          state.toggleSidebar();
        }
        state.setSidebarWidth(DEFAULT_WIDTH);
      }

      narrowRef.current = false;
      useUIStore.getState().setSidebarDragState('idle');
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  return { handleMouseDown };
}
