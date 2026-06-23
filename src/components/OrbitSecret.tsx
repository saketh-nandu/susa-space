import React, { useState, useRef, useEffect } from 'react';
import { useSusaStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage, OrbitMemory, FutureItem, IslandStructure } from '../types';
import ThreeDDog from './ThreeDDog';
import NovaPet from './NovaPet';
import { uploadToSupabase } from '../supabase';
import {
  MessageSquare, Image, Star, Compass, Activity, Bell, Shield, MapPin,
  Hourglass, Music, Sliders, Palette, LogOut, ArrowLeft, Send, Sparkles,
  Trash2, Pin, Bookmark, Heart, Play, Film, User, Gamepad2, Plus,
  RotateCcw, Sparkle, Grid, Move, CloudRain, Tent, Waves, Moon,
  Upload, Mic, Volume2, Lock, Unlock, Flame, Zap, HelpCircle, Square,
  Settings, Database, AlertTriangle, Download, Gift, Key, Check, File
} from 'lucide-react';
import SusaLogo from './SusaLogo';

export default function OrbitSecret() {
  const {
    state,
    activeUserRole,
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
    updatePresence,
  } = useSusaStore();

  const [orbitTab, setOrbitTab] = useState<'constellation' | 'chat' | 'gallery' | 'timeline' | 'nova' | 'island' | 'time' | 'statistics' | 'passion' | 'settings'>('constellation');
  
  const renderMessageTextWithLinks = (text: string) => {
    if (!text) return null;

    // Split on bracketed references e.g. [Nova Companion], [Redeem Codes], [Star Atlas], [Island Sandbox], [Future Letters], etc.
    const tokens = text.split(/(\[[^\]]+\])/gi);

    return (
      <span className="whitespace-pre-wrap leading-relaxed">
        {tokens.map((token, idx) => {
          if (token.startsWith('[') && token.endsWith(']')) {
            const inner = token.slice(1, -1).trim();
            const lower = inner.toLowerCase();

            let targetTab: 'constellation' | 'chat' | 'gallery' | 'timeline' | 'nova' | 'island' | 'time' | 'statistics' | 'passion' | 'settings' | null = null;
            let iconLabel = inner;
            let styleClass = "";

            if (lower.includes('nova') || lower.includes('pet') || lower.includes('companion')) {
              targetTab = 'nova';
              iconLabel = "🦖 Nova Room Companion";
              styleClass = "bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0] hover:bg-[#A7F3D0]";
            } else if (lower.includes('redeem') || lower.includes('naughty') || lower.includes('code') || lower.includes('passion') || lower.includes('play')) {
              targetTab = 'passion';
              iconLabel = "🔑 Play & Redeem Cabin";
              styleClass = "bg-[#FFE4E6] text-[#9F1239] border-[#FECDD3] hover:bg-[#FECDD3] font-bold animate-pulse";
            } else if (lower.includes('atlas') || lower.includes('constellation') || lower.includes('star')) {
              targetTab = 'constellation';
              iconLabel = "🌟 Star Atlas Constellation";
              styleClass = "bg-[#FEF3C7] text-[#92400E] border-[#FDE68A] hover:bg-[#FDE68A]";
            } else if (lower.includes('island') || lower.includes('builder') || lower.includes('sandbox')) {
              targetTab = 'island';
              iconLabel = "🪙 Shared Island Sandbox";
              styleClass = "bg-[#DBEAFE] text-[#1E40AF] border-[#BFDBFE] hover:bg-[#BFDBFE]";
            } else if (lower.includes('letter') || lower.includes('capsule') || lower.includes('future') || lower.includes('time lock')) {
              targetTab = 'time';
              iconLabel = "🔒 Future Letter Locker";
              styleClass = "bg-[#F3E8FF] text-[#6B21A8] border-[#E9D5FF] hover:bg-[#E9D5FF]";
            } else if (lower.includes('timeline') || lower.includes('scroller') || lower.includes('milestone')) {
              targetTab = 'timeline';
              iconLabel = "📅 Experience Timeline";
              styleClass = "bg-stone-100 text-[#1C1C1C] border-stone-250 hover:bg-stone-200";
            } else if (lower.includes('gallery') || lower.includes('media') || lower.includes('photo')) {
              targetTab = 'gallery';
              iconLabel = "🖼️ Shared Media Gallery";
              styleClass = "bg-[#CCFBF1] text-[#115E59] border-[#99F6E4] hover:bg-[#99F6E4]";
            } else if (lower.includes('stats') || lower.includes('ledger') || lower.includes('analytics') || lower.includes('orion growth')) {
              targetTab = 'statistics';
              iconLabel = "📊 Orion Growth Stats";
              styleClass = "bg-[#E0E7FF] text-[#3730A3] border-[#C7D2FE] hover:bg-[#C7D2FE]";
            }

            if (targetTab) {
              return (
                <button
                  key={idx}
                  onClick={() => setOrbitTab(targetTab!)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all duration-300 mx-1 align-baseline cursor-pointer select-none shadow-3xs ${styleClass}`}
                  title={`Click to jump to ${iconLabel}`}
                >
                  {iconLabel}
                </button>
              );
            }
          }

          // Let's also search for plain mentions of keywords inside the token just to make them neat!
          // We can highlight key terms with standard style underlines.
          return token;
        })}
      </span>
    );
  };
  
  const [istTime, setIstTime] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      const dateString = now.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      setIstTime(`${dateString} • ${timeString} IST`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const [chatDragOver, setChatDragOver] = useState(false);

  const handleChatDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setChatDragOver(true);
  };

  const handleChatDragLeave = () => {
    setChatDragOver(false);
  };

  const getFileType = (file: File): 'image' | 'video' | 'voice' | 'file' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'voice';
    return 'file';
  };

  const handleFileSelect = async (file: File) => {
    setIsUploading(true);
    setSelectedFile(file);
    const fileType = getFileType(file);
    
    const result = await uploadToSupabase(file, 'chat');
    if (result.error) {
      // Supabase not configured — use local data URL as fallback
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setChatFileUrl(reader.result);
          setChatFileType(fileType);
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } else {
      setChatFileUrl(result.url);
      setChatFileType(fileType);
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleChatDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setChatDragOver(false);
    if (!e.dataTransfer.files || !e.dataTransfer.files[0]) return;
    handleFileSelect(e.dataTransfer.files[0]);
  };
  
  // Custom companion feed animation trigger state
  const [feedAnimation, setFeedAnimation] = useState<'idle' | 'feed' | 'joy'>('idle');

  const handleFeedNova = (actionType: 'feed', itemId: string) => {
    interactWithNova(actionType, itemId);
    setFeedAnimation('feed');
    setTimeout(() => {
      setFeedAnimation('idle');
    }, 2000);
  };
  
  // Simulated character role indicator
  const activeUser = activeUserRole;

  const isUserAOnline = (() => {
    if (!state.orbit?.lastActive?.['User A']) return false;
    const diffMs = Date.now() - new Date(state.orbit.lastActive['User A']).getTime();
    return diffMs < 45000;
  })();

  const isUserBOnline = (() => {
    if (!state.orbit?.lastActive?.['User B']) return false;
    const diffMs = Date.now() - new Date(state.orbit.lastActive['User B']).getTime();
    return diffMs < 45000;
  })();

  const isCurrentMe = (sender: string) => {
    const name = state.currentUser?.name?.toLowerCase() || '';
    if (name.includes('saketh')) {
      return sender === 'User A';
    }
    if (name.includes('supriya')) {
      return sender === 'User B';
    }
    return sender === activeUser;
  };

  // Ambient Room Overlay States
  const [ambientRoom, setAmbientRoom] = useState<'none' | 'rain' | 'forest' | 'space'>('none');
  const [ambientAudioActive, setAmbientAudioActive] = useState(false);

  // Chat message attachments state
  const [typedMessage, setTypedMessage] = useState('');
  const [chatFileUrl, setChatFileUrl] = useState('');
  const [chatFileType, setChatFileType] = useState<'text' | 'image' | 'video' | 'voice' | 'file'>('text');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [gifSearchQuery, setGifSearchQuery] = useState('');
  const [gifs, setGifs] = useState<{ id: string; url: string }[]>([]);
  const [isLoadingGifs, setIsLoadingGifs] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Giphy API search function
  const searchGifs = async (query: string) => {
    if (!query) {
      // Default trending gifs
      query = 'love';
    }
    setIsLoadingGifs(true);
    try {
      const apiKey = 'QBvYeEiQQ2sremzMPbRn4NCFGsMoy6KH';
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=12&rating=g`
      );
      const data = await response.json();
      if (data.data) {
        setGifs(data.data.map((gif: any) => ({
          id: gif.id,
          url: gif.images.fixed_width.url
        })));
      }
    } catch (error) {
      console.error('Error fetching gifs:', error);
    } finally {
      setIsLoadingGifs(false);
    }
  };

  // Load trending gifs when picker opens
  useEffect(() => {
    if (showGifPicker && gifs.length === 0) {
      searchGifs('love');
    }
  }, [showGifPicker]);

  // Constellation pan/zoom states
  const [constellationOffset, setConstellationOffset] = useState({ x: 0, y: 0 });
  const [isPanningConstellation, setIsPanningConstellation] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });

  // Draggable Shared Island coordinate states
  const [selectedIslandStructureId, setSelectedIslandStructureId] = useState<string | null>(null);

  // Memory Detail view modal
  const [selectedMemory, setSelectedMemory] = useState<OrbitMemory | null>(null);
  const [isMemorySliderOpened, setIsMemorySliderOpened] = useState(false);

  // Memory creation state (from Chat/media)
  const [creationTitle, setCreationTitle] = useState('');
  const [creationDesc, setCreationDesc] = useState('');

  // Future letters lock state
  const [newLetterTitle, setNewLetterTitle] = useState('');
  const [newLetterContent, setNewLetterContent] = useState('');
  const [newLetterUnlockDate, setNewLetterUnlockDate] = useState('2026-12-25');
  const [newFutureType, setNewFutureType] = useState<'letter' | 'voice' | 'capsule'>('letter');

  // Memory Theater state
  const [theaterActive, setTheaterActive] = useState(false);
  const [theaterFrame, setTheaterFrame] = useState(0);

  // Cooperative Battle simulation state
  const [battleActive, setBattleActive] = useState(false);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [bossHp, setBossHp] = useState(100);
  const [ourShield, setOurShield] = useState(50);

  // AI Weekly Recap report variables
  const [weeksRecapText, setWeeksRecapText] = useState('');
  const [recapLoading, setRecapLoading] = useState(false);

  // Memory creation states for Drag-and-Drop and insertion
  const [newMemTitle, setNewMemTitle] = useState('');
  const [newMemDesc, setNewMemDesc] = useState('');
  const [newMemDate, setNewMemDate] = useState('2026-06-18');
  const [newMemLocation, setNewMemLocation] = useState('');
  const [newMemTags, setNewMemTags] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [uploadedImgUrl, setUploadedImgUrl] = useState('');
  const [isMemUploading, setIsMemUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Live voice capsule recording simulation states
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceSecs, setVoiceSecs] = useState(0);
  const [recordedVoiceUrl, setRecordedVoiceUrl] = useState('');
  const [activeVoicePlayingId, setActiveVoicePlayingId] = useState<string | null>(null);
  const [voicePlaybackPercent, setVoicePlaybackPercent] = useState(0);
  const voiceTimerRef = useRef<any>(null);
  const playbackTimerRef = useRef<any>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (orbitTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state.orbit?.messages, orbitTab]);

  // Couples Passion & Play intimate states
  const [passionSparkLevel, setPassionSparkLevel] = useState(6);
  const [couplesDesires, setCouplesDesires] = useState<{ id: string; label: string; activeByA: boolean; activeByB: boolean }[]>([
    { id: 'des-1', label: 'Spontaneous Warm Bath together 🛁', activeByA: true, activeByB: false },
    { id: 'des-2', label: 'Erotic Whisper Session in absolute dark 🤫', activeByA: false, activeByB: false },
    { id: 'des-3', label: 'Midnight desert stars drive & champagne 🍾', activeByA: true, activeByB: true },
    { id: 'des-4', label: 'A sensual full body oil massage 💆‍♀️', activeByA: false, activeByB: true },
    { id: 'des-5', label: 'Roleplay adventure at a cozy boutique hotel 👘', activeByA: false, activeByB: false },
  ]);
  const [newCustomDesire, setNewCustomDesire] = useState('');

  // SUSA Island Coordinates Expanded Building list & controls
  const [buildingCoord, setBuildingCoord] = useState<{ x: number; y: number } | null>(null);
  const [customBuildingName, setCustomBuildingName] = useState('');
  const [selectedBuildingTemplateIdx, setSelectedBuildingTemplateIdx] = useState<number>(0);

  const AVAILABLE_BUILDINGS = [
    { type: 'home', emoji: '🏡', title: 'Cozy SUSA Cottage', desc: 'A serene blocky retreat for Saketh & Supriya.', cost: 40 },
    { type: 'home', emoji: '🍵', title: 'Zen Teahouse', desc: 'A peaceful spot with steaming matcha and velvet pillows.', cost: 40 },
    { type: 'home', emoji: '🏰', title: 'Magical Castle', desc: 'A grand royal fortress with towers and drawbridge.', cost: 60 },
    { type: 'birthday_pavilion', emoji: '🎂', title: 'Birthday Pavilion', desc: 'A starry shelter to celebrate milestones together.', cost: 50 },
    { type: 'birthday_pavilion', emoji: '🎈', title: 'Amusement Archway', desc: 'Bright floating balloons and sweet carnival lights.', cost: 45 },
    { type: 'birthday_pavilion', emoji: '💖', title: 'S&S Temple of Love', desc: 'A legendary shrine of ultimate romance and bonding.', cost: 60 },
    { type: 'travel_monument', emoji: '⛩️', title: 'Kyoto Torii Gate', desc: 'A miniature vermilion gate representing joint dreams.', cost: 40 },
    { type: 'travel_monument', emoji: '🗼', title: 'Mini Tokyo Tower', desc: 'Illuminates the skyline with warm red neon rays.', cost: 50 },
    { type: 'outdoor_cinema', emoji: '🎬', title: 'Secret Cinema Screen', desc: 'Widescreen projector beneath the virtual sunset skies.', cost: 50 },
    { type: 'outdoor_cinema', emoji: '🍿', title: 'Flirty Food Truck', desc: 'Serves popcorn, delicious hot pizza, and sweet sodas.', cost: 35 },
    { type: 'lighthouse', emoji: '💡', title: 'Aether Lighthouse', desc: 'Guards the shore with a powerful rotating yellow beacon.', cost: 70 },
    { type: 'lighthouse', emoji: '🏮', title: 'Mystic Lantern Spire', desc: 'A tranquil tower holding an eternal warm candlelight.', cost: 55 },
    { type: 'museum', emoji: '🏛️', title: 'SUSA Hall of Fame', desc: 'Contains letter vaults and active secret collections.', cost: 50 },
    { type: 'museum', emoji: '🎨', title: 'Sketch & Art Atelier', desc: 'Displays gorgeous sketches and customized drawings.', cost: 45 },
    { type: 'museum', emoji: '💫', title: 'Stardust Conservatory', desc: 'Astronomical observatory to track shooting stars on SUSA Island.', cost: 60 }
  ];

  // Couples Naughty Redeem Codes states & system
  const [naughtyCodes, setNaughtyCodes] = useState([
    { id: 'nc-1', code: 'MATCHAMORNING', reward: 'Fresh hot matcha latte served in bed accompanied by forehead kisses', createdBy: 'Supriya', createdFor: 'Saketh', status: 'active' },
    { id: 'nc-2', code: 'BACKRUB30', reward: 'A 30-minute warm body essential oil back rub with candlelight', createdBy: 'Saketh', createdFor: 'Supriya', status: 'active' },
    { id: 'nc-3', code: 'STARKISS', reward: 'A spontaneous 5-minute deep romantic kiss under real starry night sky', createdBy: 'Saketh', createdFor: 'Supriya', status: 'redeemed', redeemedAt: '2026-06-20' }
  ]);
  const [inputCodeWord, setInputCodeWord] = useState('');
  const [newCodeWord, setNewCodeWord] = useState('');
  const [newCodeReward, setNewCodeReward] = useState('');
  const [newCodeCreator, setNewCodeCreator] = useState<'Saketh' | 'Supriya'>('Saketh');
  const [newCodeFor, setNewCodeFor] = useState<'Saketh' | 'Supriya'>('Supriya');
  const [showHeartCelebration, setShowHeartCelebration] = useState(false);
  const [lastRedeemedReward, setLastRedeemedReward] = useState('');
  const [codeErrorMessage, setCodeErrorMessage] = useState('');

  // Supabase Storage & Bucket simulation
  const [storageUsed, setStorageUsed] = useState(0); // MB
  const [isLoadingStorage, setIsLoadingStorage] = useState(false);
  const STORAGE_LIMIT = 1000.0; // MB
  const storagePercent = (storageUsed / STORAGE_LIMIT) * 100;
  const isStorageAlmostFull = storagePercent >= 90;

  // Load storage usage when settings tab opens
  const loadStorageUsage = async () => {
    setIsLoadingStorage(true);
    const { calculateStorageUsage } = await import('../supabase');
    const { totalMB, error } = await calculateStorageUsage();
    if (!error) {
      setStorageUsed(totalMB);
    }
    setIsLoadingStorage(false);
  };

  // Watch for orbit tab change to settings
  useEffect(() => {
    if (orbitTab === 'settings') {
      loadStorageUsage();
    }
  }, [orbitTab]);

  // Real backup-generator routine (produces valid download stream)
  const handleDownloadBackup = () => {
    const backupData = {
      backupDate: new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' ' + new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }),
      timezone: "Asia/Kolkata (IST)",
      owner: "Saketh & Supriya",
      systemVersion: "v1.9.0-supabase-ready",
      island: {
        coins: state.orbit.island.coins,
        structures: state.orbit.island.structures,
        questStatus: state.orbit.island.questStatus
      },
      nova: {
        name: state.orbit.nova.name,
        bondLevel: state.orbit.nova.bondLevel,
        growthPoints: state.orbit.nova.growthPoints,
        vitalSigns: {
          hunger: state.orbit.nova.hunger,
          energy: state.orbit.nova.energy,
          happiness: state.orbit.nova.happiness,
          intelligence: state.orbit.nova.intelligence
        },
        journal: state.orbit.nova.journal
      },
      passion: {
        sparkLevel: passionSparkLevel,
        desires: couplesDesires,
        coupons: couplesCoupons,
        customNaughtyCodes: naughtyCodes
      },
      collections: state.orbit.collections,
      timelineMilestones: state.orbit.achievements
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `SUSA_Orbit_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCreateNaughtyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCodeWord.trim() || !newCodeReward.trim()) return;
    
    // Normalize code word to uppercase, alphanumeric only
    const normalizedCode = newCodeWord.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '');
    if (!normalizedCode) {
      setCodeErrorMessage('Invalid code format. Use capital letters, numbers, and underscores.');
      return;
    }

    if (naughtyCodes.some(c => c.code === normalizedCode)) {
      setCodeErrorMessage('This code already exists! Choose another word.');
      return;
    }

    const newCodeObj = {
      id: 'nc-' + Date.now(),
      code: normalizedCode,
      reward: newCodeReward.trim(),
      createdBy: newCodeCreator,
      createdFor: newCodeFor,
      status: 'active' as const
    };

    setNaughtyCodes(prev => [newCodeObj, ...prev]);
    setNewCodeWord('');
    setNewCodeReward('');
    setCodeErrorMessage('');
  };

  const handleRedeemCodeWord = (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputCodeWord.trim().toUpperCase();
    if (!query) return;

    const matchedIndex = naughtyCodes.findIndex(c => c.code === query);
    if (matchedIndex === -1) {
      setCodeErrorMessage('❌ Code not found inside the Orbit registries.');
      return;
    }

    const matched = naughtyCodes[matchedIndex];
    if (matched.status === 'redeemed') {
      setCodeErrorMessage(`⚠️ Code "${query}" has already been redeemed on ${matched.redeemedAt}!`);
      return;
    }

    // Process redemption
    const updated = [...naughtyCodes];
    const today = new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    updated[matchedIndex] = {
      ...matched,
      status: 'redeemed',
      redeemedAt: today
    };

    setNaughtyCodes(updated);
    setLastRedeemedReward(matched.reward);
    setShowHeartCelebration(true);
    setInputCodeWord('');
    setCodeErrorMessage('');
    
    // Increment intimate spark!
    setPassionSparkLevel(prev => Math.min(10, prev + 1));
  };
  const [couplesCoupons, setCouplesCoupons] = useState([
    { id: 'coup-1', title: 'Sensual Aromatherapy Massage', description: 'Redeem for 45 minutes of warm peppermint body oil massage.', owner: 'Supriya', status: 'ready' },
    { id: 'coup-2', title: 'Midnight Secret Command card', description: 'Forces your partner to obey one flirty command before the moon sets.', owner: 'Saketh', status: 'ready' },
    { id: 'coup-3', title: 'Late Night Pillow Fight Arena', description: 'Initiates a fun pillow battle followed by warm strawberry treats.', owner: 'Supriya', status: 'ready' },
    { id: 'coup-4', title: 'Intimate Bubble Bath Rendezvous', description: 'Prepares a steamy bubble bath styled with candles and slow jazzy tunes.', owner: 'Saketh', status: 'redeemed' }
  ]);
  const [selectedIntimatePrompt, setSelectedIntimatePrompt] = useState('Click below to spin truth/dare dice!');
  const [diceRollMode, setDiceRollMode] = useState<'truth' | 'dare' | 'naughty'>('truth');
  const [isDiceSpun, setIsDiceSpun] = useState(false);

  // Future meet planner states
  const [futureMeetTitle, setFutureMeetTitle] = useState('');
  const [futureMeetDate, setFutureMeetDate] = useState('2026-07-04');
  const [futureMeetDesc, setFutureMeetDesc] = useState('');
  const [futureMeetLocation, setFutureMeetLocation] = useState('');
  const [isFutureStarFormOpened, setIsFutureStarFormOpened] = useState(false);

  // Duo Memory Matching Game States
  const [matchCards, setMatchCards] = useState<{ id: number; symbol: string; isFlipped: boolean; isMatched: boolean }[]>([]);
  const [selectedCardIds, setSelectedCardIds] = useState<number[]>([]);
  const [matchGameMoves, setMatchGameMoves] = useState(0);
  const [matchGameWon, setMatchGameWon] = useState(false);
  const [isMatchingChecking, setIsMatchingChecking] = useState(false);

  const initMatchGame = () => {
    const symbols = ['❤️', '⭐', '🗺️', '🎵', '🧭', '🔒'];
    const duplicated = [...symbols, ...symbols];
    const shuffled = duplicated
      .map((sym, idx) => ({ id: idx, symbol: sym, isFlipped: false, isMatched: false }))
      .sort(() => Math.random() - 0.5);
    setMatchCards(shuffled);
    setSelectedCardIds([]);
    setMatchGameMoves(0);
    setMatchGameWon(false);
    setIsMatchingChecking(false);
  };

  useEffect(() => {
    initMatchGame();
  }, []);

  // Keyboard shortcut Ctrl + H handler for instant hidden workspace escape
  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        exitOrbit();
      }
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, []);

  // Pan constellation logic
  const handleConstellationDown = (e: React.MouseEvent) => {
    setIsPanningConstellation(true);
    panStart.current = { x: e.clientX - constellationOffset.x, y: e.clientY - constellationOffset.y };
  };

  const handleConstellationMove = (e: React.MouseEvent) => {
    if (!isPanningConstellation) return;
    setConstellationOffset({
      x: e.clientX - panStart.current.x,
      y: e.clientY - panStart.current.y
    });
  };

  // Switch role simulator
  const handleSwapRolesAndSimulate = () => {
    toggleUserRole();
  };

  // Start Voice Recording simulation
  const startVoiceRecordingSim = () => {
    setIsRecordingVoice(true);
    setVoiceSecs(0);
    voiceTimerRef.current = setInterval(() => {
      setVoiceSecs(prev => prev + 1);
    }, 1000);
  };

  // Stop Voice Recording simulation and save
  const stopVoiceRecordingSimAndLock = (title: string, unlockDate: string) => {
    if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    setIsRecordingVoice(false);
    
    const formattedDuration = `${Math.floor(voiceSecs / 60)}:${(voiceSecs % 60).toString().padStart(2, '0')}`;
    const newCap: Omit<FutureItem, 'id' | 'createdAt' | 'isOpened'> = {
      type: 'voice',
      sender: 'User A',
      unlockDate: unlockDate || '2026-12-25',
      title: title || `Voice Clip Reflection (${formattedDuration})`,
      content: `Locked emotional audio clip. Length: ${formattedDuration}. Recorded during cozy space mode under current moon constraints.`,
    };
    
    addFutureItem(newCap);
    setVoiceSecs(0);
  };

  // Drag and Drop media processing
  const handleMemDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleMemDragLeave = () => {
    setDragOver(false);
  };

  const romanticPresets = [
    'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&q=80&w=600', // flowers couples hand
    'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=600', // ring couple cute
    'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80&w=600', // beach walk
    'https://images.unsplash.com/photo-1464746133101-a2c3f88e0dd9?auto=format&fit=crop&q=80&w=600', // mountaintop
  ];

  const processDroppedMedia = async (file: File) => {
    setIsMemUploading(true);
    setUploadProgress(0);

    // Simulate progress bar while uploading
    let cur = 0;
    const progressInterval = setInterval(() => {
      cur = Math.min(cur + 15, 90);
      setUploadProgress(cur);
    }, 150);

    const result = await uploadToSupabase(file, 'memories');
    clearInterval(progressInterval);

    if (result.error) {
      // Supabase not configured — fall back to local FileReader data URL
      const reader = new FileReader();
      reader.onload = () => {
        const url = typeof reader.result === 'string'
          ? reader.result
          : romanticPresets[Math.floor(Math.random() * romanticPresets.length)];
        setUploadedImgUrl(url);
        setUploadProgress(100);
        setTimeout(() => setIsMemUploading(false), 300);
      };
      reader.onerror = () => {
        setUploadedImgUrl(romanticPresets[Math.floor(Math.random() * romanticPresets.length)]);
        setIsMemUploading(false);
      };
      reader.readAsDataURL(file);
    } else {
      setUploadedImgUrl(result.url);
      setUploadProgress(100);
      setTimeout(() => setIsMemUploading(false), 300);
    }
  };

  const handleMemDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processDroppedMedia(files[0]);
    }
  };

  const handleMemFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processDroppedMedia(files[0]);
    }
  };

  // Add the newly constructed custom memory
  const handleAddNewCustomMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemTitle.trim()) return;
    
    addCustomMemory({
      title: newMemTitle,
      coverUrl: uploadedImgUrl || 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&q=80&w=600',
      date: newMemDate,
      participants: ['Saketh', 'Supriya'],
      description: newMemDesc || 'A lovely silent memory preserved eternally in SUSA private orbital vault.',
      tags: newMemTags.split(',').map(t => t.trim()).filter(Boolean),
      categories: ['CouplesFun', 'Scrapbook'],
      collections: [],
      location: newMemLocation || 'Secret Destination',
      relationshipIds: [],
      mediaIds: []
    });

    // Reset fields
    setNewMemTitle('');
    setNewMemDesc('');
    setNewMemLocation('');
    setNewMemTags('');
    setUploadedImgUrl('');
  };

  const handleAddFutureMeet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!futureMeetTitle.trim()) return;

    addCustomMemory({
      title: futureMeetTitle,
      coverUrl: 'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?auto=format&fit=crop&q=80&w=600',
      date: futureMeetDate,
      participants: ['Saketh', 'Supriya'],
      description: futureMeetDesc || 'An intimate future encounter planned on our Orion starry timeline.',
      tags: ['FutureMeet', 'OrionPlan'],
      categories: ['FutureMeet'],
      collections: [],
      relationshipIds: [],
      mediaIds: [],
      location: futureMeetLocation || undefined,
      isFutureMeet: true,
    });

    setFutureMeetTitle('');
    setFutureMeetDesc('');
    setFutureMeetLocation('');
    setIsFutureStarFormOpened(false);
  };

  // Voice playback simulation in unsealed capsule logs
  const simulateVoicePlayback = (id: string) => {
    if (activeVoicePlayingId === id) {
      // Pause
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
      setActiveVoicePlayingId(null);
      setVoicePlaybackPercent(0);
    } else {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
      setActiveVoicePlayingId(id);
      setVoicePlaybackPercent(0);
      let pct = 0;
      playbackTimerRef.current = setInterval(() => {
        pct += 5;
        setVoicePlaybackPercent(pct);
        if (pct >= 100) {
          clearInterval(playbackTimerRef.current);
          setActiveVoicePlayingId(null);
          setVoicePlaybackPercent(0);
        }
      }, 200);
    }
  };

  // Clean timers
  useEffect(() => {
    return () => {
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    };
  }, []);

  // Intimate Prompt spinner
  const spinIntimatePromptDice = () => {
    setIsDiceSpun(true);
    let counter = 0;
    const interval = setInterval(() => {
      const mode = Math.random() > 0.5 ? 'truth' : 'dare';
      setDiceRollMode(mode);
      counter++;
      if (counter > 8) {
        clearInterval(interval);
        
        let selectedItem = '';
        if (diceRollMode === 'truth') {
          const truths = [
            'What is your single favorite memories tonight of how we connected?',
            'When did you realize you were absolutely crazy about me?',
            'What is a secret romantic dream or fantasy you want to experience next year?',
            'Which song always reminds you of our quiet, private moments?',
            'If we had an entire week on a remote tropical island, how would you want to wake me up?'
          ];
          selectedItem = truths[Math.floor(Math.random() * truths.length)];
        } else {
          const dares = [
            'Give me a slow, continuous 45-second massage on my shoulders or neck.',
            'Whisper your deepest flirty thought in my ear using your softest voice.',
            'Light a candle, turn off the lights, and invite me to slow dance for 60 seconds.',
            'Kiss me right now as if we were main characters in a timeless romance film.',
            'Trace a gentle star pattern on my hand and tell me a sweet secret.'
          ];
          selectedItem = dares[Math.floor(Math.random() * dares.length)];
        }
        
        setSelectedIntimatePrompt(selectedItem);
        setIsDiceSpun(false);
        setPassionSparkLevel(prev => Math.min(10, prev + 1));
      }
    }, 100);
  };

  // Add custom intimate desire
  const handleAddCustomDesire = () => {
    if (!newCustomDesire.trim()) return;
    setCouplesDesires(prev => [
      ...prev,
      {
        id: `des-${Date.now()}`,
        label: newCustomDesire,
        activeByA: true,
        activeByB: false
      }
    ]);
    setNewCustomDesire('');
    setPassionSparkLevel(prev => Math.min(10, prev + 1));
  };

  // Toggle desire alignment click
  const toggleDesireCheck = (id: string, user: 'User A' | 'User B') => {
    setCouplesDesires(prev => prev.map(d => {
      if (d.id !== id) return d;
      return {
        ...d,
        activeByA: user === 'User A' ? !d.activeByA : d.activeByA,
        activeByB: user === 'User B' ? !d.activeByB : d.activeByB
      };
    }));
  };

  // Redeem action coupon
  const redeemLoveCoupon = (id: string) => {
    setCouplesCoupons(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, status: c.status === 'ready' ? 'redeemed' : 'ready' };
      }
      return c;
    }));
    setPassionSparkLevel(prev => Math.min(10, prev + 1));
  };

  const handleCardClick = (id: number) => {
    if (isMatchingChecking) return;
    const clickedCard = matchCards.find(c => c.id === id);
    if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;

    // Flip the clicked card
    setMatchCards(cards => cards.map(c => c.id === id ? { ...c, isFlipped: true } : c));
    const newSelected = [...selectedCardIds, id];
    setSelectedCardIds(newSelected);

    if (newSelected.length === 2) {
      setIsMatchingChecking(true);
      setMatchGameMoves(m => m + 1);
      const [firstId, secondId] = newSelected;
      
      // Get state at this tick to evaluate correctly
      const firstCard = matchCards.find(c => c.id === firstId);
      const secondCard = matchCards.find(c => c.id === secondId);

      if (firstCard && secondCard && firstCard.symbol === secondCard.symbol) {
        // MATCH found
        setTimeout(() => {
          setMatchCards(cards => cards.map(c => (c.id === firstId || c.id === secondId) ? { ...c, isMatched: true } : c));
          setSelectedCardIds([]);
          setIsMatchingChecking(false);

          // Force recheck validation of won
          setMatchCards(currentCards => {
            const updatedCards = currentCards.map(c => (c.id === firstId || c.id === secondId) ? { ...c, isMatched: true } : c);
            const allMatched = updatedCards.every(c => c.isMatched);
            if (allMatched) {
              setMatchGameWon(true);
              setPassionSparkLevel(prev => Math.min(prev + 1, 10));
            }
            return updatedCards;
          });
        }, 600);
      } else {
        // NO MATCH
        setTimeout(() => {
          setMatchCards(cards => cards.map(c => (c.id === firstId || c.id === secondId) ? { ...c, isFlipped: false } : c));
          setSelectedCardIds([]);
          setIsMatchingChecking(false);
        }, 1000);
      }
    }
  };

  // Open Memory Theater Carousel slideshow
  const playTheaterSlide = () => {
    setTheaterActive(true);
    setTheaterFrame(0);
  };

  // Cooperative Battle game actions
  const triggerCoopBattle = () => {
    setBattleActive(true);
    setBossHp(100);
    setOurShield(50);
    setBattleLog(["⚠️ Shadow Looming: A Memory Shadow Void Creature has emerged, wanting to fade recollections! Saketh and Supriya deploy joint shields."]);
  };

  const handleBattleAction = (action: 'reflect' | 'repair' | 'attack') => {
    if (action === 'attack') {
      const damage = Math.floor(Math.random() * 20) + 15;
      setBossHp(prev => {
        const next = Math.max(0, prev - damage);
        if (next <= 0) {
          setBattleLog(logs => [...logs, `⚔️ Victory! Orion beam obliterated the Void Shadow. Earned +75 Memory Coins for SUSA island!`, "🎁 Nova gained happiness points!"]);
          state.orbit.island.coins += 75;
          state.orbit.nova.happiness = Math.min(100, state.orbit.nova.happiness + 20);
        } else {
          setBattleLog(logs => [...logs, `💥 Orion Splicer struck the shadow for ${damage} crystallization damage. Void HP: ${next}%`]);
          // Boss retaliates
          setTimeout(() => {
            const retaliation = Math.floor(Math.random() * 15) + 5;
            setOurShield(sh => Math.max(0, sh - retaliation));
            setBattleLog(logs => [...logs, `👾 Memory Shadow retaliates, draining ${retaliation}% shield density.`]);
          }, 800);
        }
        return next;
      });
    } else if (action === 'repair') {
      setOurShield(prev => Math.min(100, prev + 30));
      setBattleLog(logs => [...logs, `🛡️ Saketh and Supriya synchronize frequencies, reinforcing SUSA protection shields by 30%.`]);
    }
  };

  // AI Weekly Recap generation
  const handleFetchAiRecap = async () => {
    setRecapLoading(true);
    try {
      const res = await fetch('/api/gemini/recap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: state.orbit.messages, memories: state.orbit.memories }),
      });
      const data = await res.json();
      if (data.success) {
        setWeeksRecapText(data.text);
      }
    } catch (e) {
      setTimeout(() => {
        setWeeksRecapText(`✨ Orbit Weekly Recap Story: Our stargazing collections showed stellar activities. Nova highlights a quiet evening where Saketh & Supriya compiled creative notes. This weekend is a perfect time to construct another Lighthouse pavilion to guard our milestones.`);
      }, 800);
    } finally {
      setRecapLoading(false);
    }
  };

  return (
    <div className="relative h-screen max-h-screen overflow-hidden bg-[#F5F2ED] text-[#1C1C1C] flex flex-col font-sans" id="orbit-digital-universe">
      
      {/* Ambient Room Environmental Filters */}
      {ambientRoom === 'rain' && (
        <div className="absolute inset-0 pointer-events-none bg-[rgba(10,15,30,0.06)] z-20 mix-blend-multiply transition-all duration-1000">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:100%_40px] animate-[pulse_1.5s_infinite]" />
          <div className="absolute top-4 left-4 bg-white/90 px-3 py-1.5 rounded-full border border-stone-300 text-[11px] text-stone-700 font-mono tracking-widest flex items-center gap-2 shadow-sm">
            <CloudRain className="w-3.5 h-3.5 animate-bounce text-blue-500" /> Rainy Cafe Room Acoustic overlay active
          </div>
        </div>
      )}
      {ambientRoom === 'forest' && (
        <div className="absolute inset-0 pointer-events-none bg-[rgba(10,35,15,0.04)] z-20 mix-blend-overlay transition-all duration-1000">
          <div className="absolute top-4 left-4 bg-white/90 px-3 py-1.5 rounded-full border border-stone-300 text-[11px] text-stone-700 font-mono tracking-widest flex items-center gap-2 shadow-sm">
            <Tent className="w-3.5 h-3.5 animate-pulse text-green-600" /> Atacama Forest Retreat Environmental active
          </div>
        </div>
      )}
      {ambientRoom === 'space' && (
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[rgba(15,10,30,0.04)] to-stone-200/30 z-20 transition-all duration-1000">
          <div className="absolute top-4 left-4 bg-white/90 px-3 py-1.5 rounded-full border border-stone-300 text-[11px] text-stone-700 font-mono tracking-widest flex items-center gap-2 shadow-sm">
            <Moon className="w-3.5 h-3.5 text-yellow-500" /> Orion Constellation Star Atmos Active
          </div>
        </div>
      )}

      {/* Orbit Upper Constellation Command Belt */}
      <header className="border-b border-[#E5E1D8] px-4 md:px-8 py-3.5 bg-[#FAF9F6]/90 backdrop-blur-md flex flex-col gap-3 md:flex-row md:items-center justify-between sticky top-0 z-40">
        <div className="flex items-center justify-between md:justify-start gap-4">
          <SusaLogo size={28} />
          <span className="hidden sm:inline text-xs text-[#7C7872] border-l border-stone-300 pl-3">Orbit Universe</span>
          <span className="hidden md:inline-flex text-[11px] font-mono text-stone-600 bg-stone-100 border border-[#E5E1D8] px-2.5 py-1 rounded-full shadow-3xs shrink-0">
            🕦 {istTime.split(' ')[0] || istTime}
          </span>
          <button 
            onClick={triggerRemoteHide}
            className="md:hidden flex items-center gap-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-250 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-3xs active:scale-95 transition-all shrink-0"
            title="Emergency Remote Hide Orbit"
            id="emergency-remote-hide-mobile"
          >
            <Shield className="w-2.5 h-2.5 text-red-500 animate-pulse-slow" /> Hide Orbit
          </button>
        </div>

        {/* Real-time status / partner indicators */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-white border border-[#E5E1D8] px-2.5 py-1 rounded-full shadow-3xs">
            <div className={`w-1.5 h-1.5 rounded-full ${isUserAOnline ? 'bg-emerald-500 animate-pulse' : 'bg-stone-300'}`}></div>
            <span className="text-[10px] text-stone-700">Saketh • <span className="font-medium text-stone-900">{state.orbit.currentMood['User A']}</span></span>
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-[#E5E1D8] px-2.5 py-1 rounded-full shadow-3xs">
            <div className={`w-1.5 h-1.5 rounded-full ${isUserBOnline ? 'bg-emerald-500 animate-pulse' : 'bg-stone-300'}`}></div>
            <span className="text-[10px] text-stone-700">Supriya • <span className="font-medium text-stone-900">{state.orbit.currentMood['User B']}</span></span>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto border-t md:border-t-0 pt-2 md:pt-0">
          <select 
            onChange={(e) => setAmbientRoom(e.target.value as any)}
            className="text-[10px] md:text-[11px] font-mono bg-white border border-[#E5E1D8] p-1.5 rounded-xl outline-none"
            value={ambientRoom}
          >
            <option value="none">None Room Ambient</option>
            <option value="rain">☔ Ambient Rain Room</option>
            <option value="forest">🌲 Atacama Retreat Forest</option>
            <option value="space">🌌 Orion Constellation Stars</option>
          </select>
          <button 
            id="orbit-hide-btn"
            onClick={exitOrbit}
            className="bg-[#1C1C1C] hover:bg-stone-800 text-white text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all duration-300 shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" /> Return
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden" id="orbit-main-layout-wrapper">
        
        {/* Mobile Responsive Horizontal Tabs Belt */}
        <div className="lg:hidden shrink-0 bg-[#FAF9F6] border-b border-[#E5E1D8] px-4 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-none z-30">
          <button 
            onClick={() => setOrbitTab('constellation')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] whitespace-nowrap transition-all select-none border ${orbitTab === 'constellation' ? 'bg-[#1C1C1C] text-white border-[#1C1C1C] font-semibold' : 'bg-white text-stone-700 border-[#E5E1D8]'}`}
          >
            <span>✨ Star Atlas</span>
          </button>
          <button 
            onClick={() => setOrbitTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] whitespace-nowrap transition-all select-none border ${orbitTab === 'chat' ? 'bg-[#1C1C1C] text-white border-[#1C1C1C] font-semibold' : 'bg-white text-stone-700 border-[#E5E1D8]'}`}
          >
            <span>💬 Chat Archive</span>
            <span className="text-[9px] bg-emerald-500 text-white px-1.5 py-0.2 rounded-full font-mono font-bold">{state.orbit?.messages?.length || 0}</span>
          </button>
          <button 
            onClick={() => setOrbitTab('gallery')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] whitespace-nowrap transition-all select-none border ${orbitTab === 'gallery' ? 'bg-[#1C1C1C] text-white border-[#1C1C1C] font-semibold' : 'bg-white text-stone-700 border-[#E5E1D8]'}`}
          >
            <span>🖼️ Gallery</span>
          </button>
          <button 
            onClick={() => setOrbitTab('timeline')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] whitespace-nowrap transition-all select-none border ${orbitTab === 'timeline' ? 'bg-[#1C1C1C] text-white border-[#1C1C1C] font-semibold' : 'bg-white text-stone-700 border-[#E5E1D8]'}`}
          >
            <span>📅 Timeline</span>
          </button>
          <button 
            onClick={() => setOrbitTab('nova')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] whitespace-nowrap transition-all select-none border ${orbitTab === 'nova' ? 'bg-[#1C1C1C] text-white border-[#1C1C1C] font-semibold' : 'bg-white text-stone-700 border-[#E5E1D8]'}`}
          >
            <span>🦖 Nova</span>
            <span className="text-[9px] bg-emerald-50 text-emerald-800 px-1 rounded">Lvl {state.orbit?.nova?.bondLevel || 1}</span>
          </button>
          <button 
            onClick={() => setOrbitTab('island')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] whitespace-nowrap transition-all select-none border ${orbitTab === 'island' ? 'bg-[#1C1C1C] text-white border-[#1C1C1C] font-semibold' : 'bg-white text-stone-700 border-[#E5E1D8]'}`}
          >
            <span>🪙 Sandbox</span>
            <span className="text-[9px] text-yellow-600 font-bold">🪙{state.orbit?.island?.coins || 0}</span>
          </button>
          <button 
            onClick={() => setOrbitTab('time')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] whitespace-nowrap transition-all select-none border ${orbitTab === 'time' ? 'bg-[#1C1C1C] text-white border-[#1C1C1C] font-semibold' : 'bg-white text-stone-700 border-[#E5E1D8]'}`}
          >
            <span>🔒 Capsules</span>
          </button>
          <button 
            onClick={() => setOrbitTab('statistics')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] whitespace-nowrap transition-all select-none border ${orbitTab === 'statistics' ? 'bg-[#1C1C1C] text-white border-[#1C1C1C] font-semibold' : 'bg-white text-stone-700 border-[#E5E1D8]'}`}
          >
            <span>📊 Growth</span>
          </button>
          <button 
            onClick={() => setOrbitTab('passion')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] whitespace-nowrap transition-all select-none border ${orbitTab === 'passion' ? 'bg-rose-600 text-white border-rose-600 font-semibold' : 'bg-white text-stone-700 border-[#E5E1D8]'}`}
          >
            <span>🌶️ Play & Redeem</span>
          </button>
        </div>

        {/* Navigation Orbit Axis */}
        <aside className="hidden lg:flex lg:flex-col lg:w-60 border-r border-[#E5E1D8] bg-[#FAF9F6] p-5 flex flex-col gap-6 overflow-y-auto shrink-0">
          <div>
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold mb-3">Secret Elements</p>
            <nav className="flex flex-col gap-1">
              <button 
                id="orbit-tab-atlas"
                onClick={() => setOrbitTab('constellation')}
                className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-xs transition-all duration-300 ${orbitTab === 'constellation' ? 'bg-[#FAF9F6] text-[#1C1C1C] border-l-2 border-[#1C1C1C] font-semibold shadow-sm' : 'text-[#7C7872] hover:text-[#1C1C1C] hover:bg-stone-50'}`}
              >
                <span className="flex items-center gap-3">
                  <Sparkle className="w-4 h-4 text-[#7C7872] animate-spin-slow" />
                  <span>Constellation Star Atlas</span>
                </span>
                <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200/40 px-1.5 py-0.5 rounded-full font-mono">{state.orbit?.memories?.length || 0}★</span>
              </button>
              <button 
                id="orbit-tab-chat"
                onClick={() => setOrbitTab('chat')}
                className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-xs transition-all duration-300 ${orbitTab === 'chat' ? 'bg-[#FAF9F6] text-[#1C1C1C] border-l-2 border-[#1C1C1C] font-semibold shadow-sm' : 'text-[#7C7872] hover:text-[#1C1C1C] hover:bg-stone-50'}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <MessageSquare className="w-4 h-4 text-[#7C7872]" />
                  <span className="truncate">Infinite Chat Archive</span>
                </div>
                <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full font-mono font-bold animate-pulse">
                  ● {state.orbit?.messages?.length || 0}
                </span>
              </button>
              <button 
                id="orbit-tab-gallery"
                onClick={() => setOrbitTab('gallery')}
                className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-xs transition-all duration-300 ${orbitTab === 'gallery' ? 'bg-[#FAF9F6] text-[#1C1C1C] border-l-2 border-[#1C1C1C] font-semibold shadow-sm' : 'text-[#7C7872] hover:text-[#1C1C1C] hover:bg-stone-50'}`}
              >
                <span className="flex items-center gap-3">
                  <Image className="w-4 h-4 text-[#7C7872]" />
                  <span>Shared Media Gallery</span>
                </span>
              </button>
              <button 
                id="orbit-tab-timeline"
                onClick={() => setOrbitTab('timeline')}
                className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-xs transition-all duration-300 ${orbitTab === 'timeline' ? 'bg-[#FAF9F6] text-[#1C1C1C] border-l-2 border-[#1C1C1C] font-semibold shadow-sm' : 'text-[#7C7872] hover:text-[#1C1C1C] hover:bg-stone-50'}`}
              >
                <span className="flex items-center gap-3">
                  <Hourglass className="w-4 h-4 text-[#7C7872]" />
                  <span>Memory Timeline</span>
                </span>
              </button>
            </nav>
          </div>

          <div>
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold mb-3">Growth Companion OS</p>
            <nav className="flex flex-col gap-1">
              <button 
                id="orbit-tab-nova"
                onClick={() => setOrbitTab('nova')}
                className={`flex items-start gap-3 px-3 py-2.5 rounded-lg text-xs transition-all duration-300 ${orbitTab === 'nova' ? 'bg-[#FAF9F6] text-[#1C1C1C] border-l-2 border-[#1C1C1C] font-semibold shadow-sm' : 'text-[#7C7872] hover:text-[#1C1C1C] hover:bg-stone-50'}`}
              >
                <User className="w-4 h-4 text-emerald-600 animate-bounce mt-0.5" />
                <div className="flex-1 text-left min-w-0">
                  <div className="font-semibold text-stone-850">Nova Room Companion</div>
                  <div className="text-[10px] text-emerald-600 font-mono mt-0.5 flex items-center gap-1.5">
                    <span className="bg-emerald-50 px-1 rounded">Lvl {state.orbit?.nova?.bondLevel || 1}</span>
                    <span>{state.orbit?.nova?.happiness || 100}% Happy</span>
                  </div>
                </div>
              </button>
              <button 
                id="orbit-tab-island"
                onClick={() => setOrbitTab('island')}
                className={`flex items-start gap-3 px-3 py-2.5 rounded-lg text-xs transition-all duration-300 ${orbitTab === 'island' ? 'bg-[#FAF9F6] text-[#1C1C1C] border-l-2 border-[#1C1C1C] font-semibold shadow-sm' : 'text-[#7C7872] hover:text-[#1C1C1C] hover:bg-stone-50'}`}
              >
                <Grid className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="flex-1 text-left min-w-0">
                  <div className="font-semibold text-stone-850">Shared Island builder</div>
                  <div className="text-[10px] text-yellow-600 font-mono mt-0.5 flex items-center gap-1">
                    <span>🪙 {state.orbit?.island?.coins || 0} coins</span>
                  </div>
                </div>
              </button>
              <button 
                id="orbit-tab-time"
                onClick={() => setOrbitTab('time')}
                className={`flex items-start gap-3 px-3 py-2.5 rounded-lg text-xs transition-all duration-300 ${orbitTab === 'time' ? 'bg-[#FAF9F6] text-[#1C1C1C] border-l-2 border-[#1C1C1C] font-semibold shadow-sm' : 'text-[#7C7872] hover:text-[#1C1C1C] hover:bg-stone-50'}`}
              >
                <Moon className="w-4 h-4 text-purple-600 mt-0.5" />
                <div className="flex-1 text-left min-w-0">
                  <div className="font-semibold text-stone-850">Future Letter Lockers</div>
                  <div className="text-[10px] text-purple-600 font-mono mt-0.5">
                    🔒 {state.orbit?.futureItems?.length || 0} capsules sealed
                  </div>
                </div>
              </button>
              <button 
                id="orbit-tab-stats"
                onClick={() => setOrbitTab('statistics')}
                className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-xs transition-all duration-300 ${orbitTab === 'statistics' ? 'bg-[#FAF9F6] text-[#1C1C1C] border-l-2 border-[#1C1C1C] font-semibold shadow-sm' : 'text-[#7C7872] hover:text-[#1C1C1C] hover:bg-stone-50'}`}
              >
                <span className="flex items-center gap-3">
                  <Activity className="w-4 h-4 text-indigo-500" />
                  <span>Orion Statistics Ledger</span>
                </span>
              </button>
              <button 
                id="orbit-tab-passion"
                onClick={() => setOrbitTab('passion')}
                className={`flex items-start gap-3 px-3 py-2.5 rounded-lg text-xs transition-all duration-300 ${orbitTab === 'passion' ? 'bg-[#FAF9F6] text-[#1C1C1C] border-l-2 border-rose-500 font-semibold shadow-sm' : 'text-[#7C7872] hover:text-[#1C1C1C] hover:bg-stone-50'}`}
              >
                <Flame className="w-4 h-4 text-rose-500 animate-pulse mt-0.5" />
                <div className="flex-1 text-left min-w-0">
                  <div className="font-semibold text-stone-850 flex items-center justify-between">
                    <span>Passion & Play Room</span>
                    <span className="text-[9px] bg-rose-50 text-rose-600 px-1 py-0.2 rounded font-mono font-bold uppercase tracking-wider">Spicy</span>
                  </div>
                  <div className="text-[10px] text-rose-500 font-mono mt-0.5 flex items-center gap-1">
                    <span>🔑 {naughtyCodes.filter(c => c.status === 'active').length} active redeem codes</span>
                  </div>
                </div>
              </button>
            </nav>
          </div>

          <div>
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold mb-3">Stellar Sovereignty</p>
            <nav className="flex flex-col gap-1.5">
              <button 
                id="orbit-tab-settings"
                onClick={() => setOrbitTab('settings')}
                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold hover:bg-stone-50 transition-all duration-300 ${orbitTab === 'settings' ? 'bg-[#FAF9F6] text-[#1C1C1C] border-l-2 border-[#1C1C1C] font-semibold' : 'text-[#7C7872]'}`}
              >
                <Settings className="w-4 h-4 text-stone-600" />
                <span>Supabase Vault Settings</span>
                {isStorageAlmostFull && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-red-500 animate-ping" />
                )}
              </button>

              <button 
                id="orbit-tab-security"
                onClick={triggerRemoteHide}
                className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50/50 hover:bg-red-50 border border-red-200/50 transition-all duration-300"
              >
                <Shield className="w-4 h-4 text-red-500" />
                <span>Remote Hide Partner Orbit</span>
              </button>
            </nav>
          </div>

          {/* Quick Stats sidebar metrics */}
          <div className="mt-auto bg-white border border-[#E5E1D8] p-4 rounded-2xl flex flex-col gap-2 shadow-sm">
            <div className="flex items-center justify-between text-[11px] text-[#7C7872]">
              <span>Memory Coins</span>
              <span className="font-semibold text-yellow-600 font-mono">🪙 {state.orbit.island.coins}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#7C7872]">
              <span>Nova Connection</span>
              <span className="font-semibold text-teal-600">Bond Tier {state.orbit.nova.bondLevel}</span>
            </div>
            <p className="text-[10px] text-neutral-400 mt-2 leading-relaxed italic">All assets, files, and chat sheets are offline preserved inside standard SUSA registries.</p>
          </div>
        </aside>

        {/* Orbit Views Portfolio */}
        <main className={`flex-1 p-4 md:p-8 relative flex flex-col min-h-0 ${orbitTab === 'chat' ? 'h-full overflow-hidden' : 'overflow-y-auto'}`}>
          <AnimatePresence mode="wait">

          {/* VIEW 1: CONSTELLATION STAR ATLAS */}
          {orbitTab === 'constellation' && (() => {
            const sortedMemoriesForAtlas = [...state.orbit.memories]
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

            return (
              <motion.div 
                key="constellation"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 flex flex-col gap-6 h-full relative" 
                id="constellation-view"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between text-sm z-30 gap-4">
                  <div>
                    <h2 className="text-2xl font-light text-[#1C1C1C] tracking-tight font-serif italic flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-[#C5A880] animate-spin" style={{ animationDuration: '6s' }} />
                      <span>The Orion Star Atlas</span>
                    </h2>
                    <p className="text-xs text-stone-500 mt-0.5">Custom timeline constellation driven dynamically by active scrapbook memories and future meet plans.</p>
                  </div>
                  <div className="flex gap-2 self-start md:self-auto">
                    <button 
                      onClick={() => setIsFutureStarFormOpened(true)}
                      className="bg-[#C5A880] hover:opacity-90 text-white text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-sm font-semibold"
                    >
                      <Plus className="w-4 h-4" /> Plan Future Meet Star
                    </button>
                    <button 
                      onClick={playTheaterSlide}
                      className="bg-white hover:bg-stone-50 border border-[#C5A880] text-[#1C1C1C] text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-sm"
                    >
                      <Film className="w-4 h-4 text-[#C5A880]" /> Launch Memory Theater
                    </button>
                    <button 
                      onClick={() => { setConstellationOffset({ x: 0, y: 0 }); }}
                      className="p-1 px-2.5 rounded-lg bg-stone-100 border border-stone-200 text-stone-600 hover:text-[#1C1C1C] text-xs transition duration-300"
                    >
                      Reset Grid Offset
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-[500px]">
                  {/* Constellation Canvas viewport */}
                  <div 
                    className="lg:col-span-3 border border-[#E5E1D8] bg-[#FAF8F5] rounded-3xl overflow-hidden relative select-none cursor-grab active:cursor-grabbing daylight-shadow flex-1 min-h-[500px]"
                    onMouseDown={handleConstellationDown}
                    onMouseMove={handleConstellationMove}
                    onMouseUp={() => setIsPanningConstellation(false)}
                    onMouseLeave={() => setIsPanningConstellation(false)}
                  >
                    {/* Visual grid paper texture */}
                    <div 
                      className="absolute inset-0 bg-[radial-gradient(#d3cbbe_1.2px,transparent_1.2px)] bg-[size:30px_30px] opacity-60 transition-transform duration-150"
                      style={{ transform: `translate(${constellationOffset.x}px, ${constellationOffset.y}px)` }}
                    />

                    {/* Stars coordinates plotted */}
                    <div 
                      className="absolute inset-0 transition-transform duration-100 ease-out"
                      style={{ transform: `translate(${constellationOffset.x}px, ${constellationOffset.y}px)` }}
                    >
                      {/* SVG Constellation lines connecting stars dynamically */}
                      <svg className="absolute inset-0 w-[5000px] h-[3000px] pointer-events-none">
                        {sortedMemoriesForAtlas.length > 1 && sortedMemoriesForAtlas.map((mem, idx) => {
                          if (idx === 0) return null;
                          const prevX = 180 + (idx - 1) * 260;
                          const prevY = 240 + ((idx - 1) % 2 === 0 ? -1 : 1) * 75;
                          const currX = 180 + idx * 260;
                          const currY = 240 + (idx % 2 === 0 ? -1 : 1) * 75;
                          return (
                            <line
                              key={`line-${idx}`}
                              x1={prevX}
                              y1={prevY}
                              x2={currX}
                              y2={currY}
                              stroke={mem.isFutureMeet ? "#EC4899" : "#C5A880"}
                              strokeWidth={mem.isFutureMeet ? "1.5" : "2"}
                              strokeDasharray={mem.isFutureMeet ? "4 4" : "1 0"}
                              className="transition-all duration-300"
                            />
                          );
                        })}
                      </svg>

                      {/* Render dynamic Memory/Meet stars */}
                      {sortedMemoriesForAtlas.map((mem, idx) => {
                        const cx = 180 + idx * 260;
                        const cy = 240 + (idx % 2 === 0 ? -1 : 1) * 75;
                        const isFuture = mem.isFutureMeet;

                        return (
                          <div 
                            key={mem.id}
                            onClick={() => { 
                              setSelectedMemory(mem); 
                              setIsMemorySliderOpened(true); 
                            }}
                            style={{ top: `${cy - 30}px`, left: `${cx - 60}px` }}
                            className="absolute flex flex-col items-center gap-1.5 cursor-pointer group z-30 w-32 text-center"
                          >
                            {isFuture ? (
                              <div className="w-10 h-10 rounded-full bg-pink-500/10 border-2 border-dashed border-pink-500 flex items-center justify-center animate-pulse group-hover:scale-110 transition duration-300">
                                <Sparkle className="w-5 h-5 text-pink-500 fill-current" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-yellow-500/5 border-2 border-yellow-500 flex items-center justify-center animate-pulse group-hover:scale-125 transition duration-300">
                                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                              </div>
                            )}
                            <span className="text-[10px] bg-white/95 text-stone-800 border border-stone-250 rounded-xl px-2.5 py-1 group-hover:bg-[#1C1C1C] group-hover:text-white transition shadow-xs font-semibold leading-tight max-w-full truncate block">
                              {mem.title}
                            </span>
                            <span className="text-[9px] font-mono text-stone-400">
                              {isFuture ? '📅 Future Plan' : `✨ ${mem.date}`}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="absolute bottom-6 right-6 bg-white/95 border border-[#E5E1D8] p-4 rounded-2xl max-w-xs text-xs text-stone-600 shadow-md">
                      <p className="font-semibold text-stone-800 mb-1">Interactive Star Universe</p>
                      <p className="leading-relaxed text-[11px] text-stone-500">
                        Drag the grid to browse. Gold solid stars represent verified past logs; dashed pink stars indicate scheduled future meets. Adding a real scrapbook memory on the same date will automatically crystallize the plan!
                      </p>
                    </div>
                  </div>

                  {/* Sidebar/Drawer for planning future meet inside Constellation View */}
                  <div className="bg-white border border-[#E5E1D8] p-5 rounded-3xl h-fit shadow-sm flex flex-col gap-4">
                    <div className="border-b border-stone-100 pb-2">
                      <h4 className="text-xs uppercase font-mono tracking-widest text-pink-600 font-bold">Planned Constellations</h4>
                      <p className="text-[10px] text-stone-400 mt-0.5">Active placeholder nodes waiting to materialize.</p>
                    </div>

                    <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
                      {sortedMemoriesForAtlas.filter(m => m.isFutureMeet).length === 0 ? (
                        <p className="text-[11px] text-stone-400 italic">No future meetings scheduled yet. Create one to plant a new star!</p>
                      ) : (
                        sortedMemoriesForAtlas.filter(m => m.isFutureMeet).map(m => (
                          <div key={m.id} className="p-2.5 bg-pink-50/40 border border-pink-100 rounded-xl flex flex-col gap-1">
                            <span className="text-xs font-bold text-pink-950 truncate block">{m.title}</span>
                            <div className="flex items-center justify-between text-[10px] text-pink-700 font-mono">
                              <span>Target: {m.date}</span>
                              <span className="bg-pink-100 px-1.5 py-0.5 rounded text-[8px] font-sans font-bold">PULSING</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {isFutureStarFormOpened ? (
                      <form onSubmit={handleAddFutureMeet} className="flex flex-col gap-3 pt-3 border-t border-stone-100">
                        <h4 className="text-[11px] uppercase font-mono font-bold text-stone-700">Star Setup Form</h4>
                        
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] text-[#7C7872] uppercase font-mono">Meet Title</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. Starry Beach Sunset Walk"
                            value={futureMeetTitle}
                            onChange={(e) => setFutureMeetTitle(e.target.value)}
                            className="bg-[#FAF9F6] border border-[#E5E1D8] text-xs p-2 outline-none focus:border-pink-400 rounded-xl font-medium"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] text-[#7C7872] uppercase font-mono">Future Date</label>
                          <input 
                            type="date" 
                            required
                            value={futureMeetDate}
                            onChange={(e) => setFutureMeetDate(e.target.value)}
                            className="bg-[#FAF9F6] border border-[#E5E1D8] text-xs p-2 outline-none text-stone-700 rounded-xl font-medium"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] text-[#7C7872] uppercase font-mono">Location</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Maruyama Park"
                            value={futureMeetLocation}
                            onChange={(e) => setFutureMeetLocation(e.target.value)}
                            className="bg-[#FAF9F6] border border-[#E5E1D8] text-xs p-2 outline-none focus:border-pink-400 rounded-xl font-medium"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] text-[#7C7872] uppercase font-mono">Short description</label>
                          <textarea 
                            rows={2}
                            placeholder="A romantic picnic plan..."
                            value={futureMeetDesc}
                            onChange={(e) => setFutureMeetDesc(e.target.value)}
                            className="bg-[#FAF9F6] border border-[#E5E1D8] text-xs p-2 outline-none focus:border-pink-400 rounded-xl resize-none font-medium"
                          />
                        </div>

                        <div className="flex gap-2">
                          <button 
                            type="button"
                            onClick={() => setIsFutureStarFormOpened(false)}
                            className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs py-2 rounded-lg transition"
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit"
                            className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs py-2 rounded-lg transition font-bold"
                          >
                            Save Star
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button 
                        onClick={() => setIsFutureStarFormOpened(true)}
                        className="w-full bg-[#FAF9F6] border border-dashed border-[#C5A880] hover:bg-white text-[#C5A880] text-xs py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> Plan Another Meet Spot
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })()}

          {/* VIEW 2: INFINITE CHAT ARCHIVE */}
          {orbitTab === 'chat' && (
            <motion.div 
              key="chat"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onDragOver={handleChatDragOver}
              onDragLeave={handleChatDragLeave}
              onDrop={handleChatDrop}
              className={`flex-1 flex flex-col h-full min-h-0 rounded-2xl md:rounded-3xl p-1 md:p-2 transition-all duration-300 ${chatDragOver ? 'bg-[#FAF2E6]/40 border-2 border-dashed border-[#C5A880]' : ''}`}
              id="infinite-chat-view"
            >
              <div className="border-[#E5E1D8] pb-3 flex flex-row justify-between items-center gap-2 z-30 border-b shrink-0">
                <div className="flex flex-col gap-1 text-left min-w-0">
                  <div className="flex items-center gap-1.5 md:gap-3">
                    <h2 className="text-sm md:text-xl font-light text-[#1C1C1C] truncate">Eternal Shared Chat</h2>
                    <span className="hidden sm:inline-block text-[9px] uppercase tracking-wider bg-orange-100 text-amber-850 px-2 py-0.5 rounded-full font-mono font-bold shrink-0">Matrix</span>
                  </div>
                  {/* Both online status indicator */}
                  <div className="flex items-center gap-2.5 bg-[#FAF9F6] border border-[#E5E1D8] rounded-full px-2 py-1 text-[9px] md:text-[11px] font-medium shadow-3xs w-fit">
                    <div className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${isUserAOnline ? 'bg-emerald-500 animate-pulse' : 'bg-stone-300'}`} />
                      <span className="text-stone-750 font-semibold font-serif text-[10px]">Saketh</span>
                    </div>
                    <div className="w-px h-2 bg-stone-300" />
                    <div className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${isUserBOnline ? 'bg-emerald-500 animate-pulse' : 'bg-stone-300'}`} />
                      <span className="text-stone-750 font-semibold font-serif text-[10px]">Supriya</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Chat flow console */}
              <div className="flex-1 min-h-0 bg-stone-50/50 border border-[#E5E1D8] rounded-2xl md:rounded-3xl p-3 md:p-6 overflow-y-auto flex flex-col gap-3 md:gap-4 my-2 md:my-3" id="orion-conversations">
                {state.orbit.messages.map((m) => {
                  const isMe = isCurrentMe(m.sender);
                  return (
                    <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className="flex flex-col gap-1 max-w-[85%] md:max-w-md group">
                        
                        {/* Message node container */}
                        <div className={`relative p-3 md:p-4 rounded-2xl md:rounded-3xl text-xs md:text-sm leading-relaxed daylight-shadow ${isMe ? 'bg-[#C5A880] text-white shadow-sm font-medium border border-stone-300' : 'bg-white text-stone-800 border border-[#E5E1D8] shadow-xs'}`}>
                          
                          <div className="flex items-center justify-between gap-6 font-mono text-[8px] md:text-[9px] uppercase tracking-wider mb-1 px-0.5 opacity-70">
                            <span className="font-bold">{m.sender === 'User A' ? 'Saketh' : 'Supriya'}</span>
                            <span>{new Date(m.timestamp).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                          </div>

                          {/* Reactions display */}
                          {m.reactions && m.reactions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {[...new Set(m.reactions.map(r => r.emoji))].map((emoji) => (
                                <span key={emoji} className="bg-stone-100 border border-stone-200 px-2 py-1 rounded-full text-xs">
                                  {emoji} {m.reactions.filter(r => r.emoji === emoji).length}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Text output */}
                          {m.type === 'text' && <p className="break-words">{renderMessageTextWithLinks(m.text)}</p>}

                          {/* Image file and reply quote */}
                          {m.type === 'image' && (
                            <div className="flex flex-col gap-2">
                              <img src={m.fileUrl} alt="shared asset" className="rounded-xl border border-stone-200 size-full object-cover max-h-40 md:max-h-48" />
                              <p className="italic text-[10px] md:text-[11px] text-stone-500 mt-1">{m.fileName} ({m.fileSize})</p>
                            </div>
                          )}

                          {/* Video file */}
                          {m.type === 'video' && (
                            <div className="flex flex-col gap-2">
                              <video controls src={m.fileUrl} className="rounded-xl border border-stone-200 size-full max-h-60 md:max-h-80" />
                              <p className="italic text-[10px] md:text-[11px] text-stone-500 mt-1">{m.fileName} ({m.fileSize})</p>
                            </div>
                          )}

                          {/* Audio/Voice note */}
                          {m.type === 'voice' && (
                            <div className="flex items-center gap-2 md:gap-3 bg-stone-100 p-2 rounded-xl border border-stone-250/50">
                              <audio controls src={m.fileUrl} className="flex-1 h-10" />
                            </div>
                          )}

                          {/* Generic file */}
                          {m.type === 'file' && (
                            <div className="flex items-center gap-2 bg-stone-100 p-3 rounded-xl border border-stone-200">
                              <div className="w-10 h-10 bg-[#C5A880] rounded-lg flex items-center justify-center text-white">
                                <File className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{m.fileName}</p>
                                <p className="text-xs text-stone-500">{m.fileSize}</p>
                              </div>
                              <a href={m.fileUrl} download className="bg-stone-200 hover:bg-stone-300 p-2 rounded-lg">
                                <Download className="w-4 h-4" />
                              </a>
                            </div>
                          )}

                          {/* Actions overlay panel */}
                          <div className="mt-2 pt-1.5 border-t border-stone-200/40 flex flex-wrap gap-2 md:gap-3 text-stone-400 group-hover:opacity-100 opacity-20 transition-all duration-300 select-none">
                            <button 
                              onClick={() => setShowReactionPicker(showReactionPicker === m.id ? null : m.id)} 
                              className="hover:text-stone-850 text-[10px] md:text-xs"
                              title="Add reaction"
                            >
                              😊
                            </button>
                            {showReactionPicker === m.id && (
                              <div className="absolute bottom-full mb-2 bg-white border border-[#E5E1D8] rounded-xl p-2 shadow-lg z-40 max-h-48 overflow-y-auto">
                                <div className="grid grid-cols-8 gap-1">
                                  {['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '👻', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '👋', '🤚', '🖐', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '🔥', '✨', '⭐', '🌟', '💫', '⚡', '☄️', '💥'].map((emoji) => (
                                    <button 
                                      key={emoji}
                                      onClick={() => {
                                        addReaction(m.id, emoji);
                                        setShowReactionPicker(null);
                                      }}
                                      className="text-xl hover:bg-stone-100 p-1 rounded transition"
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                            <button onClick={() => { bookmarkMessage(m.id); }} className="hover:text-stone-850" title="Bookmark message">
                              <Bookmark className="w-3 h-3" />
                            </button>
                            <button onClick={() => { pinMessage(m.id); }} className="hover:text-stone-850" title="Pin message">
                              <Pin className="w-3 h-3" />
                            </button>
                            <button 
                              onClick={() => {
                                setSelectedMemory({
                                  id: `mem-${Date.now()}`,
                                  title: m.text ? m.text.substring(0, 30) : 'Memory Star',
                                  description: m.text || 'Extracted from chat media',
                                  coverUrl: m.fileUrl || 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&q=80&w=500',
                                  date: new Date().toISOString().split('T')[0],
                                  participants: ['Saketh', 'Supriya'],
                                  tags: ['Extracted'],
                                  categories: ['SharedHistory'],
                                  collections: [],
                                  relationshipIds: [],
                                  mediaIds: [m.id],
                                });
                                setIsMemorySliderOpened(true);
                              }}
                              className="text-[8px] uppercase font-mono bg-stone-100 hover:bg-stone-200 text-stone-700 px-1.5 py-0.2 rounded border border-stone-220 shrink-0"
                            >
                              + Add Star
                            </button>
                          </div>
                        </div>

                        {/* Forbidden purge check trigger */}
                        <div className="flex justify-end pr-1 opacity-10 md:opacity-0 group-hover:opacity-100 transition duration-300 pb-1">
                          <button 
                            onClick={deleteOrbitMessageForbidden}
                            className="text-red-500 hover:text-red-700 text-[9px]"
                          >
                            ✕ Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Message Typing Panel */}
              <div className="relative bg-white border border-[#E5E1D8] p-3 md:p-4 rounded-xl md:rounded-[28px] flex flex-col gap-2 md:gap-3 shadow-xs shrink-0">
                {/* Refer Orbit Tab Toolbar */}
                <div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto pb-1.5 border-b border-stone-100 scrollbar-none shrink-0">
                  <span className="text-[8px] md:text-[9px] uppercase font-mono tracking-wider text-[#7C7872] mr-1 flex items-center gap-1 shrink-0 font-semibold">
                    <Sparkle className="w-2.5 h-2.5 text-[#C5A880] animate-pulse" /> Link Tab:
                  </span>
                  <button 
                    type="button"
                    onClick={() => setTypedMessage(prev => {
                      const suffix = ' [Nova Companion]';
                      return prev.endsWith(' ') ? prev + suffix : prev ? prev + suffix : '[Nova Companion]';
                    })}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] md:text-[10px] bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-100 transition whitespace-nowrap active:scale-95 cursor-pointer font-medium shrink-0"
                  >
                    Companion
                  </button>
                  <button 
                    type="button"
                    onClick={() => setTypedMessage(prev => {
                      const suffix = ' [Redeem Codes]';
                      return prev.endsWith(' ') ? prev + suffix : prev ? prev + suffix : '[Redeem Codes]';
                    })}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] md:text-[10px] bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-100 transition whitespace-nowrap active:scale-95 cursor-pointer font-medium shrink-0"
                  >
                    Keys
                  </button>
                  <button 
                    type="button"
                    onClick={() => setTypedMessage(prev => {
                      const suffix = ' [Star Atlas]';
                      return prev.endsWith(' ') ? prev + suffix : prev ? prev + suffix : '[Star Atlas]';
                    })}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] md:text-[10px] bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-100 transition whitespace-nowrap active:scale-95 cursor-pointer font-medium shrink-0"
                  >
                    Atlas
                  </button>
                  <button 
                    type="button"
                    onClick={() => setTypedMessage(prev => {
                      const suffix = ' [Island Sandbox]';
                      return prev.endsWith(' ') ? prev + suffix : prev ? prev + suffix : '[Island Sandbox]';
                    })}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] md:text-[10px] bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-100 transition whitespace-nowrap active:scale-95 cursor-pointer font-medium shrink-0"
                  >
                    Sandbox
                  </button>
                  <button 
                    type="button"
                    onClick={() => setTypedMessage(prev => {
                      const suffix = ' [Future Letters]';
                      return prev.endsWith(' ') ? prev + suffix : prev ? prev + suffix : '[Future Letters]';
                    })}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] md:text-[10px] bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-100 transition whitespace-nowrap active:scale-95 cursor-pointer font-medium shrink-0"
                  >
                    Capsules
                  </button>
                  <button 
                    type="button"
                    onClick={() => setTypedMessage(prev => {
                      const suffix = ' [Memory Timeline]';
                      return prev.endsWith(' ') ? prev + suffix : prev ? prev + suffix : '[Memory Timeline]';
                    })}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] md:text-[10px] bg-stone-100 text-stone-800 hover:bg-stone-200 border border-stone-200 transition whitespace-nowrap active:scale-95 cursor-pointer font-medium shrink-0"
                  >
                    Timeline
                  </button>
                  <button 
                    type="button"
                    onClick={() => setTypedMessage(prev => {
                      const suffix = ' [Orion Stats]';
                      return prev.endsWith(' ') ? prev + suffix : prev ? prev + suffix : '[Orion Stats]';
                    })}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] md:text-[10px] bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-100 transition whitespace-nowrap active:scale-95 cursor-pointer font-medium shrink-0"
                  >
                    Growth
                  </button>
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                  className="hidden"
                  onChange={handleFileInputChange}
                />

                {chatFileUrl && (
                  <div className="flex items-center justify-between bg-[#FAF9F6] p-2 rounded-xl border border-gold-premium shrink-0">
                    <span className="text-[10px] text-stone-700 truncate">
                      Selected: {selectedFile?.name || 'File'} ({selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(2) + ' MB' : '2 MB'})
                    </span>
                    <button onClick={() => {
                      setChatFileUrl('');
                      setChatFileType('text');
                      setSelectedFile(null);
                    }} className="text-red-500 hover:text-red-600 text-[10px] font-semibold px-2">Cancel</button>
                  </div>
                )}
                
                <div className="flex gap-2 items-center">
                  {/* Emoji button */}
                  <button 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    type="button"
                    className="p-2.5 rounded-xl border border-stone-200 hover:border-[#C5A880] text-stone-500 hover:text-stone-850 transition bg-white shrink-0"
                    title="Add emoji"
                  >
                    <span className="text-sm">😊</span>
                  </button>

                  {/* GIF button */}
                  <button 
                    onClick={() => setShowGifPicker(!showGifPicker)}
                    type="button"
                    className="p-2.5 rounded-xl border border-stone-200 hover:border-[#C5A880] text-stone-500 hover:text-stone-850 transition bg-white shrink-0"
                    title="Add GIF"
                  >
                    <span className="text-sm font-bold">GIF</span>
                  </button>

                  {/* File attach button */}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                    className="p-2.5 rounded-xl border border-stone-200 hover:border-[#C5A880] text-stone-500 hover:text-stone-850 transition bg-white shrink-0 disabled:opacity-50"
                    title="Attach file"
                    disabled={isUploading}
                  >
                    {isUploading ? <div className="w-3.5 h-3.5 border-2 border-[#C5A880] border-t-transparent rounded-full animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  </button>

                  <input 
                    type="text" 
                    placeholder="Lock a fresh message into eternal history..." 
                    className="flex-1 bg-[#FAF9F6] border border-[#E5E1D8] focus:border-[#C5A880] outline-none rounded-xl md:rounded-2xl px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm text-stone-850 placeholder-stone-400"
                    value={typedMessage}
                    onChange={(e) => setTypedMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const fileDetails = selectedFile ? {
                          name: selectedFile.name,
                          url: chatFileUrl,
                          size: (selectedFile.size / 1024 / 1024).toFixed(2) + ' MB'
                        } : undefined;
                        sendOrbitMessage(typedMessage, chatFileType, fileDetails);
                        setTypedMessage('');
                        setChatFileUrl('');
                        setChatFileType('text');
                        setSelectedFile(null);
                      }
                    }}
                  />
                  
                  <button 
                    onClick={() => {
                      const fileDetails = selectedFile ? {
                        name: selectedFile.name,
                        url: chatFileUrl,
                        size: (selectedFile.size / 1024 / 1024).toFixed(2) + ' MB'
                      } : undefined;
                      sendOrbitMessage(typedMessage, chatFileType, fileDetails);
                      setTypedMessage('');
                      setChatFileUrl('');
                      setChatFileType('text');
                      setSelectedFile(null);
                    }}
                    type="button"
                    className="bg-[#C5A880] hover:bg-opacity-95 text-white rounded-xl p-2.5 flex items-center justify-center transition shadow-xs shrink-0 disabled:opacity-50"
                    disabled={isUploading}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div className="absolute bottom-full mb-2 bg-white border border-[#E5E1D8] rounded-xl p-3 shadow-lg z-50 max-h-64 overflow-y-auto">
                    <div className="grid grid-cols-8 gap-1">
                      {['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '👻', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '👋', '🤚', '🖐', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '🔥', '✨', '⭐', '🌟', '💫', '⚡', '☄️', '💥', '🌪', '🌈', '☀️', '🌤', '⛅', '🌥', '☁️', '🌦', '🌧', '⛈', '🌩', '🌨', '❄️', '☃️', '⛄', '🌬', '💨', '💧', '💦', '☔', '☂️', '🌊', '💫', '🌙', '⭐', '🌟', '✨', '⚡', '🎶', '🎵', '🎵', '🎶', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎸', '🎺', '🎻', '🏈', '⚾', '🥎', '⚽', '🥅', '🏀', '🏐', '🏉', '🎾', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '⛳', '⛸', '🎿', '🛷', '🥌', '🎯', '🪃', '🎣', '🤿', '🎽', '🎿', '🛷', '🎪', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🎮', '🎰', '🎲', '♟', '🎯', '🎳', '🎰', '🎮', '🎲', '🎰', '🎯', '🎳', '🎲', '🎰', '🎪', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🎮', '🎰', '🎲', '🎯', '🎳', '🎲', '🎰', '🎪', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🎮', '🎰', '🎲', '🎯', '🎳', '🎲', '🎰', '🎪', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🎮', '🎰', '🎲', '🎯', '🎳', '🎲', '🎰'].map((emoji) => (
                        <button 
                          key={emoji}
                          onClick={() => {
                            setTypedMessage(prev => prev + emoji);
                            setShowEmojiPicker(false);
                          }}
                          className="text-xl hover:bg-stone-100 p-1 rounded transition"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* GIF Picker */}
                {showGifPicker && (
                  <div className="absolute bottom-full mb-2 bg-white border border-[#E5E1D8] rounded-xl p-3 shadow-lg z-50 w-80 max-h-80 overflow-y-auto">
                    {/* Search bar */}
                    <div className="mb-3">
                      <input 
                        type="text"
                        placeholder="Search GIFs..."
                        value={gifSearchQuery}
                        onChange={(e) => setGifSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            searchGifs(gifSearchQuery);
                          }
                        }}
                        className="w-full bg-[#FAF9F6] border border-[#E5E1D8] focus:border-[#C5A880] outline-none rounded-xl px-3 py-2 text-xs"
                      />
                      <button 
                        onClick={() => searchGifs(gifSearchQuery)}
                        className="mt-2 w-full bg-[#C5A880] hover:bg-opacity-90 text-white rounded-lg py-1.5 text-xs font-semibold transition"
                      >
                        {isLoadingGifs ? 'Loading...' : 'Search'}
                      </button>
                    </div>
                    {/* GIF grid */}
                    <div className="grid grid-cols-3 gap-2">
                      {gifs.map((gif) => (
                        <button 
                          key={gif.id}
                          onClick={() => {
                            setChatFileUrl(gif.url);
                            setChatFileType('image');
                            setSelectedFile(null);
                            setShowGifPicker(false);
                          }}
                          className="aspect-square overflow-hidden rounded-lg border border-stone-200 hover:border-[#C5A880] transition"
                        >
                          <img src={gif.url} alt="GIF" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* VIEW 3: SHARED MEDIA GALLERY */}
          {orbitTab === 'gallery' && (
            <motion.div 
              key="gallery"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 flex flex-col gap-6" 
              id="gallery-view"
            >
              <div>
                <h2 className="text-xl font-light text-stone-800">Shared Media Repository</h2>
                <p className="text-xs text-stone-500">Grid displaying photos, drawings, and files preserved inside the Orbit space.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {state.files.filter(f => f.isOrbit).map((file) => (
                  <div key={file.id} className="bg-white border border-[#E5E1D8] rounded-2xl overflow-hidden group shadow-sm hover:shadow-md transition">
                    <img 
                      src={file.url.startsWith('http') ? file.url : 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&q=80&w=400'} 
                      alt="shared photograph" 
                      className="w-full h-40 object-cover group-hover:scale-103 transition duration-500"
                    />
                    <div className="p-4 flex flex-col gap-2 bg-white">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] bg-stone-100 px-2 py-0.5 rounded text-stone-800 font-mono font-semibold">{file.type}</span>
                        <span className="text-[10px] text-stone-400">Shared {file.addedAt}</span>
                      </div>
                      <h4 className="text-xs font-semibold text-stone-800 truncate">{file.name}</h4>
                      <p className="text-[10px] text-stone-500">Brought by: {file.sender || 'Companion'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* VIEW 4: MEMORY TIMELINE SCROLLER */}
          {orbitTab === 'timeline' && (
            <motion.div 
              key="timeline"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 flex flex-col gap-8" 
              id="timeline-view"
            >
              <div>
                <h2 className="text-xl font-light text-[#1C1C1C]">Eternal Memory Timeline</h2>
                <p className="text-xs text-stone-500">Intentionally curated story objects stretching across our shared years milestones.</p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
                
                {/* Horizontal Timeline and Collections */}
                <div className="xl:col-span-2 flex flex-col gap-8">
                  
                  {/* Horizontal Timeline belt */}
                  <div className="bg-[#FAF9F6] border border-[#E5E1D8] rounded-[32px] p-8 overflow-x-auto flex gap-6 select-none relative py-12" style={{ cursor: 'grab' }}>
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#FAF2E6] pointer-events-none transform -translate-y-1/2" />
                    
                    {state.orbit.memories.map((mem) => (
                      <div 
                        key={mem.id}
                        onClick={() => { setSelectedMemory(mem); setIsMemorySliderOpened(true); }}
                        className="min-w-[280px] w-72 bg-white border border-[#E5E1D8] hover:border-[#C5A880] rounded-2xl overflow-hidden cursor-pointer relative z-30 transform hover:-translate-y-2 transition duration-300 shadow-sm"
                      >
                        <img src={mem.coverUrl} alt="cover" className="w-full h-32 object-cover" />
                        <div className="p-4 flex flex-col gap-1.5">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-mono text-purple-700 font-semibold">{mem.date}</span>
                            <span className="text-[9px] bg-stone-100 font-mono text-stone-700 border border-stone-200 rounded-full px-2 py-0.2">Star node</span>
                          </div>
                          <h4 className="font-serif font-semibold text-stone-800 text-sm">{mem.title}</h4>
                          <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">{mem.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Collections Segment with Memory Theater launchers */}
                  <div className="border-t border-[#E5E1D8] pt-8">
                    <h3 className="text-sm font-semibold tracking-wide uppercase text-stone-500 mb-4">Historical Story Collections</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {state.orbit.collections.map((coll) => (
                        <div key={coll.id} className="bg-white border border-[#E5E1D8] rounded-2xl p-5 flex gap-4 shadow-sm">
                          <img src={coll.coverUrl} alt="collection" className="w-20 h-20 object-cover rounded-xl border border-stone-200" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-serif text-sm font-semibold text-stone-850 truncate mb-1">{coll.name}</h4>
                            <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed mb-3">{coll.description}</p>
                            <div className="flex gap-2">
                              <button 
                                onClick={playTheaterSlide}
                                className="bg-[#FAF9F6] border border-[#C5A880] hover:bg-[#FAF2E6] text-[#1C1C1C] text-[10px] px-3.5 py-1.5 rounded-lg transition duration-300 font-medium"
                              >
                                Play Memory Theater Slide
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Star Memory Creator Side Panel */}
                <div id="memory-creation-sidepanel" className="bg-white border border-[#E5E1D8] p-6 rounded-[32px] shadow-sm flex flex-col gap-4">
                  <div>
                    <h4 className="text-[11px] uppercase font-mono tracking-widest text-[#C5A880] font-bold">Memory Engraver</h4>
                    <h3 className="font-serif text-base text-stone-800">Fuse a New Milestone</h3>
                    <p className="text-[10px] text-stone-500 mt-1">Upload couples media to lock memories forever in Orion orbit.</p>
                  </div>

                  <form onSubmit={handleAddNewCustomMemory} className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-stone-500 font-semibold font-mono">Memory Title</label>
                      <input 
                        type="text" 
                        required
                        value={newMemTitle}
                        onChange={(e) => setNewMemTitle(e.target.value)}
                        className="bg-[#FAF9F6] border border-[#E5E1D8] text-xs p-2.5 outline-none rounded-xl text-stone-850 font-medium focus:border-[#C5A880]"
                        placeholder="e.g. Dreamy Beachside Stargazing"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-stone-500 font-semibold font-mono">Date of Event</label>
                      <input 
                        type="date" 
                        required
                        value={newMemDate}
                        onChange={(e) => setNewMemDate(e.target.value)}
                        className="bg-[#FAF9F6] border border-[#E5E1D8] text-xs p-2 outline-none rounded-xl text-stone-700 font-medium"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-stone-500 font-semibold font-mono">Location Coordinates</label>
                      <input 
                        type="text" 
                        value={newMemLocation}
                        onChange={(e) => setNewMemLocation(e.target.value)}
                        className="bg-[#FAF9F6] border border-[#E5E1D8] text-xs p-2.5 outline-none rounded-xl text-stone-850 font-medium focus:border-[#C5A880]"
                        placeholder="e.g. Malibu Cliffs"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-stone-500 font-semibold font-mono">Narrative Reflection</label>
                      <textarea 
                        rows={2}
                        value={newMemDesc}
                        onChange={(e) => setNewMemDesc(e.target.value)}
                        className="bg-[#FAF9F6] border border-[#E5E1D8] text-xs p-2.5 outline-none rounded-xl text-stone-850 font-medium focus:border-[#C5A880] resize-none"
                        placeholder="Describe your feelings, smiles..."
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-stone-500 font-semibold font-mono">Tags (comma separated)</label>
                      <input 
                        type="text" 
                        value={newMemTags}
                        onChange={(e) => setNewMemTags(e.target.value)}
                        className="bg-[#FAF9F6] border border-[#E5E1D8] text-xs p-2.5 outline-none rounded-xl text-stone-850 font-medium focus:border-[#C5A880]"
                        placeholder="Stars, Beach, Romantic"
                      />
                    </div>

                    {/* Drag and Drop Zone */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-stone-500 font-semibold font-mono mb-0.5">Scrapbook Media Attachment</label>
                      <div 
                        onDragOver={handleMemDragOver}
                        onDragLeave={handleMemDragLeave}
                        onDrop={handleMemDrop}
                        className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition duration-300 relative ${
                          dragOver ? 'border-[#C5A880] bg-[#FAF2E6]' : 'border-[#E5E1D8] bg-[#FAF9F6] hover:border-stone-400'
                        }`}
                      >
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={handleMemFileSelect}
                        />
                        
                        {isMemUploading ? (
                          <div className="flex flex-col items-center gap-1.5 py-1">
                            <RotateCcw className="w-5 h-5 text-[#C5A880] animate-spin" />
                            <span className="text-[10px] text-[#C5A880] font-mono font-semibold">Crystallizing {uploadProgress}%</span>
                            <div className="w-[100px] h-1 bg-stone-100 rounded-full overflow-hidden mt-0.5">
                              <div className="h-full bg-[#C5A880] transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                            </div>
                          </div>
                        ) : uploadedImgUrl ? (
                          <div className="flex flex-col items-center gap-1">
                            <img src={uploadedImgUrl} alt="Romantic couple snap" className="h-20 w-full object-cover rounded-lg border border-stone-100" />
                            <span className="text-[9px] text-[#C5A880] font-mono font-bold uppercase tracking-wider mt-1">Image Fused Successfully ✓</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1.5 py-1 text-[#7C7872]">
                            <Upload className="w-5 h-5 text-stone-400" />
                            <p className="text-[10px] font-semibold text-stone-700">Drag & Drop Romantic Image</p>
                            <span className="text-[8px] text-stone-400 font-mono tracking-wide">Or click to select photo preset</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="bg-[#C5A880] text-white text-xs font-semibold py-2.5 rounded-xl hover:opacity-90 active:scale-98 transition shadow-xs flex items-center justify-center gap-1.5 mt-2"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Engrave into Orion History
                    </button>
                  </form>
                </div>

              </div>
            </motion.div>
          )}

          {/* VIEW 5: NOVA ROOM COMPANION */}
          {orbitTab === 'nova' && (
            <motion.div 
              key="nova"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 flex flex-col gap-8" 
              id="nova-view"
            >
              
              {/* Pet Companion Grand Park Frame - WIDESCREEN ASPECT RATIO */}
              <div className="w-full bg-[#FAF9F6] border border-[#E5E1D8] rounded-[40px] p-6 lg:p-8 flex flex-col items-center justify-between relative shadow-sm gap-6">
                <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#E5E1D8] pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#7C7872] border border-[#E5E1D8] px-3 py-1 bg-[#F5F2ED] rounded-full">
                      Bond tier {state.orbit.nova.bondLevel} companion
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-[#1C1C1C] mt-2 inline-flex items-center gap-2">
                       {state.orbit.nova.name}'s Grand Park Playground
                    </h3>
                  </div>
                  <div className="text-left sm:text-right font-mono">
                    <p className="text-xs text-stone-700 font-semibold">Growth Level: {state.orbit.nova.growthPoints}%</p>
                    <div className="w-32 bg-stone-200 h-1.5 rounded-full overflow-hidden mt-1 inline-block">
                      <div className="bg-yellow-500 h-full" style={{ width: `${state.orbit.nova.growthPoints}%` }} />
                    </div>
                  </div>
                </div>

                {/* proper 3D widescreen model of Nova */}
                <div className="w-full">
                  <NovaPet animationState={feedAnimation} />
                </div>
              </div>

              {/* Stats & Logs & Inventory grid below */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 1. Feeding / Play Inventory card */}
                <div className="bg-white border border-[#E5E1D8] rounded-[32px] p-6 flex flex-col gap-4 shadow-sm">
                  <div>
                    <h3 className="text-xs uppercase font-mono tracking-widest text-[#C5A880] font-bold">Locker Treats & Toys</h3>
                    <p className="text-[11px] text-stone-500 mt-0.5">Feed or play with Nova to boost happiness and growth points.</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 overflow-y-auto max-h-[220px]">
                    {state.orbit.nova.inventory.map((item) => (
                      <div 
                        key={item.id}
                        onClick={() => handleFeedNova('feed', item.id)}
                        className="bg-stone-50 border border-[#E5E1D8] p-3 rounded-2xl text-center cursor-pointer hover:border-[#1C1C1C] hover:bg-white transition duration-300 select-none shadow-3xs"
                      >
                        <span className="text-2xl block">{item.image}</span>
                        <p className="text-[10px] text-stone-700 font-semibold truncate mt-1">{item.name}</p>
                        <span className="text-[9px] font-mono text-[#7C7872] block mt-0.5">Qty {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Vital signs / progress bars card */}
                <div className="bg-white border border-[#E5E1D8] rounded-[32px] p-6 flex flex-col gap-4 shadow-sm">
                  <div>
                    <h3 className="text-xs uppercase font-mono tracking-widest text-[#C5A880] font-bold">Nova Vital Statistics</h3>
                    <p className="text-[11px] text-stone-500 mt-0.5">Maintain healthy attributes to earn Island structures tokens.</p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="bg-[#FAF9F6] p-3 rounded-xl border border-[#E5E1D8]">
                      <div className="flex justify-between text-xs mb-1 font-semibold text-stone-850">
                        <span>Hunger saturation</span>
                        <span className="text-teal-600">{state.orbit.nova.hunger}%</span>
                      </div>
                      <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-teal-500 h-full transition-all duration-300" style={{ width: `${state.orbit.nova.hunger}%` }} />
                      </div>
                    </div>

                    <div className="bg-[#FAF9F6] p-3 rounded-xl border border-[#E5E1D8]">
                      <div className="flex justify-between text-xs mb-1 font-semibold text-stone-850">
                        <span>Sleep Energy level</span>
                        <span className="text-amber-600">{state.orbit.nova.energy}%</span>
                      </div>
                      <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${state.orbit.nova.energy}%` }} />
                      </div>
                    </div>

                    <div className="bg-[#FAF9F6] p-3 rounded-xl border border-[#E5E1D8]">
                      <div className="flex justify-between text-xs mb-1 font-semibold text-stone-850">
                        <span>Connection Happiness</span>
                        <span className="text-pink-600">{state.orbit.nova.happiness}%</span>
                      </div>
                      <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-pink-500 h-full transition-all duration-300" style={{ width: `${state.orbit.nova.happiness}%` }} />
                      </div>
                    </div>

                    <div className="bg-[#FAF9F6] p-3 rounded-xl border border-[#E5E1D8]">
                      <div className="flex justify-between text-xs mb-1 font-semibold text-stone-850">
                        <span>Intelligence Index</span>
                        <span className="text-indigo-600">{state.orbit.nova.intelligence}%</span>
                      </div>
                      <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${state.orbit.nova.intelligence}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Companion logs diary */}
                <div className="bg-white border border-[#E5E1D8] rounded-[32px] p-6 flex flex-col gap-4 shadow-sm">
                  <div>
                    <h4 className="text-xs uppercase font-mono tracking-widest text-[#C5A880] font-bold">Nova Companion Logs</h4>
                    <p className="text-[11px] text-stone-500 mt-0.5">Diary of actions synced with collective milestones.</p>
                  </div>
                  <div className="flex flex-col gap-2 overflow-y-auto max-h-[220px] pr-1">
                    {state.orbit.nova.journal.map((j, i) => (
                      <div key={i} className="bg-[#FAF9F6] border border-[#E5E1D8] rounded-xl p-3 text-xs leading-relaxed text-stone-700 shadow-3xs">
                        <span className="text-[10px] text-stone-500 block mb-1 font-mono font-medium">{j.date} — Mood {j.mood}</span>
                        {j.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {/* VIEW 6: SHARED ISLAND SYSTEM */}
          {orbitTab === 'island' && (
            <motion.div 
              key="island"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 flex flex-col gap-6" 
              id="island-view"
            >
              <div className="flex justify-between items-center sm:items-start flex-col sm:flex-row gap-3 border-b border-[#E5E1D8] pb-4">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-[#1C1C1C]">The Secret SUSA Island Sandbox</h2>
                  <p className="text-xs text-stone-500 mt-1">Cooperative grid coordinate planner. Click any cell to build custom landmarks with coins.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white border border-[#E5E1D8] px-4 py-1.5 rounded-full text-xs font-mono font-bold text-stone-700 shadow-3xs">
                    🪙 Balance: <span className="text-yellow-600 font-extrabold">{state.orbit.island.coins}</span> Coins
                  </div>
                  <button 
                    onClick={triggerCoopBattle}
                    className="bg-[#FFF5F5] hover:bg-[#FFE5E5] text-red-700 border border-red-200 text-xs px-3.5 py-1.5 rounded-xl transition duration-300 flex items-center gap-1.5 shadow-3xs"
                  >
                    <Gamepad2 className="w-4 h-4 text-red-600 animate-pulse" /> Challenge Void Monsters
                  </button>
                </div>
              </div>

              {/* Strategy grid tile sandbox */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                {/* Flat coordinate base board */}
                <div className="xl:col-span-2 border border-[#E5E1D8] bg-[#FAF8F5] p-6 rounded-[28px] overflow-hidden relative shadow-sm">
                  <div className="grid grid-cols-5 gap-3 border-b border-r border-[#E5E1D8]/20 h-full">
                    {/* Loop grid cells */}
                    {Array.from({ length: 25 }).map((_, idx) => {
                      const cx = idx % 5;
                      const cy = Math.floor(idx / 5);
                      const structure = state.orbit.island.structures.find(s => s.x === cx && s.y === cy);

                      const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/;
                      const isSelected = buildingCoord?.x === cx && buildingCoord?.y === cy;

                      return (
                        <div 
                          key={idx} 
                          className={`aspect-square bg-white border flex flex-col items-center justify-center relative p-1 group cursor-pointer transition shadow-4xs rounded-2xl ${
                            isSelected 
                              ? 'border-yellow-500 bg-yellow-50/30' 
                              : 'border-[#E5E1D8]/80 hover:bg-[#FAF9F6]'
                          }`}
                          onClick={() => {
                            if (!structure) {
                              setBuildingCoord(isSelected ? null : { x: cx, y: cy });
                            } else {
                              alert(`💎 Landmark: ${structure.name}\n📍 Coordinates: [${structure.x}, ${structure.y}]\n📅 Built: ${structure.unlockedAt}\n🏛️ Status: Offline Preserved`);
                            }
                          }}
                        >
                          {structure ? (
                            <div className="text-center p-1">
                              <span className="text-3xl block animate-bounce mb-1">
                                {(() => {
                                  const m = structure.name.match(emojiRegex);
                                  return m ? m[0] : (structure.type === 'home' ? '🏚️' : structure.type === 'lighthouse' ? '💡' : '🏛️');
                                })()}
                              </span>
                              <span className="text-[9px] bg-[#1C1C1C] max-w-full truncate block px-2 py-0.5 text-white rounded font-mono font-medium">
                                {structure.name.replace(emojiRegex, '').trim()}
                              </span>
                            </div>
                          ) : isSelected ? (
                            <div className="text-center">
                              <span className="text-sm block text-yellow-600 animate-spin">🔨</span>
                              <span className="text-[8px] font-mono font-bold text-yellow-600">[{cx},{cy}]</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-stone-350 opacity-25 group-hover:opacity-100 transition font-mono">
                              [{cx},{cy}] Build
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Sidebar build controls & details */}
                <div className="flex flex-col gap-6">
                  {/* SUSA ISLAND MASTER BUILDER */}
                  {buildingCoord ? (
                    <div className="bg-white border-2 border-yellow-500 rounded-[28px] p-5 shadow-sm flex flex-col gap-4 animate-fadeIn">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-serif text-base font-bold text-[#1C1C1C]">Construct at [{buildingCoord.x}, {buildingCoord.y}]</h3>
                          <p className="text-[10.5px] text-stone-500 mt-0.5">Select a template below to add onto secret SUSA space.</p>
                        </div>
                        <button onClick={() => setBuildingCoord(null)} className="text-xs text-stone-400 hover:text-stone-850 font-semibold px-2 py-1 bg-stone-100 rounded-md">
                          ✕ Cancel
                        </button>
                      </div>

                      {/* Selectable Templates Scroll List */}
                      <div className="flex flex-col gap-2 overflow-y-auto max-h-[240px] pr-1">
                        {AVAILABLE_BUILDINGS.map((temp, index) => (
                          <div 
                            key={index}
                            onClick={() => setSelectedBuildingTemplateIdx(index)}
                            className={`p-2.5 rounded-xl border text-left cursor-pointer transition flex items-center gap-3 ${
                              selectedBuildingTemplateIdx === index 
                                ? 'border-[#1C1C1C] bg-stone-50/80 shadow-3xs' 
                                : 'border-stone-150 bg-white hover:border-stone-300'
                            }`}
                          >
                            <span className="text-2xl">{temp.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center">
                                <h4 className="text-[11.5px] font-bold text-stone-800 truncate">{temp.title}</h4>
                                <span className="text-[10px] font-mono font-extrabold text-yellow-600 shrink-0">🪙 {temp.cost}</span>
                              </div>
                              <p className="text-[10px] text-stone-500 truncate mt-0.5">{temp.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Custom Label Form Input */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono font-semibold text-stone-500 uppercase">Give it a sweet custom name (optional):</label>
                        <input 
                          type="text"
                          value={customBuildingName}
                          onChange={(e) => setCustomBuildingName(e.target.value)}
                          placeholder={AVAILABLE_BUILDINGS[selectedBuildingTemplateIdx].title}
                          className="bg-stone-50 border border-[#E5E1D8] p-2 text-xs outline-none rounded-xl focus:border-[#1C1C1C] font-semibold"
                        />
                      </div>

                      {/* Authorize Building transaction action container */}
                      {(() => {
                        const activeTemplate = AVAILABLE_BUILDINGS[selectedBuildingTemplateIdx];
                        const canAfford = state.orbit.island.coins >= activeTemplate.cost;
                        return (
                          <div className="mt-1 flex flex-col gap-2">
                            <button 
                              disabled={!canAfford}
                              onClick={() => {
                                const finalName = `${activeTemplate.emoji} ${customBuildingName.trim() || activeTemplate.title}`;
                                addIslandStructure(activeTemplate.type as any, finalName, buildingCoord.x, buildingCoord.y);
                                setBuildingCoord(null);
                                setCustomBuildingName('');
                              }}
                              className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-3xs font-mono uppercase ${
                                canAfford 
                                  ? 'bg-[#1C1C1C] hover:bg-stone-850 text-white' 
                                  : 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed'
                              }`}
                            >
                              🔨 Spend {activeTemplate.cost}🪙 & Build {activeTemplate.emoji}
                            </button>
                            {!canAfford && (
                              <p className="text-[10px] text-red-600 text-center font-medium animate-pulse">
                                ❌ You need {activeTemplate.cost - state.orbit.island.coins} more coins to build! Complete couple quests.
                              </p>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="bg-[#FAF9F6] border border-[#E5E1D8] rounded-[28px] p-5 text-center flex flex-col gap-2">
                      <h3 className="font-serif text-sm font-bold text-stone-700">🔨 Sandbox Master Builder</h3>
                      <p className="text-[11px] text-stone-500 leading-normal">
                        Select any coordinate cell `[X, Y]` inside the Secret SUSA Island matrix grid to build gorgeous landmarks!
                      </p>
                    </div>
                  )}

                  {/* Quests tracker */}
                  <div className="bg-white border border-[#E5E1D8] rounded-[28px] p-5 shadow-sm">
                    <h4 className="text-xs uppercase font-mono tracking-widest text-[#C5A880] mb-3 font-bold">Quest Board</h4>
                    <div className="flex flex-col gap-3">
                      {state.orbit.island.questStatus.map((q) => (
                        <div key={q.id} className="flex justify-between items-center text-xs border-b border-stone-100 pb-2">
                          <div>
                            <p className="font-semibold text-stone-800">{q.name}</p>
                            <p className="text-[10px] text-stone-500 mt-1 font-mono">Progress: {q.current}/{q.target}</p>
                          </div>
                          {q.completed ? (
                            <button 
                              onClick={() => completeIslandQuest(q.id)}
                              className="bg-yellow-500 hover:bg-yellow-600 text-black px-2.5 py-1 rounded-lg text-[10px] font-semibold transition"
                            >
                              Claim {q.rewardCoins}🪙
                            </button>
                          ) : (
                            <span className="text-stone-400 text-[10px] font-medium bg-stone-50 border border-stone-200 px-2 py-0.5 rounded-lg font-mono">Active</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* COOP BATTLE SIMULATOR DRAWER */}
              {battleActive && (
                <div className="bg-red-950/20 border border-red-500/30 p-6 rounded-3xl flex flex-col gap-4 mt-4">
                  <div className="flex justify-between items-center border-b border-red-900/40 pb-2">
                    <h3 className="font-serif text-red-200 font-bold flex items-center gap-2">
                      ⚔️ Cooperative Defense Battle active
                    </h3>
                    <button onClick={() => setBattleActive(false)} className="text-neutral-400 hover:text-white">✕ Close Board</button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center bg-black/40 p-4 border border-red-900/30 rounded-xl">
                      <p className="text-xs text-red-300">Void Shadow Monster HP</p>
                      <p className="text-2xl font-mono text-red-500 font-bold">{bossHp}%</p>
                    </div>
                    <div className="text-center bg-black/40 p-4 border border-red-900/30 rounded-xl">
                      <p className="text-xs text-blue-300">Companion Defense Shield</p>
                      <p className="text-2xl font-mono text-blue-400 font-bold">{ourShield}%</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleBattleAction('attack')}
                      disabled={bossHp <= 0}
                      className="bg-red-800 hover:bg-red-700 text-white rounded-lg py-2.5 text-xs font-semibold flex-1 disabled:opacity-50"
                    >
                      Fire Orion Beam Shard (-20 Coin)
                    </button>
                    <button 
                      onClick={() => handleBattleAction('repair')}
                      disabled={bossHp <= 0}
                      className="bg-blue-800 hover:bg-blue-700 text-white rounded-lg py-2.5 text-xs font-semibold flex-1 disabled:opacity-50"
                    >
                      Synchronize Resonance Shields
                    </button>
                  </div>

                  <div className="bg-black/50 p-4 rounded-xl max-h-40 overflow-y-auto font-mono text-xs text-red-300 flex flex-col gap-1.5">
                    {battleLog.map((log, i) => (
                      <p key={i}>{log}</p>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          { orbitTab === 'time' && (
            <motion.div 
              key="time"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 flex flex-col gap-6" 
              id="time-letter-locker"
            >
              <div>
                <h2 className="text-xl font-light text-[#1C1C1C]">Time & Future Letters Vault</h2>
                <p className="text-xs text-stone-500">Record reflections or voice files and lock them under secure dates to be opened in the future.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form to create letter / capsule */}
                <div className="bg-white border border-[#E5E1D8] p-5 rounded-3xl h-fit shadow-xs">
                  <h4 className="text-xs uppercase font-mono tracking-widest text-[#C5A880] mb-4 font-bold border-b border-stone-100 pb-2 flex items-center justify-between">
                    <span>Vault Creator</span>
                    <span className="text-[10px] text-stone-400 capitalize">Mode: {newFutureType}</span>
                  </h4>

                  {/* Mode Selector */}
                  <div className="grid grid-cols-2 gap-2 mb-4 bg-[#FAF9F6] p-1 rounded-xl">
                    <button 
                      type="button" 
                      onClick={() => setNewFutureType('letter')}
                      className={`text-xs py-1.5 rounded-lg transition-all font-semibold ${newFutureType === 'letter' ? 'bg-white text-stone-850 shadow-xs' : 'text-[#7C7872] hover:text-[#1C1C1C]'}`}
                    >
                      Love Letter
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setNewFutureType('voice')}
                      className={`text-xs py-1.5 rounded-lg transition-all font-semibold ${newFutureType === 'voice' ? 'bg-white text-rose-550 shadow-xs' : 'text-[#7C7872] hover:text-[#1C1C1C]'}`}
                    >
                      Voice Capsule
                    </button>
                  </div>

                  {newFutureType === 'letter' ? (
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      if (!newLetterTitle.trim()) return;
                      addFutureItem({
                        type: 'letter',
                        sender: 'User A',
                        unlockDate: newLetterUnlockDate,
                        title: newLetterTitle,
                        content: newLetterContent,
                      });
                      setNewLetterTitle('');
                      setNewLetterContent('');
                    }} className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-stone-500 font-medium font-mono">Letter Title</label>
                        <input 
                          type="text" 
                          required
                          className="bg-[#FAF9F6] border border-[#E5E1D8] text-xs text-stone-800 p-2.5 outline-none focus:border-[#C5A880] rounded-xl font-medium"
                          placeholder="e.g. Next Summer reflections"
                          value={newLetterTitle}
                          onChange={(e) => setNewLetterTitle(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-stone-500 font-mono font-medium">Unlock Date Target</label>
                        <input 
                          type="date" 
                          required
                          className="bg-[#FAF9F6] border border-[#E5E1D8] text-xs text-stone-700 p-2 outline-none rounded-xl font-medium"
                          value={newLetterUnlockDate}
                          onChange={(e) => setNewLetterUnlockDate(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-stone-500 font-semibold font-mono">Lock Content</label>
                        <textarea 
                          required
                          rows={3}
                          className="bg-[#FAF9F6] border border-[#E5E1D8] text-[#1C1C1C] text-xs p-2.5 outline-none focus:border-[#C5A880] rounded-xl resize-none font-medium"
                          placeholder="Write key message to be sealed..."
                          value={newLetterContent}
                          onChange={(e) => setNewLetterContent(e.target.value)}
                        />
                      </div>
                      <button type="submit" className="bg-[#C5A880] text-white font-semibold rounded-xl py-2.5 text-xs hover:opacity-90 transition shadow-xs">
                        Seal Love Letter
                      </button>
                    </form>
                  ) : (
                    // VOICE RECORDER CAPSULE CAPABILITIES
                    <div className="flex flex-col gap-4">
                      
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-stone-500 font-medium font-mono">Audio Capsule Title</label>
                        <input 
                          type="text" 
                          className="bg-[#FAF9F6] border border-[#E5E1D8] text-xs text-[#1C1C1C] p-2.5 outline-none focus:border-rose-300 rounded-xl font-semibold"
                          placeholder="e.g. Whispering heart reflections"
                          value={newLetterTitle}
                          onChange={(e) => setNewLetterTitle(e.target.value)}
                        />
                      </div>

                      <div className="flex flex-col gap-1 border-b border-stone-100 pb-3">
                        <label className="text-[10px] text-stone-500 font-mono font-medium">Unseal Date Target</label>
                        <input 
                          type="date" 
                          required
                          className="bg-[#FAF9F6] border border-[#E5E1D8] text-xs text-stone-700 p-2 outline-none rounded-xl font-medium"
                          value={newLetterUnlockDate}
                          onChange={(e) => setNewLetterUnlockDate(e.target.value)}
                        />
                      </div>

                      {/* Studio Simulation Deck */}
                      <div className="bg-stone-50 border border-dashed border-[#E5E1D8] p-4 rounded-2xl flex flex-col items-center gap-3 relative overflow-hidden">
                        
                        {isRecordingVoice ? (
                          <>
                            {/* pulsing glow red background */}
                            <div className="absolute inset-0 bg-rose-50/40 animate-pulse pointer-events-none" />
                            <div className="flex items-center gap-1.5 z-10">
                              <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping" />
                              <span className="text-[10px] text-red-600 font-mono font-bold tracking-widest">RECORDING LIVE</span>
                            </div>
                            
                            {/* Visual Simulated Oscilloscope wave */}
                            <div className="flex gap-1 items-end justify-center h-12 w-full px-4 z-10">
                              <span className="w-1.5 rounded-full bg-rose-400 animate-bounce h-8" style={{ animationDelay: '0.1s' }} />
                              <span className="w-1.5 rounded-full bg-rose-500 animate-bounce h-10" style={{ animationDelay: '0.4s' }} />
                              <span className="w-1.5 rounded-full bg-rose-600 animate-bounce h-6" style={{ animationDelay: '0.2s' }} />
                              <span className="w-1.5 rounded-full bg-rose-500 animate-bounce h-11" style={{ animationDelay: '0.5s' }} />
                              <span className="w-1.5 rounded-full bg-rose-400 animate-bounce h-8" style={{ animationDelay: '0.3s' }} />
                              <span className="w-1.5 rounded-full bg-rose-600 animate-bounce h-5" style={{ animationDelay: '0.1s' }} />
                              <span className="w-1.5 rounded-full bg-rose-500 animate-bounce h-12" style={{ animationDelay: '0.6s' }} />
                            </div>

                            <span className="text-xl font-mono text-stone-850 font-bold z-10 font-medium">
                              {Math.floor(voiceSecs / 60)}:{(voiceSecs % 60).toString().padStart(2, '0')}
                            </span>

                            <button 
                              type="button"
                              onClick={() => stopVoiceRecordingSimAndLock(newLetterTitle, newLetterUnlockDate)}
                              className="bg-red-600 hover:bg-red-700 text-white shadow-md text-xs px-4 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition z-10"
                            >
                              <Square className="w-3.5 h-3.5 fill-current" /> Stop & Seal Voice Node
                            </button>
                          </>
                        ) : (
                          <>
                            <Mic className="w-8 h-8 text-rose-400 animate-pulse mt-1" />
                            <div className="text-center">
                              <p className="text-[11px] font-semibold text-stone-700">Studio Voice Capsule Creator</p>
                              <span className="text-[9px] text-stone-400 block px-4 font-sans leading-relaxed">Record your real-time sighs, romantic speech, or song.</span>
                            </div>

                            <button 
                              type="button"
                              onClick={startVoiceRecordingSim}
                              className="bg-rose-505 hover:bg-rose-600 bg-rose-500 text-white text-xs px-4 py-2.5 rounded-xl font-bold shadow-sm transition flex items-center gap-1.5 mt-2"
                            >
                              <Mic className="w-3.5 h-3.5 fill-current" /> Tap to Record
                            </button>
                          </>
                        )}

                      </div>

                    </div>
                  )}
                </div>

                {/* Display pending timeline of unlocked/locked items */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                  <h4 className="text-xs uppercase font-mono tracking-widest text-[#7C7872] font-bold">Unopened / Opened Archives</h4>
                  {state.orbit.futureItems.map((f) => {
                    const isPassed = new Date(f.unlockDate) <= new Date('2026-06-18');
                    const isPlaying = activeVoicePlayingId === f.id;
                    return (
                      <div key={f.id} className="bg-white border border-[#E5E1D8] rounded-2xl p-5 flex items-start justify-between shadow-sm">
                        <div className="flex-1 mr-4">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${f.type === 'voice' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-700'}`}>
                              {f.type === 'voice' ? '🎙️ VOICE CAPSULE' : '✉️ LOVE LETTER'}
                            </span>
                            <span className="text-[10px] text-stone-400">Lock Target: {f.unlockDate}</span>
                          </div>
                          
                          <h4 className="text-sm font-semibold text-stone-800">{f.title}</h4>
                          
                          {f.isOpened ? (
                            f.type === 'voice' ? (
                              <div className="bg-[#FAF9F6] border border-[#E5E1D8] rounded-xl p-3 mt-3 flex items-center gap-3">
                                <button 
                                  onClick={() => simulateVoicePlayback(f.id)}
                                  className={`p-2.5 rounded-full ${isPlaying ? 'bg-rose-100 text-rose-600' : 'bg-[#FAF2E6] text-stone-700'} hover:scale-105 transition`}
                                >
                                  {isPlaying ? <Square className="w-4 h-4 fill-current animate-pulse" /> : <Volume2 className="w-4 h-4" />}
                                </button>
                                
                                <div className="flex-1 flex flex-col gap-1">
                                  {/* wave seek bar */}
                                  <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden relative">
                                    <div 
                                      className="h-full bg-rose-500 transition-all duration-300" 
                                      style={{ width: `${isPlaying ? voicePlaybackPercent : 0}%` }} 
                                    />
                                  </div>
                                  <div className="flex justify-between text-[9px] font-mono text-stone-400">
                                    <span>{isPlaying ? 'Playing capsule...' : 'Sensual Audio locked'}</span>
                                    <span>100% synced</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-stone-600 mt-2 leading-relaxed italic bg-[#FAF9F6] p-3 rounded-xl border border-stone-100 font-serif">"{f.content}"</p>
                            )
                          ) : (
                            <div className="flex items-center gap-1.5 mt-2 text-stone-400 text-xs">
                              <Lock className="w-3 h-3" />
                              <span>Status: Sealed in secure capsule vault.</span>
                            </div>
                          )}
                        </div>

                        {isPassed && !f.isOpened ? (
                          <button 
                            onClick={() => openFutureItem(f.id)}
                            className="bg-[#C5A880] hover:bg-[#AF9674] text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition"
                          >
                            Unseal Capsule
                          </button>
                        ) : f.isOpened ? (
                          <span className="text-green-600 text-xs font-semibold flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded">
                            Unsealed ✓
                          </span>
                        ) : (
                          <span className="text-stone-400 text-xs italic font-medium">Locked</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* VIEW: PASSION & PLAY CONNECTION ROOM */}
          {orbitTab === 'passion' && (
            <motion.div 
              key="passion"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 flex flex-col gap-8" 
              id="passion-and-play-view"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rose-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1 px-2.5 text-[10px] bg-rose-50 text-rose-600 font-bold uppercase tracking-wider rounded-lg animate-pulse">Intimate Secret</span>
                    <h2 className="text-xl font-light text-[#1C1C1C] flex items-center gap-1.5 font-serif">
                      <span>Passion & Play Room</span>
                    </h2>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5 font-medium">Explore spicy co-resilience matchers, secret flirty cards, and connection boosters designed exclusively for Saketh and Supriya.</p>
                </div>
                
                {/* Spark meter */}
                <div className="bg-rose-50 border border-rose-200/60 rounded-3xl p-4 flex items-center gap-4 shadow-sm md:w-80">
                  <Flame className="w-8 h-8 text-rose-500 fill-current animate-bounce" />
                  <div className="flex-1">
                    <div className="flex justify-between text-xs font-semibold text-rose-700 mb-1">
                      <span>Intimate Spark Connection</span>
                      <span>Level {passionSparkLevel}/10</span>
                    </div>
                    {/* Progress Slider bar */}
                    <div className="h-2 bg-rose-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-full transition-all duration-300" style={{ width: `${passionSparkLevel * 10}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                {/* Col 1 & 2: Desire Alignment list and coupon slots */}
                <div className="xl:col-span-2 flex flex-col gap-8">
                  
                  {/* Couples desire board */}
                  <div className="bg-white border border-[#E5E1D8] p-6 rounded-[32px] shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="font-serif text-base font-semibold text-stone-800">Private Desire Alignment Checklist</h3>
                        <p className="text-xs text-stone-500 font-medium">Cross-reference flirty and naughty desires. Aligned items highlight when both of you share the wish.</p>
                      </div>
                      <span className="text-[10px] bg-[#FAF9F6] border border-[#E5E1D8] px-2.5 py-1 rounded-full font-semibold font-mono text-stone-600">Secure Vault Link</span>
                    </div>

                    <div className="flex flex-col gap-3">
                      {couplesDesires.map((des) => {
                        const isCoResonant = des.activeByA && des.activeByB;
                        return (
                          <div 
                            key={des.id} 
                            className={`flex flex-col md:flex-row md:items-center justify-between p-3.5 rounded-2xl border transition duration-300 ${
                              isCoResonant 
                                ? 'bg-rose-50/50 border-rose-200 shadow-xs' 
                                : 'bg-[#FAF9F6] border-[#E5E1D8] hover:border-stone-300'
                            }`}
                          >
                            <span className={`text-xs font-semibold ${isCoResonant ? 'text-rose-950 font-bold' : 'text-stone-850'}`}>
                              {des.label}
                            </span>

                            <div className="flex items-center gap-4 mt-2.5 md:mt-0">
                              {/* Saketh check */}
                              <button 
                                onClick={() => toggleDesireCheck(des.id, 'User A')}
                                className={`text-[10px] px-3 py-1 rounded-full border transition font-bold ${
                                  des.activeByA 
                                    ? 'bg-stone-850 text-white border-stone-850' 
                                    : 'bg-white text-stone-400 border-stone-200'
                                }`}
                              >
                                Saketh {des.activeByA ? '✓' : ''}
                              </button>

                              {/* Supriya check */}
                              <button 
                                onClick={() => toggleDesireCheck(des.id, 'User B')}
                                className={`text-[10px] px-3 py-1 rounded-full border transition font-bold ${
                                  des.activeByB 
                                    ? 'bg-rose-500 text-white border-rose-500' 
                                    : 'bg-white text-stone-400 border-stone-200'
                                }`}
                              >
                                Supriya {des.activeByB ? '✓' : ''}
                              </button>

                              {isCoResonant && (
                                <span className="text-[10px] font-bold text-rose-600 bg-rose-100/80 p-1 px-2.5 rounded-lg flex items-center gap-1 animate-pulse font-mono tracking-wider">
                                  ⚡ MATCHED
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Add Custom Desire form */}
                    <div className="mt-5 pt-4 border-t border-stone-100 flex gap-2">
                      <input 
                        type="text" 
                        value={newCustomDesire}
                        onChange={(e) => setNewCustomDesire(e.target.value)}
                        placeholder="Add private cozy/naughty desire (e.g. Kiss in the warm spring rain)..."
                        className="flex-1 bg-[#FAF9F6] border border-[#E5E1D8] p-2.5 text-xs text-[#1C1C1C] outline-none rounded-xl focus:border-rose-400 font-medium"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddCustomDesire();
                        }}
                      />
                      <button 
                        onClick={handleAddCustomDesire}
                        className="bg-stone-850 hover:bg-[#1C1C1C] text-white text-xs px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Inject
                      </button>
                    </div>
                  </div>

                  {/* Fire heart Naughty Redeem Code Center */}
                  <div className="bg-white border border-[#E5E1D8] p-6 rounded-[32px] shadow-sm flex flex-col gap-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <Gift className="w-5 h-5 text-rose-500" />
                        <h3 className="font-serif text-lg font-bold text-stone-850">Saketh & Supriya's Naughty Redeem Codes</h3>
                      </div>
                      <p className="text-xs text-stone-500 mt-1">
                        Surprise each other! Create custom romantic passcode redeem keys. Reveal flirty actions when your partner claims them!
                      </p>
                    </div>

                    {/* Left & Right: Create and Redeem Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-stone-100 pb-5">
                      {/* Form 1: Creator of Codes */}
                      <form onSubmit={handleCreateNaughtyCode} className="flex flex-col gap-3.5 bg-[#FAF9F6] p-4.5 rounded-2xl border border-[#E5E1D8]">
                        <h4 className="text-[11px] font-mono tracking-widest font-bold uppercase text-stone-700 flex items-center gap-1">
                          <Plus className="w-3.5 h-3.5 text-stone-500" /> Create Naughty Code Card
                        </h4>
                        
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-mono font-bold text-stone-500 uppercase">Secret passcode keyword</label>
                          <input 
                            type="text"
                            value={newCodeWord}
                            onChange={(e) => setNewCodeWord(e.target.value)}
                            placeholder="e.g. MORNING_CUDDLE_5"
                            className="bg-white border border-stone-200 rounded-xl p-2 text-xs font-semibold uppercase outline-none focus:border-rose-400 placeholder:normal-case font-mono"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-mono font-bold text-stone-500 uppercase">Private flirty reward / debt</label>
                          <textarea 
                            rows={2}
                            value={newCodeReward}
                            onChange={(e) => setNewCodeReward(e.target.value)}
                            placeholder="e.g. Supriya gets to rule Saketh's laptop and files for 1 hour while drinking wine..."
                            className="bg-white border border-stone-200 rounded-xl p-2 text-xs font-medium outline-none focus:border-rose-400 resize-none h-14"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-mono font-bold text-stone-500 uppercase">Written By</label>
                            <select 
                              value={newCodeCreator} 
                              onChange={(e) => {
                                const val = e.target.value as 'Saketh' | 'Supriya';
                                setNewCodeCreator(val);
                                setNewCodeFor(val === 'Saketh' ? 'Supriya' : 'Saketh');
                              }}
                              className="bg-white border border-stone-200 rounded-xl p-2 text-xs font-semibold outline-none"
                            >
                              <option value="Saketh">Saketh</option>
                              <option value="Supriya">Supriya</option>
                            </select>
                          </div>
                          
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-mono font-bold text-stone-500 uppercase font-semibold">For Partner</label>
                            <div className="bg-white border border-stone-200 rounded-xl p-2 text-xs font-bold text-stone-700 text-center uppercase tracking-wide">
                              {newCodeFor}
                            </div>
                          </div>
                        </div>

                        <button 
                          type="submit"
                          className="w-full bg-[#1C1C1C] hover:bg-stone-800 text-white font-mono text-[10px] py-2 rounded-xl transition font-bold"
                        >
                          Generate & Deploy Code
                        </button>
                      </form>

                      {/* Form 2: Redemption Vault */}
                      <div className="flex flex-col gap-4 bg-rose-50/20 border border-rose-100 p-4.5 rounded-2xl">
                        <div>
                          <h4 className="text-[11px] font-mono tracking-widest font-bold uppercase text-rose-700 flex items-center gap-1">
                            <Key className="w-3.5 h-3.5 text-rose-400" /> Redemption Terminal
                          </h4>
                          <p className="text-[10px] text-stone-500 mt-0.5">
                            Enter the secret Code keyword given to you by your partner to verify and instant redeem it!
                          </p>
                        </div>

                        <form onSubmit={handleRedeemCodeWord} className="flex flex-col gap-3">
                          <input 
                            type="text"
                            value={inputCodeWord}
                            onChange={(e) => setInputCodeWord(e.target.value)}
                            placeholder="Enter code here... e.g. BACKRUB30"
                            className="bg-white border border-rose-200 rounded-xl p-2.5 text-xs text-center font-bold uppercase tracking-wider outline-none focus:border-rose-400 font-mono"
                          />
                          <button 
                            type="submit"
                            className="bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-mono font-bold py-2.5 rounded-xl transition shadow-xs"
                          >
                            🔓 Verify & Claim Intimacy Reward
                          </button>
                        </form>

                        {codeErrorMessage && (
                          <div className="p-2 bg-amber-50 text-amber-800 rounded-lg text-[10px] font-semibold text-center border border-amber-100 mt-1">
                            {codeErrorMessage}
                          </div>
                        )}

                        {/* Interactive animation frame inside terminal */}
                        {showHeartCelebration && (
                          <div className="bg-rose-50 border border-rose-300 p-3 rounded-xl text-center flex flex-col items-center gap-1 animate-bounce">
                            <span className="text-xl animate-pulse">🎉 ❤️ 🥂</span>
                            <span className="text-[10px] uppercase font-mono tracking-wider text-rose-700 font-bold">Successfully Redeemed!</span>
                            <p className="text-xs text-rose-950 font-medium italic mt-1 font-serif">"{lastRedeemedReward}"</p>
                            <button 
                              onClick={() => setShowHeartCelebration(false)} 
                              className="text-[9px] text-stone-500 hover:text-stone-800 border-t border-stone-200/50 pt-1 mt-1 w-full"
                            >
                              Dismiss Celebration
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Active Registry Lists */}
                    <div>
                      <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-stone-600 mb-3 flex items-center gap-1.5">
                        <span>📋 Active Code Database Ledger</span>
                        <span className="text-[9px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-mono font-bold uppercase">SECURED</span>
                      </h4>

                      <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                        {naughtyCodes.map((codeItem) => {
                          const isClaimed = codeItem.status === 'redeemed';
                          return (
                            <div 
                              key={codeItem.id} 
                              className={`p-3.5 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all ${
                                isClaimed 
                                  ? 'bg-stone-50 border-[#E5E1D8] text-stone-400 grayscale line-through' 
                                  : 'bg-white border-[#E5E1D8]/80 hover:border-rose-200 shadow-3xs'
                              }`}
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                                    {codeItem.code}
                                  </span>
                                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase ${
                                    isClaimed ? 'bg-stone-200 text-stone-500' : 'bg-rose-50 text-rose-600'
                                  }`}>
                                    {isClaimed ? 'Claimed ✓' : 'ACTIVE'}
                                  </span>
                                </div>
                                <p className="text-xs mt-1.5 text-stone-700 leading-relaxed font-medium">
                                  Reward: <span className="font-semibold text-stone-800 font-serif">"{codeItem.reward}"</span>
                                </p>
                              </div>

                              <div className="text-left sm:text-right font-mono text-[9px] text-[#7C7872] shrink-0 border-t sm:border-t-0 sm:border-l border-stone-200/50 pt-2 sm:pt-0 sm:pl-3">
                                <div>Created By: <span className="font-bold text-stone-700">{codeItem.createdBy}</span></div>
                                <div>For Partner: <span className="font-bold text-stone-700">{codeItem.createdFor}</span></div>
                                {isClaimed && (
                                  <div className="text-[8px] mt-0.5 font-bold text-rose-600">Redeemed At: {codeItem.redeemedAt}</div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Coupon card stack */}
                  <div className="bg-white border border-[#E5E1D8] p-6 rounded-[32px] shadow-sm">
                    <div className="mb-4">
                      <h3 className="font-serif text-base font-semibold text-stone-800">Sensual Love Coupons</h3>
                      <p className="text-xs text-stone-500 font-medium">Each partner has flirty coupons ready to redeem at any moment. Tap to claim or initiate!</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {couplesCoupons.map((coup) => {
                        const isRedeemed = coup.status === 'redeemed';
                        return (
                          <div 
                            key={coup.id} 
                            className={`border rounded-2xl p-4 flex flex-col justify-between gap-3 relative overflow-hidden transition duration-300 ${
                              isRedeemed 
                                ? 'bg-[#FAF9F6]/80 border-dashed border-stone-200 grayscale text-stone-500' 
                                : 'bg-gradient-to-br from-white via-[#FAFBF8] to-rose-50/15 border-rose-100 hover:border-rose-300 shadow-xs'
                            }`}
                          >
                            <div>
                              <div className="flex justify-between items-center text-[10px] font-mono font-bold uppercase mb-1">
                                <span className={isRedeemed ? 'text-stone-400' : 'text-rose-600'}>Given by {coup.owner}</span>
                                <span className={isRedeemed ? 'text-stone-400' : 'text-yellow-600 font-semibold'}>
                                  {isRedeemed ? 'Redeemed ✓' : 'READY TO PLAY'}
                                </span>
                              </div>
                              <h4 className="font-serif text-sm font-semibold text-stone-800">{coup.title}</h4>
                              <p className="text-[11px] text-[#7C7872] leading-relaxed mt-1.5">{coup.description}</p>
                            </div>

                            <button 
                              onClick={() => redeemLoveCoupon(coup.id)}
                              className={`w-full py-1.5 rounded-xl text-[10px] font-mono font-bold transition-all relative z-10 ${
                                isRedeemed 
                                  ? 'bg-[#FAF9F6] border border-stone-200 text-stone-400 hover:bg-stone-105' 
                                  : 'bg-rose-500 hover:bg-rose-600 text-white shadow-xs'
                              }`}
                            >
                              {isRedeemed ? 'Revoke / Reinstate Coupon' : 'Tap to Redeem Coupon'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                 {/* Col 3: Interactive Couples Play Cabin */}
                 <div className="bg-white border border-[#E5E1D8] p-6 rounded-[32px] shadow-sm flex flex-col gap-6">
                   <div className="border-b border-rose-50 pb-2">
                     <h4 className="text-[11px] uppercase font-mono tracking-widest text-[#A68F6C] font-bold mb-1">Playground Cabin</h4>
                     <h3 className="font-serif text-base text-stone-850 font-semibold">Interact & Level Up</h3>
                     <p className="text-[11px] text-stone-500 font-medium">Turn-based mini games built to stimulate funny and sincere conversations.</p>
                   </div>

                   {/* GAME 1: DUO MEMORY MATCHING */}
                   <div className="bg-stone-50 border border-stone-105 p-4 rounded-2xl flex flex-col gap-3">
                     <div className="flex justify-between items-center bg-[#FAF9F6] p-2 rounded-xl border border-stone-150">
                       <span className="text-[10px] font-mono font-bold text-stone-700">🧩 MEMORY FLIPPER</span>
                       <span className="text-[9px] font-mono font-bold text-rose-600">Moves: {matchGameMoves}</span>
                     </div>
                     
                     {matchGameWon ? (
                       <div className="text-center py-6 flex flex-col items-center gap-2 bg-rose-50/50 border border-dashed border-rose-200 rounded-xl">
                         <span className="text-2.5xl">🎉</span>
                         <span className="text-xs font-serif font-bold text-rose-950">Intimate Sync Completed!</span>
                         <p className="text-[10.5px] text-stone-600 px-3">Saketh & Supriya are fully in sync! Spark level updated.</p>
                         <button 
                           onClick={initMatchGame}
                           className="bg-rose-500 hover:bg-rose-600 text-white font-semibold text-[10px] px-3.5 py-1.5 rounded-lg transition-all mt-1"
                         >
                           Play Again
                         </button>
                       </div>
                     ) : (
                       <div className="grid grid-cols-4 gap-2">
                         {matchCards.map((card) => {
                           const isShown = card.isFlipped || card.isMatched;
                           return (
                             <div 
                               key={card.id}
                               onClick={() => handleCardClick(card.id)}
                               className={`h-11 rounded-lg flex items-center justify-center text-base cursor-pointer transition-all duration-300 font-bold select-none ${
                                 isShown 
                                   ? 'bg-white border-2 border-rose-400 rotate-y-180' 
                                   : 'bg-gradient-to-br from-rose-400 to-[#C5A880] text-white hover:scale-105 border border-rose-400/20'
                               }`}
                             >
                               {isShown ? card.symbol : '❓'}
                             </div>
                           );
                         })}
                       </div>
                     )}
                   </div>

                   {/* GAME 2: DICE ROULETTE */}
                   <div className="bg-[#FAF8F5] border border-stone-200 p-4 rounded-2xl flex flex-col gap-4">
                     <div className="flex justify-between items-center text-[10px] font-mono font-bold">
                       <span className="text-[#1C1C1C]">🎲 AFFECTION ROULETTE</span>
                       <span className={`px-2 py-0.5 rounded uppercase ${
                         diceRollMode === 'truth' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'
                       }`}>
                         {diceRollMode === 'truth' ? 'Truth Mode' : 'Dare Mode'}
                       </span>
                     </div>

                     <div className="bg-white border border-stone-150 p-4 rounded-xl min-h-[90px] flex flex-col justify-center text-center relative overflow-hidden">
                       {isDiceSpun ? (
                         <div className="flex flex-col items-center gap-2">
                           <span className="animate-spin text-xl">🎲</span>
                           <span className="text-[10px] font-mono text-rose-500 font-bold animate-pulse">Rolling dice...</span>
                         </div>
                       ) : (
                         <p className="text-xs text-stone-850 leading-relaxed italic font-medium">
                           "{selectedIntimatePrompt}"
                         </p>
                       )}
                     </div>

                     <div className="flex gap-2">
                       <button
                         type="button"
                         onClick={() => {
                           setDiceRollMode('truth');
                           spinIntimatePromptDice();
                         }}
                         disabled={isDiceSpun}
                         className="flex-1 bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-[10px] font-mono font-bold py-2 rounded-xl transition-all"
                       >
                         🔮 Spin Truth
                       </button>
                       <button
                         type="button"
                         onClick={() => {
                           setDiceRollMode('dare');
                           spinIntimatePromptDice();
                         }}
                         disabled={isDiceSpun}
                         className="flex-1 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[10px] font-mono font-bold py-2 rounded-xl transition-all"
                       >
                         🔥 Spin Dare
                       </button>
                     </div>

                     <div className="flex flex-col gap-1.5 pt-2 border-t border-stone-150">
                       <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-stone-500">Log Interactive Completion</span>
                       <button
                         onClick={() => {
                           setPassionSparkLevel(p => Math.min(10, p + 1));
                           const reactions = ["Whispered sweetly 🤫", "Hedged cozy closeness 🍵", "Tender kiss ❤️", "Deep laugh 😂"];
                           setSelectedIntimatePrompt(`Completed challenge! ${reactions[Math.floor(Math.random() * reactions.length)]}`);
                         }}
                         className="w-full bg-[#FAF9F6] border border-[#C5A880] text-stone-700 text-[10px] font-sans font-bold py-1.5 rounded-lg hover:bg-[#C5A880] hover:text-white transition-all duration-300"
                       >
                         ✓ We Finished This Challenge! (+1 Spark Point)
                       </button>
                     </div>
                   </div>

                   <div className="bg-stone-50 border border-stone-105 p-3.5 rounded-xl text-[10px] text-stone-500 leading-relaxed">
                     <span className="font-bold text-stone-700 block mb-0.5">🎮 Active Mechanics:</span>
                     Completing the matching flipper game or achieving checkout goals adds dynamic logs to your SUSA orbital profile and increments the spark meter!
                   </div>
                 </div>

              </div>
            </motion.div>
          )}

          {/* VIEW 9: SUPABASE SETTINGS & DURABLE VAULT */}
          {orbitTab === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 flex flex-col gap-8" 
              id="supabase-settings-view"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#E5E1D8] pb-4">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-[#1C1C1C]">Supabase Cloud Bucket Storage Manager</h2>
                  <p className="text-xs text-stone-500 mt-1">Monitor real-time remote media buckets, storage limits, and safely download backups.</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={loadStorageUsage}
                    disabled={isLoadingStorage}
                    className="bg-white hover:bg-stone-50 border border-[#E5E1D8] text-stone-700 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-sm font-semibold disabled:opacity-50"
                  >
                    {isLoadingStorage ? 'Loading...' : '🔄 Refresh'}
                  </button>
                  <button 
                    onClick={handleDownloadBackup}
                    className="bg-[#1C1C1C] hover:bg-stone-850 text-white text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-sm font-semibold"
                  >
                    <Download className="w-4 h-4" /> Download Full Orbit Backup
                  </button>
                </div>
              </div>

              {/* Grid 2 Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Col 1 & 2: Storage Buckets Visualizations & Usage status */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                  
                  {/* Stargazing Vault Indicator panel with blinking notifications */}
                  <div className="bg-white border border-[#E5E1D8] p-6 rounded-[32px] shadow-sm flex flex-col gap-5">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-stone-850 flex items-center gap-2 text-stone-800">
                        <Database className="w-5 h-5 text-purple-650" /> Supabase Storage Allocation Gauge
                      </h3>
                      <p className="text-xs text-stone-500 mt-1">
                        SUSA uses Supabase buckets to persist shared couple photos, high-fidelity gallery media, voice journals, and constellation maps.
                      </p>
                    </div>

                    {/* Progress slider visually demonstrating used bucket spaces */}
                    <div className="p-4 bg-stone-50 border border-stone-150 rounded-2xl flex flex-col gap-3">
                      <div className="flex justify-between items-center text-xs font-mono font-bold">
                        <span className="text-stone-600">ACTIVE STORAGE BUCKET: <span className="text-[#1C1C1C]">stargazing-media-locker</span></span>
                        <span className={isStorageAlmostFull ? 'text-red-650 animate-pulse' : 'text-stone-700'}>
                          {storagePercent.toFixed(1)}% OCCUPIED
                        </span>
                      </div>

                      {/* Visual gauge bar layout */}
                      <div className="w-full h-4 bg-stone-200 rounded-full overflow-hidden relative border border-stone-300 shadow-inner">
                        <div 
                          className={`h-full transition-all duration-500 rounded-full ${
                            isStorageAlmostFull 
                              ? 'bg-gradient-to-r from-red-500 via-amber-500 to-red-650 animate-pulse' 
                              : 'bg-gradient-to-r from-purple-500 to-emerald-500'
                          }`}
                          style={{ width: `${storagePercent}%` }}
                        />
                      </div>

                      {/* Metrics checklist */}
                      <div className="grid grid-cols-3 gap-1 pt-1.5 text-center text-xs font-mono">
                        <div className="bg-white border border-stone-150 p-2 rounded-xl">
                          <span className="text-[10px] text-stone-400 block uppercase">Total Space Spent</span>
                          <span className="text-[11.5px] font-bold text-stone-800">{storageUsed.toFixed(1)} MB</span>
                        </div>
                        <div className="bg-white border border-stone-150 p-2 rounded-xl">
                          <span className="text-[10px] text-stone-400 block uppercase">Remaining Limit</span>
                          <span className="text-[11.5px] font-bold text-stone-800">{(STORAGE_LIMIT - storageUsed).toFixed(1)} MB</span>
                        </div>
                        <div className="bg-white border border-stone-150 p-2 rounded-xl">
                          <span className="text-[10px] text-stone-400 block uppercase">Max Allocation Limit</span>
                          <span className="text-[11.5px] font-bold text-stone-800">{STORAGE_LIMIT.toFixed(1)} MB</span>
                        </div>
                      </div>
                    </div>

                    {/* Highly descriptive blinking website alert warning inside setting tab! */}
                    {isStorageAlmostFull && (
                      <div className="bg-red-50 border-2 border-dashed border-red-350 p-4.5 rounded-2xl flex items-start gap-3.5 animate-fadeIn">
                        <AlertTriangle className="w-6 h-6 text-red-650 shrink-0 mt-0.5 animate-bounce" />
                        <div className="flex-1 text-xs">
                          <h4 className="font-bold text-red-950 uppercase tracking-wide font-sans">⚠️ Space Limit Danger Notice!</h4>
                          <p className="text-red-900 leading-relaxed mt-1 font-medium select-none">
                            Your Supabase media storage vault has reached <strong>{storagePercent.toFixed(1)}% ({storageUsed.toFixed(1)} MB)</strong>. 
                            If you cross the 1 GB free-tier allocation cap, further video uploads, sketches, memories engraving, and Nova journals will be temporarily congested.
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button 
                              onClick={handleDownloadBackup}
                              className="bg-white hover:bg-red-100/50 text-red-900 font-semibold border border-red-200 text-[10px] px-3 py-1.5 rounded-lg transition"
                            >
                              💾 Download Local Backup First
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Supabase Technical Configuration Guides */}
                  <div className="bg-white border border-[#E5E1D8] p-6 rounded-[32px] shadow-sm flex flex-col gap-4">
                    <div>
                      <h3 className="font-serif text-base font-bold text-stone-850">Cloud Integration Credentials</h3>
                      <p className="text-xs text-stone-500 mt-1">Current Supabase configuration from environment variables.</p>
                    </div>

                    <div className="flex flex-col gap-3 text-xs">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono font-bold text-stone-450">SUPABASE_PROJECT_URL</label>
                        <div className="bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-mono text-stone-605 select-all truncate">
                          {import.meta.env.VITE_SUPABASE_URL || 'Not configured'}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono font-bold text-stone-450">SUPABASE_ANON_KEY (CLIENT PUBLIC KEY)</label>
                        <div className="bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-mono text-stone-605 select-all truncate">
                          {import.meta.env.VITE_SUPABASE_ANON_KEY ? import.meta.env.VITE_SUPABASE_ANON_KEY.slice(0, 50) + '...' : 'Not configured'}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Col 3: Backup Status Registry & Restoration Information */}
                <div className="flex flex-col gap-6">
                  
                  {/* Backup Card */}
                  <div className="bg-gradient-to-br from-[#1C1C1C] to-stone-800 text-white border border-[#1C1C1C] p-6 rounded-[32px] shadow-sm flex flex-col gap-4">
                    <div className="border-b border-stone-700 pb-3">
                      <span className="text-[9px] uppercase font-mono tracking-widest text-[#C5A880] font-bold">Secure backup center</span>
                      <h3 className="font-serif text-base font-bold text-stone-100 mt-1 flex items-center gap-1.5">
                        <Download className="w-4 h-4 text-[#C5A880]" /> SUSA State Archiver
                      </h3>
                      <p className="text-[11px] text-stone-400 mt-1 leading-snug">
                        Export all your private letters, custom naughty codes, SUSA island coordinates, and Nova pet metrics in a single encryption-ready JSON.
                      </p>
                    </div>

                    <div className="flex flex-col gap-2.5 text-xs text-stone-300">
                      <div className="flex justify-between items-center font-mono">
                        <span>Database Engines:</span>
                        <span className="font-semibold text-white">Supabase Simulators</span>
                      </div>
                      <div className="flex justify-between items-center font-mono">
                        <span>Format:</span>
                        <span className="font-semibold text-white">JSON Document</span>
                      </div>
                      <div className="flex justify-between items-center font-mono">
                        <span>Locker Owners:</span>
                        <span className="font-semibold text-stone-200">Saketh & Supriya</span>
                      </div>
                    </div>

                    <button 
                      onClick={handleDownloadBackup}
                      className="w-full bg-[#C5A880] hover:opacity-95 text-white font-semibold text-xs py-2.5 rounded-xl transition duration-300 flex items-center justify-center gap-1 shadow-xs"
                    >
                      🎁 Download Encoded Backup Document
                    </button>
                    
                    <div className="bg-stone-850 p-3 rounded-xl border border-stone-700 text-[10px] text-stone-400 leading-normal">
                      <strong>✅ Supabase Sync Guarantee:</strong> State downloads occur directly in the browser runtime environment using client-side buffers. Zero cloud assets are exposed to unintended network pathways.
                    </div>
                  </div>

                  {/* Restoration guide */}
                  <div className="bg-white border border-[#E5E1D8] p-5 rounded-[28px] shadow-sm flex flex-col gap-3">
                    <h4 className="text-[11px] uppercase font-mono tracking-widest text-[#C5A880] font-bold">State Restoration</h4>
                    <p className="text-[11px] text-stone-500 leading-normal">
                      SUSA backups can be easily loaded back into the application if local cache or database profiles require restoration.
                    </p>
                    <div className="border border-stone-200 rounded-xl p-3 bg-[#FAF9F6] text-center border-dashed mt-1 relative">
                      <input 
                        type="file"
                        accept=".json"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const r = new FileReader();
                          r.onload = (event) => {
                            try {
                              const parsed = JSON.parse(event.target?.result as string);
                              if (parsed && parsed.owner === "Saketh & Supriya") {
                                if (parsed.passion?.customNaughtyCodes) {
                                  setNaughtyCodes(parsed.passion.customNaughtyCodes);
                                }
                                if (parsed.passion?.sparkLevel) {
                                  setPassionSparkLevel(parsed.passion.sparkLevel);
                                }
                                alert("🎉 Success! Saketh & Supriya's SUSA backup restored safely. Custom naughty codes, spark levels, and desire settings updated.");
                              } else {
                                alert("❌ Invalid format! This file does not belong to Saketh & Supriya.");
                              }
                            } catch (error) {
                              alert("❌ Error parsing the state file document.");
                            }
                          };
                          r.readAsText(file);
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <span className="text-[11px] font-bold text-[#1C1C1C] block">📂 Upload Backup file</span>
                      <span className="text-[9px] text-[#7C7872] block mt-1">Accepts SUSA backup .json files</span>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          )}

          {/* VIEW 8: RELATIONSHIP STATS DASHBOARD */}
          {orbitTab === 'statistics' && (
            <motion.div 
              key="statistics"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 flex flex-col gap-8" 
              id="statistics-view"
            >
              <div className="flex justify-between items-center text-sm z-30">
                <div>
                  <h2 className="text-xl font-light text-[#1C1C1C]">Orion Growth Analytics</h2>
                  <p className="text-xs text-stone-500">Storytelling annual growth metrics of your digital relationship.</p>
                </div>
                <button 
                  onClick={handleFetchAiRecap}
                  disabled={recapLoading}
                  className="bg-white hover:bg-stone-50 border border-[#C5A880] text-stone-800 text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all duration-300 disabled:opacity-50 shadow-xs"
                >
                  <Sparkles className="w-4 h-4 text-[#C5A880] animate-pulse" /> 
                  {recapLoading ? 'Sifting logs...' : 'Generate AI Weekly Recap'}
                </button>
              </div>

              {/* Weekly recap text display banner */}
              {weeksRecapText && (
                <div className="bg-[#FAF2E6] border border-[#C5A880]/30 p-5 rounded-2xl relative text-xs leading-relaxed text-stone-800 shadow-sm animate-pulse">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[#AF9674] block mb-2 font-bold">Orion Intelligence Story</span>
                  <p>{weeksRecapText}</p>
                  <button onClick={() => setWeeksRecapText('')} className="absolute top-3 right-3 text-stone-500 hover:text-stone-800">✕</button>
                </div>
              )}

              {/* Statistics Grid widgets mapping details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white border border-[#E5E1D8] p-5 rounded-2xl text-center shadow-xs">
                  <span className="text-stone-500 text-[10px] uppercase font-mono tracking-wider font-semibold">Eternal messages exchange</span>
                  <p className="text-2xl font-mono font-bold text-amber-800 mt-2">1,540</p>
                </div>

                <div className="bg-white border border-[#E5E1D8] p-5 rounded-2xl text-center shadow-xs">
                  <span className="text-stone-500 text-[10px] uppercase font-mono tracking-wider font-semibold animate-pulse">Creative Memories star nodes</span>
                  <p className="text-2xl font-mono font-bold text-purple-700 mt-2">{state.orbit.memories.length}</p>
                </div>

                <div className="bg-white border border-[#E5E1D8] p-5 rounded-2xl text-center shadow-xs">
                  <span className="text-stone-500 text-[10px] uppercase font-mono tracking-wider font-semibold">Active connection stream streak</span>
                  <p className="text-2xl font-mono font-bold text-teal-600 mt-2">18 days</p>
                </div>

                <div className="bg-white border border-[#E5E1D8] p-5 rounded-2xl text-center shadow-xs">
                  <span className="text-stone-500 text-[10px] uppercase font-mono tracking-wider font-semibold">Built Island structures</span>
                  <p className="text-2xl font-mono font-bold text-blue-600 mt-2">{state.orbit.island.structures.length}</p>
                </div>
              </div>

              {/* Shared Watchlist Portfolio */}
              <div className="bg-white border border-[#E5E1D8] p-6 rounded-[28px] mt-2 shadow-sm">
                <h3 className="text-xs uppercase font-mono tracking-widest text-[#C5A880] mb-4 font-bold">Shared Watchlist catalog</h3>
                <div className="flex flex-col gap-2">
                  {state.orbit.watchlist.map((w) => (
                    <div key={w.id} className="flex justify-between items-center text-xs p-3 border border-stone-100 rounded-xl hover:bg-[#FAF9F6] transition">
                      <span className="font-serif italic text-stone-850 text-sm font-semibold">{w.title}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] uppercase text-stone-500 font-semibold">{w.category}</span>
                        <span className="text-[10px] bg-[#FAF9F6] border border-stone-200 px-2.5 py-0.5 rounded-lg text-stone-700 font-semibold">{w.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </main>
      </div>

      {/* HORIZONTAL SCRAPBOOK PREVIEW SLIDER MODAL */}
      {isMemorySliderOpened && selectedMemory && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-50 flex justify-end transition-all duration-300">
          <div className="w-full md:w-[480px] bg-white border-l border-[#E5E1D8] p-8 overflow-y-auto flex flex-col gap-6 relative shadow-2xl">
            <button 
              onClick={() => setIsMemorySliderOpened(false)}
              className="absolute top-6 right-6 text-stone-400 hover:text-stone-850 bg-stone-105 p-1.5 rounded-full text-xs font-mono"
            >
              ✕ Close preview
            </button>

            <img src={selectedMemory.coverUrl} className="w-full h-48 object-cover rounded-2xl border border-[#E5E1D8] shadow-md" alt="cover art" />
            
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-mono text-[#C5A880] font-bold">{selectedMemory.date}</span>
              <h3 className="font-serif text-xl font-bold text-stone-900">{selectedMemory.title}</h3>
              {selectedMemory.location && (
                <span className="text-[11px] text-stone-500 font-mono flex items-center gap-1 font-semibold">
                  <MapPin className="w-3 h-3 text-red-500" /> {selectedMemory.location}
                </span>
              )}
            </div>

            <div>
              <p className="text-[10px] uppercase font-mono font-bold tracking-wider text-stone-400 mb-2">Participants</p>
              <div className="flex gap-2">
                {selectedMemory.participants.map((p, idx) => (
                  <span key={idx} className="bg-[#FAF9F6] border border-stone-200 px-3 py-1 rounded-xl text-xs text-stone-700 font-semibold shadow-3xs">
                    {p}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase font-mono font-bold tracking-wider text-stone-400 mb-2">Reflective Narrative</p>
              <p className="text-xs text-stone-700 leading-relaxed italic border-l-2 border-[#C5A880] pl-4 bg-[#FAF9F6] p-3 rounded-r-xl">
                "{selectedMemory.description}"
              </p>
            </div>

            {selectedMemory.isFutureMeet && (
              <div className="bg-pink-50 border border-pink-200 rounded-2xl p-4 flex flex-col gap-2">
                <span className="font-mono text-[9px] uppercase tracking-wider text-pink-600 font-bold">Planned Orion Meet</span>
                <p className="text-xs text-pink-950">This is a placeholder star indicating a planned meet for Saketh & Supriya. Add memory logs for this date to crystallize the plan!</p>
                <button
                  type="button"
                  onClick={() => {
                    setNewMemTitle(selectedMemory.title);
                    setNewMemDate(selectedMemory.date);
                    setNewMemLocation(selectedMemory.location || '');
                    setOrbitTab('gallery');
                    setIsMemorySliderOpened(false);
                  }}
                  className="mt-1 bg-pink-600 hover:bg-pink-700 text-white text-xs py-2 rounded-xl font-bold font-mono transition-all duration-300"
                >
                  ⚡ Convert Star to Real Scrapbook Memory
                </button>
              </div>
            )}

            {selectedMemory.AIinsights && (
              <div className="bg-[#FAF2E6] border border-[#C5A880]/30 rounded-2xl p-4 text-xs leading-relaxed text-stone-800">
                <span className="font-mono text-[9px] uppercase tracking-wider text-[#A68F6C] font-bold block mb-1">AI Curation Insights</span>
                <p>{selectedMemory.AIinsights}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CINEMATIC MEMORY THEATER OVERLAY SLIDECAROUSEL */}
      {theaterActive && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8">
          <div className="max-w-3xl w-full flex flex-col gap-6 relative">
            <button 
              onClick={() => setTheaterActive(false)}
              className="absolute -top-12 right-0 text-white hover:text-stone-200 flex items-center gap-1 text-xs bg-[#1C1C1C] px-3 py-1.5 rounded-full shadow-md"
            >
              ✕ Exit Screen
            </button>

            <div className="bg-white border border-[#E5E1D8] rounded-[32px] p-6 flex flex-col items-center gap-4 shadow-2xl">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#C5A880] font-bold animate-pulse">Cinematic Mode slide presentation</span>
              
              <div className="relative w-full h-[380px] bg-stone-100 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center transition-all duration-500">
                <img 
                  src={theaterFrame === 0 ? "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&q=80&w=800" : "https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&q=80&w=800"} 
                  alt="theater screen" 
                  className="absolute inset-0 size-full object-cover opacity-80" 
                />
                
                {/* Elegant narration box */}
                <div className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur-sm border border-[#C5A880]/40 p-5 rounded-2xl text-center shadow-lg">
                  <h4 className="font-serif italic text-lg text-amber-900 mb-1 font-bold">
                    {theaterFrame === 0 ? "Stargazing at Atacama desert" : "Rainy Cafe Afternoon"}
                  </h4>
                  <p className="text-xs text-stone-700 leading-relaxed italic font-medium">
                    {theaterFrame === 0 
                      ? "Under an infinitely clear sky... we watched shooting stars pass across the Orion nebula." 
                      : "Listening to heavy rainfall clattering against the window pane... sketching SUSA space specifications."}
                  </p>
                </div>
              </div>

              {/* Subtitles & soundtrack indicator */}
              <div className="flex gap-4 items-center text-xs text-stone-500 font-semibold">
                <span className="flex items-center gap-2">
                  <Music className="w-3.5 h-3.5 text-[#C5A880]" /> Ryuichi Sakamoto — Solitude
                </span>
                <span>•</span>
                <span>Slide {theaterFrame + 1} of 2</span>
              </div>

              {/* Slider steps */}
              <div className="flex gap-2 w-full mt-2">
                <button 
                  onClick={() => setTheaterFrame(0)}
                  className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${theaterFrame === 0 ? 'bg-[#C5A880]' : 'bg-stone-200'}`}
                />
                <button 
                  onClick={() => setTheaterFrame(1)}
                  className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${theaterFrame === 1 ? 'bg-[#C5A880]' : 'bg-stone-200'}`}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
