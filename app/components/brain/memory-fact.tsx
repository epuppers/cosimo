import { useNavigate } from 'react-router';
import { MoreHorizontal, Pencil, Trash2, User, Building, FileText, Landmark } from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '~/components/ui/dropdown-menu';
import type { MemoryFact as MemoryFactType, LinkedEntity } from '~/services/types';

interface MemoryFactProps {
  fact: MemoryFactType;
  onEntityClick?: (name: string) => void;
}

/** Renders the icon for a linked entity based on its type. */
function EntityIcon({ type }: { type: string }) {
  const cls = 'size-3';
  switch (type) {
    case 'person':
      return <User className={cls} />;
    case 'fund':
      return <Landmark className={cls} />;
    case 'document':
      return <FileText className={cls} />;
    default:
      return <Building className={cls} />;
  }
}

/** A single memory fact card with category badge, entity chips, and edit/delete actions. */
export function MemoryFactCard({ fact, onEntityClick }: MemoryFactProps) {
  const navigate = useNavigate();

  const handleEntityClick = (entity: LinkedEntity) => {
    if (onEntityClick) {
      onEntityClick(entity.name);
    }
    navigate(`/brain/graph?entity=${encodeURIComponent(entity.name)}`);
  };

  return (
    <div className="group flex items-start gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent/50">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="secondary" className="text-[10px] capitalize">
            {fact.category}
          </Badge>
          {fact.date && (
            <span className="text-[10px] text-muted-foreground">{fact.date}</span>
          )}
        </div>

        <p className="text-sm text-foreground leading-relaxed">{fact.text}</p>

        {fact.linkedEntities && fact.linkedEntities.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {fact.linkedEntities.map((entity) => (
              <button
                key={entity.name}
                type="button"
                onClick={() => handleEntityClick(entity)}
                className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <EntityIcon type={entity.type} />
                {entity.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          className="opacity-0 group-hover:opacity-100 transition-opacity rounded p-1 hover:bg-muted focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <MoreHorizontal className="size-4 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="bottom">
          <DropdownMenuItem>
            <Pencil className="size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive">
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
