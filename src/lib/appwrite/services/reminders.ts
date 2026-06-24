/**
 * Reminders Service
 * Handles reminder scheduling and notifications
 */

import { databases, realtime } from '../client';
import { DATABASE_ID, COLLECTIONS, REALTIME_CHANNELS } from '../config';
import { ID, Query } from 'appwrite';

// ============================================
// REMINDER OPERATIONS
// ============================================

/**
 * Create a reminder
 */
export async function createReminder(
  orbitId: string,
  data: {
    title: string;
    description?: string;
    triggerDate: string; // ISO string
    triggerTime?: string; // HH:MM format
    reminderType: 'once' | 'daily' | 'weekly' | 'monthly';
    recipient: 'User A' | 'User B' | 'both';
    notificationEnabled: boolean;
  }
): Promise<{ reminder: any; error?: string }> {
  try {
    const reminder = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.REMINDERS,
      ID.unique(),
      {
        orbitId,
        ...data,
        triggered: false,
        createdAt: new Date().toISOString(),
      }
    );

    return { reminder };
  } catch (error: any) {
    return { reminder: null, error: error.message };
  }
}

/**
 * Get reminders for an Orbit
 */
export async function getReminders(
  orbitId: string,
  limit: number = 50,
  offset: number = 0
): Promise<{ reminders: any[]; total: number; error?: string }> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.REMINDERS,
      [
        Query.equal('orbitId', orbitId),
        Query.orderAsc('triggerDate'),
        Query.limit(limit),
        Query.offset(offset),
      ]
    );

    return { reminders: response.documents, total: response.total };
  } catch (error: any) {
    return { reminders: [], total: 0, error: error.message };
  }
}

/**
 * Get upcoming reminders (next 7 days)
 */
export async function getUpcomingReminders(
  orbitId: string
): Promise<{ reminders: any[]; error?: string }> {
  try {
    const now = new Date();
    const future = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.REMINDERS,
      [
        Query.equal('orbitId', orbitId),
        Query.equal('triggered', false),
        Query.greaterThanOrEqual('triggerDate', now.toISOString()),
        Query.lessThanOrEqual('triggerDate', future.toISOString()),
        Query.orderAsc('triggerDate'),
      ]
    );

    return { reminders: response.documents };
  } catch (error: any) {
    return { reminders: [], error: error.message };
  }
}

/**
 * Update a reminder
 */
export async function updateReminder(
  reminderId: string,
  updates: Partial<any>
): Promise<{ reminder: any; error?: string }> {
  try {
    const reminder = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.REMINDERS,
      reminderId,
      updates
    );

    return { reminder };
  } catch (error: any) {
    return { reminder: null, error: error.message };
  }
}

/**
 * Delete a reminder
 */
export async function deleteReminder(reminderId: string): Promise<{ error?: string }> {
  try {
    await databases.deleteDocument(
      DATABASE_ID,
      COLLECTIONS.REMINDERS,
      reminderId
    );
    return {};
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Mark reminder as triggered
 */
export async function markReminderTriggered(reminderId: string): Promise<{ error?: string }> {
  try {
    await updateReminder(reminderId, {
      triggered: true,
      triggeredAt: new Date().toISOString(),
    });
    return {};
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Subscribe to reminders in realtime
 */
export async function subscribeToReminders(
  orbitId: string,
  onReminder: (reminder: any) => void
): Promise<() => void> {
  try {
    const channel = `databases.${DATABASE_ID}.collections.${COLLECTIONS.REMINDERS}.documents`;

    const subscription = await realtime.subscribe(channel, (response) => {
      if (response.payload.orbitId === orbitId) {
        onReminder(response.payload);
      }
    });

    return () => {
      // @ts-ignore
      subscription.close?.();
    };
  } catch (error) {
    console.error('Error subscribing to reminders:', error);
    return () => {};
  }
}

export default {
  createReminder,
  getReminders,
  getUpcomingReminders,
  updateReminder,
  deleteReminder,
  markReminderTriggered,
  subscribeToReminders,
};
