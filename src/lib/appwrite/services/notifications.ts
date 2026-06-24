/**
 * Notifications Service
 * Handles notification creation and delivery
 */

import { databases, realtime } from '../client';
import { DATABASE_ID, COLLECTIONS } from '../config';
import { ID, Query } from 'appwrite';

// ============================================
// NOTIFICATION OPERATIONS
// ============================================

export type NotificationType =
  | 'message'
  | 'reminder'
  | 'memory'
  | 'achievement'
  | 'nova'
  | 'island'
  | 'invitation'
  | 'system';

/**
 * Create a notification
 */
export async function createNotification(
  orbitId: string,
  recipient: 'User A' | 'User B' | 'both',
  data: {
    type: NotificationType;
    title: string;
    message: string;
    icon?: string;
    actionUrl?: string;
    metadata?: Record<string, any>;
  }
): Promise<{ notification: any; error?: string }> {
  try {
    const notification = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.NOTIFICATIONS,
      ID.unique(),
      {
        orbitId,
        recipient,
        ...data,
        read: false,
        createdAt: new Date().toISOString(),
      }
    );

    return { notification };
  } catch (error: any) {
    return { notification: null, error: error.message };
  }
}

/**
 * Get notifications for a user in an Orbit
 */
export async function getNotifications(
  orbitId: string,
  recipient: 'User A' | 'User B',
  limit: number = 50,
  offset: number = 0
): Promise<{ notifications: any[]; total: number; error?: string }> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.NOTIFICATIONS,
      [
        Query.equal('orbitId', orbitId),
        Query.or([
          Query.equal('recipient', recipient),
          Query.equal('recipient', 'both'),
        ]),
        Query.orderDesc('createdAt'),
        Query.limit(limit),
        Query.offset(offset),
      ]
    );

    return { notifications: response.documents, total: response.total };
  } catch (error: any) {
    return { notifications: [], total: 0, error: error.message };
  }
}

/**
 * Get unread notifications
 */
export async function getUnreadNotifications(
  orbitId: string,
  recipient: 'User A' | 'User B'
): Promise<{ notifications: any[]; count: number; error?: string }> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.NOTIFICATIONS,
      [
        Query.equal('orbitId', orbitId),
        Query.equal('read', false),
        Query.or([
          Query.equal('recipient', recipient),
          Query.equal('recipient', 'both'),
        ]),
      ]
    );

    return { notifications: response.documents, count: response.total };
  } catch (error: any) {
    return { notifications: [], count: 0, error: error.message };
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(
  notificationId: string
): Promise<{ notification: any; error?: string }> {
  try {
    const notification = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.NOTIFICATIONS,
      notificationId,
      {
        read: true,
        readAt: new Date().toISOString(),
      }
    );

    return { notification };
  } catch (error: any) {
    return { notification: null, error: error.message };
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead(
  orbitId: string,
  recipient: 'User A' | 'User B'
): Promise<{ error?: string }> {
  try {
    const { notifications } = await getUnreadNotifications(orbitId, recipient);

    await Promise.all(
      notifications.map((notif) => markNotificationRead(notif.$id))
    );

    return {};
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<{ error?: string }> {
  try {
    await databases.deleteDocument(
      DATABASE_ID,
      COLLECTIONS.NOTIFICATIONS,
      notificationId
    );
    return {};
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Delete all read notifications
 */
export async function deleteReadNotifications(orbitId: string): Promise<{ error?: string }> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.NOTIFICATIONS,
      [
        Query.equal('orbitId', orbitId),
        Query.equal('read', true),
      ]
    );

    await Promise.all(
      response.documents.map((notif) => deleteNotification(notif.$id))
    );

    return {};
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Subscribe to notifications in realtime
 */
export async function subscribeToNotifications(
  orbitId: string,
  recipient: 'User A' | 'User B',
  onNotification: (notification: any) => void
): Promise<() => void> {
  try {
    const channel = `databases.${DATABASE_ID}.collections.${COLLECTIONS.NOTIFICATIONS}.documents`;

    const subscription = await realtime.subscribe(channel, (response) => {
      if (
        response.payload.orbitId === orbitId &&
        (response.payload.recipient === recipient || response.payload.recipient === 'both')
      ) {
        onNotification(response.payload);
      }
    });

    return () => {
      // @ts-ignore
      subscription.close?.();
    };
  } catch (error) {
    console.error('Error subscribing to notifications:', error);
    return () => {};
  }
}

export default {
  createNotification,
  getNotifications,
  getUnreadNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  deleteReadNotifications,
  subscribeToNotifications,
};
