/**
 * Reactions Service
 * Handles message reactions in Orbit chat with realtime updates
 */

import { databases, realtime } from '../client';
import { DATABASE_ID, COLLECTIONS } from '../config';
import { ID, Query } from 'appwrite';

// ============================================
// REACTION OPERATIONS
// ============================================

/**
 * Add a reaction to a message
 */
export async function addReaction(
  messageId: string,
  user: 'User A' | 'User B',
  emoji: string
): Promise<{ reaction: any; error?: string }> {
  try {
    const reaction = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.MESSAGE_REACTIONS,
      ID.unique(),
      {
        messageId,
        user,
        emoji,
        createdAt: new Date().toISOString(),
      }
    );

    return { reaction };
  } catch (error: any) {
    return { reaction: null, error: error.message };
  }
}

/**
 * Remove a reaction from a message
 */
export async function removeReaction(
  messageId: string,
  user: 'User A' | 'User B',
  emoji: string
): Promise<{ error?: string }> {
  try {
    // Find the reaction document
    const reactions = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.MESSAGE_REACTIONS,
      [
        Query.equal('messageId', messageId),
        Query.equal('user', user),
        Query.equal('emoji', emoji),
      ]
    );

    if (reactions.documents.length > 0) {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.MESSAGE_REACTIONS,
        reactions.documents[0].$id
      );
    }

    return {};
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Get all reactions for a message
 */
export async function getMessageReactions(
  messageId: string
): Promise<{ reactions: any[]; error?: string }> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.MESSAGE_REACTIONS,
      [Query.equal('messageId', messageId)]
    );

    return { reactions: response.documents };
  } catch (error: any) {
    return { reactions: [], error: error.message };
  }
}

/**
 * Get reaction count for a message
 */
export async function getReactionCounts(
  messageId: string
): Promise<{ counts: Record<string, number>; error?: string }> {
  try {
    const { reactions } = await getMessageReactions(messageId);

    const counts: Record<string, number> = {};
    for (const reaction of reactions) {
      counts[reaction.emoji] = (counts[reaction.emoji] || 0) + 1;
    }

    return { counts };
  } catch (error: any) {
    return { counts: {}, error: error.message };
  }
}

/**
 * Get reactions by a specific user
 */
export async function getUserReactions(
  messageId: string,
  user: 'User A' | 'User B'
): Promise<{ emojis: string[]; error?: string }> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.MESSAGE_REACTIONS,
      [
        Query.equal('messageId', messageId),
        Query.equal('user', user),
      ]
    );

    const emojis = response.documents.map((doc) => doc.emoji);
    return { emojis };
  } catch (error: any) {
    return { emojis: [], error: error.message };
  }
}

/**
 * Subscribe to reactions for a message in realtime
 */
export async function subscribeToReactions(
  messageId: string,
  onReaction: (reaction: any) => void
): Promise<() => void> {
  try {
    const channel = `databases.${DATABASE_ID}.collections.${COLLECTIONS.MESSAGE_REACTIONS}.documents`;

    const subscription = await realtime.subscribe(channel, (response) => {
      if (response.payload.messageId === messageId) {
        onReaction(response.payload);
      }
    });

    return () => {
      // @ts-ignore
      subscription.close?.();
    };
  } catch (error) {
    console.error('Error subscribing to reactions:', error);
    return () => {};
  }
}

export default {
  addReaction,
  removeReaction,
  getMessageReactions,
  getReactionCounts,
  getUserReactions,
  subscribeToReactions,
};
