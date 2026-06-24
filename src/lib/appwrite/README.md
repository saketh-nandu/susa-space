# Appwrite Backend Architecture Documentation

## Overview

This directory contains the complete Appwrite Cloud backend infrastructure for SUSA Space and Orbit. The architecture is modular, scalable, and handles authentication, databases, storage, realtime communication, and serverless functions.

## Directory Structure

```
src/lib/appwrite/
├── config.ts              # Configuration and constants
├── client.ts              # Browser-safe Appwrite client
├── index.ts               # Main export barrel
├── admin/
│   └── admin-client.ts    # Server-side admin operations
└── services/
    ├── auth.ts            # Authentication (SUSA + Orbit)
    ├── messages.ts        # Infinite Chat
    ├── reactions.ts       # Message reactions
    ├── storage.ts         # File uploads and media
    ├── memories.ts        # Memory management
    ├── reminders.ts       # Reminders and scheduling
    ├── notifications.ts   # Notifications delivery
    ├── nova.ts            # Nova pet companion
    └── index.ts           # Service exports
```

## Environment Configuration

Create a `.env.local` file in the project root with these variables:

```env
# Appwrite Cloud Settings
VITE_APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=6a3a52fb001e5b3afa82
VITE_DATABASE_ID=6a3a5935001b389ccd3b

# Server-side only (DO NOT expose to frontend)
APPWRITE_API_KEY=your_admin_api_key_here
```

## Core Services

### 1. Authentication Service (`auth.ts`)

Handles both SUSA Space (public) and Orbit (private) authentication.

**SUSA Space Authentication:**
- Email/Password registration and login
- Google OAuth integration
- Session management
- Password reset

**Orbit Authentication:**
- Secret access sequence (Ctrl+S + "icecream")
- Manual account creation by owner
- Separate credential validation
- No automatic cross-access between systems

**Usage:**
```typescript
import { registerSUSAUser, loginSUSAUser, getCurrentUser } from '@/lib/appwrite/services/auth';

// Register
const { user, error } = await registerSUSAUser(email, password, name);

// Login
const { session, error } = await loginSUSAUser(email, password);

// Get current user
const { user, error } = await getCurrentUser();
```

### 2. Messages Service (`messages.ts`)

Handles Infinite Chat for Orbit with realtime capabilities.

**Features:**
- Send/receive messages with multiple types (text, image, video, voice, file, sticker, drawing, gif)
- Message reactions and replies
- Pin/bookmark messages
- Message search
- Realtime subscriptions

**Usage:**
```typescript
import { sendMessage, getMessages, subscribeToMessages } from '@/lib/appwrite/services/messages';

// Send message
await sendMessage(orbitId, 'User A', 'Hello!', 'text');

// Get messages
const { messages, total } = await getMessages(orbitId);

// Subscribe to new messages
const unsubscribe = await subscribeToMessages(orbitId, (message) => {
  console.log('New message:', message);
});
```

### 3. Reactions Service (`reactions.ts`)

Manages message reactions with emoji support.

**Usage:**
```typescript
import { addReaction, getReactionCounts, subscribeToReactions } from '@/lib/appwrite/services/reactions';

// Add reaction
await addReaction(messageId, 'User A', '❤️');

// Get reaction counts
const { counts } = await getReactionCounts(messageId);

// Subscribe to reactions
await subscribeToReactions(messageId, (reaction) => {
  console.log('Reaction:', reaction);
});
```

### 4. Storage Service (`storage.ts`)

Handles file uploads and media management across all buckets.

**Supported Buckets:**
- AVATARS
- GALLERY_IMAGES, GALLERY_VIDEOS
- VOICE_NOTES, AUDIO_FILES
- DOCUMENTS
- MEMORY_COVERS, MEMORY_THEATER_ASSETS
- TIME_CAPSULE_ASSETS, FUTURE_LETTER_ASSETS
- ISLAND_ASSETS, NOVA_ASSETS
- BACKUP_ARCHIVES

**File Size & Type Validation:**
- Images: max 10 MB (JPEG, PNG, WebP, GIF)
- Videos: max 50 MB (MP4, WebM)
- Audio: max 25 MB (MP3, WAV, WebM, OGG)
- Documents: max 100 MB (PDF, DOCX, TXT)

**Usage:**
```typescript
import { uploadFile, getFileUrl, deleteFile } from '@/lib/appwrite/services/storage';

// Upload file
const { fileId, url, error } = await uploadFile(file, { bucket: 'GALLERY_IMAGES' });

// Get public URL
const url = getFileUrl('GALLERY_IMAGES', fileId);

// Delete file
await deleteFile('GALLERY_IMAGES', fileId);
```

