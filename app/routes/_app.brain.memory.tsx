import { useRouteError } from 'react-router';
import { ErrorBoundaryContent } from '~/components/ui/error-boundary-content';
import { getMemory } from '~/services/brain';
import { MemoryList } from '~/components/brain/memory-list';
import type { Route } from './+types/_app.brain.memory';

/** Loads memory data for the Brain Memory route. */
export async function clientLoader() {
  const memory = await getMemory();
  return { memory };
}

/** Brain Memory route — facts, traits, role profile */
export default function BrainMemoryRoute({ loaderData }: Route.ComponentProps) {
  const { memory } = loaderData;
  return <MemoryList memory={memory} />;
}

/** Error boundary for memory loading errors */
export function ErrorBoundary() {
  const error = useRouteError();
  console.error('Memory route error:', error);
  return <ErrorBoundaryContent message="An unexpected error occurred while loading memory data." />;
}
