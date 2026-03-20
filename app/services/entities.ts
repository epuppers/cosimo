// ============================================
// Entity Service — Schema, entity, and timeline data access
// ============================================
// Wraps mock data behind async functions.
// Replace these implementations with real API calls later.

import {
  MOCK_ENTITY_SCHEMA,
  MOCK_ENTITIES,
  MOCK_ENTITY_TIMELINES,
} from '~/data/mock-entities';
import type { EntitySchema, Entity, ActivityEvent } from './types';

/** Returns the full entity schema configuration for the current tenant. */
export async function getEntitySchema(): Promise<EntitySchema> {
  return MOCK_ENTITY_SCHEMA;
}

/** Returns all entities, optionally filtered by entity type ID. */
export async function getEntities(typeId?: string): Promise<Entity[]> {
  if (typeId) {
    return MOCK_ENTITIES.filter((e) => e.typeId === typeId);
  }
  return MOCK_ENTITIES;
}

/** Returns a single entity by ID, or null if not found. */
export async function getEntity(id: string): Promise<Entity | null> {
  return MOCK_ENTITIES.find((e) => e.id === id) ?? null;
}

/** Returns the activity timeline for a given entity, or an empty array if none exists. */
export async function getEntityTimeline(
  entityId: string,
): Promise<ActivityEvent[]> {
  return MOCK_ENTITY_TIMELINES[entityId] ?? [];
}

/** Searches entities by name, subtitle, and string property values (case-insensitive). */
export async function searchEntities(query: string): Promise<Entity[]> {
  const q = query.toLowerCase();
  return MOCK_ENTITIES.filter((entity) => {
    if (entity.name.toLowerCase().includes(q)) return true;
    if (entity.subtitle?.toLowerCase().includes(q)) return true;
    for (const value of Object.values(entity.properties)) {
      if (typeof value === 'string' && value.toLowerCase().includes(q)) {
        return true;
      }
    }
    return false;
  });
}

/** Returns all entities related to the given entity via its relationships. */
export async function getRelatedEntities(
  entityId: string,
): Promise<Entity[]> {
  const entity = MOCK_ENTITIES.find((e) => e.id === entityId);
  if (!entity) return [];
  const targetIds = entity.relationships.map((r) => r.targetEntityId);
  return MOCK_ENTITIES.filter((e) => targetIds.includes(e.id));
}

/** Returns a count of entities grouped by type ID. */
export async function getEntityCounts(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const entity of MOCK_ENTITIES) {
    counts[entity.typeId] = (counts[entity.typeId] ?? 0) + 1;
  }
  return counts;
}
