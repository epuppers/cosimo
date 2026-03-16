// ============================================
// Brain Layout Route — section header + child outlet
// ============================================

import { Outlet, useLocation } from 'react-router';
import { useBrainStore } from '~/stores/brain-store';
import { useUIStore } from '~/stores/ui-store';

const BRAIN_SECTIONS = [
  { label: 'Memory', path: '/brain/memory', action: '+ Add Memory' },
  { label: 'Lessons', path: '/brain/lessons', action: '+ New Lesson' },
  { label: 'Data Graphs', path: '/brain/graph', action: null },
] as const;

/** Brain layout route — renders section header and child content. */
export default function BrainRoute() {
  const location = useLocation();

  const currentSection = BRAIN_SECTIONS.find((s) =>
    location.pathname.startsWith(s.path)
  ) ?? BRAIN_SECTIONS[0];

  return (
    <div className="flex h-full flex-col bg-[var(--off-white)] dark:bg-[var(--surface-0)]">
      {/* Section header */}
      <div className="main-header">
        <span className="header-title">{currentSection.label}</span>
        <div className="header-actions">
          {currentSection.action && (
            <button
              type="button"
              className="header-btn bevel label-mono primary"
              onClick={() => {
                if (currentSection.label === 'Memory') {
                  useBrainStore.getState().toggleAddMemoryForm();
                } else if (currentSection.label === 'Lessons') {
                  useUIStore.getState().openCosimoPanel({ type: 'lesson', text: 'New Lesson' });
                }
              }}
            >
              {currentSection.action}
            </button>
          )}
        </div>
      </div>

      {/* Child route content */}
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
