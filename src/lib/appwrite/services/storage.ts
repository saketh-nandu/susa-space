/**
 * Storage Service
 * Handles file uploads and media management across all buckets
 */

import { storage } from '../client';
import { STORAGE_BUCKETS, VALIDATION } from '../config';
import { ID } from 'appwrite';

// ============================================
// FILE UPLOAD
// ============================================

export interface UploadOptions {
  bucket: keyof typeof STORAGE_BUCKETS;
  fileName?: string;
  onProgress?: (progress: number) => void;
}

export interface UploadResult {
  fileId: string;
  url: string;
  path: string;
  error?: string;
}

/**
 * Upload a file to a specific bucket
 */
export async function uploadFile(
  file: File,
  options: UploadOptions
): Promise<UploadResult> {
  try {
    // Validate file size based on type
    if (!validateFileSize(file)) {
      return {
        fileId: '',
        url: '',
        path: '',
        error: `File size exceeds maximum allowed size`,
      };
    }

    // Validate file type
    if (!validateFileType(file, options.bucket)) {
      return {
        fileId: '',
        url: '',
        path: '',
        error: `File type not allowed for ${options.bucket} bucket`,
      };
    }

    const bucketId = STORAGE_BUCKETS[options.bucket];
    const fileId = ID.unique();

    // Upload file
    const response = await storage.createFile(bucketId, fileId, file);

    // Get public URL
    const url = storage.getFileView(bucketId, fileId).toString();

    return {
      fileId: response.$id,
      url,
      path: response.$id,
    };
  } catch (error: any) {
    return {
      fileId: '',
      url: '',
      path: '',
      error: error.message,
    };
  }
}

/**
 * Upload multiple files to a bucket
 */
export async function uploadFiles(
  files: File[],
  options: UploadOptions
): Promise<UploadResult[]> {
  try {
    const results = await Promise.all(
      files.map((file) => uploadFile(file, options))
    );
    return results;
  } catch (error: any) {
    return [
      {
        fileId: '',
        url: '',
        path: '',
        error: error.message,
      },
    ];
  }
}

/**
 * Get public URL for a file
 */
export function getFileUrl(bucketKey: keyof typeof STORAGE_BUCKETS, fileId: string): string {
  try {
    const bucketId = STORAGE_BUCKETS[bucketKey];
    return storage.getFileView(bucketId, fileId).toString();
  } catch {
    return '';
  }
}

/**
 * Get download URL for a file
 */
export function getFileDownloadUrl(
  bucketKey: keyof typeof STORAGE_BUCKETS,
  fileId: string
): string {
  try {
    const bucketId = STORAGE_BUCKETS[bucketKey];
    return storage.getFileDownload(bucketId, fileId).toString();
  } catch {
    return '';
  }
}

/**
 * Delete a file
 */
export async function deleteFile(
  bucketKey: keyof typeof STORAGE_BUCKETS,
  fileId: string
): Promise<{ error?: string }> {
  try {
    const bucketId = STORAGE_BUCKETS[bucketKey];
    await storage.deleteFile(bucketId, fileId);
    return {};
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Get file info
 */
export async function getFileInfo(
  bucketKey: keyof typeof STORAGE_BUCKETS,
  fileId: string
): Promise<{ file: any; error?: string }> {
  try {
    const bucketId = STORAGE_BUCKETS[bucketKey];
    const file = await storage.getFile(bucketId, fileId);
    return { file };
  } catch (error: any) {
    return { file: null, error: error.message };
  }
}

/**
 * List files in a bucket
 */
export async function listFiles(
  bucketKey: keyof typeof STORAGE_BUCKETS,
  limit: number = 100,
  offset: number = 0
): Promise<{ files: any[]; total: number; error?: string }> {
  try {
    const bucketId = STORAGE_BUCKETS[bucketKey];
    const response = await storage.listFiles(bucketId, undefined, limit, offset);
    return { files: response.files, total: response.total };
  } catch (error: any) {
    return { files: [], total: 0, error: error.message };
  }
}

// ============================================
// VALIDATION HELPERS
// ============================================

function validateFileSize(file: File): boolean {
  if (file.size > VALIDATION.MAX_FILE_SIZE) return false;

  if (file.type.startsWith('image/') && file.size > VALIDATION.MAX_IMAGE_SIZE) {
    return false;
  }

  if (file.type.startsWith('video/') && file.size > VALIDATION.MAX_VIDEO_SIZE) {
    return false;
  }

  if (file.type.startsWith('audio/') && file.size > VALIDATION.MAX_AUDIO_SIZE) {
    return false;
  }

  return true;
}

function validateFileType(
  file: File,
  bucketKey: keyof typeof STORAGE_BUCKETS
): boolean {
  const mimeType = file.type;

  switch (bucketKey) {
    case 'AVATARS':
    case 'GALLERY_IMAGES':
    case 'MEMORY_COVERS':
    case 'ISLAND_ASSETS':
    case 'NOVA_ASSETS':
      return VALIDATION.ALLOWED_IMAGE_TYPES.includes(mimeType);

    case 'GALLERY_VIDEOS':
      return VALIDATION.ALLOWED_VIDEO_TYPES.includes(mimeType);

    case 'VOICE_NOTES':
    case 'AUDIO_FILES':
      return VALIDATION.ALLOWED_AUDIO_TYPES.includes(mimeType);

    case 'DOCUMENTS':
    case 'MEMORY_THEATER_ASSETS':
    case 'TIME_CAPSULE_ASSETS':
    case 'FUTURE_LETTER_ASSETS':
      return VALIDATION.ALLOWED_DOCUMENT_TYPES.includes(mimeType) || mimeType.startsWith('image/');

    default:
      return true; // Allow all file types for other buckets
  }
}

/**
 * Get storage usage for a bucket
 */
export async function getBucketUsage(
  bucketKey: keyof typeof STORAGE_BUCKETS
): Promise<{ usedBytes: number; totalBytes: number; error?: string }> {
  try {
    const { files } = await listFiles(bucketKey, 1000);

    let usedBytes = 0;
    for (const file of files) {
      usedBytes += file.sizeOriginal;
    }

    return {
      usedBytes,
      totalBytes: VALIDATION.MAX_FILE_SIZE * files.length,
    };
  } catch (error: any) {
    return { usedBytes: 0, totalBytes: 0, error: error.message };
  }
}

export default {
  uploadFile,
  uploadFiles,
  getFileUrl,
  getFileDownloadUrl,
  deleteFile,
  getFileInfo,
  listFiles,
  getBucketUsage,
};
