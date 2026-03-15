// ============================================
// Brain Lesson Detail Route — single lesson view
// ============================================

import { useNavigate, isRouteErrorResponse, useRouteError } from 'react-router';
import { AlertCircle } from 'lucide-react';
import { Skeleton } from '~/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { getLesson } from '~/services/brain';
import { LessonDetail } from '~/components/brain/lesson-detail';
import type { Route } from './+types/_app.brain.lessons.$id';

/** Loads a single lesson by ID, throws 404 if not found. */
export async function loader({ params }: Route.LoaderArgs) {
  const lesson = await getLesson(params.id);
  if (!lesson) {
    throw new Response('Lesson not found', { status: 404 });
  }
  return { lesson };
}

/** Brain Lesson Detail route — renders full lesson content with back navigation. */
export default function BrainLessonDetailRoute({ loaderData }: Route.ComponentProps) {
  const { lesson } = loaderData;
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/brain/lessons');
  };

  return <LessonDetail lesson={lesson} onBack={handleBack} />;
}

/** Error boundary for lesson not found */
export function ErrorBoundary() {
  const error = useRouteError();
  console.error('Lesson route error:', error);

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Lesson not found</AlertTitle>
          <AlertDescription className="mt-2">
            The lesson you&apos;re looking for doesn&apos;t exist or has been removed.
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

  return (
    <div className="flex h-full items-center justify-center p-8">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription className="mt-2">
          An unexpected error occurred while loading this lesson.
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

/** Loading skeleton — header + content block */
export function HydrateFallback() {
  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Header skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-64" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>
      {/* Content block skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}
