// ============================================
// NodePopover — Detail popover shown on flow graph node click
// ============================================

import { X, Sparkles, BookOpen } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
  PopoverTrigger,
} from '~/components/ui/popover';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { useUIStore } from '~/stores/ui-store';
import type { FlowNode, FlowNodeType } from '~/services/types';
import { cn } from '~/lib/utils';

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

/** Maps node type to badge color classes */
function nodeTypeBadgeClass(type: FlowNodeType): string {
  const classes: Record<FlowNodeType, string> = {
    input: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    action: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
    gate: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    branch: 'bg-secondary text-secondary-foreground',
    output: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  };
  return classes[type];
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
      <PopoverContent className="w-80 p-4" side="right" sideOffset={12}>
        <PopoverHeader>
          <div className="flex items-center justify-between">
            <Badge
              className={cn(
                'border-transparent text-xs font-medium',
                nodeTypeBadgeClass(node.type)
              )}
            >
              {nodeTypeLabel(node.type)}
            </Badge>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onClose}
              aria-label="Close popover"
            >
              <X />
            </Button>
          </div>
          <PopoverTitle className="font-mono text-sm font-semibold mt-1.5">
            {node.title}
          </PopoverTitle>
        </PopoverHeader>

        <PopoverDescription className="text-xs leading-relaxed">
          {node.description}
        </PopoverDescription>

        {node.lesson && (
          <div className="flex items-center gap-1.5 text-xs text-primary">
            <BookOpen className="size-3 shrink-0" />
            <span className="truncate underline underline-offset-2 cursor-pointer hover:text-primary/80">
              {node.lesson}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <Button
            variant="default"
            size="sm"
            onClick={handleEditWithCosimo}
            className="gap-1.5"
          >
            <Sparkles className="size-3.5" />
            Edit with Cosimo
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
