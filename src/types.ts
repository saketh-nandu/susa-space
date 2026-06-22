export interface PublicNote {
  id: string;
  title: string;
  content: string;
  backlinks: string[]; // List of note titles or IDs
  relatedNotes: string[];
  summary?: string;
  category: string;
  updatedAt: string;
}

export interface PlannerBlock {
  id: string;
  time: string;
  task: string;
  completed: boolean;
}

export interface PlannerDay {
  id: string;
  date: string; // YYYY-MM-DD
  blocks: PlannerBlock[];
  notes: string;
  focusMinutes: number;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: 'happy' | 'calm' | 'thoughtful' | 'tired' | 'excited' | 'melancholy';
  date: string;
}

export interface PublicTask {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: 'personal' | 'work' | 'learning' | 'life';
  dueDate: string;
}

export interface Habit {
  id: string;
  name: string;
  streak: number;
  history: string[]; // List of YYYY-MM-DD completion dates
}

export interface LifeGoal {
  id: string;
  title: string;
  category: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
  completed: boolean;
}

export interface CloudFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'pdf' | 'document' | 'sticker' | 'gif';
  size: string;
  url: string;
  addedAt: string;
  isOrbit: boolean;
  sender?: 'User A' | 'User B'; // for Orbit space
}

// ORBIT TYPES
export interface ChatMessage {
  id: string;
  sender: 'User A' | 'User B';
  text: string;
  type: 'text' | 'image' | 'video' | 'voice' | 'file' | 'sticker' | 'drawing' | 'gif';
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  duration?: string; // For voice notes
  timestamp: string; // ISO string
  reactions: { user: 'User A' | 'User B'; emoji: string }[];
  repliedToId?: string;
  quotedText?: string;
  isPinned?: boolean;
  isBookmarked?: boolean;
}

export interface OrbitMemory {
  id: string;
  title: string;
  coverUrl: string;
  date: string; // YYYY-MM-DD
  participants: string[];
  description: string;
  tags: string[];
  categories: string[];
  collections: string[]; // Collection IDs
  location?: string;
  AIinsights?: string;
  relationshipIds: string[]; // Connected memories
  mediaIds: string[]; // Message IDs
  isLocked?: boolean;
  isFutureMeet?: boolean;
}

export interface MemoryCollection {
  id: string;
  name: string;
  coverUrl: string;
  description: string;
  tags: string[];
  AIsummary?: string;
}

export interface FutureItem {
  id: string;
  type: 'voice' | 'letter' | 'capsule';
  sender: 'User A' | 'User B';
  unlockDate: string; // YYYY-MM-DD
  title: string;
  content: string;
  coverUrl?: string;
  attachmentUrl?: string;
  isOpened: boolean;
  createdAt: string;
}

export interface NovaCompanion {
  name: string;
  hunger: number; // 0 - 100
  energy: number;  // 0 - 100
  happiness: number; // 0 - 100
  intelligence: number; // 0 - 100
  curiosity: number; // 0 - 100
  bondLevel: number; // 1 - 10
  growthPoints: number;
  evolutionStage: 'baby' | 'teen' | 'guardian_of_stars';
  inventory: { id: string; name: string; quantity: number; image: string; type: 'food' | 'toy' | 'upgrade' }[];
  journal: { date: string; text: string; mood: string }[];
  ambientMood: 'Happy' | 'Curious' | 'Sleepy' | 'Nostalgic' | 'Loved';
}

export interface IslandStructure {
  id: string;
  type: 'home' | 'birthday_pavilion' | 'travel_monument' | 'outdoor_cinema' | 'lighthouse' | 'museum';
  name: string;
  x: number; // grid position
  y: number;
  unlockedAt: string;
}

export interface SharedIsland {
  level: number;
  coins: number;
  materials: number;
  structures: IslandStructure[];
  activeEvent?: string;
  questStatus: { id: string; name: string; target: number; current: number; completed: boolean; rewardCoins: number }[];
}

export interface OrbitState {
  authenticated: boolean;
  authenticatedUserA?: boolean;
  authenticatedUserB?: boolean;
  messages: ChatMessage[];
  memories: OrbitMemory[];
  collections: MemoryCollection[];
  futureItems: FutureItem[];
  nova: NovaCompanion;
  island: SharedIsland;
  achievements: { id: string; name: string; description: string; unlockedAt?: string; category: string }[];
  remoteHideEnabled: boolean;
  requireHideConfirmation: boolean;
  hideUserAOrbit?: boolean;
  hideUserBOrbit?: boolean;
  watchlist: { id: string; title: string; category: 'movie' | 'book' | 'show'; status: 'planned' | 'watching' | 'completed'; rating?: number }[];
  currentMood: { 'User A': string; 'User B': string };
  currentMusic: { 'User A': string; 'User B': string };
  lastActive?: { 'User A'?: string; 'User B'?: string };
}

export interface SusaState {
  notes: PublicNote[];
  planner: PlannerDay[];
  journal: JournalEntry[];
  tasks: PublicTask[];
  habits: Habit[];
  goals: LifeGoal[];
  files: CloudFile[];
  currentUser: { email: string; name: string; avatar: string } | null;
  orbit: OrbitState;
}
