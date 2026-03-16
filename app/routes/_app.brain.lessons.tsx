// ============================================
// Brain Lessons Route — lesson list + detail outlet
// ============================================

import { useState, useMemo } from 'react';
import { Outlet, useMatches, useNavigate, useRouteError } from 'react-router';
import { AlertCircle, Search } from 'lucide-react';
import { Skeleton } from '~/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { getLessons } from '~/services/brain';
import { LessonCard } from '~/components/brain/lesson-card';
import { useBrainStore } from '~/stores/brain-store';
import { cn } from '~/lib/utils';
import type { Route } from './+types/_app.brain.lessons';

const LESSON_SCOPES = [
  { id: 'all', label: 'All' },
  { id: 'user', label: 'Personal' },
  { id: 'company', label: 'Company' },
];

/** Loads all lessons for the lesson list. */
export async function loader() {
  const lessons = await getLessons();
  return { lessons };
}

/** Brain Lessons route — shows lesson cards, with detail overlay when a lesson is selected. */
export default function BrainLessonsRoute({ loaderData }: Route.ComponentProps) {
  const { lessons } = loaderData;
  const navigate = useNavigate();
  const matches = useMatches();
  const [searchQuery, setSearchQuery] = useState('');
  const lessonScope = useBrainStore((s) => s.lessonScope);
  const setLessonScope = useBrainStore((s) => s.setLessonScope);

  // Check if a child lesson detail route is matched
  const hasChildRoute = matches.some(
    (m) => m.id === 'routes/_app.brain.lessons.$id'
  );

  const filteredLessons = useMemo(() => {
    let result = lessons;

    if (lessonScope !== 'all') {
      result = result.filter((l) => l.scope === lessonScope);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.preview.toLowerCase().includes(q)
      );
    }

    return result;
  }, [lessons, lessonScope, searchQuery]);

  const handleSelectLesson = (id: string) => {
    navigate(`/brain/lessons/${id}`);
  };

  if (hasChildRoute) {
    return <Outlet />;
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-[10px] top-1/2 size-3.5 -translate-y-1/2 text-[var(--taupe-3)] pointer-events-none" />
        <input
          type="search"
          placeholder="Search lessons..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mem-search-input"
        />
      </div>

      {/* Scope filter pills */}
      <div className="flex flex-wrap gap-1 mb-3">
        {LESSON_SCOPES.map((scope) => (
          <button
            key={scope.id}
            type="button"
            onClick={() => setLessonScope(scope.id)}
            className={cn(
              'mem-cat-pill',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--violet-3)]',
              lessonScope === scope.id && 'active'
            )}
          >
            {scope.label}
          </button>
        ))}
      </div>

      {/* Lesson cards */}
      <div className="flex flex-col gap-1.5">
        {filteredLessons.length === 0 ? (
          <div className="mem-no-results">
            <div className="brain-empty-icon">
              <Search size={32} />
            </div>
            <div className="brain-empty-title">No lessons found</div>
            <div className="brain-empty-desc">
              Try a different search term or filter.
            </div>
          </div>
        ) : (
          filteredLessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              onSelect={handleSelectLesson}
            />
          ))
        )}
      </div>
    </div>
  );
}

/** Error boundary for lessons list errors */
export function ErrorBoundary() {
  const error = useRouteError();
  console.error('Lessons route error:', error);

  return (
    <div className="flex h-full items-center justify-center p-8">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription className="mt-2">
          An unexpected error occurred while loading lessons.
        </AlertDescription>
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Try again
          </Button>
        </div>
      </Alert>
    </div>
  );
}

/** Loading skeleton — 4 lesson cards */
export function HydrateFallback() {
  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
