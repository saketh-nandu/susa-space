/**
 * Messages Service
 * Handles Infinite Chat for Orbit with realtime communication
 */

import { databases, realtime } from '../client';
import { DATABASE_ID, COLLECTIONS, REALTIME_CHANNELS, PERMISSIONS, VALIDATION } from '../config';
import { ID, Query, Permission, Role } from 'appwrite';
import type { ChatMessage } from '../../../types';

// ============================================
// MESSAGE OPERATIONS
// ============================================

/**
 * Send a message in Orbit chat
 */
export async function sendMessage(
  orbitId: string,
  sender: 'User A' | 'User B',
  text: string,
  messageType: ChatMessage['type'] = 'text',
  metadata?: {
    fileUrl?: string;
    fileName?: string;
    fileSize?: string;
    duration?: string; // For voice notes
    repliedToId?: string;
    quotedText?: string;
  }
): Promise<{ message: any; error?: string }> {
  try {
    // Validate message length
    if (text.length > VALIDATION.MESSAGE_MAX_LENGTH) {
      return { message: null, error: `Message exceeds maximum length of ${VALIDATION.MESSAGE_MAX_LENGTH}` };
    }

    const message = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.MESSAGES,
      ID.unique(),
      {
        orbitId,
        sender,
        text,
        type: messageType,
        fileUrl: metadata?.fileUrl || null,
        fileName: metadata?.fileName || null,
        fileSize: metadata?.fileSize || null,
        duration: metadata?.duration || null,
        timestamp: new Date().toISOString(),
        reactions: [],
        repliedToId: metadata?.repliedToId || null,
        quotedText: metadata?.quotedText || null,
        isPinned: false,
        isBookmarked: false,
      },
      [
        // Only accessible to the two Orbit users
        Permission.write(Role.user(sender === 'User A' ? 'user_a_id' : 'user_b_id')),
        Permission.read(Role.user(sender === 'User A' ? 'user_a_id' : 'user_b_id')),
        Permission.write(Role.user(sender === 'User A' ? 'user_b_id' : 'user_a_id')),
        Permission.read(Role.user(sender === 'User A' ? 'user_b_id' : 'user_a_id')),
      ]
    );

    return { message };
  } catch (error: any) {
    return { message: null, error: error.message };
  }
}

/**
 * Get messages for an Orbit conversation
 */
export async function getMessages(
  orbitId: string,
  limit: number = 50,
  offset: number = 0
): Promise<{ messages: any[]; total: number; error?: string }> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.MESSAGES,
      [
        Query.equal('orbitId', orbitId),
        Query.orderDesc('timestamp'),
        Query.limit(limit),
        Query.offset(offset),
      ]
    );

    return { messages: response.documents.reverse(), total: response.total };
  } catch (error: any) {
    return { messages: [], total: 0, error: error.message };
  }
}

/**
 * Get a single message by ID
 */
export async function getMessage(messageId: string): Promise<{ message: any; error?: string }> {
  try {
    const message = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.MESSAGES,
      messageId
    );
    return { message };
  } catch (error: any) {
    return { message: null, error: error.message };
  }
}

/**
 * Update a message (edit)
 */
export async function updateMessage(
  messageId: string,
  updates: Partial<ChatMessage>
): Promise<{ message: any; error?: string }> {
  try {
    const message = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.MESSAGES,
      messageId,
      updates
    );
    return { message };
  } catch (error: any) {
    return { message: null, error: error.message };
  }
}

/**
 * Delete a message
 */
export async function deleteMessage(messageId: string): Promise<{ error?: string }> {
  try {
    await databases.deleteDocument(
      DATABASE_ID,
      COLLECTIONS.MESSAGES,
      messageId
    );
    return {};
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Search messages
 */
export async function searchMessages(
  orbitId: string,
  query: string,
  limit: number = 20
): Promise<{ messages: any[]; error?: string }> {
  try {
    // Note: Appwrite doesn't have built-in full-text search
    // This is a basic implementation - for production, use Appwrite Functions
    // or an external search service like Meilisearch
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.MESSAGES,
      [
        Query.equal('orbitId', orbitId),
        Query.search('text', query),
        Query.limit(limit),
      ]
    );

    return { messages: response.documents };
  } catch (error: any) {
    return { messages: [], error: error.message };
  }
}

/**
 * Pin a message
 */
export async function pinMessage(messageId: string): Promise<{ message: any; error?: string }> {
  try {
    const message = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.MESSAGES,
      messageId,
      { isPinned: true }
    );
    return { message };
  } catch (error: any) {
    return { message: null, error: error.message };
  }
}

/**
 * Unpin a message
 */
export async function unpinMessage(messageId: string): Promise<{ message: any; error?: string }> {
  try {
    const message = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.MESSAGES,
      messageId,
      { isPinned: false }
    );
    return { message };
  } catch (error: any) {
    return { message: null, error: error.message };
  }
}

/**
 * Bookmark a message
 */
export async function bookmarkMessage(messageId: string): Promise<{ message: any; error?: string }> {
  try {
    const message = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.MESSAGES,
      messageId,
      { isBookmarked: true }
    );
    return { message };
  } catch (error: any) {
    return { message: null, error: error.message };
  }
}

/**
 * Get pinned messages for an Orbit
 */
export async function getPinnedMessages(orbitId: string): Promise<{ messages: any[]; error?: string }> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.MESSAGES,
      [
        Query.equal('orbitId', orbitId),
        Query.equal('isPinned', true),
        Query.orderDesc('timestamp'),
      ]
    );

    return { messages: response.documents };
  } catch (error: any) {
    return { messages: [], error: error.message };
  }
}

/**
 * Subscribe to messages in realtime
 */
export async function subscribeToMessages(
  orbitId: string,
  onMessage: (message: any) => void
): Promise<() => void> {
  try {
    const channel = `databases.${DATABASE_ID}.collections.${COLLECTIONS.MESSAGES}.documents`;

    const subscription = await realtime.subscribe(channel, (response) => {
      // Filter for this orbit's messages
      if (response.payload.orbitId === orbitId) {
        onMessage(response.payload);
      }
    });

    // Return unsubscribe function
    return () => {
      // @ts-ignore
      subscription.close?.();
    };
  } catch (error) {
    console.error('Error subscribing to messages:', error);
    return () => {};
  }
}

export default {
  sendMessage,
  getMessages,
  getMessage,
  updateMessage,
  deleteMessage,
  searchMessages,
  pinMessage,
  unpinMessage,
  bookmarkMessage,
  getPinnedMessages,
  subscribeToMessages,
};
