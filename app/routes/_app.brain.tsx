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
    <div className="flex h-full flex-col">
      {/* Section tabs */}
      <nav className="flex shrink-0 gap-1 border-b border-border px-4 pt-2">
        {BRAIN_SECTIONS.map((section) => {
          const isActive = location.pathname.startsWith(section.path);
          return (
            <Link
              key={section.path}
              to={section.path}
              className={cn(
                'relative px-3 py-2 text-xs font-medium transition-colors',
                'hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-t-md',
                isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              {section.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
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
