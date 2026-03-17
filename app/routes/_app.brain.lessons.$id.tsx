// ============================================
// Brain Lesson Detail Route — single lesson view
// ============================================

import { useNavigate, isRouteErrorResponse, useRouteError } from 'react-router';
import { ErrorBoundaryContent } from '~/components/ui/error-boundary-content';
import { getLesson } from '~/services/brain';
import { LessonDetail } from '~/components/brain/lesson-detail';
import type { Route } from './+types/_app.brain.lessons.$id';

/** Loads a single lesson by ID, throws 404 if not found. */
export async function clientLoader({ params }: Route.ClientLoaderArgs) {
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
    return <ErrorBoundaryContent title="Lesson not found" message="The lesson you're looking for doesn't exist or has been removed." />;
  }
  return <ErrorBoundaryContent message="An unexpected error occurred while loading this lesson." />;
}
