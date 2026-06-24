/**
 * Appwrite Configuration
 * Centralized configuration for all Appwrite services and resources
 */

// ============================================
// APPWRITE CONNECTION SETTINGS
// ============================================
export const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1';
export const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || '6a3a52fb001e5b3afa82';
export const APPWRITE_API_KEY = import.meta.env.VITE_APPWRITE_API_KEY || ''; // For admin SDK (server-side only)

// ============================================
// DATABASE CONFIGURATION
// ============================================
export const DATABASE_ID = import.meta.env.VITE_DATABASE_ID || '6a3a5935001b389ccd3b';

// Collection IDs - SUSA Space (Public)
export const COLLECTIONS = {
  // Authentication & Users
  USERS: 'users',
  USER_PROFILES: 'user_profiles',

  // SUSA Space Collections
  NOTES: 'notes',
  JOURNALS: 'journals',
  PLANNERS: 'planners',
  TASKS: 'tasks',
  GOALS: 'goals',
  HABITS: 'habits',

  // Orbit Collections (Shared Workspace)
  ORBIT_ACCOUNTS: 'orbit_accounts',
  MESSAGES: 'messages',
  MESSAGE_REACTIONS: 'message_reactions',
  MEMORIES: 'memories',
  MEMORY_COLLECTIONS: 'memory_collections',
  MEMORY_RELATIONSHIPS: 'memory_relationships',

  // Orbit Features
  ACHIEVEMENTS: 'achievements',
  REMINDERS: 'reminders',
  CALENDAR_EVENTS: 'calendar_events',
  WATCHLISTS: 'watchlists',
  VOICE_CAPSULES: 'voice_capsules',
  FUTURE_LETTERS: 'future_letters',
  TIME_CAPSULES: 'time_capsules',
  CONSTELLATION_STARS: 'constellation_stars',

  // Nova Pet System
  NOVA_PETS: 'nova_pets',
  NOVA_INVENTORY: 'nova_inventory',

  // Shared Island
  ISLAND_DATA: 'island_data',
  ISLAND_BUILDINGS: 'island_buildings',
  ISLAND_RESOURCES: 'island_resources',

  // Quest & Treasure System
  TREASURE_HUNTS: 'treasure_hunts',
  QUESTS: 'quests',

  // System & Analytics
  NOTIFICATIONS: 'notifications',
  ACTIVITY_LOGS: 'activity_logs',
  STATISTICS: 'statistics',

  // Media & Creative
  GALLERY_MEDIA: 'gallery_media',
  MEMORY_THEATER_PROJECTS: 'memory_theater_projects',
  AMBIENT_ROOMS: 'ambient_rooms',

  // System
  SYSTEM_SETTINGS: 'system_settings',
  FILES: 'files',
} as const;

// ============================================
// STORAGE CONFIGURATION
// ============================================
export const STORAGE_BUCKETS = {
  // Consolidated media bucket (free plan limit)
  MEDIA: 'susa_space_media',
} as const;

// ============================================
// PERMISSION CONSTANTS
// ============================================
export const PERMISSIONS = {
  // User roles
  ROLE_EVERYONE: 'role:everyone',
  ROLE_USERS: 'role:users',
  ROLE_GUESTS: 'role:guests',

  // Custom roles
  ROLE_SUSA_USER: 'role:susa_user',
  ROLE_ORBIT_USER: 'role:orbit_user',
  ROLE_ORBIT_OWNER: 'role:orbit_owner',
} as const;

// ============================================
// ACCESS CONTROL CONSTANTS
// ============================================
export const ORBIT_ACCESS_SEQUENCE = {
  TRIGGER_KEY: 'Control+s',
  KEYWORD: 'icecream',
};

// ============================================
// REALTIME CHANNEL PREFIXES
// ============================================
export const REALTIME_CHANNELS = {
  MESSAGES: 'messages',
  REACTIONS: 'message_reactions',
  REMINDERS: 'reminders',
  NOTIFICATIONS: 'notifications',
  MEMORY_UPDATES: 'memory_updates',
  NOVA_STATUS: 'nova_status',
  ISLAND_UPDATES: 'island_updates',
  PRESENCE: 'presence',
  COLLABORATIVE: 'collaborative_events',
} as const;

// ============================================
// APPWRITE FUNCTIONS
// ============================================
export const APPWRITE_FUNCTIONS = {
  // AI & Analysis
  GENERATE_MEMORY: 'generate_memory',
  ANALYZE_RELATIONSHIPS: 'analyze_relationships',
  GENERATE_RECAPS: 'generate_recaps', // Weekly, monthly, yearly
  GENERATE_MEMORY_THEATER: 'generate_memory_theater',

  // Automation
  CALCULATE_ACHIEVEMENTS: 'calculate_achievements',
  PROCESS_NOVA_BEHAVIOR: 'process_nova_behavior',
  PROCESS_ISLAND_EVENTS: 'process_island_events',

  // System
  SCHEDULE_REMINDERS: 'schedule_reminders',
  DELIVER_NOTIFICATIONS: 'deliver_notifications',
  INDEX_SEARCH: 'index_search',
  PROCESS_MEDIA: 'process_media',

  // Data Management
  CLEANUP_EXPIRED_ITEMS: 'cleanup_expired_items',
  BACKUP_USER_DATA: 'backup_user_data',
} as const;

// ============================================
// VALIDATION CONSTANTS
// ============================================
export const VALIDATION = {
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100 MB
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10 MB
  MAX_VIDEO_SIZE: 50 * 1024 * 1024, // 50 MB
  MAX_AUDIO_SIZE: 25 * 1024 * 1024, // 25 MB

  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm'],
  ALLOWED_AUDIO_TYPES: ['audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'text/plain'],

  MESSAGE_MAX_LENGTH: 5000,
  NOTE_MAX_LENGTH: 50000,
  JOURNAL_MAX_LENGTH: 50000,
} as const;

// ============================================
// QUOTA LIMITS
// ============================================
export const QUOTAS = {
  // Storage limits (in MB)
  FREE_TIER_STORAGE: 100,
  PREMIUM_TIER_STORAGE: 1000,
  STORAGE_PER_MESSAGE: 50, // MB per message attachment

  // Message limits
  MESSAGES_PER_DAY: 10000,

  // Memory limits
  MAX_MEMORIES_PER_COLLECTION: 1000,
  MAX_COLLECTIONS: 100,

  // File limits
  MAX_FILES_IN_GALLERY: 5000,
} as const;

// ============================================
// EXPORT ALL CONFIG
// ============================================
export default {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  DATABASE_ID,
  COLLECTIONS,
  STORAGE_BUCKETS,
  PERMISSIONS,
  ORBIT_ACCESS_SEQUENCE,
  REALTIME_CHANNELS,
  APPWRITE_FUNCTIONS,
  VALIDATION,
  QUOTAS,
};
