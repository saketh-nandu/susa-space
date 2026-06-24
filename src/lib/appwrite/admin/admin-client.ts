/**
 * Appwrite Admin Client
 * Server-side admin operations with API key
 * ONLY use this on the server/backend
 */

import { Client, Databases, Users, Storage, Functions } from 'appwrite';
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY } from '../config';

if (!APPWRITE_API_KEY) {
  console.warn('⚠️ APPWRITE_API_KEY not set. Admin operations will not work.');
}

// Initialize admin client
const adminClient = new Client();

adminClient
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

// Initialize admin services
export const adminDatabases = new Databases(adminClient);
export const adminUsers = new Users(adminClient);
export const adminStorage = new Storage(adminClient);
export const adminFunctions = new Functions(adminClient);

export { adminClient };
export default adminClient;
