// ============================================
// Brain Lessons Route — lesson list + detail outlet
// ============================================

import { useState, useMemo } from 'react';
import { Outlet, useMatches, useNavigate, useRouteError } from 'react-router';
import { Search } from 'lucide-react';
import { ErrorBoundaryContent } from '~/components/ui/error-boundary-content';
import { EmptyState } from '~/components/ui/empty-state';
import { getLessons } from '~/services/brain';
import { LessonCard } from '~/components/brain/lesson-card';
import { useBrainStore } from '~/stores/brain-store';
import { SearchFilterBar } from '~/components/ui/search-filter-bar';
import { LESSON_SCOPE_FILTERS } from '~/lib/brain-constants';
import type { Route } from './+types/_app.brain.lessons';

/** Loads all lessons for the lesson list. */
export async function clientLoader() {
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
      {/* Search & scope filter */}
      <SearchFilterBar
        placeholder="Search lessons..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        filters={{
          options: LESSON_SCOPE_FILTERS,
          value: lessonScope,
          onChange: setLessonScope,
        }}
        className="mb-3"
      />

      {/* Lesson cards */}
      <div className="flex flex-col gap-1.5">
        {filteredLessons.length === 0 ? (
          <EmptyState icon={<Search size={32} />} title="No lessons found" description="Try a different search term or filter." />
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
  return <ErrorBoundaryContent message="An unexpected error occurred while loading lessons." />;
}
