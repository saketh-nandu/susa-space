/**
 * Appwrite Backend Index
 * Central export point for all Appwrite SDK functionality
 */

// Configuration
export * from './config';

// Client initialization
export * from './client';

// Admin client
export * from './admin/admin-client';

// Services
export * from './services';

// Re-export for convenience
export { default as config } from './config';
export { default as client } from './client';
export { default as adminClient } from './admin/admin-client';
