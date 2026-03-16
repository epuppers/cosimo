import { useState, useCallback, useImperativeHandle, forwardRef } from 'react';

// ============================================
// Graph Tooltip — hover info above nodes
// ============================================

export interface TooltipHandle {
  show: (text: string, svgX: number, svgY: number) => void;
  hide: () => void;
}

interface TooltipState {
  text: string;
  x: number;
  y: number;
  visible: boolean;
}

interface GraphTooltipProps {
  svgRef: React.RefObject<SVGSVGElement | null>;
  viewBox: { x: number; y: number; w: number; h: number };
}

/** Tooltip that appears above graph nodes on hover. Uses SVG-to-screen coordinate mapping. */
export const GraphTooltip = forwardRef<TooltipHandle, GraphTooltipProps>(
  function GraphTooltip({ svgRef, viewBox }, ref) {
    const [state, setState] = useState<TooltipState>({
      text: '',
      x: 0,
      y: 0,
      visible: false,
    });

    const show = useCallback(
      (text: string, svgX: number, svgY: number) => {
        const svg = svgRef.current;
        if (!svg) return;

        const rect = svg.getBoundingClientRect();
        const scaleX = rect.width / viewBox.w;
        const scaleY = rect.height / viewBox.h;

        // Convert SVG coords to screen coords
        const screenX = rect.left + (svgX - viewBox.x) * scaleX;
        const screenY = rect.top + (svgY - viewBox.y) * scaleY - 40;

        // Clamp to viewport
        const clampedX = Math.max(60, Math.min(window.innerWidth - 60, screenX));

        setState({ text, x: clampedX, y: screenY, visible: true });
      },
      [svgRef, viewBox]
    );

    const hide = useCallback(() => {
      setState((prev) => ({ ...prev, visible: false }));
    }, []);

    useImperativeHandle(ref, () => ({ show, hide }), [show, hide]);

    return (
      <div
        className={`graph-tooltip ${state.visible ? 'show' : ''}`}
        style={{
          left: state.x,
          top: state.y,
          transform: 'translateX(-50%)',
        }}
      >
        {state.text}
      </div>
    );
  }
);
