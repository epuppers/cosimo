// ============================================
// Brain Lessons Route — lesson list + detail outlet
// ============================================

import { Outlet, useMatches, useNavigate, useRouteError } from 'react-router';
import { AlertCircle } from 'lucide-react';
import { Skeleton } from '~/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { getLessons } from '~/services/brain';
import { LessonCard } from '~/components/brain/lesson-card';
import type { Route } from './+types/_app.brain.lessons';

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

  // Check if a child lesson detail route is matched
  const hasChildRoute = matches.some(
    (m) => m.id === 'routes/_app.brain.lessons.$id'
  );

  const handleSelectLesson = (id: string) => {
    navigate(`/brain/lessons/${id}`);
  };

  if (hasChildRoute) {
    return <Outlet />;
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {lessons.map((lesson) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            onSelect={handleSelectLesson}
          />
        ))}
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
