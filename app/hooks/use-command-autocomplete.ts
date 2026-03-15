// ============================================
// useCommandAutocomplete — Manages /command autocomplete dropdown in chat input
// ============================================

import { useState, useCallback, useMemo } from 'react';
import type { WorkflowCommand } from '~/services/types';

/** Return type for the useCommandAutocomplete hook */
interface CommandAutocompleteResult {
  /** Whether the autocomplete dropdown is visible */
  isOpen: boolean;
  /** Filtered list of matching commands */
  filteredItems: WorkflowCommand[];
  /** Index of the currently highlighted item */
  selectedIndex: number;
  /** Select a command by index */
  selectItem: (index: number) => string;
  /** Close the autocomplete dropdown */
  close: () => void;
  /** Process input value changes — call this on every input change */
  handleInputChange: (value: string) => void;
  /** Handle keyboard events for navigation — call from onKeyDown */
  handleKeyDown: (e: React.KeyboardEvent) => string | null;
}

/**
 * Hook that manages slash-command autocomplete for the chat input.
 * Filters available workflow commands based on user input, handles
 * keyboard navigation (arrow keys, Enter, Escape), and returns the
 * selected command text.
 */
export function useCommandAutocomplete(
  commands: WorkflowCommand[],
): CommandAutocompleteResult {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredItems = useMemo(() => {
    if (!query.startsWith('/')) return [];
    const search = query.slice(1).toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.command.slice(1).toLowerCase().includes(search) ||
        cmd.label.toLowerCase().includes(search),
    );
  }, [query, commands]);

  const handleInputChange = useCallback(
    (value: string) => {
      if (value.startsWith('/')) {
        setQuery(value);
        setIsOpen(true);
        setSelectedIndex(0);
      } else {
        setIsOpen(false);
        setQuery('');
      }
    },
    [],
  );

  /** Returns the full command text for the selected item, or empty string */
  const selectItem = useCallback(
    (index: number): string => {
      const item = filteredItems[index];
      if (!item) return '';
      setIsOpen(false);
      setQuery('');
      const text = item.argPlaceholder
        ? `${item.command} ${item.argPlaceholder}`
        : item.command;
      return text;
    },
    [filteredItems],
  );

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(0);
  }, []);

  /**
   * Keyboard handler for autocomplete navigation.
   * Returns selected command text if Enter is pressed, null otherwise.
   * Prevents default on handled keys.
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent): string | null => {
      if (!isOpen || filteredItems.length === 0) return null;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredItems.length - 1 ? prev + 1 : 0,
        );
        return null;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredItems.length - 1,
        );
        return null;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        return selectItem(selectedIndex);
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return null;
      }

      return null;
    },
    [isOpen, filteredItems, selectedIndex, selectItem, close],
  );

  return {
    isOpen,
    filteredItems,
    selectedIndex,
    selectItem,
    close,
    handleInputChange,
    handleKeyDown,
  };
}
