import { createClient } from '@supabase/supabase-js';
import type { ChatMessage, OrbitMemory, MemoryCollection, FutureItem, NovaCompanion, SharedIsland, CloudFile } from './types';

// Supabase credentials — set via .env (VITE_ prefix exposes them to the frontend bundle)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const bucketName = (import.meta.env.VITE_SUPABASE_BUCKET as string) || 'orbit-media';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[SUSA] Supabase credentials not configured. ' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file. ' +
    'File uploads will be disabled until credentials are provided.'
  );
}

/** Supabase client — safe to call even when credentials are missing (operations will fail gracefully). */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

export { bucketName };

// ── Storage helpers ──────────────────────────────────────────────────────────

export interface UploadResult {
  url: string;
  path: string;
  error?: string;
}

/**
 * Upload a File object to the Supabase Storage bucket.
 * Returns the public URL on success, or an error message on failure.
 *
 * @param file     The File to upload
 * @param folder   Sub-folder inside the bucket, e.g. "memories" | "chat" | "voice"
 * @param fileName Optional override for the stored filename (auto-generated if omitted)
 */
export async function uploadToSupabase(
  file: File,
  folder: 'memories' | 'chat' | 'voice' | 'gallery' | 'avatars' = 'chat',
  fileName?: string
): Promise<UploadResult> {
  if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
    return {
      url: '',
      path: '',
      error: 'Supabase not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.',
    };
  }

  const ext = file.name.split('.').pop() || 'bin';
  const safeName = fileName
    ? fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
    : `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const path = `${folder}/${safeName}`;

  const { error } = await supabase.storage.from(bucketName).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    return { url: '', path, error: error.message };
  }

  const { data } = supabase.storage.from(bucketName).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

/**
 * Get the public URL for an already-uploaded file.
 */
export function getPublicUrl(path: string): string {
  const { data } = supabase.storage.from(bucketName).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Delete a file from the bucket.
 */
export async function deleteFromSupabase(path: string): Promise<{ error?: string }> {
  const { error } = await supabase.storage.from(bucketName).remove([path]);
  return error ? { error: error.message } : {};
}

/**
 * List files in a folder.
 */
export async function listBucketFolder(folder: string) {
  const { data, error } = await supabase.storage.from(bucketName).list(folder, {
    limit: 200,
    offset: 0,
    sortBy: { column: 'created_at', order: 'desc' },
  });
  return { files: data || [], error: error?.message };
}

/**
 * Calculate total storage usage in MB
 */
export async function calculateStorageUsage(): Promise<{ totalMB: number; error?: string }> {
  if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
    return { totalMB: 0, error: 'Supabase not configured' };
  }

  try {
    // List all folders
    const folders = ['memories', 'chat', 'voice', 'gallery', 'avatars'];
    let totalBytes = 0;

    for (const folder of folders) {
      const { files, error } = await listBucketFolder(folder);
      if (error) {
        // Skip folder if error
        continue;
      }
      for (const file of files) {
        if (file.metadata && file.metadata.size) {
          totalBytes += file.metadata.size;
        }
      }
    }

    // Also list root folder
    const { files: rootFiles } = await listBucketFolder('');
    for (const file of rootFiles) {
      if (file.metadata && file.metadata.size) {
        totalBytes += file.metadata.size;
      }
    }

    const totalMB = totalBytes / (1024 * 1024);
    return { totalMB };
  } catch (error) {
    return { totalMB: 0, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Persist chat messages to a Supabase table.
 * The table schema is documented in supabase/schema.sql.
 */
export async function syncChatMessagesToSupabase(
  messages: ChatMessage[],
  spaceId = 'primary_space'
): Promise<{ error?: string }> {
  if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
    return { error: 'Supabase not configured for chat persistence.' };
  }

  try {
    const { error } = await supabase
      .from('chat_messages')
      .upsert(
        {
          space_id: spaceId,
          payload: messages,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'space_id' }
      );

    if (error) {
      return { error: error.message };
    }

    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error while saving chat messages.' };
  }
}

/**
 * Load chat messages from Supabase if the chat_messages table exists.
 */
export async function loadChatMessagesFromSupabase(
  spaceId = 'primary_space'
): Promise<{ messages: ChatMessage[]; error?: string }> {
  if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
    return { messages: [], error: 'Supabase not configured for chat persistence.' };
  }

  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('payload')
      .eq('space_id', spaceId)
      .maybeSingle();

    if (error) {
      return { messages: [], error: error.message };
    }

    return { messages: Array.isArray(data?.payload) ? data.payload : [] };
  } catch (err) {
    return {
      messages: [],
      error: err instanceof Error ? err.message : 'Unknown error while loading chat messages.',
    };
  }
}

/**
 * Subscribe to real-time chat updates
 */
export function subscribeToChatMessages(
  spaceId = 'primary_space',
  callback: (messages: ChatMessage[]) => void
) {
  if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
    return () => {};
  }

  const subscription = supabase
    .channel(`chat_messages_${spaceId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'chat_messages',
        filter: `space_id=eq.${spaceId}`
      },
      (payload: any) => {
        if (payload.new && payload.new.payload) {
          callback(payload.new.payload);
        }
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}

// ── Full Orbit State Helpers ────────────────────────────────────────────────

interface OrbitState {
  messages: ChatMessage[];
  memories: OrbitMemory[];
  collections: MemoryCollection[];
  futureItems: FutureItem[];
  nova: NovaCompanion;
  island: SharedIsland;
  achievements: any[];
  watchlist: any[];
  currentMood: any;
  currentMusic: any;
  lastActive: any;
  // Add other orbit state properties as needed
}

export async function saveOrbitStateToSupabase(
  orbitState: OrbitState,
  spaceId = 'primary_space'
) {
  if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
    return { error: 'Supabase not configured' };
  }

  try {
    const { error } = await supabase
      .from('orbit_state')
      .upsert(
        {
          space_id: spaceId,
          payload: orbitState,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'space_id' }
      );

    return { error };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function loadOrbitStateFromSupabase(
  spaceId = 'primary_space'
) {
  if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
    return { orbitState: null, error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await supabase
      .from('orbit_state')
      .select('payload')
      .eq('space_id', spaceId)
      .maybeSingle();

    return { orbitState: data?.payload, error };
  } catch (err) {
    return { 
      orbitState: null, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
}

export function subscribeToOrbitState(
  spaceId = 'primary_space',
  callback: (orbitState: OrbitState) => void
) {
  if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
    return () => {};
  }

  const subscription = supabase
    .channel(`orbit_state_${spaceId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orbit_state',
        filter: `space_id=eq.${spaceId}`
      },
      (payload: any) => {
        if (payload.new && payload.new.payload) {
          callback(payload.new.payload);
        }
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}
