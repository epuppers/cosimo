import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import { useBrainStore } from '~/stores/brain-store';
import { TraitBadges } from './trait-badges';
import { MemoryFactCard } from './memory-fact';
import type { MemoryData } from '~/services/types';
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
        <h3 className="mem-section-label">What Describes Your Work</h3>
        <div className="mem-role-card">
          <div
            className="mem-role-text"
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
        <h3 className="mem-section-label">What Traits Should Cosimo Have?</h3>
        <div className="mem-personality">
          <TraitBadges
            selectedTraits={memory.selectedTraits}
            presetTraits={memory.presetTraits}
          />
        </div>
      </div>

      {/* Core Memories */}
      <div className="mb-6">
        <h3 className="mem-section-label">Core Memories</h3>

        {/* Search & filter toolbar */}
        <div className="mem-facts-toolbar">
          <div className="relative mb-2">
            <Search className="absolute left-[10px] top-1/2 size-3.5 -translate-y-1/2 text-[var(--taupe-3)] pointer-events-none" />
            <input
              type="search"
              placeholder="Search memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mem-search-input"
            />
          </div>

          <div className="flex flex-wrap gap-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setMemoryCategory(cat.id)}
                className={cn(
                  'mem-cat-pill',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--violet-3)]',
                  memoryCategory === cat.id && 'active'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Add Memory form */}
        {showAddMemoryForm && (
          <div className="mem-add-form">
            <div className="mem-add-form-inner">
              <input
                type="text"
                className="mem-add-input"
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
              <div className="mem-add-form-row">
                <select
                  className="mem-add-category"
                  value={newFactCategory}
                  onChange={(e) => setNewFactCategory(e.target.value)}
                >
                  <option value="preference">Preference</option>
                  <option value="workflow">Workflow</option>
                  <option value="contact">Contact</option>
                  <option value="fund">Fund</option>
                  <option value="style">Style</option>
                  <option value="context">Context</option>
                </select>
                <div className="mem-add-actions">
                  <button
                    type="button"
                    className="header-btn bevel label-mono"
                    onClick={handleCancelAdd}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="header-btn bevel label-mono primary"
                    onClick={handleSaveMemory}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fact list */}
        <div className="flex flex-col gap-1.5">
          {filteredFacts.length === 0 ? (
            <div className="mem-no-results">
              <div className="brain-empty-icon">
                <Search size={32} />
              </div>
              <div className="brain-empty-title">No memories found</div>
              <div className="brain-empty-desc">
                Try a different search or category filter.
              </div>
            </div>
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
