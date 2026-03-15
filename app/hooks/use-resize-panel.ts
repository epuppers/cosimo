// ============================================
// useResizePanel — Drag-to-resize logic for side panels
// ============================================
// Used by FilePanel and WorkflowPanel for the resize handle.

import { useCallback, useState } from 'react';

interface UseResizePanelOptions {
  /** Initial width in pixels */
  initialWidth: number;
  /** Minimum width in pixels */
  minWidth: number;
  /** Maximum width in pixels */
  maxWidth: number;
  /** Which side the panel is on — determines drag direction */
  side: 'left' | 'right';
}

interface UseResizePanelReturn {
  /** Current panel width */
  currentWidth: number;
  /** Whether a drag is in progress */
  isDragging: boolean;
  /** Mouse down handler for the resize handle */
  handleMouseDown: (e: React.MouseEvent) => void;
}

/**
 * Hook for drag-to-resize panel behavior.
 * Handles mousedown/mousemove/mouseup pattern with proper cleanup.
 */
export function useResizePanel({
  initialWidth,
  minWidth,
  maxWidth,
  side,
}: UseResizePanelOptions): UseResizePanelReturn {
  const [currentWidth, setCurrentWidth] = useState(initialWidth);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);

      const startX = e.clientX;
      const startWidth = currentWidth;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        // For right-side panels: dragging left increases width
        // For left-side panels: dragging right increases width
        const delta =
          side === 'right'
            ? startX - moveEvent.clientX
            : moveEvent.clientX - startX;
        const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + delta));
        setCurrentWidth(newWidth);
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [currentWidth, minWidth, maxWidth, side]
  );

  return { currentWidth, isDragging, handleMouseDown };
}
