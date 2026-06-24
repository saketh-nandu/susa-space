import { Client, Databases, Storage, Account, Realtime, ID, TablesDB } from 'appwrite';
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, DATABASE_ID, STORAGE_BUCKETS } from './lib/appwrite/config';
import type { ChatMessage, OrbitState } from './types';

// Initialize Appwrite client
const client = new Client();

// Configure Appwrite client with your specific credentials
client
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

// Initialize Appwrite services
export const account = new Account(client);
export const tablesDB = new TablesDB(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const realtime = new Realtime(client);

// Database and collection IDs (your specific IDs)
export const TABLE_SPACES = 'spaces';
const BUCKET_ID = STORAGE_BUCKETS.MEDIA;

// Storage helpers
export interface UploadResult {
  url: string;
  path: string;
  error?: string;
}

/**
 * Upload a File object to the Appwrite Storage bucket.
 * Returns the public URL on success, or an error message on failure.
 *
 * @param file     The File to upload
 * @param folder   Sub-folder inside the bucket (not used, kept for compatibility)
 * @param fileName Optional override for the stored filename (auto-generated if omitted)
 */
export async function uploadToAppwrite(
  file: File,
  folder: 'memories' | 'chat' | 'voice' | 'gallery' | 'avatars' = 'chat',
  fileName?: string
): Promise<UploadResult> {
  try {
    console.log('[Appwrite Upload] Starting upload for file:', file.name);
    const fileId = ID.unique();
    console.log('[Appwrite Upload] Using file ID:', fileId);

    const uploadedFile = await storage.createFile(
      BUCKET_ID,
      fileId,
      file
    );

    console.log('[Appwrite Upload] Upload successful! File ID:', uploadedFile.$id);
    const publicUrl = storage.getFileView(BUCKET_ID, uploadedFile.$id);
    
    return { url: publicUrl.toString(), path: uploadedFile.$id };
  } catch (error: any) {
    console.error('[Appwrite Upload Error]', error);
    return { url: '', path: '', error: error.message };
  }
}

/**
 * Get the public URL for an already-uploaded file.
 */
export function getPublicUrl(fileId: string): string {
  try {
    return storage.getFileView(BUCKET_ID, fileId).toString();
  } catch {
    return '';
  }
}

/**
 * Delete a file from the bucket.
 */
export async function deleteFromAppwrite(fileId: string): Promise<{ error?: string }> {
  try {
    await storage.deleteFile(BUCKET_ID, fileId);
    return {};
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * List files in a folder.
 */
export async function listBucketFolder() {
  try {
    const files = await storage.listFiles(BUCKET_ID);
    return { files: files.files || [], error: undefined };
  } catch (error: any) {
    return { files: [], error: error.message };
  }
}

/**
 * Calculate total storage usage in MB
 */
export async function calculateStorageUsage(): Promise<{ totalMB: number; error?: string }> {
  try {
    const { files } = await listBucketFolder();
    let totalBytes = 0;
    for (const file of files) {
      totalBytes += file.sizeOriginal;
    }
    const totalMB = totalBytes / (1024 * 1024);
    return { totalMB };
  } catch (error: any) {
    return { totalMB: 0, error: error.message };
  }
}

/**
 * Persist full state to Appwrite
 */
export async function saveStateToAppwrite(
  state: any, 
  spaceId = 'primary_space',
  maxRetries = 3
): Promise<{ error?: string }> {
  const stateString = JSON.stringify(state);
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // First, try to update
      console.log(`[Appwrite State Save] Attempt ${attempt}/${maxRetries}: Updating row with ID:`, spaceId);
      await tablesDB.updateRow(
        DATABASE_ID,
        TABLE_SPACES,
        spaceId,
        { state: stateString }
      );
      console.log('[Appwrite State Save] Row updated successfully!');
      return {};
    } catch (updateErr: any) {
      // If 429, retry
      if (updateErr.code === 429 && attempt < maxRetries) {
        const delay = 1000 * attempt;
        console.warn(`[Appwrite State Save] 429 Too Many Requests - retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // If update failed for other reason (like 404 row not found), try create
      console.log(`[Appwrite State Save] Attempt ${attempt}/${maxRetries}: Update failed, trying create...`);
      try {
        await tablesDB.createRow(
          DATABASE_ID,
          TABLE_SPACES,
          spaceId,
          { state: stateString }
        );
        console.log('[Appwrite State Save] Row created successfully!');
        return {};
      } catch (createErr: any) {
        // If 409 (already exists), just try update again
        if (createErr.code === 409) {
          console.log(`[Appwrite State Save] Attempt ${attempt}/${maxRetries}: Create failed with 409, retrying update...`);
          continue;
        }
        // If 429, retry
        if (createErr.code === 429 && attempt < maxRetries) {
          const delay = 1000 * attempt;
          console.warn(`[Appwrite State Save] 429 Too Many Requests - retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        console.error('[Appwrite State Save] Create failed:', createErr);
        return { error: createErr.message };
      }
    }
  }
  
  return { error: 'Failed to save state after multiple retries' };
}

/**
 * Load state from Appwrite
 */
export async function loadStateFromAppwrite(spaceId = 'primary_space'): Promise<{ state: any; error?: string }> {
  try {
    const row = await tablesDB.getRow(
      DATABASE_ID,
      TABLE_SPACES,
      spaceId
    );
    const state = JSON.parse(row.state);
    return { state };
  } catch (error: any) {
    return { state: null, error: error.message };
  }
}

/**
 * Subscribe to real-time state updates
 */
export function subscribeToState(
  spaceId = 'primary_space',
  callback: (state: any) => void
) {
  let unsubscribeFn: (() => void) = () => {};
  
  (async () => {
    try {
      const subscription = await realtime.subscribe(
        `databases.${DATABASE_ID}.tables.${TABLE_SPACES}.rows.${spaceId}`,
        (response) => {
          if (response.events.includes('databases.*.tables.*.rows.*.update') || 
              response.events.includes('databases.*.tables.*.rows.*.create')) {
            try {
              const state = JSON.parse(response.payload.state);
              callback(state);
            } catch (e) {
              console.error('[Appwrite Realtime] Parse error:', e);
            }
          }
        }
      );
      // @ts-ignore: Appwrite SDK subscription has unsubscribe or close method
      unsubscribeFn = () => subscription.unsubscribe?.() || subscription.close?.() || (() => {});
    } catch (error) {
      console.error('[Appwrite Realtime Error]', error);
    }
  })();

  return () => unsubscribeFn();
}
