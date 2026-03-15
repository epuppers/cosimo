// ============================================
// Brain Service — Memory, lessons, and graph data access
// ============================================
// Wraps mock data behind async functions.
// Replace these implementations with real API calls later.

import { MOCK_MEMORY, MOCK_LESSONS, MOCK_GRAPH_DATA } from '~/data/mock-brain';
import type { MemoryData, Lesson, GraphData } from './types';

/** Returns the full memory data (role, traits, facts). */
export async function getMemory(): Promise<MemoryData> {
  return MOCK_MEMORY;
}

/** Returns all lessons as an array. */
export async function getLessons(): Promise<Lesson[]> {
  return Object.values(MOCK_LESSONS);
}

/** Returns a single lesson by ID, or null if not found. */
export async function getLesson(id: string): Promise<Lesson | null> {
  return MOCK_LESSONS[id] ?? null;
}

/** Returns the full knowledge graph data (categories + nodes). */
export async function getGraphData(): Promise<GraphData> {
  return MOCK_GRAPH_DATA;
}
