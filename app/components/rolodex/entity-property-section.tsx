// ============================================
// EntityPropertySection — Detail section with formatted property rows
// ============================================

import type { EntityDetailSection, EntityPropertyDefinition } from '~/services/types';
import { SectionPanel } from '~/components/ui/section-panel';
import { KVRow } from '~/components/ui/kv-row';
import { cn } from '~/lib/utils';

interface EntityPropertySectionProps {
  /** The section definition from the schema */
  section: EntityDetailSection;
  /** The entity's property values */
  properties: Record<string, string | string[] | null>;
  /** The property definitions from the schema */
  propertyDefs: EntityPropertyDefinition[];
  /** Optional additional class names */
  className?: string;
}

/** Formats a property value based on its type for display in the detail view. */
function formatPropertyValue(
  value: string | string[] | null | undefined,
  type: string,
): React.ReactNode {
  if (value == null) {
    return <span className="text-taupe-2 italic">—</span>;
  }

  if (Array.isArray(value)) {
    if (type === 'tags') {
      return (
        <span className="flex flex-wrap gap-1 justify-end">
          {value.map((tag) => (
            <span
              key={tag}
              className="font-mono text-[0.625rem] px-1.5 py-[1px] bg-[rgba(var(--violet-3-rgb),0.08)] dark:bg-[rgba(var(--violet-3-rgb),0.12)] text-violet-3 rounded-[var(--r-sm)]"
            >
              {tag}
            </span>
          ))}
        </span>
      );
    }
    return value.join(', ');
  }

  switch (type) {
    case 'currency': {
      const num = Number(value);
      if (!isNaN(num)) {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(num);
      }
      return value;
    }
    case 'percentage':
      return `${value}%`;
    case 'date': {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }).format(date);
      }
      return value;
    }
    case 'email':
      return (
        <a href={`mailto:${value}`} className="text-violet-3 hover:underline">
          {value}
        </a>
      );
    case 'phone':
      return (
        <a href={`tel:${value}`} className="text-violet-3 hover:underline">
          {value}
        </a>
      );
    case 'url':
      return (
        <a href={value} className="text-violet-3 hover:underline" target="_blank" rel="noopener noreferrer">
          {value}
        </a>
      );
    case 'boolean':
      return value === 'true' ? '✓' : '—';
    default:
      return value;
  }
}

/** Renders a section of entity properties inside a SectionPanel with formatted KVRow values. */
export function EntityPropertySection({
  section,
  properties,
  propertyDefs,
  className,
}: EntityPropertySectionProps) {
  return (
    <div data-slot="entity-property-section" className={cn(className)}>
      <SectionPanel title={section.label}>
        {section.propertyIds.map((propId) => {
          const propDef = propertyDefs.find((p) => p.id === propId);
          if (!propDef) return null;
          const value = properties[propId];
          return (
            <KVRow
              key={propId}
              label={propDef.label}
              value={formatPropertyValue(value, propDef.type)}
            />
          );
        })}
      </SectionPanel>
    </div>
  );
}
