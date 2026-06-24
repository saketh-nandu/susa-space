/**
 * Memories Service
 * Handles memory creation, retrieval, and management for Orbit
 */

import { databases, realtime } from '../client';
import { DATABASE_ID, COLLECTIONS, VALIDATION } from '../config';
import { ID, Query, Permission, Role } from 'appwrite';
import type { OrbitMemory } from '../../../types';

// ============================================
// MEMORY OPERATIONS
// ============================================

/**
 * Create a new memory in Orbit
 */
export async function createMemory(
  orbitId: string,
  data: Omit<OrbitMemory, 'id'> & { userId?: string }
): Promise<{ memory: any; error?: string }> {
  try {
    // Validate memory data
    if (data.description && data.description.length > VALIDATION.JOURNAL_MAX_LENGTH) {
      return { memory: null, error: 'Memory description too long' };
    }

    const memory = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.MEMORIES,
      ID.unique(),
      {
        orbitId,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      [
        // Memory is accessible to both Orbit users
        Permission.read(Role.any()),
        Permission.write(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any()),
      ]
    );

    return { memory };
  } catch (error: any) {
    return { memory: null, error: error.message };
  }
}

/**
 * Get a memory by ID
 */
export async function getMemory(memoryId: string): Promise<{ memory: any; error?: string }> {
  try {
    const memory = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.MEMORIES,
      memoryId
    );
    return { memory };
  } catch (error: any) {
    return { memory: null, error: error.message };
  }
}

/**
 * Get all memories for an Orbit
 */
export async function getMemories(
  orbitId: string,
  limit: number = 50,
  offset: number = 0
): Promise<{ memories: any[]; total: number; error?: string }> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.MEMORIES,
      [
        Query.equal('orbitId', orbitId),
        Query.orderDesc('date'),
        Query.limit(limit),
        Query.offset(offset),
      ]
    );

    return { memories: response.documents, total: response.total };
  } catch (error: any) {
    return { memories: [], total: 0, error: error.message };
  }
}

/**
 * Update a memory
 */
export async function updateMemory(
  memoryId: string,
  updates: Partial<OrbitMemory>
): Promise<{ memory: any; error?: string }> {
  try {
    const memory = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.MEMORIES,
      memoryId,
      {
        ...updates,
        updatedAt: new Date().toISOString(),
      }
    );

    return { memory };
  } catch (error: any) {
    return { memory: null, error: error.message };
  }
}

/**
 * Delete a memory
 */
export async function deleteMemory(memoryId: string): Promise<{ error?: string }> {
  try {
    await databases.deleteDocument(
      DATABASE_ID,
      COLLECTIONS.MEMORIES,
      memoryId
    );
    return {};
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Lock a memory (make it private)
 */
export async function lockMemory(memoryId: string): Promise<{ memory: any; error?: string }> {
  try {
    const memory = await updateMemory(memoryId, { isLocked: true });
    return memory;
  } catch (error: any) {
    return { memory: null, error: error.message };
  }
}

/**
 * Unlock a memory
 */
export async function unlockMemory(memoryId: string): Promise<{ memory: any; error?: string }> {
  try {
    const memory = await updateMemory(memoryId, { isLocked: false });
    return memory;
  } catch (error: any) {
    return { memory: null, error: error.message };
  }
}

/**
 * Search memories by title or description
 */
export async function searchMemories(
  orbitId: string,
  query: string,
  limit: number = 20
): Promise<{ memories: any[]; error?: string }> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.MEMORIES,
      [
        Query.equal('orbitId', orbitId),
        Query.search('title', query),
        Query.or([Query.search('description', query)]),
        Query.limit(limit),
      ]
    );

    return { memories: response.documents };
  } catch (error: any) {
    return { memories: [], error: error.message };
  }
}

/**
 * Get memories from a specific collection
 */
export async function getMemoriesByCollection(
  orbitId: string,
  collectionId: string,
  limit: number = 50
): Promise<{ memories: any[]; error?: string }> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.MEMORIES,
      [
        Query.equal('orbitId', orbitId),
        Query.search('collections', collectionId),
        Query.limit(limit),
      ]
    );

    return { memories: response.documents };
  } catch (error: any) {
    return { memories: [], error: error.message };
  }
}

/**
 * Add memory to a collection
 */
export async function addMemoryToCollection(
  memoryId: string,
  collectionId: string
): Promise<{ memory: any; error?: string }> {
  try {
    const { memory } = await getMemory(memoryId);

    const collections = memory.collections || [];
    if (!collections.includes(collectionId)) {
      collections.push(collectionId);
    }

    const updated = await updateMemory(memoryId, { collections });
    return updated;
  } catch (error: any) {
    return { memory: null, error: error.message };
  }
}

/**
 * Remove memory from a collection
 */
export async function removeMemoryFromCollection(
  memoryId: string,
  collectionId: string
): Promise<{ memory: any; error?: string }> {
  try {
    const { memory } = await getMemory(memoryId);

    const collections = (memory.collections || []).filter(
      (id: string) => id !== collectionId
    );

    const updated = await updateMemory(memoryId, { collections });
    return updated;
  } catch (error: any) {
    return { memory: null, error: error.message };
  }
}

/**
 * Subscribe to memory updates in realtime
 */
export async function subscribeToMemories(
  orbitId: string,
  onUpdate: (memory: any) => void
): Promise<() => void> {
  try {
    const channel = `databases.${DATABASE_ID}.collections.${COLLECTIONS.MEMORIES}.documents`;

    const subscription = await realtime.subscribe(channel, (response) => {
      if (response.payload.orbitId === orbitId) {
        onUpdate(response.payload);
      }
    });

    return () => {
      // @ts-ignore
      subscription.close?.();
    };
  } catch (error) {
    console.error('Error subscribing to memories:', error);
    return () => {};
  }
}

export default {
  createMemory,
  getMemory,
  getMemories,
  updateMemory,
  deleteMemory,
  lockMemory,
  unlockMemory,
  searchMemories,
  getMemoriesByCollection,
  addMemoryToCollection,
  removeMemoryFromCollection,
  subscribeToMemories,
};
