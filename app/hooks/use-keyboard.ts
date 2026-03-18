// ============================================
// useKeyboard — Global keyboard shortcut handler
// ============================================
// Handles Escape key priority chain and Cmd/Ctrl+K search focus.
// Should be called once at the app shell level.

import { useEffect } from 'react';
import { useUIStore } from '~/stores/ui-store';
import { useChatStore } from '~/stores/chat-store';

/**
 * Global keyboard shortcut handler.
 * Escape key closes panels in priority order:
 *   autocomplete → Cosimo panel → file/workflow panel → header panels → profile menu
 * Cmd/Ctrl+K focuses the search input.
 */
export function useKeyboard() {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // --- Escape priority chain ---
      if (e.key === 'Escape') {
        const chatState = useChatStore.getState();
        const uiState = useUIStore.getState();

        // 1. Close autocomplete dropdown
        if (chatState.autocompleteOpen) {
          chatState.hideAutocomplete();
          return;
        }

        // 2. Close Cosimo panel
        if (uiState.cosimoPanelOpen) {
          uiState.closeCosimoPanel();
          return;
        }

        // 3. Close file or workflow panel
        const filePanelState = chatState.filePanelByThread[chatState.activeThreadId ?? ''];
        if (filePanelState?.open) {
          chatState.closeFilePanel();
          return;
        }
        if (chatState.workflowPanelOpen) {
          chatState.closeWorkflowPanel();
          return;
        }

        // 4. Close any header panels
        if (uiState.taskPanelOpen || uiState.calendarPanelOpen || uiState.usagePanelOpen) {
          uiState.closeAllPanels();
          return;
        }

        // 5. Close profile menu
        if (uiState.profileMenuOpen) {
          uiState.closeAllPanels();
          return;
        }
      }

      // --- Cmd/Ctrl+K for search ---
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]');
        if (searchInput) {
          searchInput.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
}