### 5. Memories Service (`memories.ts`)

Manages memory creation and organization for Orbit.

**Features:**
- Create, read, update, delete memories
- Lock/unlock memories (privacy control)
- Add memories to collections
- Search memories
- Realtime updates

**Usage:**
```typescript
import { createMemory, getMemories, lockMemory } from '@/lib/appwrite/services/memories';

// Create memory
const { memory } = await createMemory(orbitId, {
  title: 'Birthday Party',
  date: '2025-06-23',
  description: '...',
  coverUrl: '...',
  participants: ['User A', 'User B'],
  tags: ['celebration', 'birthday'],
  categories: [],
  collections: [],
});

// Get memories
const { memories, total } = await getMemories(orbitId);

// Lock memory (private)
await lockMemory(memoryId);
```

### 6. Reminders Service (`reminders.ts`)

Handles reminder scheduling and notifications.

**Features:**
- Create reminders (once, daily, weekly, monthly)
- Get upcoming reminders (next 7 days)
- Trigger reminders
- Delete reminders

**Usage:**
```typescript
import { createReminder, getUpcomingReminders } from '@/lib/appwrite/services/reminders';

// Create reminder
await createReminder(orbitId, {
  title: 'Anniversary',
  triggerDate: '2025-12-25',
  reminderType: 'annual',
  recipient: 'both',
  notificationEnabled: true,
});

// Get upcoming
const { reminders } = await getUpcomingReminders(orbitId);
```

### 7. Notifications Service (`notifications.ts`)

Handles notification creation and delivery.

**Notification Types:**
- message, reminder, memory
- achievement, nova, island
- invitation, system

**Usage:**
```typescript
import { createNotification, getUnreadNotifications } from '@/lib/appwrite/services/notifications';

// Create notification
await createNotification(orbitId, 'User A', {
  type: 'achievement',
  title: 'New Achievement!',
  message: 'You reached 100 memories',
});

// Get unread
const { notifications, count } = await getUnreadNotifications(orbitId, 'User A');
```

### 8. Nova Service (`nova.ts`)

Manages Nova companion pet system.

**Features:**
- Initialize and evolve Nova
- Feed, play, train, rest
- Inventory management
- Mood and emotional state
- Progression tracking

**Usage:**
```typescript
import { initializeNova, feedNova, playWithNova } from '@/lib/appwrite/services/nova';

// Initialize
await initializeNova(orbitId);

// Interact
await feedNova(orbitId);
await playWithNova(orbitId);

// Check evolution
await checkAndEvolveNova(orbitId);
```

## Database Collections

### Authentication & Users
- **users**: SUSA Space user accounts
- **user_profiles**: Extended user information
- **orbit_accounts**: Orbit user manual entries

### SUSA Space (Public)
- **notes**: User notes with backlinks
- **journals**: Journal entries with mood tracking
- **planners**: Daily planners with time blocks
- **tasks**: Todo items with priorities
- **goals**: Life goals and targets
- **habits**: Habit tracking with streaks

### Orbit (Shared Workspace)
- **messages**: Infinite Chat messages
- **message_reactions**: Emoji reactions to messages
- **memories**: Memory entries with metadata
- **memory_collections**: Organized memory groups
- **memory_relationships**: Connected memories
- **achievements**: Unlocked achievements
- **reminders**: Scheduled reminders
- **calendar_events**: Shared calendar events
- **watchlists**: Books/movies/shows to watch

### Advanced Features
- **voice_capsules**: Voice messages with timestamps
- **future_letters**: Letters to open in future
- **time_capsules**: Content time-locked to date
- **constellation_stars**: Constellations system
- **nova_pets**: Nova companion state
- **nova_inventory**: Nova items and resources
- **island_data**: Shared island progression
- **island_buildings**: Island structures
- **island_resources**: Island materials
- **treasure_hunts**: Treasure hunt quests
- **quests**: Main quest system
- **notifications**: User notifications
- **activity_logs**: Activity timeline
- **statistics**: Analytics data
- **gallery_media**: Shared gallery files
- **memory_theater_projects**: Generated experiences
- **ambient_rooms**: Ambient environment states

## Storage Buckets

All media is served directly from storage buckets with public URLs, enabling instant playback without downloads.

**Bucket Configuration:**
- Each bucket is configured for public read access
- Images/videos render directly in-app
- Audio files play in-app media player
- PDFs and documents can be viewed inline

