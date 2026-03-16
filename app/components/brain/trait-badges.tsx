import { useState } from 'react';
import { cn } from '~/lib/utils';

interface TraitBadgesProps {
  selectedTraits: string[];
  presetTraits: string[];
}

/** Personality trait badges split into selected / presets / custom input sections. */
export function TraitBadges({ selectedTraits: initialSelected, presetTraits }: TraitBadgesProps) {
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [customInput, setCustomInput] = useState('');

  const removeTrait = (name: string) => {
    setSelected((prev) => prev.filter((t) => t !== name));
  };

  const addTrait = (name: string) => {
    if (!selected.includes(name)) {
      setSelected((prev) => [...prev, name]);
    }
  };

  const addCustomTrait = () => {
    const trimmed = customInput.trim();
    if (trimmed && !selected.includes(trimmed)) {
      setSelected((prev) => [...prev, trimmed]);
      setCustomInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomTrait();
    }
  };

  return (
    <>
      {/* Selected traits */}
      <div className="mem-trait-selected">
        {selected.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => removeTrait(name)}
            className={cn(
              'mem-trait-tag active',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--violet-3)]'
            )}
          >
            {name}
            <span className="trait-x">&times;</span>
          </button>
        ))}
      </div>

      {/* Preset traits */}
      <div className="mem-trait-presets">
        {presetTraits.map((name) => {
          const isSelected = selected.includes(name);
          return (
            <button
              key={name}
              type="button"
              onClick={() => !isSelected && addTrait(name)}
              className={cn(
                'mem-trait-tag',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--violet-3)]',
                isSelected && 'disabled'
              )}
            >
              {name}
            </button>
          );
        })}
      </div>

      {/* Custom trait input */}
      <div className="mem-trait-custom">
        <input
          type="text"
          className="mem-trait-input"
          placeholder="Add a custom trait..."
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          className={cn(
            'mem-trait-add-btn',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--violet-3)]'
          )}
          onClick={addCustomTrait}
        >
          Add
        </button>
      </div>
    </>
  );
}
