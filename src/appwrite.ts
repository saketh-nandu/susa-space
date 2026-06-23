import { Client, Databases, Storage, Account, Realtime, ID } from 'appwrite';
import type { ChatMessage, OrbitState } from './types';

// Initialize Appwrite client
const client = new Client();

// Configure Appwrite client with your specific credentials
client
  .setEndpoint('https://sgp.cloud.appwrite.io/v1') // Your Singapore endpoint
  .setProject('6a3a52fb001e5b3afa82'); // Your project ID

// Initialize Appwrite services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const realtime = new Realtime(client);

// Database and collection IDs (your specific IDs)
export const DATABASE_ID = '6a3a5935001b389ccd3b';
export const COLLECTION_SPACES = 'spaces';

// Storage bucket ID (your specific bucket)
export const BUCKET_ID = '6a3a594a0018f9b4876e';

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
export async function saveStateToAppwrite(state: any, spaceId = 'primary_space'): Promise<{ error?: string }> {
  try {
    console.log('[Appwrite State Save] Creating document with ID:', spaceId);
    await databases.createDocument(
      DATABASE_ID,
      COLLECTION_SPACES,
      spaceId,
      { data: state }
    );
    console.log('[Appwrite State Save] Document created successfully!');
    return {};
  } catch (error: any) {
    console.error('[Appwrite State Save] Error:', error);
    // If document already exists, update it
    if (error.code === 409) {
      try {
        console.log('[Appwrite State Save] Document exists, updating...');
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTION_SPACES,
          spaceId,
          { data: state }
        );
        console.log('[Appwrite State Save] Document updated successfully!');
        return {};
      } catch (updateError: any) {
        console.error('[Appwrite State Save] Update error:', updateError);
        return { error: updateError.message };
      }
    }
    return { error: error.message };
  }
}

/**
 * Load state from Appwrite
 */
export async function loadStateFromAppwrite(spaceId = 'primary_space'): Promise<{ state: any; error?: string }> {
  try {
    const doc = await databases.getDocument(
      DATABASE_ID,
      COLLECTION_SPACES,
      spaceId
    );
    return { state: doc.data };
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
        `databases.${DATABASE_ID}.collections.${COLLECTION_SPACES}.documents.${spaceId}`,
        (response) => {
          if (response.events.includes('databases.*.documents.*.update') || 
              response.events.includes('databases.*.documents.*.create')) {
            callback(response.payload.data);
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
