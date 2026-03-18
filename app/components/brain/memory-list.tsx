import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import { useBrainStore } from '~/stores/brain-store';
import { TraitBadges } from './trait-badges';
import { MemoryFactCard } from './memory-fact';
import type { MemoryData } from '~/services/types';
import { MEMORY_CATEGORIES } from '~/lib/brain-constants';
import { SearchFilterBar } from '~/components/ui/search-filter-bar';
import { Button } from '~/components/ui/button';
import { EmptyState } from '~/components/ui/empty-state';

interface MemoryListProps {
  memory: MemoryData;
}

/** Full memory view: role profile, personality traits, category filter, search, and fact list. */
export function MemoryList({ memory }: MemoryListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [newFactText, setNewFactText] = useState('');
  const [newFactCategory, setNewFactCategory] = useState('preference');
  const memoryCategory = useBrainStore((s) => s.memoryCategory);
  const setMemoryCategory = useBrainStore((s) => s.setMemoryCategory);
  const showAddMemoryForm = useBrainStore((s) => s.showAddMemoryForm);
  const toggleAddMemoryForm = useBrainStore((s) => s.toggleAddMemoryForm);

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

  const handleSaveMemory = () => {
    if (!newFactText.trim()) return;
    toast('Memory saved');
    setNewFactText('');
    setNewFactCategory('preference');
    toggleAddMemoryForm();
  };

  const handleCancelAdd = () => {
    setNewFactText('');
    setNewFactCategory('preference');
    toggleAddMemoryForm();
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Role profile */}
      <div className="mb-6">
        <h3 className="font-mono text-[0.6875rem] font-bold text-taupe-3 uppercase tracking-[0.08em] mb-2">What Describes Your Work</h3>
        <div className="bg-white border-2 border-t-taupe-2 border-l-taupe-2 border-b-taupe-3 border-r-taupe-3 rounded-[var(--r-md)] px-3.5 py-3 dark:bg-surface-1 dark:border-taupe-3">
          <div
            className="mem-role-text font-sans text-xs leading-[1.7] text-taupe-5 outline-none min-h-[40px] focus:border-violet-3"
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-label="Role description"
            data-placeholder="Describe what you do, your role, your firm..."
          >
            {memory.roleProfile}
          </div>
        </div>
      </div>

      {/* Personality traits */}
      <div className="mb-6">
        <h3 className="font-mono text-[0.6875rem] font-bold text-taupe-3 uppercase tracking-[0.08em] mb-2">What Traits Should Cosimo Have?</h3>
        <div className="bg-white dark:bg-surface-1 border-2 border-t-taupe-2 border-l-taupe-2 border-r-taupe-3 border-b-taupe-3 dark:border-taupe-3 rounded-[var(--r-md)] p-[12px_14px]">
          <TraitBadges
            selectedTraits={memory.selectedTraits}
            presetTraits={memory.presetTraits}
          />
        </div>
      </div>

      {/* Core Memories */}
      <div className="mb-6">
        <h3 className="font-mono text-[0.6875rem] font-bold text-taupe-3 uppercase tracking-[0.08em] mb-2">Core Memories</h3>

        {/* Search & filter toolbar */}
        <div className="mb-3 bg-black/[0.02] dark:bg-black/10 rounded-[var(--r-md)] p-2.5">
          <SearchFilterBar
            placeholder="Search memories..."
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            filters={{
              options: MEMORY_CATEGORIES,
              value: memoryCategory,
              onChange: setMemoryCategory,
            }}
          />
        </div>

        {/* Add Memory form */}
        {showAddMemoryForm && (
          <div className="mb-3">
            <div className="bg-white dark:bg-surface-1 border-2 border-t-violet-2 border-l-violet-2 border-r-violet-3 border-b-violet-3 dark:border-violet-2 rounded-[var(--r-md)] p-[12px_14px]">
              <input
                type="text"
                className="w-full p-[8px_10px] font-sans text-xs text-taupe-5 bg-off-white dark:bg-surface-2 border border-taupe-2 dark:border-taupe-3 rounded-[var(--r-md)] outline-none mb-2 focus:border-violet-3 dark:text-taupe-3"
                placeholder="Type a fact Cosimo should remember..."
                value={newFactText}
                onChange={(e) => setNewFactText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSaveMemory();
                  }
                }}
                autoFocus
              />
              <div className="flex items-center justify-between">
                <select
                  className="p-[4px_8px] font-mono text-[0.6875rem] text-taupe-5 dark:text-taupe-3 bg-off-white dark:bg-surface-2 border border-taupe-2 dark:border-taupe-3 rounded-[var(--r-md)] outline-none cursor-pointer"
                  value={newFactCategory}
                  onChange={(e) => setNewFactCategory(e.target.value)}
                >
                  {MEMORY_CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
                <div className="flex gap-1.5">
                  <Button variant="ghost" size="sm" className="header-btn border border-solid border-t-taupe-2 border-l-taupe-2 border-b-taupe-3 border-r-taupe-3 dark:border-taupe-2 font-mono text-[0.625rem] uppercase tracking-[0.05em] text-taupe-3" onClick={handleCancelAdd}>Cancel</Button>
                  <Button variant="default" size="sm" className="header-btn border border-solid border-t-taupe-2 border-l-taupe-2 border-b-taupe-3 border-r-taupe-3 dark:border-taupe-2 font-mono text-[0.625rem] uppercase tracking-[0.05em] text-taupe-3 primary" onClick={handleSaveMemory}>Save</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fact list */}
        <div className="flex flex-col gap-1.5">
          {filteredFacts.length === 0 ? (
            <EmptyState icon={<Search size={32} />} title="No memories found" description="Try a different search or category filter." />
          ) : (
            filteredFacts.map((fact, index) => (
              <MemoryFactCard key={`${fact.category}-${index}`} fact={fact} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
