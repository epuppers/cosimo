// ============================================
// Cloud Storage Service — Cloud drive data access
// ============================================
// Wraps mock data behind async functions.
// Replace these implementations with real API calls later.

import {
  MOCK_CLOUD_STORAGE_SETTINGS,
  MOCK_CLOUD_SOURCES,
  MOCK_CLOUD_FILES,
  MOCK_RECENT_CLOUD_FILES,
  MOCK_DATA_SCOPE_TOGGLES,
} from '~/data/mock-cloud-storage';
import type { CloudStorageSettings, CloudSource, CloudFile, DataScopeToggle } from './types';

/** Simulate network latency for mock data */
const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Returns the full cloud storage settings (providers, sites, config). */
export async function getCloudStorageSettings(): Promise<CloudStorageSettings> {
  return { ...MOCK_CLOUD_STORAGE_SETTINGS };
}

/** Returns the cloud source navigation tree. */
export async function getCloudSources(): Promise<CloudSource[]> {
  return [...MOCK_CLOUD_SOURCES];
}

/** Returns cloud files for a given source or folder ID. */
export async function getCloudFiles(sourceId: string): Promise<CloudFile[]> {
  await delay(2000);
  return [...(MOCK_CLOUD_FILES[sourceId] ?? [])];
}

/** Returns recently accessed cloud files across all providers. */
export async function getRecentCloudFiles(): Promise<CloudFile[]> {
  await delay(2000);
  return [...MOCK_RECENT_CLOUD_FILES];
}

/** Returns data scope toggles for email and calendar access. */
export async function getDataScopeToggles(): Promise<DataScopeToggle[]> {
  return [...MOCK_DATA_SCOPE_TOGGLES];
}

/** Searches cloud files across all sources by name (case-insensitive). */
export async function searchCloudFiles(query: string): Promise<CloudFile[]> {
  await delay(2000);
  const lowerQuery = query.toLowerCase();
  return Object.values(MOCK_CLOUD_FILES)
    .flat()
    .filter((file) => file.name.toLowerCase().includes(lowerQuery));
}
