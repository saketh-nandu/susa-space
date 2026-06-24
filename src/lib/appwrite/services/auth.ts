/**
 * Authentication Service
 * Handles SUSA Space (Public) and Orbit authentication
 */

import { account } from '../client';
import { OAuthProvider } from 'appwrite';
import type { Models } from 'appwrite';

// ============================================
// SUSA SPACE AUTHENTICATION (Public)
// ============================================

/**
 * Register a new SUSA Space user with email and password
 */
export async function registerSUSAUser(
  email: string,
  password: string,
  name: string
): Promise<{ user: Models.User; error?: string }> {
  try {
    const user = await account.create('unique()', email, password, name);
    return { user };
  } catch (error: any) {
    return { user: {} as Models.User, error: error.message };
  }
}

/**
 * Login SUSA Space user with email and password
 */
export async function loginSUSAUser(
  email: string,
  password: string
): Promise<{ session: Models.Session; error?: string }> {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    return { session };
  } catch (error: any) {
    return { session: {} as Models.Session, error: error.message };
  }
}

/**
 * Start Google OAuth flow for SUSA Space
 */
export async function startGoogleOAuth(redirectUrl: string): Promise<{ url?: string; error?: string }> {
  try {
    const authUrl = account.createOAuth2Session(
      OAuthProvider.Google,
      redirectUrl,
      redirectUrl
    );
    return { url: (await authUrl) as unknown as string };
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Logout current user
 */
export async function logoutUser(): Promise<{ error?: string }> {
  try {
    await account.deleteSession('current');
    return {};
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Logout from all sessions
 */
export async function logoutAllSessions(): Promise<{ error?: string }> {
  try {
    await account.deleteSessions();
    return {};
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<{ user: Models.User | null; error?: string }> {
  try {
    const user = await account.get();
    return { user };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
}

// ============================================
// ORBIT AUTHENTICATION (Separate Layer)
// ============================================

/**
 * Validate Orbit access sequence
 * Must complete: Ctrl+S followed by typing "icecream"
 */
export function validateOrbitAccessSequence(
  keySequence: string[],
  keywordInput: string
): boolean {
  // Check if Ctrl+S was pressed (typically represented as 'Control+s' in the sequence)
  const hasCtrlS = keySequence.some((key) => key.toLowerCase().includes('control') && key.includes('s'));

  // Check if keyword matches
  const keywordMatches = keywordInput.toLowerCase().trim() === 'icecream';

  return hasCtrlS && keywordMatches;
}

/**
 * Validate Orbit user credentials against Orbit collection
 * Orbit users are manually created by the owner
 */
export async function validateOrbitCredentials(
  orbitUserId: string,
  accessCode: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    // This would typically validate against the orbit_accounts collection
    // For now, returning a success state - implement actual validation
    // when connecting to Orbit collection
    const valid = orbitUserId && accessCode;
    return { valid };
  } catch (error: any) {
    return { valid: false, error: error.message };
  }
}

// ============================================
// SESSION MANAGEMENT
// ============================================

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const user = await account.get();
    return !!user;
  } catch {
    return false;
  }
}

/**
 * Get active sessions
 */
export async function getActiveSessions(): Promise<{ sessions: Models.SessionList | null; error?: string }> {
  try {
    const sessions = await account.listSessions();
    return { sessions };
  } catch (error: any) {
    return { sessions: null, error: error.message };
  }
}

/**
 * Refresh current session
 */
export async function refreshSession(): Promise<{ session: Models.Session | null; error?: string }> {
  try {
    const session = await account.createJWT();
    return { session: session as unknown as Models.Session };
  } catch (error: any) {
    return { session: null, error: error.message };
  }
}

/**
 * Reset password with email
 */
export async function requestPasswordReset(email: string): Promise<{ error?: string }> {
  try {
    await account.createRecovery(email, 'https://susa-space.com/reset-password');
    return {};
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Confirm password reset
 */
export async function confirmPasswordReset(
  userId: string,
  secret: string,
  newPassword: string
): Promise<{ error?: string }> {
  try {
    await account.updateRecovery(userId, secret, newPassword);
    return {};
  } catch (error: any) {
    return { error: error.message };
  }
}

export default {
  registerSUSAUser,
  loginSUSAUser,
  startGoogleOAuth,
  logoutUser,
  logoutAllSessions,
  getCurrentUser,
  validateOrbitAccessSequence,
  validateOrbitCredentials,
  isAuthenticated,
  getActiveSessions,
  refreshSession,
  requestPasswordReset,
  confirmPasswordReset,
};
