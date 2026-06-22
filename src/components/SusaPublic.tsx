import React, { useState, useEffect, useRef } from 'react';
import { useSusaStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { PublicNote, JournalEntry, PublicTask } from '../types';
import { 
  BookOpen, Calendar, CheckSquare, Sparkles, Folder, BarChart2, Search,
  Plus, Trash2, Edit3, ArrowRight, User, Compass, Zap, Play, Square,
  Clock, Heart, FileText, Check, Award, Send, RefreshCw, LogOut, Upload
} from 'lucide-react';
import SusaLogo from './SusaLogo';
import { uploadToSupabase } from '../supabase';

export default function SusaPublic() {
  const {
    state,
    enterOrbit,
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
    resetToSeeds,
  } = useSusaStore();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'notes' | 'planner' | 'journal' | 'tasks' | 'vault' | 'ai'>('dashboard');
  
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
  
  const [dashboardHeaderDate, setDashboardHeaderDate] = useState('');
  useEffect(() => {
    const d = new Date();
    const formatted = d.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
    setDashboardHeaderDate(formatted);
  }, []);
  
  // States for Note creation & selection
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(state.notes[0]?.id || null);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState('philosophy');
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);

  // States for Planner Focus Sessions
  const [currentPlannerDate, setCurrentPlannerDate] = useState('2026-06-18');
  const [focusTimerActive, setFocusTimerActive] = useState(false);
  const [focusTimeLeft, setFocusTimeLeft] = useState(1500); // 25 Min
  const [focusTimerInterval, setFocusTimerInterval] = useState<any>(null);
  const [newBlockTime, setNewBlockTime] = useState('10:00');
  const [newBlockTask, setNewBlockTask] = useState('');

  // States for Journaling
  const [journalTitle, setJournalTitle] = useState('');
  const [journalContent, setJournalContent] = useState('');
  const [journalMood, setJournalMood] = useState<JournalEntry['mood']>('calm');

  // States for Tasks & Habits
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<PublicTask['priority']>('medium');
  const [newTaskCategory, setNewTaskCategory] = useState<PublicTask['category']>('work');
  const [newHabitName, setNewHabitName] = useState('');

  // States for Goals
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState('Creative');
  const [newGoalValue, setNewGoalValue] = useState(10);
  const [newGoalUnit, setNewGoalUnit] = useState('sketches');

  // States for Chat Assistant
  const [assistantInput, setAssistantInput] = useState('');
  const [assistantMessages, setAssistantMessages] = useState<{ sender: 'user' | 'ai'; text: string }[]>([
    { sender: 'ai', text: 'Hello. I am SUSA’s digital consciousness. How are we shaping your thoughts, journals, and timeline archives today?' }
  ]);
  const [assistantLoading, setAssistantLoading] = useState(false);
  const aiChatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'ai') {
      aiChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [assistantMessages, activeTab, assistantLoading]);

  // Drag and drop / local file picker mock
  const [fileInputName, setFileInputName] = useState('');
  const [fileInputType, setFileInputType] = useState<'image' | 'pdf' | 'document'>('image');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Edit Profile States
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editProfileName, setEditProfileName] = useState(state.currentUser?.name || '');
  const [editProfileAvatar, setEditProfileAvatar] = useState(state.currentUser?.avatar || '');
  const [profileDragOver, setProfileDragOver] = useState(false);

  // Vault File states
  const [lockerFileBase64, setLockerFileBase64] = useState('');
  const [lockerFileSize, setLockerFileSize] = useState('1.5 MB');
  const [lockerDragOver, setLockerDragOver] = useState(false);

  const handleDragOverShared = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropProfileImage = async (e: React.DragEvent) => {
    e.preventDefault();
    setProfileDragOver(false);
    if (!e.dataTransfer.files || !e.dataTransfer.files[0]) return;
    const file = e.dataTransfer.files[0];
    if (!file.type.startsWith('image/')) { alert('Please drop a valid image file.'); return; }

    const result = await uploadToSupabase(file, 'avatars');
    if (result.error) {
      const reader = new FileReader();
      reader.onload = () => { if (typeof reader.result === 'string') setEditProfileAvatar(reader.result); };
      reader.readAsDataURL(file);
    } else {
      setEditProfileAvatar(result.url);
    }
  };

  const handleFileChangeProfileImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    if (!file.type.startsWith('image/')) return;

    const result = await uploadToSupabase(file, 'avatars');
    if (result.error) {
      const reader = new FileReader();
      reader.onload = () => { if (typeof reader.result === 'string') setEditProfileAvatar(reader.result); };
      reader.readAsDataURL(file);
    } else {
      setEditProfileAvatar(result.url);
    }
  };

  const handleDropLockerFile = async (e: React.DragEvent) => {
    e.preventDefault();
    setLockerDragOver(false);
    if (!e.dataTransfer.files || !e.dataTransfer.files[0]) return;
    const file = e.dataTransfer.files[0];
    setFileInputName(file.name);
    setLockerFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
    setFileInputType(file.type.startsWith('image/') ? 'image' : file.type === 'application/pdf' ? 'pdf' : 'document');

    const result = await uploadToSupabase(file, 'gallery');
    if (result.error) {
      // Fall back to base64 data URL when Supabase isn't configured
      const reader = new FileReader();
      reader.onload = () => { if (typeof reader.result === 'string') setLockerFileBase64(reader.result); };
      reader.readAsDataURL(file);
    } else {
      setLockerFileBase64(result.url);
    }
  };

  const handleFileChangeLockerFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setFileInputName(file.name);
    setLockerFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
    setFileInputType(file.type.startsWith('image/') ? 'image' : file.type === 'application/pdf' ? 'pdf' : 'document');

    const result = await uploadToSupabase(file, 'gallery');
    if (result.error) {
      const reader = new FileReader();
      reader.onload = () => { if (typeof reader.result === 'string') setLockerFileBase64(reader.result); };
      reader.readAsDataURL(file);
    } else {
      setLockerFileBase64(result.url);
    }
  };

  const activeNote = state.notes.find(n => n.id === selectedNoteId);

  // AI Assistant trigger
  const handleAssistantSend = async () => {
    if (!assistantInput.trim()) return;
    const userPrompt = assistantInput;
    setAssistantMessages(prev => [...prev, { sender: 'user', text: userPrompt }]);
    setAssistantInput('');
    setAssistantLoading(true);

    try {
      const response = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userPrompt, chatHistory: assistantMessages }),
      });
      const data = await response.json();
      if (data.success) {
        setAssistantMessages(prev => [...prev, { sender: 'ai', text: data.text }]);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      // Graceful local failover response reflecting minimal elegance
      setTimeout(() => {
        const fallbacks = [
          "Curate with absolute serenity. In modern architectural gardens, beauty thrives in deliberate empty spaces (ma). Keep exploring.",
          "I have processed your goal schedules. Incrementing your focus by another interval or writing a short journal can help align these ideas.",
          "To align SUSA space completely with active Gemini servers, ensure process.env.GEMINI_API_KEY is registered in the cloud runs settings panel.",
          "Fascinating perspective. That links closely with your philosophy page 'Studio Design Philosophy'. Try adding a backlinked reference."
        ];
        const randomAnswer = fallbacks[Math.floor(Math.random() * fallbacks.length)];
        setAssistantMessages(prev => [...prev, { sender: 'ai', text: randomAnswer }]);
      }, 1000);
    } finally {
      setAssistantLoading(false);
    }
  };

  // AI Summary triggers
  const handleAiSummarizeNote = async () => {
    if (!activeNote) return;
    setAiSummaryLoading(true);
    try {
      const resp = await fetch('/api/gemini/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: activeNote.title, content: activeNote.content }),
      });
      const data = await resp.json();
      if (data.success) {
        updateNote(activeNote.id, { summary: data.text });
      }
    } catch (e) {
      setTimeout(() => {
        updateNote(activeNote.id, {
          summary: "AI Summary: Establishes minimalist core tenets centered on organic shadows (#FBFBFA) and high-contrast typographic pairings. Promotes Ma (creative white spacing) as SUSA's principal philosophy."
        });
      }, 800);
    } finally {
      setAiSummaryLoading(false);
    }
  };

  // Focus Timer controls
  const toggleFocusTimer = () => {
    if (focusTimerActive) {
      clearInterval(focusTimerInterval);
      setFocusTimerActive(false);
      // Log active time
      const recordedMin = Math.round((1500 - focusTimeLeft) / 60);
      if (recordedMin > 0) {
        const day = state.planner.find(p => p.date === currentPlannerDate);
        updatePlanner(currentPlannerDate, day?.blocks || [], day?.notes || '', recordedMin);
      }
    } else {
      setFocusTimerActive(true);
      const interval = setInterval(() => {
        setFocusTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setFocusTimerActive(false);
            // Completed 25 mins Focus block!
            const day = state.planner.find(p => p.date === currentPlannerDate);
            updatePlanner(currentPlannerDate, day?.blocks || [], day?.notes || '', 25);
            alert("✨ serenade chime: Focus Block interval complete. Enjoy 5 minutes of architectural silence.");
            return 1500;
          }
          return prev - 1;
        });
      }, 1000);
      setFocusTimerInterval(interval);
    }
  };

  const resetFocusTimer = () => {
    clearInterval(focusTimerInterval);
    setFocusTimerActive(false);
    setFocusTimeLeft(1500);
  };

  const handleAddPlannerBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockTask.trim()) return;
    const day = state.planner.find(p => p.date === currentPlannerDate);
    const existingBlocks = day ? [...day.blocks] : [];
    existingBlocks.push({
      id: `b-${Date.now()}`,
      time: newBlockTime,
      task: newBlockTask,
      completed: false,
    });
    updatePlanner(currentPlannerDate, existingBlocks, day?.notes || '');
    setNewBlockTask('');
  };

  const handleAddJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalTitle.trim()) return;
    addJournal(journalTitle, journalContent, journalMood);
    setJournalTitle('');
    setJournalContent('');
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    addTask(newTaskText, newTaskPriority, newTaskCategory, '2026-06-18');
    setNewTaskText('');
  };

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    addHabit(newHabitName);
    setNewHabitName('');
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    addGoal(newGoalTitle, newGoalCategory, Number(newGoalValue), newGoalUnit, '2026-09-30');
    setNewGoalTitle('');
  };

  const handleAddFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileInputName.trim()) return;
    addFile(fileInputName, fileInputType, lockerFileBase64 || '#', lockerFileSize || '1.4 MB', false);
    setFileInputName('');
    setLockerFileBase64('');
    setLockerFileSize('1.5 MB');
  };

  // Helper formatting for seconds to MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col" id="susa-public-workspace">
      {/* Upper Architectural Command Girdle */}
      <header className="border-b border-soft-gray px-8 py-4 bg-white/50 backdrop-blur flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-6">
          <SusaLogo size={34} />
          <span className="text-xs bg-stone-100 text-stone-600 px-3 py-1 rounded-full border border-soft-gray">
            Daylight Workspace
          </span>
          <span className="hidden lg:inline text-xs font-mono text-zinc-600 bg-stone-100 border border-stone-200 px-3 py-1 rounded-full">
            🕦 {istTime}
          </span>
        </div>

        {/* Global Search Bar */}
        <div className="hidden md:flex items-center gap-2 bg-champagne border border-soft-gray rounded-lg px-3 py-1.5 w-80 focus-within:border-gold-premium transition-all duration-300">
          <Search className="w-4 h-4 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Search notes, files, task registries..." 
            className="bg-transparent text-sm text-charcoal focus:outline-none w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* User Glimpse Indicator */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              setEditProfileName(state.currentUser?.name || '');
              setEditProfileAvatar(state.currentUser?.avatar || '');
              setShowEditProfileModal(true);
            }}
            className="flex items-center gap-3 text-left hover:opacity-80 transition duration-300 group"
            title="Edit Identity Coordinates"
            id="btn-edit-profile-trigger"
          >
            <div className="text-right">
              <p className="text-[10px] text-neutral-400 font-mono uppercase tracking-[0.1em] group-hover:text-gold-premium transition duration-350">Creative Lead ✎</p>
              <p className="text-sm font-medium text-charcoal">{state.currentUser?.name || 'Workspace Principal'}</p>
            </div>
            <img 
              src={state.currentUser?.avatar} 
              alt="Avatar" 
              className="w-10 h-10 rounded-full border-2 border-soil bg-champagne text-xs daylight-shadow group-hover:scale-105 transition-transform duration-300"
            />
          </button>
          <button 
            onClick={logout}
            className="p-2.5 rounded-xl text-neutral-400 hover:text-red-700 hover:bg-rose-50 border border-transparent hover:border-red-100 transition-all duration-300"
            title="Log out to Cosmic Landing"
            id="btn-logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Structural Layout */}
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Architectural Left Rail Menu */}
        <aside className="w-full lg:w-64 border-r border-soft-gray bg-[#FAF9F6] p-6 flex flex-col gap-8">
          <div>
            <p className="text-xs text-neutral-400 uppercase tracking-widest font-semibold mb-4">Life Operating Axis</p>
            <nav className="flex flex-col gap-1.5">
              <button 
                id="nav-tab-dashboard"
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-stone-warm text-charcoal font-semibold daylight-shadow' : 'text-stone-600 hover:bg-champagne'}`}
              >
                <Compass className="w-4 h-4 text-gold-premium" />
                Dashboard Matrix
              </button>
              <button 
                id="nav-tab-notes"
                onClick={() => setActiveTab('notes')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-300 ${activeTab === 'notes' ? 'bg-stone-warm text-charcoal font-semibold daylight-shadow' : 'text-stone-600 hover:bg-champagne'}`}
              >
                <BookOpen className="w-4 h-4 text-gold-premium" />
                Editorial Notes ({state.notes.length})
              </button>
              <button 
                id="nav-tab-planner"
                onClick={() => setActiveTab('planner')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-300 ${activeTab === 'planner' ? 'bg-stone-warm text-charcoal font-semibold daylight-shadow' : 'text-stone-600 hover:bg-champagne'}`}
              >
                <Calendar className="w-4 h-4 text-gold-premium" />
                Time-Block Planner
              </button>
              <button 
                id="nav-tab-journal"
                onClick={() => setActiveTab('journal')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-300 ${activeTab === 'journal' ? 'bg-stone-warm text-charcoal font-semibold daylight-shadow' : 'text-stone-600 hover:bg-champagne'}`}
              >
                <FileText className="w-4 h-4 text-gold-premium" />
                Silent Journal ({state.journal.length})
              </button>
              <button 
                id="nav-tab-tasks"
                onClick={() => setActiveTab('tasks')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-300 ${activeTab === 'tasks' ? 'bg-stone-warm text-charcoal font-semibold daylight-shadow' : 'text-stone-600 hover:bg-champagne'}`}
              >
                <CheckSquare className="w-4 h-4 text-gold-premium" />
                Tasks & Habit Lists
              </button>
              <button 
                id="nav-tab-vault"
                onClick={() => setActiveTab('vault')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-300 ${activeTab === 'vault' ? 'bg-stone-warm text-charcoal font-semibold daylight-shadow' : 'text-stone-600 hover:bg-champagne'}`}
              >
                <Folder className="w-4 h-4 text-gold-premium" />
                Knowledge Vault & Files
              </button>
            </nav>
          </div>

          <div className="border-t border-soft-gray pt-6">
            <p className="text-xs text-neutral-400 uppercase tracking-widest font-semibold mb-4">Core Intelligence</p>
            <button 
              id="nav-tab-ai"
              onClick={() => setActiveTab('ai')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-300 ${activeTab === 'ai' ? 'bg-stone-warm text-charcoal font-semibold daylight-shadow' : 'text-stone-600 hover:bg-champagne'}`}
            >
              <span className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-yellow-600 animate-spin" />
                SUSA Assistant
              </span>
              <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded-full font-mono uppercase">Online</span>
            </button>
          </div>



          {/* System Purge & Clean Mechanism */}
          <div className="border-t border-soft-gray pt-6 mt-2">
            <p className="text-xs text-neutral-400 uppercase tracking-widest font-semibold mb-3">System Maintenance</p>
            <button 
              onClick={() => {
                if (window.confirm("Are you sure you want to clean all demo data and live states? This will completely clear all files, chats, reminders, journals, and task registries across both your local cache and Firestore database.")) {
                  resetToSeeds();
                  window.alert("✨ All workspace state cleaned successfully!");
                }
              }}
              className="w-full flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-xl border border-dashed border-red-200 hover:bg-rose-50/50 text-rose-850 hover:border-rose-300 transition-all duration-300 text-xs font-semibold shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-700" />
              Clear All Demo & Live Data
            </button>
          </div>

          <div className="mt-auto bg-champagne border border-soft-gray p-4 rounded-xl text-xs text-neutral-500 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-charcoal">Ctrl + S</span>
              <span>Universal Search</span>
            </div>
            <p className="text-[11px] leading-relaxed">Entering the search keyword coordinates can bridge secondary stargazing atmospheres.</p>
          </div>
        </aside>

        {/* Multi-view Screen Engine */}
        <main className="flex-1 p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-8 max-w-5xl mx-auto" 
                id="dashboard-view"
              >
                <div className="flex flex-col gap-2">
                  <span className="text-neutral-500 text-xs font-semibold uppercase tracking-[0.2em]">{dashboardHeaderDate || 'Thursday, October 24'}</span>
                  <h1 className="text-5xl font-light text-charcoal tracking-tight font-serif mt-1">
                    Good morning, <span className="italic font-normal">{state.currentUser?.name || 'Workspace Principal'}</span>
                  </h1>
                  <p className="text-neutral-500 text-sm mt-1">Organizing your creative days using daylight shadows and serene focus structures.</p>
                </div>

              {/* Dynamic AI Suggested Action Banner */}
              <div className="bg-gradient-to-r from-champagne to-stone-warm rounded-2xl p-6 border border-soft-gray daylight-shadow flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="bg-white p-3 rounded-xl border border-soft-gray daylight-shadow flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-gold-premium animate-pulse" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#9A7D56] font-semibold">Self-Care Intelligence Insight</span>
                    <p className="text-sm font-medium text-charcoal">
                      Your partner synchronized their timeline logs today. You completed 120 digital Focus minutes yesterday. Suggested: Log your reflections or track your habits.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab('ai')}
                  className="bg-charcoal hover:bg-stone-900 border border-charcoal text-white text-xs px-3 py-1.5 rounded-lg transition-all duration-300"
                >
                  Consult AI
                </button>
              </div>

              {/* Grid Widgets Portfolio */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* planner card */}
                <div className="bg-champagne rounded-[40px] p-6 border border-soft-gray daylight-shadow flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs tracking-widest uppercase text-neutral-400 font-semibold flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-gold-premium" /> Daily Agenda
                    </h3>
                    <span className="text-xs text-gold-premium">{currentPlannerDate}</span>
                  </div>
                  {state.planner.find(p => p.date === currentPlannerDate)?.blocks.map((block) => (
                    <div key={block.id} className="flex items-center gap-3 border-b border-stone-50 pb-2">
                      <span className="text-xs font-mono bg-stone-100 px-1.5 py-0.5 rounded text-neutral-500">{block.time}</span>
                      <span className={`text-xs ${block.completed ? 'line-through text-neutral-400' : 'text-neutral-700'}`}>{block.task}</span>
                    </div>
                  )) || <p className="text-neutral-400 text-xs text-center py-4">No planner items established for today.</p>}
                  <button 
                    onClick={() => setActiveTab('planner')}
                    className="mt-auto text-xs text-neutral-500 hover:text-gold-premium flex items-center justify-center gap-1.5"
                  >
                    Manage Planner <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Habit Streak Portfolio */}
                <div className="bg-champagne rounded-[40px] p-6 border border-soft-gray daylight-shadow flex flex-col gap-4">
                  <h3 className="text-xs tracking-widest uppercase text-neutral-400 font-semibold flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-gold-premium" /> Focus Habits
                  </h3>
                  <div className="flex flex-col gap-3">
                    {state.habits.slice(0,3).map(h => (
                      <div key={h.id} className="flex items-center justify-between">
                        <span className="text-xs text-neutral-700 font-medium">{h.name}</span>
                        <span className="text-xs bg-ivory text-gold-premium border border-soft-gray px-2 py-0.5 rounded-full font-semibold">🔥 {h.streak}d streak</span>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => setActiveTab('tasks')}
                    className="mt-auto text-xs text-neutral-500 hover:text-gold-premium flex items-center justify-center gap-1.5"
                  >
                    View Habits Ledger <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Active Life Goals Tracker */}
                <div className="bg-champagne rounded-[40px] p-6 border border-soft-gray daylight-shadow flex flex-col gap-4">
                  <h3 className="text-xs tracking-widest uppercase text-neutral-400 font-semibold flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-gold-premium" /> Active Life Goals
                  </h3>
                  <div className="flex flex-col gap-4 mt-2">
                    {state.goals.map(g => {
                      const perc = Math.round((g.currentValue / g.targetValue) * 100);
                      return (
                        <div key={g.id} className="flex flex-col gap-1.5">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-neutral-700 truncate">{g.title}</span>
                            <span className="text-gold-premium">{perc}%</span>
                          </div>
                          <div className="w-full bg-stone-100 rounded-full h-1.5">
                            <div className="bg-[#1C1C1C] h-1.5 rounded-full transition-all duration-500" style={{ width: `${perc}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Quick-Add & Metrics Dashboard */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent notes brief */}
                <div className="bg-champagne border border-soft-gray rounded-[40px] p-6 daylight-shadow">
                  <h3 className="text-xs text-neutral-400 uppercase tracking-widest font-semibold mb-4">Editorial Notes Overview</h3>
                  <div className="flex flex-col gap-3">
                    {state.notes.slice(0, 2).map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => { setSelectedNoteId(n.id); setActiveTab('notes'); }}
                        className="bg-white border border-soft-gray p-4 rounded-xl cursor-pointer hover:border-gold-premium transition-all duration-300 flex flex-col gap-1.5"
                      >
                        <h4 className="text-sm font-medium text-charcoal">{n.title}</h4>
                        <p className="text-neutral-500 text-xs line-clamp-1">{n.content.replace(/[#\-\*]/g, '')}</p>
                        {n.summary && <p className="text-[11px] text-[#A68F6C] font-mono select-none">✨ Summarized</p>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Journal Highlight Preview and Quick Addition */}
                <div className="bg-champagne border border-soft-gray rounded-[40px] p-6 daylight-shadow flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs text-neutral-400 uppercase tracking-widest font-semibold mb-3">Quick Journal Capture</h3>
                    <form onSubmit={handleAddJournal} className="flex flex-col gap-3">
                      <input 
                        type="text" 
                        placeholder="Reflection title..." 
                        className="w-full font-serif text-sm border-b border-soft-gray focus:border-gold-premium pb-1 outline-none text-charcoal"
                        value={journalTitle}
                        onChange={(e) => setJournalTitle(e.target.value)}
                        required
                      />
                      <textarea 
                        placeholder="Log your thoughts under the daylight window..." 
                        rows={2}
                        className="w-full text-xs text-stone-600 outline-none resize-none bg-stone-50/50 p-2 rounded-lg border border-transparent focus:border-soft-gray"
                        value={journalContent}
                        onChange={(e) => setJournalContent(e.target.value)}
                      />
                      <div className="flex items-center justify-between mt-2">
                        <select 
                          className="text-xs bg-stone-100 border border-soft-gray rounded px-2.5 py-1 text-stone-600"
                          value={journalMood}
                          onChange={(e) => setJournalMood(e.target.value as any)}
                        >
                          <option value="calm">Calm 🍵</option>
                          <option value="happy">Excited ☀️</option>
                          <option value="thoughtful">Thoughtful 📖</option>
                          <option value="tired">Tired 💤</option>
                          <option value="melancholy">Melancholy ☔</option>
                        </select>
                        <button 
                          type="submit"
                          className="bg-charcoal text-white text-xs px-3 py-1.5 rounded hover:bg-neutral-800 flex items-center gap-1.5 transition-all duration-300"
                        >
                          <Plus className="w-3.5 h-3.5" /> Commit Entry
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: NOTES EDITING WITH AI */}
          {activeTab === 'notes' && (
            <motion.div 
              key="notes"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto h-[75vh]" 
              id="notes-view"
            >
              {/* Left Column notes list */}
              <div className="w-full md:w-80 border-r border-soft-gray pr-6 flex flex-col gap-4 overflow-y-auto">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-light text-charcoal tracking-tight">Editorial Hub</h2>
                  <button 
                    onClick={() => {
                      const id = `note-${Date.now()}`;
                      addNote({
                        title: 'Untitled Note',
                        content: '# Untitled Note\nFormulate your design notes here.',
                        backlinks: [],
                        relatedNotes: [],
                        category: 'philosophy',
                      });
                      setSelectedNoteId(id);
                    }}
                    className="p-1 px-2.5 rounded bg-stone-warm text-charcoal hover:bg-gold-premium hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all duration-300"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Note
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  {state.notes.map(n => (
                    <div 
                      key={n.id}
                      onClick={() => setSelectedNoteId(n.id)}
                      className={`p-3.5 rounded-xl cursor-pointer transition-all duration-300 ${n.id === selectedNoteId ? 'bg-stone-warm border-l-2 border-gold-premium' : 'bg-white border border-soft-gray hover:bg-champagne'}`}
                    >
                      <h4 className="text-xs uppercase font-mono tracking-wider font-semibold text-neutral-400 mb-1">{n.category}</h4>
                      <h3 className="text-sm font-medium text-charcoal truncate">{n.title}</h3>
                      <p className="text-[11px] text-neutral-500 line-clamp-1 mt-1">
                        {n.content.substring(0, 80).replace(/[#\-\*]/g, '')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column workspace editor */}
              <div className="flex-1 flex flex-col gap-4 bg-white/70 p-6 rounded-2xl border border-soft-gray h-full overflow-y-auto">
                {activeNote ? (
                  <div className="flex flex-col gap-4 h-full">
                    {/* Header Controls */}
                    <div className="flex items-center justify-between border-b border-soft-gray pb-4">
                      <div className="flex flex-col gap-1">
                        <input 
                          type="text" 
                          className="text-2xl font-serif font-semibold outline-none border-b border-transparent focus:border-soft-gray"
                          value={activeNote.title}
                          onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                        />
                        <select 
                          className="text-xs bg-stone-100 text-neutral-500 outline-none w-28 rounded px-1.5 py-0.5 border"
                          value={activeNote.category}
                          onChange={(e) => updateNote(activeNote.id, { category: e.target.value })}
                        >
                          <option value="philosophy">philosophy</option>
                          <option value="work">work</option>
                          <option value="design">design</option>
                          <option value="personal">personal</option>
                        </select>
                      </div>

                      {/* Editorial Actions */}
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={handleAiSummarizeNote}
                          disabled={aiSummaryLoading}
                          className="bg-champagne hover:bg-stone-warm border border-soft-gray text-gold-premium hover:text-neutral-800 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all duration-300 disabled:opacity-50"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> 
                          {aiSummaryLoading ? 'Formulating...' : 'AI Editorial Recap'}
                        </button>
                        <button 
                          onClick={() => { deleteNote(activeNote.id); setSelectedNoteId(state.notes[0]?.id || null); }}
                          className="text-stone-400 hover:text-red-500 p-1.5 rounded transition-all duration-300"
                          title="Purge Note"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* AI Summary Banner if present */}
                    {activeNote.summary && (
                      <div className="bg-yellow-50/50 border border-yellow-200/50 rounded-xl p-4 text-xs text-yellow-900 leading-relaxed italic pr-10 relative">
                        <span className="font-mono uppercase font-bold text-[9px] block mb-1 text-yellow-800">Curation Recap</span>
                        <p>{activeNote.summary}</p>
                        <button 
                          onClick={() => updateNote(activeNote.id, { summary: undefined })}
                          className="absolute top-2 right-2 text-stone-400 hover:text-charcoal"
                        >
                          ✕
                        </button>
                      </div>
                    )}

                    {/* Text Area */}
                    <textarea 
                      className="flex-1 w-full text-sm leading-relaxed text-stone-700 outline-none resize-none font-mono"
                      placeholder="Use standard Markdown notations (# for headings, - for lists, * for italics) to sculpt your thoughts..."
                      value={activeNote.content}
                      onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                    <BookOpen className="w-10 h-10 stroke-[1.5] text-stone-300 mb-2" />
                    <p className="text-sm font-light">Select or formulate an active note to begin the design canvas.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 3: PLANNER */}
          {activeTab === 'planner' && (
            <motion.div 
              key="planner"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto" 
              id="planner-view"
            >
              {/* Focus Session Module */}
              <div className="w-full lg:w-80 bg-champagne border border-soft-gray rounded-[40px] p-8 daylight-shadow flex flex-col gap-6">
                <div>
                  <h3 className="text-xs text-neutral-400 uppercase tracking-widest font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gold-premium" /> Silent Focus Interval
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">Practice deliberate concentration away from standard noise indicators.</p>
                </div>

                <div className="bg-ivory border border-soft-gray rounded-2xl p-8 flex flex-col items-center justify-center shadow-inner">
                  <span className="text-4xl font-mono tracking-wider text-charcoal font-bold">{formatTime(focusTimeLeft)}</span>
                  <p className="text-[10px] text-neutral-400 uppercase tracking-widest mt-2">{focusTimerActive ? 'Chime active' : 'Suspended'}</p>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={toggleFocusTimer}
                    className="flex-1 bg-charcoal hover:bg-stone-900 text-white rounded-lg py-2.5 text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-300"
                  >
                    {focusTimerActive ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    {focusTimerActive ? 'Pause Session' : 'Begin Interval'}
                  </button>
                  <button 
                    onClick={resetFocusTimer}
                    className="border border-soft-gray p-2.5 rounded-lg text-neutral-500 hover:text-charcoal transition-all duration-300"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                {/* Focus Accumulation Indicators */}
                <div className="border-t border-soft-gray pt-4 text-center">
                  <p className="text-xs text-neutral-500">
                    Daylight Focus Tracked Today:{' '}
                    <span className="font-mono font-bold text-gold-premium text-sm">
                      {state.planner.find(p => p.date === currentPlannerDate)?.focusMinutes || 0} minutes
                    </span>
                  </p>
                </div>
              </div>

              {/* Time Blocks list */}
              <div className="flex-1 bg-champagne border border-soft-gray rounded-[40px] p-8 daylight-shadow flex flex-col gap-6">
                <div className="flex justify-between items-center border-b border-soft-gray pb-4">
                  <div>
                    <h2 className="text-xl font-light text-charcoal">Design Roadmap Planner</h2>
                    <span className="text-xs text-neutral-400">Establish time alignment steps for {currentPlannerDate}</span>
                  </div>
                  <input 
                    type="date" 
                    value={currentPlannerDate}
                    onChange={(e) => setCurrentPlannerDate(e.target.value)}
                    className="text-xs border border-soft-gray p-1.5 rounded outline-none"
                  />
                </div>

                {/* Form to add time block */}
                <form onSubmit={handleAddPlannerBlock} className="flex gap-2 bg-champagne p-3 rounded-lg border border-soft-gray">
                  <input 
                    type="time" 
                    required 
                    value={newBlockTime} 
                    onChange={(e) => setNewBlockTime(e.target.value)}
                    className="text-xs border border-soft-gray p-1.5 rounded outline-none bg-white font-mono"
                  />
                  <input 
                    type="text" 
                    placeholder="Enter planned block title..."
                    required
                    value={newBlockTask} 
                    onChange={(e) => setNewBlockTask(e.target.value)}
                    className="flex-1 text-xs border border-soft-gray p-1.5 rounded outline-none bg-white"
                  />
                  <button 
                    type="submit"
                    className="bg-charcoal text-white text-xs px-4 py-1.5 rounded-lg hover:bg-stone-900"
                  >
                    Schedule
                  </button>
                </form>

                {/* Blocks Display container */}
                <div className="flex flex-col gap-2">
                  {state.planner.find(p => p.date === currentPlannerDate)?.blocks.map((b) => (
                    <div key={b.id} className="flex items-center justify-between p-3 rounded-xl border border-soft-gray bg-stone-50/30">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-semibold text-gold-premium w-12">{b.time}</span>
                        <input 
                          type="checkbox" 
                          checked={b.completed}
                          onChange={() => {
                            const pDay = state.planner.find(p => p.date === currentPlannerDate)!;
                            const nextBlocks = pDay.blocks.map(x => x.id === b.id ? { ...x, completed: !x.completed } : x);
                            updatePlanner(currentPlannerDate, nextBlocks, pDay.notes);
                          }}
                          className="rounded text-gold-premium focus:ring-0 cursor-pointer"
                        />
                        <span className={`text-xs ${b.completed ? 'line-through text-neutral-400' : 'text-neutral-700'}`}>{b.task}</span>
                      </div>
                      <button 
                        onClick={() => {
                          const pDay = state.planner.find(p => p.date === currentPlannerDate)!;
                          const nextBlocks = pDay.blocks.filter(x => x.id !== b.id);
                          updatePlanner(currentPlannerDate, nextBlocks, pDay.notes);
                        }}
                        className="text-stone-300 hover:text-red-500 transition-all duration-300"
                      >
                        ✕
                      </button>
                    </div>
                  )) || <p className="text-center text-xs text-neutral-400 py-8">Your roadmap planner has no hours locked. Align a slot above.</p>}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: JOURNAL */}
          {activeTab === 'journal' && (
            <motion.div 
              key="journal"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-4xl mx-auto flex flex-col gap-6" 
              id="journal-view"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-light text-charcoal tracking-tight">Silent Journal reflections</h2>
                  <p className="text-xs text-neutral-500">Record emotional transitions and project alignments.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Journal List */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-xs tracking-widest uppercase font-semibold text-neutral-400 mb-2">Past Logs</h3>
                  {state.journal.map(j => (
                    <div key={j.id} className="bg-champagne border border-soft-gray rounded-3xl p-6 daylight-shadow relative">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-neutral-400 font-mono">{j.date}</span>
                        <span className="text-xs uppercase font-mono tracking-widest bg-ivory text-stone-600 px-2 py-0.5 rounded border border-soft-gray">
                          {j.mood}
                        </span>
                      </div>
                      <h4 className="font-serif font-semibold text-stone-800 text-base mb-1.5">{j.title}</h4>
                      <p className="text-xs text-stone-600 leading-relaxed whitespace-pre-line">{j.content}</p>
                    </div>
                  ))}
                </div>

                {/* Quick Addition form already embedded, placeholder detailed box */}
                <div className="bg-champagne border border-soft-gray rounded-[40px] p-8 daylight-shadow h-fit">
                  <h3 className="text-xs text-neutral-400 uppercase tracking-widest font-semibold mb-4">Log New Reflection</h3>
                  <form onSubmit={handleAddJournal} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase font-mono text-neutral-400 tracking-wider font-semibold">Title</label>
                      <input 
                        type="text" 
                        required
                        className="noble-input bg-ivory border-soft-gray text-charcoal outline-none rounded-xl text-xs py-2.5 px-3"
                        placeholder="e.g. Summer Rainfall Refractions"
                        value={journalTitle}
                        onChange={(e) => setJournalTitle(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase font-mono text-neutral-400 tracking-wider font-semibold">Cerebral Mood</label>
                      <select 
                        className="noble-input bg-ivory border-soft-gray text-charcoal outline-none rounded-xl text-xs py-2.5 px-3 w-full"
                        value={journalMood}
                        onChange={(e) => setJournalMood(e.target.value as any)}
                      >
                        <option value="calm">Calm 🍵</option>
                        <option value="happy">Excited ☀️</option>
                        <option value="thoughtful">Thoughtful 📖</option>
                        <option value="tired">Tired 💤</option>
                        <option value="melancholy">Melancholy ☔</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase font-mono text-neutral-400 tracking-wider font-semibold">Thoughts</label>
                      <textarea 
                        required
                        rows={4}
                        className="noble-input bg-ivory border-soft-gray text-charcoal outline-none rounded-xl text-xs py-2.5 px-2.5 resize-none"
                        placeholder="Log your creative notes in the digital notebook..."
                        value={journalContent}
                        onChange={(e) => setJournalContent(e.target.value)}
                      />
                    </div>
                    <button 
                      type="submit"
                      className="noble-btn w-full flex items-center justify-center gap-1.5 rounded-xl bg-charcoal text-white hover:bg-neutral-800 transition py-3 text-xs font-semibold"
                    >
                      <Plus className="w-4 h-4" /> Commit Reflection
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 5: TASKS & HABITS */}
          {activeTab === 'tasks' && (
            <motion.div 
              key="tasks"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-5xl mx-auto flex flex-col gap-8 text-sm" 
              id="tasks-view"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-light text-charcoal">Tasks and Focus Habits</h2>
                  <p className="text-xs text-neutral-400">Keep check of project deadlines and active streak structures.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Tasks management panel */}
                <div className="bg-champagne border border-soft-gray rounded-[40px] p-8 daylight-shadow flex flex-col gap-4">
                  <h3 className="text-xs text-neutral-400 uppercase tracking-widest font-semibold flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-gold-premium" /> Tasks Registry
                  </h3>

                  <form onSubmit={handleAddTask} className="flex gap-2 flex-wrap">
                    <input 
                      type="text" 
                      required
                      placeholder="Add task item..."
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      className="flex-1 text-xs border border-soft-gray p-2 rounded-lg"
                    />
                    <select 
                      className="text-xs border p-2 rounded-lg"
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                    <button type="submit" className="bg-charcoal text-white hover:bg-neutral-800 p-2 px-3.5 rounded-lg text-xs">
                      Add
                    </button>
                  </form>

                  <div className="flex flex-col gap-2 mt-2">
                    {state.tasks.map(t => (
                      <div key={t.id} className="flex items-center justify-between p-3 border border-soft-gray rounded-xl">
                        <div className="flex items-center gap-3">
                          <input 
                            type="checkbox" 
                            checked={t.completed}
                            onChange={() => toggleTask(t.id)}
                            className="rounded text-gold-premium"
                          />
                          <span className={`${t.completed ? 'line-through text-neutral-400' : 'text-neutral-700'} text-xs`}>{t.text}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${t.priority === 'high' ? 'bg-red-100 text-red-700' : t.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-600'}`}>
                            {t.priority}
                          </span>
                          <button onClick={() => deleteTask(t.id)} className="text-stone-300 hover:text-red-500 transition-all duration-300">
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Habits tracking container */}
                <div className="bg-white border border-soft-gray rounded-2xl p-6 daylight-shadow flex flex-col gap-4">
                  <h3 className="text-xs text-neutral-400 uppercase tracking-widest font-semibold flex items-center gap-2">
                    <Zap className="w-4 h-4 text-gold-premium" /> Streaks Ledger
                  </h3>

                  <form onSubmit={handleAddHabit} className="flex gap-2">
                    <input 
                      type="text" 
                      required
                      placeholder="Add habit focus..."
                      value={newHabitName}
                      onChange={(e) => setNewHabitName(e.target.value)}
                      className="flex-1 text-xs border border-soft-gray p-2 rounded-lg"
                    />
                    <button type="submit" className="bg-charcoal text-white hover:bg-neutral-800 p-2 px-3.5 rounded-lg text-xs">
                      Enlist
                    </button>
                  </form>

                  <div className="flex flex-col gap-3 mt-2">
                    {state.habits.map(h => (
                      <div key={h.id} className="p-4 border border-soft-gray rounded-xl flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-semibold text-neutral-700">{h.name}</h4>
                          <p className="text-[10px] text-neutral-400 mt-1">Completion Streak: <span className="text-gold-premium font-bold font-mono">{h.streak} days</span></p>
                        </div>
                        <button 
                          onClick={() => toggleHabit(h.id, '2026-06-18')}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-300 ${h.history.includes('2026-06-18') ? 'bg-gold-premium text-white' : 'bg-[#FAF5EF] text-gold-premium border border-soft-gray'}`}
                        >
                          {h.history.includes('2026-06-18') ? '✓ Completed Today' : 'Mark Completed'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 6: VAULT */}
          {activeTab === 'vault' && (
            <motion.div 
              key="vault"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-5xl mx-auto flex flex-col gap-8" 
              id="vault-view"
            >
              <div>
                <h2 className="text-2xl font-light text-charcoal">Design Knowledge Locker</h2>
                <p className="text-xs text-neutral-400">Safely host mock assets, sketches, and design references.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side Add form */}
                <div className="bg-[#FAF9F6] border border-soft-gray rounded-2xl p-6 h-fit daylight-shadow">
                  <h3 className="text-xs text-neutral-400 uppercase tracking-widest font-semibold mb-4">Locker upload Mock</h3>
                  <form onSubmit={handleAddFile} className="flex flex-col gap-3">
                    <div 
                      onDragOver={handleDragOverShared}
                      onDrop={handleDropLockerFile}
                      onDragEnter={() => setLockerDragOver(true)}
                      onDragLeave={() => setLockerDragOver(false)}
                      className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-5 transition-all duration-300 text-center cursor-pointer ${lockerDragOver ? 'border-gold-premium bg-stone-100/50' : 'border-stone-200 bg-white hover:border-gold-premium'}`}
                    >
                      <input 
                        type="file" 
                        className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                        onChange={handleFileChangeLockerFile}
                        title="Drag and drop any image, video, or document"
                      />
                      <Upload className="w-6 h-6 text-stone-400 mb-2" />
                      <span className="text-[10px] text-stone-500 font-mono tracking-wider uppercase font-semibold">
                        DRAG & DROP SECURE FILES
                      </span>
                      <span className="text-[9px] text-[#A69076]">
                        or click here to upload files
                      </span>
                    </div>

                    <input 
                      type="text" 
                      required
                      placeholder="File nomenclature..."
                      value={fileInputName}
                      onChange={(e) => setFileInputName(e.target.value)}
                      className="noble-input bg-white text-xs"
                    />
                    <select 
                      className="noble-input bg-white text-xs"
                      value={fileInputType}
                      onChange={(e) => setFileInputType(e.target.value as any)}
                    >
                      <option value="image">JPEG/PNG Image</option>
                      <option value="pdf">PDF Document</option>
                      <option value="document">Drawing Outline</option>
                    </select>
                    <button type="submit" className="noble-btn">
                      Log asset
                    </button>
                  </form>
                </div>

                {/* Right side Portfolio Grid */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {state.files.filter(f => !f.isOrbit).map(f => (
                    <div key={f.id} className="bg-white border border-soft-gray rounded-2xl p-4 daylight-shadow flex items-center gap-4">
                      <div className="bg-champagne p-3 rounded-lg border">
                        <FileText className="w-5 h-5 text-gold-premium" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-neutral-700 truncate">{f.name}</h4>
                        <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                          <span>{f.size}</span>
                          <span>Added {f.addedAt}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 7: AI */}
          {activeTab === 'ai' && (
            <motion.div 
              key="ai"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-4xl mx-auto flex flex-col gap-4 h-[75vh]" 
              id="ai-chat-view"
            >
              <div className="border-b border-soft-gray pb-2 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-light text-charcoal">SUSA Intelligent Guidance Console</h2>
                  <p className="text-xs text-neutral-400">Consult with the platform's self-reflective consciousness.</p>
                </div>
              </div>

              {/* Chat log */}
              <div className="flex-1 bg-white border border-soft-gray rounded-2xl p-6 overflow-y-auto flex flex-col gap-4">
                {assistantMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-md rounded-2xl p-4 text-xs leading-relaxed daylight-shadow ${msg.sender === 'user' ? 'bg-charcoal text-white' : 'bg-champagne text-charcoal border'}`}>
                      <span className="font-mono text-[9px] uppercase tracking-wider block mb-1 opacity-60">
                        {msg.sender === 'user' ? (state.currentUser?.name || 'Workspace Principal') : 'SUSA Intelligence'}
                      </span>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {assistantLoading && (
                  <div className="flex justify-start">
                    <div className="bg-champagne text-charcoal border rounded-2xl p-4 text-xs animate-pulse">
                      Sailing through high-fidelity neural networks...
                    </div>
                  </div>
                )}
                <div ref={aiChatEndRef} />
              </div>

              {/* Input belt */}
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Ask SUSA of calendar alignment, design philosophy or memory stars..." 
                  value={assistantInput}
                  onChange={(e) => setAssistantInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAssistantSend()}
                  className="flex-1 border bg-white border-soft-gray focus:border-gold-premium rounded-xl px-4 py-3 outline-none text-xs"
                />
                <button 
                  onClick={handleAssistantSend}
                  className="bg-charcoal text-white hover:bg-stone-900 border rounded-xl px-5 flex items-center justify-center transition-all duration-300"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </main>
      </div>

      {/* Dynamic Profile Coordinate Editor Dialog */}
      {showEditProfileModal && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
          <div className="bg-white border border-[#E4C59E]/30 w-full max-w-md rounded-3xl p-6 shadow-2xl animate-fade-in text-charcoal flex flex-col gap-5">
            <div className="flex items-center justify-between border-b pb-3 border-stone-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold-premium" />
                <h3 className="font-serif italic text-lg text-charcoal">Edit Identity Coordinates</h3>
              </div>
              <button 
                onClick={() => setShowEditProfileModal(false)}
                className="text-neutral-400 hover:text-charcoal transition text-sm font-mono cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div 
                onDragOver={handleDragOverShared}
                onDrop={handleDropProfileImage}
                onDragEnter={() => setProfileDragOver(true)}
                onDragLeave={() => setProfileDragOver(false)}
                className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-4 transition-all duration-300 text-center ${profileDragOver ? 'border-gold-premium bg-stone-100/40 scale-102' : 'border-stone-200 bg-stone-50 hover:bg-stone-50/80 hover:border-gold-premium'}`}
              >
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                  onChange={handleFileChangeProfileImage}
                  title="Drop profile image or click to browse"
                />
                <div className="flex items-center gap-4 w-full">
                  <img 
                    src={editProfileAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'} 
                    alt="Avatar Preview" 
                    className="w-16 h-16 rounded-full border-2 border-[#E4C59E] object-cover bg-champagne text-xs daylight-shadow"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
                    }}
                  />
                  <div className="flex flex-col gap-1 items-start text-left">
                    <span className="text-[10px] text-neutral-400 font-mono tracking-widest uppercase">Identity Avatar Asset</span>
                    <span className="text-xs text-neutral-500 font-medium">Drag & Drop Image or Click to Browse</span>
                    <span className="text-[9px] text-stone-400 max-w-[205px] truncate">{editProfileAvatar?.startsWith('data:image') ? 'Loaded Custom Stream Data' : editProfileAvatar}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[10px] text-neutral-500 font-mono tracking-wider font-semibold uppercase">Workspace Display Name</label>
                <div className="relative flex items-center font-mono">
                  <User className="absolute left-3.5 text-neutral-400 w-3.5 h-3.5" />
                  <input 
                    type="text"
                    required
                    className="w-full bg-stone-50 border border-stone-200 focus:border-gold-premium outline-none rounded-xl py-2.5 pl-10 pr-4 text-xs font-sans text-charcoal transition-all duration-300"
                    placeholder="e.g. Workspace Principal"
                    value={editProfileName}
                    onChange={(e) => setEditProfileName(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[10px] text-neutral-500 font-mono tracking-wider font-semibold uppercase">Avatar Photo Endpoint (URL)</label>
                <div className="relative flex items-center font-mono font-mono">
                  <FileText className="absolute left-3.5 text-neutral-400 w-3.5 h-3.5" />
                  <input 
                    type="url"
                    className="w-full bg-stone-50 border border-stone-200 focus:border-gold-premium outline-none rounded-xl py-2.5 pl-10 pr-4 text-xs font-sans text-charcoal transition-all duration-300"
                    placeholder="Enter image URL https://..."
                    value={editProfileAvatar}
                    onChange={(e) => setEditProfileAvatar(e.target.value)}
                  />
                </div>
              </div>

              {/* Recommended Preset Avatars for super clean workspace representation */}
              <div className="flex flex-col gap-2">
                <span className="text-[9px] text-neutral-400 font-mono tracking-wider uppercase">Or Select Architectural Coordinates</span>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { name: 'Warm Minimalist', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200' },
                    { name: 'Cozy Architect', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' },
                    { name: 'Editorial Botanist', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200' },
                    { name: 'Stardust Persona', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200' }
                  ].map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => setEditProfileAvatar(preset.url)}
                      type="button"
                      className="group relative rounded-xl overflow-hidden aspect-square border border-stone-200 hover:border-gold-premium transition duration-300 w-full cursor-pointer"
                      title={preset.name}
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-2">
              <button
                type="button"
                onClick={() => setShowEditProfileModal(false)}
                className="px-4 py-2 border border-stone-200 hover:bg-stone-50 rounded-xl text-xs font-mono text-neutral-500 transition-all duration-300 cursor-pointer"
              >
                DISMISS
              </button>
              <button
                type="button"
                onClick={() => {
                  updateProfile(editProfileName, editProfileAvatar);
                  setShowEditProfileModal(false);
                }}
                className="px-5 py-2.5 bg-charcoal hover:bg-stone-900 border text-white rounded-xl text-xs font-mono font-semibold tracking-wider daylight-shadow transition-all duration-300 cursor-pointer"
              >
                PERSIST COORDINATES
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
