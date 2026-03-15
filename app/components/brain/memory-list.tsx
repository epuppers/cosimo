import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Input } from '~/components/ui/input';
import { useBrainStore } from '~/stores/brain-store';
import { TraitBadges } from './trait-badges';
import { MemoryFactCard } from './memory-fact';
import type { MemoryData, PersonalityTrait } from '~/services/types';
import { cn } from '~/lib/utils';

interface MemoryListProps {
  memory: MemoryData;
}

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'preference', label: 'Preference' },
  { id: 'workflow', label: 'Workflow' },
  { id: 'contact', label: 'Contact' },
  { id: 'fund', label: 'Fund' },
  { id: 'style', label: 'Style' },
  { id: 'context', label: 'Context' },
];

/** Full memory view: role profile, personality traits, category filter, search, and fact list. */
export function MemoryList({ memory }: MemoryListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const memoryCategory = useBrainStore((s) => s.memoryCategory);
  const setMemoryCategory = useBrainStore((s) => s.setMemoryCategory);

  const traits: PersonalityTrait[] = useMemo(
    () =>
      memory.presetTraits.map((name) => ({
        name,
        active: memory.selectedTraits.includes(name),
      })),
    [memory.presetTraits, memory.selectedTraits]
  );

  const filteredFacts = useMemo(() => {
    let facts = memory.facts;

    if (memoryCategory !== 'all') {
      facts = facts.filter((f) => f.category === memoryCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      facts = facts.filter(
        (f) =>
          f.text.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q) ||
          f.linkedEntities?.some((e) => e.name.toLowerCase().includes(q))
      );
    }

    return facts;
  }, [memory.facts, memoryCategory, searchQuery]);

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto p-4">
      {/* Role profile */}
      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Role Profile
        </h3>
        <p className="text-sm leading-relaxed text-foreground">
          {memory.roleProfile}
        </p>
      </section>

      {/* Personality traits */}
      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Personality
        </h3>
        <TraitBadges traits={traits} />
      </section>

      {/* Category filter */}
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setMemoryCategory(cat.id)}
            className={cn(
              'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              memoryCategory === cat.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search memories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 h-8 text-sm"
        />
      </div>

      {/* Fact list */}
      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Facts ({filteredFacts.length})
        </h3>
        {filteredFacts.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No memories match your filter.
          </p>
        ) : (
          filteredFacts.map((fact, index) => (
            <MemoryFactCard key={`${fact.category}-${index}`} fact={fact} />
          ))
        )}
      </section>
    </div>
  );
}
