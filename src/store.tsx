import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { loadChatMessagesFromSupabase, syncChatMessagesToSupabase } from './supabase';
import {
  SusaState,
  PublicNote,
  PlannerDay,
  JournalEntry,
  PublicTask,
  Habit,
  LifeGoal,
  CloudFile,
  ChatMessage,
  OrbitMemory,
  MemoryCollection,
  FutureItem,
  NovaCompanion,
  SharedIsland,
  IslandStructure,
} from './types';

interface SusaContextProps {
  state: SusaState;
  activeUserRole: 'User A' | 'User B';
  login: (email: string, name: string, avatar?: string) => void;
  logout: () => void;
  updateProfile: (name: string, avatar: string) => void;
  addNote: (note: Omit<PublicNote, 'id' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<PublicNote>) => void;
  deleteNote: (id: string) => void;
  updatePlanner: (date: string, blocks: PlannerDay['blocks'], notes: string, focusInc?: number) => void;
  addJournal: (title: string, content: string, mood: JournalEntry['mood']) => void;
  addTask: (text: string, priority: PublicTask['priority'], category: PublicTask['category'], dueDate: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  addHabit: (name: string) => void;
  toggleHabit: (id: string, date: string) => void;
  addGoal: (title: string, category: string, targetValue: number, unit: string, deadline: string) => void;
  updateGoalProgress: (id: string, increment: number) => void;
  addFile: (name: string, type: CloudFile['type'], url: string, size: string, isOrbit?: boolean) => void;
  
  // Orbit Actions
  tryOrbitAuth: (id: string, secret: string) => boolean;
  enterOrbit: () => void;
  exitOrbit: () => void;
  toggleUserRole: () => void; // Swap active user between User A and User B
  sendOrbitMessage: (text: string, type?: ChatMessage['type'], fileDetails?: { name: string; url: string; size: string; duration?: string }) => void;
  deleteOrbitMessageForbidden: () => void; // Display error modal that message is eternal
  addReaction: (msgId: string, emoji: string) => void;
  bookmarkMessage: (msgId: string) => void;
  pinMessage: (msgId: string) => void;
  addMemoryFromMedia: (title: string, description: string, mediaMsgId: string, coverUrl: string, tags: string[], categories: string[]) => void;
  addCustomMemory: (memory: Omit<OrbitMemory, 'id'>) => void;
  addCollection: (name: string, description: string, coverUrl: string, tags: string[]) => void;
  addFutureItem: (item: Omit<FutureItem, 'id' | 'createdAt' | 'isOpened'>) => void;
  openFutureItem: (id: string) => void;
  interactWithNova: (action: 'feed' | 'play' | 'study' | 'sleep', itemId?: string) => void;
  addIslandStructure: (type: IslandStructure['type'], name: string, x: number, y: number) => void;
  moveIslandStructure: (id: string, x: number, y: number) => void;
  completeIslandQuest: (questId: string) => void;
  triggerRemoteHide: () => void; // Immediate Orbit exit
  simulatePartnerMessage: (presetText?: string) => void; // Artificial partner reaction
  updateWatchlist: (title: string, category: 'movie' | 'book' | 'show', rating?: number) => void;
  updateActivityStats: () => void;
  updatePresence: (user: 'User A' | 'User B', mood: string, music: string) => void;
  exportArchiveData: () => string;
  resetToSeeds: () => void;
}

const STORAGE_KEY = 'susa_space_orbit_state_v1';

// Clean initial state — no demo data
const INITIAL_SEEDS: SusaState = {
  currentUser: null,
  notes: [],
  planner: [],
  journal: [],
  tasks: [],
  habits: [],
  goals: [],
  files: [],
  orbit: {
    authenticated: false,
    authenticatedUserA: false,
    authenticatedUserB: false,
    messages: [],
    memories: [],
    collections: [],
    futureItems: [],
    nova: {
      name: 'Nova',
      hunger: 80,
      energy: 100,
      happiness: 90,
      intelligence: 10,
      curiosity: 10,
      bondLevel: 1,
      growthPoints: 0,
      evolutionStage: 'baby',
      inventory: [
        { id: 'inv-1', name: 'Memory Star Dust', quantity: 1, image: '✨', type: 'upgrade' },
        { id: 'inv-2', name: 'Organic Herbal Tea', quantity: 2, image: '🍵', type: 'food' },
      ],
      journal: [],
      ambientMood: 'Happy',
    },
    island: {
      level: 1,
      coins: 150,
      materials: 50,
      structures: [],
      activeEvent: undefined,
      questStatus: [
        { id: 'q-1', name: 'Feed Nova with Organic Tea', target: 1, current: 0, completed: false, rewardCoins: 100 },
        { id: 'q-2', name: 'Create your first memory star', target: 1, current: 0, completed: false, rewardCoins: 100 },
        { id: 'q-3', name: 'Send 5 messages in the Eternal Chat', target: 5, current: 0, completed: false, rewardCoins: 150 },
      ],
    },
    achievements: [
      { id: 'ach-1', name: 'First Eternal Memory', description: 'Create your first memory node in the timeline', category: 'Memories' },
      { id: 'ach-2', name: 'Nova Bond Tier II', description: 'Nurture Nova to Bond Level 3', category: 'Pet' },
      { id: 'ach-3', name: 'Lighthouse Built', description: 'Construct a Lighthouse on the island', category: 'Island' },
      { id: 'ach-4', name: 'Ambient Explorer', description: 'Activate an Ambient Room overlay', category: 'Atmosphere' },
      { id: 'ach-5', name: 'Time Traveller', description: 'Create a Voice Capsule or Future Letter', category: 'Time' },
    ],
    remoteHideEnabled: true,
    requireHideConfirmation: false,
    hideUserAOrbit: false,
    hideUserBOrbit: false,
    watchlist: [],
    currentMood: { 'User A': 'Ready ☀️', 'User B': 'Ready 🌸' },
    currentMusic: { 'User A': 'Silent', 'User B': 'Silent' },
  },
};

const SusaContext = createContext<SusaContextProps | undefined>(undefined);

export const SusaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SusaState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed;
      } catch (e) {
        console.error('Error loading state from localStorage:', e);
      }
    }
    return INITIAL_SEEDS;
  });

  const [activeUserRole, setActiveUserRole] = useState<'User A' | 'User B'>('User A');

  // Sync active user role with currently logged in user automatically
  useEffect(() => {
    if (state.currentUser?.name) {
      const lowerName = state.currentUser.name.toLowerCase();
      if (lowerName.includes('saketh')) {
        setActiveUserRole('User A');
      } else if (lowerName.includes('supriya')) {
        setActiveUserRole('User B');
      }
    }
  }, [state.currentUser]);

  // Heartbeat presence tracker for Saketh and Supriya
  useEffect(() => {
    if (!state.currentUser?.name) return;
    const lowerName = state.currentUser.name.toLowerCase();
    const role: 'User A' | 'User B' | null = lowerName.includes('saketh') ? 'User A' : lowerName.includes('supriya') ? 'User B' : null;
    if (!role) return;

    const sendHeartbeat = () => {
      setState((prev) => {
        const lastActive = prev.orbit?.lastActive || {};
        const nowStr = new Date().toISOString();
        if (lastActive[role] === nowStr) return prev;
        return {
          ...prev,
          orbit: {
            ...prev.orbit,
            lastActive: {
              ...lastActive,
              [role]: nowStr
            }
          }
        };
      });
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 15000);
    return () => clearInterval(interval);
  }, [state.currentUser?.name]);

  // Save state on change and sync to Firestore
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    
    const syncToFirebase = async () => {
      try {
        const docRef = doc(db, 'spaces', 'primary_space');
        const cleanState = JSON.parse(JSON.stringify(state));
        await setDoc(docRef, cleanState);
      } catch (err) {
        console.error("Firestore serialization failed:", err);
      }
    };

    const syncToSupabase = async () => {
      try {
        const result = await syncChatMessagesToSupabase(state.orbit.messages);
        if (result.error) {
          console.warn('[SUSA] Supabase chat sync warning:', result.error);
        }
      } catch (err) {
        console.warn('[SUSA] Supabase chat sync failed:', err);
      }
    };

    syncToFirebase();
    syncToSupabase();
  }, [state]);

  // Listen to Firestore updates
  useEffect(() => {
    const docRef = doc(db, 'spaces', 'primary_space');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const remoteData = docSnap.data() as SusaState;
        
        // Remote hide logic
        const isA = activeUserRole === 'User A';
        if (isA && remoteData.orbit?.hideUserAOrbit) {
          setTimeout(() => {
            alert("⚠️ Your private stargazing Orbit has been remotely hidden by Supriya!");
          }, 100);
          setState((prev) => {
            const nextA = false;
            const nextB = prev.orbit?.authenticatedUserB ?? prev.orbit?.authenticated;
            return {
              ...prev,
              orbit: {
                ...prev.orbit,
                authenticatedUserA: nextA,
                authenticated: nextA || nextB,
                hideUserAOrbit: false,
              }
            };
          });
          return;
        } else if (!isA && remoteData.orbit?.hideUserBOrbit) {
          setTimeout(() => {
            alert("⚠️ Your private stargazing Orbit has been remotely hidden by Saketh!");
          }, 100);
          setState((prev) => {
            const nextA = prev.orbit?.authenticatedUserA ?? prev.orbit?.authenticated;
            const nextB = false;
            return {
              ...prev,
              orbit: {
                ...prev.orbit,
                authenticatedUserB: nextB,
                authenticated: nextA || nextB,
                hideUserBOrbit: false,
              }
            };
          });
          return;
        }

        setState((current) => {
          // Compare current vs remote state excluding client-specific currentUser
          const currentClean = { ...current, currentUser: null };
          const remoteClean = { ...remoteData, currentUser: null };
          if (JSON.stringify(currentClean) !== JSON.stringify(remoteClean)) {
            return {
              ...remoteData,
              currentUser: current.currentUser
            };
          }
          return current;
        });
      }
    });

    return () => unsubscribe();
  }, [activeUserRole]);

  useEffect(() => {
    let active = true;

    const loadSupabaseChat = async () => {
      const result = await loadChatMessagesFromSupabase();
      if (!active) return;
      if (!result.error && result.messages.length > 0) {
        setState((prev) => ({
          ...prev,
          orbit: {
            ...prev.orbit,
            messages: result.messages,
          },
        }));
      }
    };

    loadSupabaseChat();
    return () => {
      active = false;
    };
  }, []);

  const login = (email: string, name: string, avatar?: string) => {
    setState((prev) => ({
      ...prev,
      currentUser: {
        email,
        name,
        avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      },
    }));
  };

  const logout = () => {
    setState((prev) => ({ ...prev, currentUser: null }));
  };

  const updateProfile = (name: string, avatar: string) => {
    setState((prev) => {
      if (!prev.currentUser) return prev;
      return {
        ...prev,
        currentUser: {
          ...prev.currentUser,
          name,
          avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        }
      };
    });
  };

  const addNote = (note: Omit<PublicNote, 'id' | 'updatedAt'>) => {
    const newNote: PublicNote = {
      ...note,
      id: `note-${Date.now()}`,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setState((prev) => ({
      ...prev,
      notes: [newNote, ...prev.notes],
    }));
  };

  const updateNote = (id: string, updates: Partial<PublicNote>) => {
    setState((prev) => ({
      ...prev,
      notes: prev.notes.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : n)),
    }));
  };

  const deleteNote = (id: string) => {
    setState((prev) => ({
      ...prev,
      notes: prev.notes.filter((n) => n.id !== id),
    }));
  };

  const updatePlanner = (date: string, blocks: PlannerDay['blocks'], notes: string, focusInc?: number) => {
    setState((prev) => {
      const exists = prev.planner.find((p) => p.date === date);
      let updatedPlanner = [...prev.planner];
      if (exists) {
        updatedPlanner = prev.planner.map((p) =>
          p.date === date
            ? { ...p, blocks, notes, focusMinutes: p.focusMinutes + (focusInc || 0) }
            : p
        );
      } else {
        updatedPlanner.push({
          id: `plan-${Date.now()}`,
          date,
          blocks,
          notes,
          focusMinutes: focusInc || 0,
        });
      }
      return { ...prev, planner: updatedPlanner };
    });
  };

  const addJournal = (title: string, content: string, mood: JournalEntry['mood']) => {
    const newEntry: JournalEntry = {
      id: `j-${Date.now()}`,
      title,
      content,
      mood,
      date: new Date().toISOString().split('T')[0],
    };
    setState((prev) => ({
      ...prev,
      journal: [newEntry, ...prev.journal],
    }));
  };

  const addTask = (text: string, priority: PublicTask['priority'], category: PublicTask['category'], dueDate: string) => {
    const newTask: PublicTask = {
      id: `t-${Date.now()}`,
      text,
      completed: false,
      priority,
      category,
      dueDate,
    };
    setState((prev) => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
    }));
  };

  const toggleTask = (id: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    }));
  };

  const deleteTask = (id: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }));
  };

  const addHabit = (name: string) => {
    const newHabit: Habit = {
      id: `h-${Date.now()}`,
      name,
      streak: 0,
      history: [],
    };
    setState((prev) => ({
      ...prev,
      habits: [...prev.habits, newHabit],
    }));
  };

  const toggleHabit = (id: string, date: string) => {
    setState((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => {
        if (h.id !== id) return h;
        const exists = h.history.includes(date);
        let updatedHistory = [...h.history];
        let updatedStreak = h.streak;
        if (exists) {
          updatedHistory = h.history.filter((d) => d !== date);
          updatedStreak = Math.max(0, h.streak - 1);
        } else {
          updatedHistory.push(date);
          updatedStreak = h.streak + 1;
        }
        return { ...h, history: updatedHistory, streak: updatedStreak };
      }),
    }));
  };

  const addGoal = (title: string, category: string, targetValue: number, unit: string, deadline: string) => {
    const newGoal: LifeGoal = {
      id: `g-${Date.now()}`,
      title,
      category,
      targetValue,
      currentValue: 0,
      unit,
      deadline,
      completed: false,
    };
    setState((prev) => ({
      ...prev,
      goals: [...prev.goals, newGoal],
    }));
  };

  const updateGoalProgress = (id: string, increment: number) => {
    setState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => {
        if (g.id !== id) return g;
        const newValue = Math.min(g.targetValue, Math.max(0, g.currentValue + increment));
        return {
          ...g,
          currentValue: newValue,
          completed: newValue >= g.targetValue,
        };
      }),
    }));
  };

  const addFile = (name: string, type: CloudFile['type'], url: string, size: string, isOrbit = false) => {
    const newFile: CloudFile = {
      id: `f-${Date.now()}`,
      name,
      type,
      size,
      url,
      addedAt: new Date().toISOString().split('T')[0],
      isOrbit,
      sender: isOrbit ? activeUserRole : undefined,
    };
    setState((prev) => ({
      ...prev,
      files: [newFile, ...prev.files],
    }));
  };

  // Orbit state operations
  const tryOrbitAuth = (id: string, secret: string): boolean => {
    // Orbit IDs: saketh_nandu127 / srirenu127, password: SupriyaSaketh127
    // These are the two fixed private accounts — no registration possible for Orbit.
    const cleanId = id.trim().toLowerCase();
    const cleanSecret = secret.trim();

    const isSaketh = cleanId === 'saketh_nandu127' || cleanId === 'saketh';
    const isSupriya = cleanId === 'srirenu127' || cleanId === 'supriya';
    const passwordOk = cleanSecret === 'SupriyaSaketh127';

    if (!(isSaketh || isSupriya) || !passwordOk) return false;

    if (isSaketh) {
      setActiveUserRole('User A');
      setState(prev => ({
        ...prev,
        currentUser: prev.currentUser ?? {
          email: 'nandusaketh5@gmail.com',
          name: 'Saketh',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
        },
      }));
    } else {
      setActiveUserRole('User B');
      setState(prev => ({
        ...prev,
        currentUser: prev.currentUser ?? {
          email: 'supriya@example.com',
          name: 'Supriya',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
        },
      }));
    }
    enterOrbit();
    return true;
  };

  const enterOrbit = () => {
    setState((prev) => {
      const isA = activeUserRole === 'User A';
      return {
        ...prev,
        orbit: {
          ...prev.orbit,
          authenticated: true,
          authenticatedUserA: isA ? true : prev.orbit.authenticatedUserA,
          authenticatedUserB: !isA ? true : prev.orbit.authenticatedUserB,
        },
      };
    });
  };

  const exitOrbit = () => {
    setState((prev) => {
      const isA = activeUserRole === 'User A';
      const nextA = isA ? false : (prev.orbit.authenticatedUserA ?? prev.orbit.authenticated);
      const nextB = !isA ? false : (prev.orbit.authenticatedUserB ?? prev.orbit.authenticated);
      return {
        ...prev,
        orbit: {
          ...prev.orbit,
          authenticatedUserA: nextA,
          authenticatedUserB: nextB,
          authenticated: nextA || nextB,
        },
      };
    });
  };

  const toggleUserRole = () => {
    setActiveUserRole((prev) => (prev === 'User A' ? 'User B' : 'User A'));
  };

  const sendOrbitMessage = (
    text: string,
    type: ChatMessage['type'] = 'text',
    fileDetails?: { name: string; url: string; size: string; duration?: string }
  ) => {
    const newMsg: ChatMessage = {
      id: `o-msg-${Date.now()}`,
      sender: activeUserRole,
      text,
      type,
      fileUrl: fileDetails?.url,
      fileName: fileDetails?.name,
      fileSize: fileDetails?.size,
      duration: fileDetails?.duration,
      timestamp: new Date().toISOString(),
      reactions: [],
      isPinned: false,
      isBookmarked: false,
    };

    setState((prev) => {
      const updatedMessages = [...prev.orbit.messages, newMsg];
      
      // If a file was sent, trigger automatic addition to Shared Files layer
      let updatedFiles = [...prev.files];
      if (fileDetails) {
        updatedFiles = [
          {
            id: `f-${Date.now()}`,
            name: fileDetails.name,
            type: type as any,
            size: fileDetails.size,
            url: fileDetails.url,
            addedAt: new Date().toISOString().split('T')[0],
            isOrbit: true,
            sender: activeUserRole,
          },
          ...prev.files,
        ];
      }

      // Update island quest progress for "Send 5 eternal chat messages"
      const updatedQuests = prev.orbit.island.questStatus.map((q) => {
        if (q.id === 'q-3') {
          const nextVal = q.current + 1;
          return {
            ...q,
            current: nextVal,
            completed: nextVal >= q.target,
          };
        }
        return q;
      });

      return {
        ...prev,
        files: updatedFiles,
        orbit: {
          ...prev.orbit,
          messages: updatedMessages,
          island: {
            ...prev.orbit.island,
            questStatus: updatedQuests,
          },
        },
      };
    });
  };

  const deleteOrbitMessageForbidden = () => {
    // This is a validation prompt explaining message eternity in Orbit
    alert("⚠️ Orbit Notice: Messages are etched into Orion star history eternally. Once built, they can be folded out of view but never erased.");
  };

  const addReaction = (msgId: string, emoji: string) => {
    setState((prev) => ({
      ...prev,
      orbit: {
        ...prev.orbit,
        messages: prev.orbit.messages.map((m) => {
          if (m.id !== msgId) return m;
          const alreadyReacted = m.reactions.some((r) => r.user === activeUserRole && r.emoji === emoji);
          const nextReactions = alreadyReacted
            ? m.reactions.filter((r) => !(r.user === activeUserRole && r.emoji === emoji))
            : [...m.reactions, { user: activeUserRole, emoji }];
          return { ...m, reactions: nextReactions };
        }),
      },
    }));
  };

  const bookmarkMessage = (msgId: string) => {
    setState((prev) => ({
      ...prev,
      orbit: {
        ...prev.orbit,
        messages: prev.orbit.messages.map((m) => (m.id === msgId ? { ...m, isBookmarked: !m.isBookmarked } : m)),
      },
    }));
  };

  const pinMessage = (msgId: string) => {
    setState((prev) => ({
      ...prev,
      orbit: {
        ...prev.orbit,
        messages: prev.orbit.messages.map((m) => (m.id === msgId ? { ...m, isPinned: !m.isPinned } : m)),
      },
    }));
  };

  const addMemoryFromMedia = (
    title: string,
    description: string,
    mediaMsgId: string,
    coverUrl: string,
    tags: string[],
    categories: string[]
  ) => {
    const newMem: OrbitMemory = {
      id: `mem-${Date.now()}`,
      title,
      coverUrl: coverUrl || 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&q=80&w=500',
      date: new Date().toISOString().split('T')[0],
      participants: ['Saketh', 'Supriya'],
      description,
      tags,
      categories,
      collections: [],
      relationshipIds: [],
      mediaIds: [mediaMsgId],
      AIinsights: 'A story object extracted with rich context from shared messenger logs.',
    };

    // Unlock achievement for first memory if none present
    setState((prev) => {
      const hasMemoryAch = prev.orbit.achievements.some((a) => a.id === 'ach-1' && a.unlockedAt);
      const nextAchievements = prev.orbit.achievements.map((a) => {
        if (a.id === 'ach-1' && !a.unlockedAt) {
          return { ...a, unlockedAt: new Date().toISOString() };
        }
        return a;
      });

      // Award memory coins for this creative action
      const nextCoins = prev.orbit.island.coins + 100;

      return {
        ...prev,
        orbit: {
          ...prev.orbit,
          memories: [newMem, ...prev.orbit.memories],
          achievements: nextAchievements,
          island: {
            ...prev.orbit.island,
            coins: nextCoins,
          },
        },
      };
    });
  };

  const addCustomMemory = (memory: Omit<OrbitMemory, 'id'>) => {
    setState((prev) => {
      const matchIndex = prev.orbit.memories.findIndex(
        (m) => m.isFutureMeet && m.date === memory.date
      );

      let updatedMemories = [...prev.orbit.memories];
      const newMem: OrbitMemory = {
        ...memory,
        id: `mem-${Date.now()}`,
      };

      if (matchIndex !== -1) {
        // Upgrade/replace future meet plan placeholder with real recollection
        updatedMemories[matchIndex] = newMem;
      } else {
        // Normal prepending
        updatedMemories = [newMem, ...updatedMemories];
      }

      return {
        ...prev,
        orbit: {
          ...prev.orbit,
          memories: updatedMemories,
          island: {
            ...prev.orbit.island,
            coins: prev.orbit.island.coins + 100,
          },
        },
      };
    });
  };

  const addCollection = (name: string, description: string, coverUrl: string, tags: string[]) => {
    const newColl: MemoryCollection = {
      id: `coll-${Date.now()}`,
      name,
      coverUrl: coverUrl || 'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?auto=format&fit=crop&q=80&w=500',
      description,
      tags,
      AIsummary: 'This collection aggregates several related stars on the horizontal timeline layer.',
    };
    setState((prev) => ({
      ...prev,
      orbit: {
        ...prev.orbit,
        collections: [...prev.orbit.collections, newColl],
      },
    }));
  };

  const addFutureItem = (item: Omit<FutureItem, 'id' | 'createdAt' | 'isOpened'>) => {
    const newItem: FutureItem = {
      ...item,
      id: `fut-${Date.now()}`,
      isOpened: false,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setState((prev) => {
      const isTimeExplUnlocked = prev.orbit.achievements.some((a) => a.id === 'ach-5' && a.unlockedAt);
      const nextAchievements = prev.orbit.achievements.map((a) => {
        if (a.id === 'ach-5' && !a.unlockedAt) {
          return { ...a, unlockedAt: new Date().toISOString() };
        }
        return a;
      });

      return {
        ...prev,
        orbit: {
          ...prev.orbit,
          futureItems: [newItem, ...prev.orbit.futureItems],
          achievements: nextAchievements,
        },
      };
    });
  };

  const openFutureItem = (id: string) => {
    setState((prev) => ({
      ...prev,
      orbit: {
        ...prev.orbit,
        futureItems: prev.orbit.futureItems.map((f) => (f.id === id ? { ...f, isOpened: true } : f)),
      },
    }));
  };

  const interactWithNova = (action: 'feed' | 'play' | 'study' | 'sleep', itemId?: string) => {
    setState((prev) => {
      const currentNova = prev.orbit.nova;
      let nextHunger = currentNova.hunger;
      let nextHappiness = currentNova.happiness;
      let nextEnergy = currentNova.energy;
      let nextIntel = currentNova.intelligence;
      let nextCuriosity = currentNova.curiosity;
      let nextBond = currentNova.bondLevel;
      let nextGp = currentNova.growthPoints;
      let nextStage = currentNova.evolutionStage;
      let updatedInventory = [...currentNova.inventory];

      let journalComment = '';

      if (action === 'feed') {
        // Feed Matcha or Star Candy from inventory
        const itemIdx = updatedInventory.findIndex((i) => i.id === itemId && i.quantity > 0);
        if (itemIdx > -1) {
          updatedInventory[itemIdx].quantity -= 1;
          nextHunger = Math.min(100, nextHunger + 30);
          nextHappiness = Math.min(100, nextHappiness + 15);
          nextGp += 10;
          journalComment = `${activeUserRole} fed me ${updatedInventory[itemIdx].name}. I felt a warm, nourishing current!`;
        } else if (!itemId) {
          // generic quick feed
          nextHunger = Math.min(100, nextHunger + 20);
          journalComment = `${activeUserRole} gave me some celestial fragments. Delicious!`;
        }
      } else if (action === 'play') {
        const itemIdx = updatedInventory.findIndex((i) => i.type === 'toy' && i.quantity > 0);
        if (itemIdx > -1) {
          updatedInventory[itemIdx].quantity -= 1;
          nextHappiness = Math.min(100, nextHappiness + 40);
          nextEnergy = Math.max(0, nextEnergy - 10);
          nextGp += 15;
          journalComment = `We played together with the Aesthetic Toy Block. I spun around happily in circles.`;
        } else {
          nextHappiness = Math.min(100, nextHappiness + 20);
          nextEnergy = Math.max(0, nextEnergy - 15);
          journalComment = `Saketh and Supriya tickled my starry tummy. Happiness overflow!`;
        }
      } else if (action === 'study') {
        nextIntel = Math.min(100, nextIntel + 25);
        nextCuriosity = Math.min(100, nextCuriosity + 20);
        nextEnergy = Math.max(0, nextEnergy - 25);
        nextGp += 20;
        journalComment = `Studied design and science with Saketh and Supriya. My intelligence indexes increased.`;
      } else if (action === 'sleep') {
        nextEnergy = 100;
        nextGp += 5;
        journalComment = `I fell asleep on my warm constellation bed, dreaming of shooting stars.`;
      }

      // Check Bond Level upgrade
      if (nextGp >= 100) {
        nextBond = Math.min(10, nextBond + 1);
        nextGp = nextGp % 100;
        if (nextBond >= 7) {
          nextStage = 'guardian_of_stars';
        } else if (nextBond >= 4) {
          nextStage = 'teen';
        }
      }

      const nextJournal = [
        {
          date: new Date().toISOString().split('T')[0],
          text: journalComment,
          mood: action === 'sleep' ? 'Sleepy' : 'Happy',
        },
        ...currentNova.journal,
      ];

      // Update Matcha feed quest if appropriate
      let updatedQuests = prev.orbit.island.questStatus;
      if (action === 'feed' && itemId === 'inv-2') {
        updatedQuests = prev.orbit.island.questStatus.map((q) => {
          if (q.id === 'q-1') {
            return { ...q, current: Math.min(q.target, q.current + 1), completed: true };
          }
          return q;
        });
      }

      return {
        ...prev,
        orbit: {
          ...prev.orbit,
          nova: {
            ...currentNova,
            hunger: nextHunger,
            happiness: nextHappiness,
            energy: nextEnergy,
            intelligence: nextIntel,
            curiosity: nextCuriosity,
            bondLevel: nextBond,
            growthPoints: nextGp,
            evolutionStage: nextStage,
            inventory: updatedInventory,
            journal: nextJournal,
          },
          island: {
            ...prev.orbit.island,
            questStatus: updatedQuests,
          },
        },
      };
    });
  };

  const addIslandStructure = (type: IslandStructure['type'], name: string, x: number, y: number) => {
    setState((prev) => {
      const cost = type === 'lighthouse' ? 200 : 100;
      if (prev.orbit.island.coins < cost) {
        alert("❌ Memory Coins are insufficient to authorize building construction!");
        return prev;
      }

      const newStruct: IslandStructure = {
        id: `str-${Date.now()}`,
        type,
        name,
        x,
        y,
        unlockedAt: new Date().toISOString().split('T')[0],
      };

      const unlockedAchievements = prev.orbit.achievements.map((a) => {
        if (a.id === 'ach-3' && !a.unlockedAt && type === 'lighthouse') {
          return { ...a, unlockedAt: new Date().toISOString() };
        }
        return a;
      });

      return {
        ...prev,
        orbit: {
          ...prev.orbit,
          achievements: unlockedAchievements,
          island: {
            ...prev.orbit.island,
            coins: prev.orbit.island.coins - cost,
            structures: [...prev.orbit.island.structures, newStruct],
          },
        },
      };
    });
  };

  const moveIslandStructure = (id: string, x: number, y: number) => {
    setState((prev) => ({
      ...prev,
      orbit: {
        ...prev.orbit,
        island: {
          ...prev.orbit.island,
          structures: prev.orbit.island.structures.map((s) => (s.id === id ? { ...s, x, y } : s)),
        },
      },
    }));
  };

  const completeIslandQuest = (questId: string) => {
    setState((prev) => {
      const q = prev.orbit.island.questStatus.find((x) => x.id === questId);
      if (!q || !q.completed) return prev;

      return {
        ...prev,
        orbit: {
          ...prev.orbit,
          island: {
            ...prev.orbit.island,
            coins: prev.orbit.island.coins + q.rewardCoins,
            questStatus: prev.orbit.island.questStatus.map((x) => (x.id === questId ? { ...x, rewardCoins: 0 } : x)), // Quest coins claimed
          },
        },
      };
    });
  };

  const triggerRemoteHide = () => {
    setState((prev) => {
      const isA = activeUserRole === 'User A';
      // If I am Saketh (A), I hide Supriya's (B) private orbit remotely.
      // If I am Supriya (B), I hide Saketh's (A) private orbit remotely.
      return {
        ...prev,
        orbit: { 
          ...prev.orbit,
          hideUserBOrbit: isA ? true : prev.orbit.hideUserBOrbit,
          hideUserAOrbit: !isA ? true : prev.orbit.hideUserAOrbit,
        },
      };
    });
    alert("🌌 Remote hide command initialized. Partner's Orbit stargazing visibility has been locked!");
  };

  const simulatePartnerMessage = (presetText?: string) => {
    const textOptions = [
      "Check out our [Nova Companion]! I fed some celestial food to it, bond tier is looking great.",
      "Just added a new secret code in [Redeem Codes] under our Play cabin, try guessing it!",
      "I love how our digital [Star Atlas] constellation is lighting up with our saved memories.",
      "Let's build a new observatory dome in our [Island Sandbox], it is going to be gorgeous!",
      "I have stored and sealed a secret tomorrow letter inside our [Future Letters] vaults!",
      "Our milestone diary on [Memory Timeline] is growing by the day!"
    ];
    const chosenText = presetText || textOptions[Math.floor(Math.random() * textOptions.length)];
    
    // Switch character temporarily to make it sound like partner
    const currentReceiverRole = activeUserRole === 'User A' ? 'User B' : 'User A';

    const newMsg: ChatMessage = {
      id: `o-msg-${Date.now()}`,
      sender: currentReceiverRole,
      text: chosenText,
      type: 'text',
      timestamp: new Date().toISOString(),
      reactions: [],
    };

    setState((prev) => ({
      ...prev,
      orbit: {
        ...prev.orbit,
        messages: [...prev.orbit.messages, newMsg],
      },
    }));
  };

  const updateWatchlist = (title: string, category: 'movie' | 'book' | 'show', rating?: number) => {
    const newEntry = {
      id: `w-${Date.now()}`,
      title,
      category,
      status: 'completed' as const,
      rating,
    };
    setState((prev) => ({
      ...prev,
      orbit: {
        ...prev.orbit,
        watchlist: [newEntry, ...prev.orbit.watchlist],
      },
    }));
  };

  const updatePresence = (user: 'User A' | 'User B', mood: string, music: string) => {
    setState((prev) => ({
      ...prev,
      orbit: {
        ...prev.orbit,
        currentMood: { ...prev.orbit.currentMood, [user]: mood },
        currentMusic: { ...prev.orbit.currentMusic, [user]: music },
      },
    }));
  };

  const updateActivityStats = () => {
    // updates or triggers simulated recalculation of activity growth
  };

  const exportArchiveData = () => {
    return JSON.stringify(state, null, 2);
  };

  const resetToSeeds = () => {
    setState(INITIAL_SEEDS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEEDS));
  };

  return (
    <SusaContext.Provider
      value={{
        state,
        activeUserRole,
        login,
        logout,
        updateProfile,
        addNote,
        updateNote,
        deleteNote,
        updatePlanner,
        addJournal,
        addTask,
        toggleTask,
        deleteTask,
        addHabit,
        toggleHabit,
        addGoal,
        updateGoalProgress,
        addFile,
        tryOrbitAuth,
        enterOrbit,
        exitOrbit,
        toggleUserRole,
        sendOrbitMessage,
        deleteOrbitMessageForbidden,
        addReaction,
        bookmarkMessage,
        pinMessage,
        addMemoryFromMedia,
        addCustomMemory,
        addCollection,
        addFutureItem,
        openFutureItem,
        interactWithNova,
        addIslandStructure,
        moveIslandStructure,
        completeIslandQuest,
        triggerRemoteHide,
        simulatePartnerMessage,
        updateWatchlist,
        updateActivityStats,
        updatePresence,
        exportArchiveData,
        resetToSeeds,
      }}
    >
      {children}
    </SusaContext.Provider>
  );
};

export const useSusaStore = () => {
  const context = useContext(SusaContext);
  if (!context) {
    throw new Error('useSusaStore must be used within a SusaProvider');
  }
  return context;
};
