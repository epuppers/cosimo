// ============================================
// Threads Service — Chat thread data access
// ============================================
// Wraps mock data behind async functions.
// Replace these implementations with real API calls later.

import { MOCK_THREADS, MOCK_THREAD_ORDER } from '~/data/mock-threads';
import type { Thread } from './types';

/** Returns all chat threads as an array, ordered by MOCK_THREAD_ORDER. */
export async function getThreads(): Promise<Thread[]> {
  return MOCK_THREAD_ORDER.map((id) => MOCK_THREADS[id]).filter(Boolean);
}

/** Returns a single thread by ID, or null if not found. */
export async function getThread(id: string): Promise<Thread | null> {
  return MOCK_THREADS[id] ?? null;
}

/** Returns the ordered list of thread IDs. */
export async function getThreadOrder(): Promise<string[]> {
  return [...MOCK_THREAD_ORDER];
}
