// ============================================
// Brain Layout Route — section tabs + child outlet
// ============================================

import { Outlet, Link, useLocation } from 'react-router';
import { cn } from '~/lib/utils';

const BRAIN_SECTIONS = [
  { label: 'Memory', path: '/brain/memory' },
  { label: 'Lessons', path: '/brain/lessons' },
  { label: 'Graphs', path: '/brain/graph' },
] as const;

/** Brain layout route — renders section navigation tabs and child content. */
export default function BrainRoute() {
  const location = useLocation();

  return (
    <div className="flex h-full flex-col bg-[var(--off-white)] dark:bg-[var(--surface-0)]">
      {/* Section tabs */}
      <nav className="flex shrink-0 gap-1 border-b border-[var(--taupe-2)] px-4 pt-2 dark:border-[var(--taupe-4)]">
        {BRAIN_SECTIONS.map((section) => {
          const isActive = location.pathname.startsWith(section.path);
          return (
            <Link
              key={section.path}
              to={section.path}
              className={cn(
                'relative px-3 py-2 font-[family-name:var(--pixel)] text-[11px] uppercase tracking-[0.08em] transition-colors',
                'hover:text-[var(--taupe-5)] dark:hover:text-[var(--taupe-1)] focus-visible:outline-2 focus-visible:outline-[var(--violet-3)] focus-visible:outline-offset-1 rounded-t-[var(--r-md)]',
                isActive
                  ? 'text-[var(--taupe-5)] dark:text-[var(--taupe-1)]'
                  : 'text-[var(--taupe-3)]'
              )}
            >
              {section.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--violet-3)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Child route content */}
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
