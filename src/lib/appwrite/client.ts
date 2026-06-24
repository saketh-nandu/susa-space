/**
 * Appwrite Client Initialization
 * Browser-safe client for frontend communication
 */

import { Client, Account, Databases, Storage, Realtime } from 'appwrite';
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID } from './config';

// Initialize client
const client = new Client();

client
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setHeaders({
    'X-Appwrite-Response-Format': '1.4.0',
  });

// Initialize services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const realtime = new Realtime(client);

export { client };
export default client;
