/**
 * Nova Pet Service
 * Handles Nova companion evolution, interactions, and state management
 */

import { databases, realtime } from '../client';
import { DATABASE_ID, COLLECTIONS } from '../config';
import { ID, Query } from 'appwrite';
import type { NovaCompanion } from '../../../types';

// ============================================
// NOVA PET OPERATIONS
// ============================================

/**
 * Initialize Nova pet for an Orbit
 */
export async function initializeNova(
  orbitId: string
): Promise<{ nova: any; error?: string }> {
  try {
    const nova = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.NOVA_PETS,
      orbitId,
      {
        orbitId,
        name: 'Nova',
        hunger: 50,
        energy: 75,
        happiness: 80,
        intelligence: 60,
        curiosity: 70,
        bondLevel: 1,
        growthPoints: 0,
        evolutionStage: 'baby',
        inventory: [],
        journal: [],
        ambientMood: 'Happy',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );

    return { nova };
  } catch (error: any) {
    return { nova: null, error: error.message };
  }
}

/**
 * Get Nova pet for an Orbit
 */
export async function getNova(orbitId: string): Promise<{ nova: any; error?: string }> {
  try {
    const nova = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.NOVA_PETS,
      orbitId
    );
    return { nova };
  } catch (error: any) {
    return { nova: null, error: error.message };
  }
}

/**
 * Update Nova stats
 */
export async function updateNovaStats(
  orbitId: string,
  updates: Partial<NovaCompanion>
): Promise<{ nova: any; error?: string }> {
  try {
    const nova = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.NOVA_PETS,
      orbitId,
      {
        ...updates,
        updatedAt: new Date().toISOString(),
      }
    );

    return { nova };
  } catch (error: any) {
    return { nova: null, error: error.message };
  }
}

/**
 * Feed Nova
 */
export async function feedNova(orbitId: string, amount: number = 10): Promise<{ nova: any; error?: string }> {
  try {
    const { nova } = await getNova(orbitId);

    const newHunger = Math.max(0, nova.hunger - amount);
    const newHappiness = Math.min(100, nova.happiness + 5);

    return updateNovaStats(orbitId, {
      hunger: newHunger,
      happiness: newHappiness,
    });
  } catch (error: any) {
    return { nova: null, error: error.message };
  }
}

/**
 * Play with Nova
 */
export async function playWithNova(orbitId: string): Promise<{ nova: any; error?: string }> {
  try {
    const { nova } = await getNova(orbitId);

    const newEnergy = Math.max(0, nova.energy - 15);
    const newHappiness = Math.min(100, nova.happiness + 20);
    const newBondLevel = Math.min(10, nova.bondLevel + 0.1);
    const newGrowthPoints = nova.growthPoints + 10;

    return updateNovaStats(orbitId, {
      energy: newEnergy,
      happiness: newHappiness,
      bondLevel: newBondLevel,
      growthPoints: newGrowthPoints,
    });
  } catch (error: any) {
    return { nova: null, error: error.message };
  }
}

/**
 * Train Nova
 */
export async function trainNova(orbitId: string, stat: keyof Omit<NovaCompanion, 'name' | 'inventory' | 'journal' | 'ambientMood' | 'evolutionStage'>): Promise<{ nova: any; error?: string }> {
  try {
    const { nova } = await getNova(orbitId);

    const newEnergy = Math.max(0, nova.energy - 20);
    const statIncrease = Math.min(100, nova[stat] + 5);
    const newGrowthPoints = nova.growthPoints + 15;

    const updates: any = {
      energy: newEnergy,
      growthPoints: newGrowthPoints,
      [stat]: statIncrease,
    };

    return updateNovaStats(orbitId, updates);
  } catch (error: any) {
    return { nova: null, error: error.message };
  }
}

/**
 * Rest Nova
 */
export async function restNova(orbitId: string, duration: number = 60): Promise<{ nova: any; error?: string }> {
  try {
    const { nova } = await getNova(orbitId);

    const newEnergy = Math.min(100, nova.energy + Math.floor(duration / 10));
    const newHunger = Math.min(100, nova.hunger + 5);

    return updateNovaStats(orbitId, {
      energy: newEnergy,
      hunger: newHunger,
    });
  } catch (error: any) {
    return { nova: null, error: error.message };
  }
}

/**
 * Add item to Nova inventory
 */
export async function addNovaInventoryItem(
  orbitId: string,
  itemId: string,
  name: string,
  quantity: number,
  image: string,
  type: 'food' | 'toy' | 'upgrade'
): Promise<{ error?: string }> {
  try {
    const { nova } = await getNova(orbitId);

    const inventory = [...(nova.inventory || [])];
    const existingItem = inventory.find((item) => item.id === itemId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      inventory.push({ id: itemId, name, quantity, image, type });
    }

    await updateNovaStats(orbitId, { inventory });
    return {};
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Use item from Nova inventory
 */
export async function useNovaInventoryItem(
  orbitId: string,
  itemId: string
): Promise<{ nova: any; error?: string }> {
  try {
    const { nova } = await getNova(orbitId);

    const inventory = [...(nova.inventory || [])];
    const itemIndex = inventory.findIndex((item) => item.id === itemId);

    if (itemIndex !== -1) {
      inventory[itemIndex].quantity -= 1;
      if (inventory[itemIndex].quantity <= 0) {
        inventory.splice(itemIndex, 1);
      }
    }

    return updateNovaStats(orbitId, { inventory });
  } catch (error: any) {
    return { nova: null, error: error.message };
  }
}

/**
 * Evolve Nova if conditions are met
 */
export async function checkAndEvolveNova(orbitId: string): Promise<{ nova: any; error?: string }> {
  try {
    const { nova } = await getNova(orbitId);

    let newStage = nova.evolutionStage;

    if (
      nova.evolutionStage === 'baby' &&
      nova.bondLevel >= 5 &&
      nova.intelligence >= 60
    ) {
      newStage = 'teen';
    } else if (
      nova.evolutionStage === 'teen' &&
      nova.bondLevel >= 10 &&
      nova.intelligence >= 85
    ) {
      newStage = 'guardian_of_stars';
    }

    if (newStage !== nova.evolutionStage) {
      return updateNovaStats(orbitId, { evolutionStage: newStage });
    }

    return { nova };
  } catch (error: any) {
    return { nova: null, error: error.message };
  }
}

/**
 * Subscribe to Nova updates in realtime
 */
export async function subscribeToNova(
  orbitId: string,
  onUpdate: (nova: any) => void
): Promise<() => void> {
  try {
    const subscription = await realtime.subscribe(
      `databases.${DATABASE_ID}.collections.${COLLECTIONS.NOVA_PETS}.documents.${orbitId}`,
      (response) => {
        onUpdate(response.payload);
      }
    );

    return () => {
      // @ts-ignore
      subscription.close?.();
    };
  } catch (error) {
    console.error('Error subscribing to Nova:', error);
    return () => {};
  }
}

export default {
  initializeNova,
  getNova,
  updateNovaStats,
  feedNova,
  playWithNova,
  trainNova,
  restNova,
  addNovaInventoryItem,
  useNovaInventoryItem,
  checkAndEvolveNova,
  subscribeToNova,
};
