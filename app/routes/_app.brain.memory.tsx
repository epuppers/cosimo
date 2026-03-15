import { useRouteError } from 'react-router';
import { AlertCircle } from 'lucide-react';
import { Skeleton } from '~/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { getMemory } from '~/services/brain';
import { MemoryList } from '~/components/brain/memory-list';
import type { Route } from './+types/_app.brain.memory';

/** Loads memory data for the Brain Memory route. */
export async function loader() {
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

  return (
    <div className="flex h-full items-center justify-center p-8">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription className="mt-2">
          An unexpected error occurred while loading memory data.
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

/** Loading skeleton — trait section + 5 fact cards */
export function HydrateFallback() {
  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      {/* Trait section skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-20 rounded-full" />
          ))}
        </div>
      </div>
      {/* Fact cards skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-24" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
