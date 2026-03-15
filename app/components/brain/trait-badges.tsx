import { useState } from 'react';
import { cn } from '~/lib/utils';
import type { PersonalityTrait } from '~/services/types';

interface TraitBadgesProps {
  traits: PersonalityTrait[];
}

/** Grid of toggleable personality trait badges. Active traits show primary styling. */
export function TraitBadges({ traits: initialTraits }: TraitBadgesProps) {
  const [traits, setTraits] = useState<PersonalityTrait[]>(initialTraits);

  const handleToggle = (index: number) => {
    setTraits((prev) =>
      prev.map((t, i) => (i === index ? { ...t, active: !t.active } : t))
    );
  };

  return (
    <div className="flex flex-wrap gap-2">
      {traits.map((trait, index) => (
        <button
          key={trait.name}
          type="button"
          onClick={() => handleToggle(index)}
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            trait.active
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          {trait.name}
        </button>
      ))}
    </div>
  );
}
