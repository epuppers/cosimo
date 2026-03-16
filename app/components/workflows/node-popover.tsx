// ============================================
// NodePopover — Detail popover shown on flow graph node click
// ============================================

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import { useUIStore } from '~/stores/ui-store';
import type { FlowNode, FlowNodeType } from '~/services/types';

interface NodePopoverProps {
  /** The flow node to display details for */
  node: FlowNode;
  /** The template this node belongs to */
  templateId: string;
  /** Whether the popover is open */
  open: boolean;
  /** Called when the popover should close */
  onClose: () => void;
  /** Screen position to anchor the popover near */
  anchorPosition: { x: number; y: number };
}

/** Maps node type to display label */
function nodeTypeLabel(type: FlowNodeType): string {
  const labels: Record<FlowNodeType, string> = {
    input: 'Input',
    action: 'Action',
    gate: 'Gate',
    branch: 'Branch',
    output: 'Output',
  };
  return labels[type];
}

/**
 * Popover that shows detailed information about a flow graph node.
 * Anchored near the clicked node position using an invisible trigger element.
 */
export function NodePopover({
  node,
  templateId,
  open,
  onClose,
  anchorPosition,
}: NodePopoverProps) {
  const openCosimoPanel = useUIStore((s) => s.openCosimoPanel);

  const handleEditWithCosimo = () => {
    openCosimoPanel({ type: 'node', text: node.title });
    onClose();
  };

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <PopoverTrigger
        render={<span />}
        style={{
          position: 'fixed',
          left: anchorPosition.x,
          top: anchorPosition.y,
          width: 1,
          height: 1,
          pointerEvents: 'none',
          opacity: 0,
        }}
      />
      <PopoverContent className="node-popover !p-[14px] !w-[320px] !gap-0 !ring-0" side="right" sideOffset={12}>
        <div className="node-popover-header">
          <span className={`node-popover-type node-popover-type--${node.type}`}>
            {nodeTypeLabel(node.type)}
          </span>
          <button
            className="node-popover-close"
            onClick={onClose}
            aria-label="Close popover"
          >
            <span className="icon-char">✕</span>
            <span className="a11y-label">Close</span>
          </button>
        </div>

        <div className="node-popover-title">{node.title}</div>

        <div className="node-popover-desc">{node.description}</div>

        {node.lesson && (
          <div className="node-popover-lesson">
            <div className="node-popover-lesson-label">Linked Lesson</div>
            <div className="node-popover-lesson-title">
              <span className="node-popover-lesson-diamond">◆</span>{' '}
              {node.lesson}
            </div>
          </div>
        )}

        <div className="node-popover-actions">
          <button
            className="node-popover-cosimo-btn"
            onClick={handleEditWithCosimo}
          >
            <span className="icon-char">✦</span> Edit with Cosimo
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