## Realtime Communication

Appwrite Realtime provides instant synchronization across all features:

**Channels:**
- `databases.{DATABASE_ID}.collections.{COLLECTION_ID}.documents` - Document changes
- Filtered by document/collection ID for specific subscriptions

**Usage:**
```typescript
import { subscribeToMessages } from '@/lib/appwrite/services/messages';

// Subscribe to message updates
const unsubscribe = await subscribeToMessages(orbitId, (message) => {
  // Handle new/updated messages
});

// Unsubscribe when done
unsubscribe();
```

## Permission Model

### Public Data (SUSA Space)
- User-private collections (only user can access)
- Publicly shared notes/resources (if enabled)

### Orbit Data
- Restricted to 2 Orbit users only
- No cross-access from public SUSA accounts
- Document-level and collection-level permissions
- Locked memories: restricted access even within Orbit

**Permission Assignment:**
```typescript
import { Permission, Role } from 'appwrite';

// Only Orbit users can read/write
[
  Permission.read(Role.user('user_a_id')),
  Permission.write(Role.user('user_a_id')),
  Permission.read(Role.user('user_b_id')),
  Permission.write(Role.user('user_b_id')),
]
```

## Appwrite Functions

Server-side functions for AI and automation (deployed separately):

```
- generate_memory: AI memory summarization
- analyze_relationships: Memory relationship analysis
- generate_recaps: Weekly/monthly/yearly recaps
- generate_memory_theater: AI experience generation
- calculate_achievements: Achievement system
- process_nova_behavior: Nova behavior evolution
- process_island_events: Island progression
- schedule_reminders: Reminder trigger system
- deliver_notifications: Notification delivery
- index_search: Full-text search indexing
- process_media: Media optimization
- cleanup_expired_items: Time capsule/future letter management
- backup_user_data: User data backup
```

## Best Practices

### Error Handling
```typescript
const { message, error } = await sendMessage(...);
if (error) {
  console.error('Failed to send message:', error);
  // Show user-friendly error
}
```

### Realtime Subscriptions
```typescript
// Always cleanup subscriptions
useEffect(() => {
  let unsubscribe: (() => void) | undefined;
  
  const setup = async () => {
    unsubscribe = await subscribeToMessages(orbitId, onMessage);
  };
  
  setup();
  
  return () => unsubscribe?.();
}, [orbitId]);
```

### File Uploads
```typescript
// Check file before upload
if (!validateFileSize(file)) {
  setError('File too large');
  return;
}

const { fileId, url, error } = await uploadFile(file, { 
  bucket: 'GALLERY_IMAGES' 
});
```

### Pagination
```typescript
// Get paginated results
const { messages, total } = await getMessages(orbitId, 50, 0);
const { messages: more } = await getMessages(orbitId, 50, 50);
```

## Security Notes

1. **Never expose APPWRITE_API_KEY** to frontend - only use on server
2. **Orbit accounts are not auto-created** - manual creation by owner prevents unauthorized access
3. **Orbit access requires secret sequence** - Ctrl+S + "icecream" prevents accidental discovery
4. **All media is permission-checked** - Appwrite enforces access rules at storage level
5. **Session validation** - Use `refreshSession()` periodically to keep auth current

## Migration from Firebase

If migrating from Firebase/Supabase:

1. Update environment variables to point to Appwrite
2. Replace Firestore queries with Appwrite Databases queries
3. Update Storage bucket names to match Appwrite bucket IDs
4. Refactor realtime listeners to use Appwrite Realtime channels
5. Implement Appwrite Functions for server-side logic

## Next Steps

1. **Create Appwrite Collections**: Use Appwrite console to create all collections with proper schema
2. **Configure Storage Buckets**: Create buckets with public read access for media
3. **Deploy Functions**: Create and deploy Appwrite Functions for AI processing
4. **Set Permissions**: Configure collection/document-level permissions in Appwrite
5. **Test Integration**: Verify all services work with your Appwrite project
6. **Enable OAuth**: Configure Google OAuth in Appwrite settings
7. **Setup Backups**: Configure automated backups in Appwrite

## Resources

- [Appwrite Documentation](https://appwrite.io/docs)
- [Appwrite SDK (JavaScript)](https://github.com/appwrite/sdk-for-web)
- [Appwrite Realtime](https://appwrite.io/docs/products/databases/realtime)
- [Appwrite Functions](https://appwrite.io/docs/products/functions)
