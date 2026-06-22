import React, { useState, useEffect } from 'react';
import { SusaProvider, useSusaStore } from './store';
import SusaPublic from './components/SusaPublic';
import OrbitSecret from './components/OrbitSecret';
import CosmicLanding from './components/CosmicLanding';
import ConstellationTransition from './components/ConstellationTransition';
import { Search, Compass, Key, Sparkles, MessageSquare, ShieldAlert } from 'lucide-react';
import SusaLogo from './components/SusaLogo';

function SusaAppMain() {
  const { state, tryOrbitAuth, exitOrbit, activeUserRole } = useSusaStore();
  const [showPalette, setShowPalette] = useState(false);
  const [paletteInput, setPaletteInput] = useState('');
  const [showOrbitAuth, setShowOrbitAuth] = useState(false);

  // Orbit login credential states
  const [orbitId, setOrbitId] = useState('');
  const [orbitSecret, setOrbitSecret] = useState('');
  const [authError, setAuthError] = useState('');

  // Transition controller
  const [orbitRevealed, setOrbitRevealed] = useState(false);
  const [isPlayingTransition, setIsPlayingTransition] = useState(false);

  const isA = activeUserRole === 'User A';
  const isMeAuthenticated = isA 
    ? (state.orbit.authenticatedUserA ?? state.orbit.authenticated) 
    : (state.orbit.authenticatedUserB ?? state.orbit.authenticated);

  useEffect(() => {
    if (isMeAuthenticated) {
      setIsPlayingTransition(true);
    } else {
      setOrbitRevealed(false);
      setIsPlayingTransition(false);
    }
  }, [isMeAuthenticated]);

  // Keyboard hooks for SUSA Space universal navigation
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // Ctrl + S open searching command console
      if (e.ctrlKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setShowPalette(v => !v);
        setShowOrbitAuth(false);
        setPaletteInput('');
        setAuthError('');
      }
      // Ctrl + H hides orbit instantly
      if (e.ctrlKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        exitOrbit();
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [exitOrbit]);

  const handlePaletteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paletteInput.trim().toLowerCase() === 'icecream') {
      const nameLower = state.currentUser?.name?.toLowerCase() || '';
      const isOwner = nameLower.includes('saketh') || nameLower.includes('supriya');
      if (!isOwner) {
        alert("⚠️ Unauthorized Access: The private Stargazing Orbit only belongs to the SUSA Founders (Saketh & Supriya). Your entry coordinates have been blocked.");
        setShowPalette(false);
        return;
      }
      // Secret entry passphrase matched. Transform keyboard modal into Orbit Authentication
      // Require ID and password to be typed again manually to access
      setShowOrbitAuth(true);
      setShowPalette(false);
      setOrbitId(''); 
      setOrbitSecret('');
    } else {
      setShowPalette(false);
    }
  };

  const handleOrbitLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = tryOrbitAuth(orbitId, orbitSecret);
    if (ok) {
      setShowOrbitAuth(false);
      setAuthError('');
    } else {
      setAuthError('Unauthorized orbit coordinates. Star alignment rejected.');
    }
  };

  if (!state.currentUser) {
    return <CosmicLanding />;
  }

  return (
    <div className="relative min-h-screen bg-[#F5F2ED]">
      {/* Cinematic Star Constellation Dissolve Overlay */}
      {isPlayingTransition && (
        <ConstellationTransition 
          onComplete={() => {
            setIsPlayingTransition(false);
            setOrbitRevealed(true);
          }} 
        />
      )}

      {/* Dynamic Screen routing with fade transitions */}
      <div className={`transition-all duration-700 ${orbitRevealed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
        <SusaPublic />
      </div>

      <div className={`transition-all duration-1000 ${orbitRevealed ? 'opacity-100 h-screen w-screen overflow-hidden flex flex-col' : 'opacity-0 h-0 overflow-hidden'}`}>
        {orbitRevealed && <OrbitSecret />}
      </div>

      {/* DISGUISED COMMAND PALETTE SCREEN */}
      {showPalette && (
        <div className="fixed inset-0 bg-[#121211]/40 backdrop-blur-sm z-[9999] flex items-start justify-center pt-24 transition-opacity duration-300 animate-fade-in">
          <div className="w-full max-w-xl bg-white border border-soft-gray rounded-2xl p-4 daylight-shadow-lg flex flex-col gap-3">
            <div className="text-xs text-neutral-400 font-mono flex items-center justify-between border-b pb-2">
              <span>Universal Command Palette</span>
              <span>ESC to cancel</span>
            </div>
            <form onSubmit={handlePaletteSubmit} className="flex items-center gap-3">
              <Search className="w-5 h-5 text-gold-premium animate-pulse" />
              <input 
                type="text" 
                placeholder="Search notes, jump to journal logs, or enter coordinates..."
                className="flex-1 bg-transparent text-sm text-charcoal outline-none py-1"
                value={paletteInput}
                onChange={(e) => setPaletteInput(e.target.value)}
                autoFocus
              />
              <button 
                type="submit"
                className="bg-stone-warm hover:bg-[#C5A880] text-charcoal px-3 py-1 text-xs rounded transition duration-150"
              >
                Go
              </button>
            </form>
            <div className="bg-champagne p-3 rounded-lg text-[11px] text-neutral-500 leading-relaxed italic">
              <span className="font-semibold text-charcoal">Curator tip:</span> Search indices are instantly cataloged. Enter standard coordinates keywords for deep system transits.
            </div>
          </div>
        </div>
      )}

      {/* SECRET ORBIT AUTHENTICATION GATEWAY PORTAL */}
      {showOrbitAuth && (
        <div className="fixed inset-0 bg-black/95 z-[10000] flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-md bg-[#121211] border border-gold-premium rounded-3xl p-8 shadow-2xl flex flex-col gap-6 relative">
            <button 
              onClick={() => setShowOrbitAuth(false)}
              className="absolute top-6 right-6 text-neutral-400 hover:text-white"
            >
              ✕
            </button>

            <div className="text-center flex flex-col items-center gap-2">
              <SusaLogo size={44} iconOnly />
              <h3 className="font-serif italic text-xl text-[#E6D4BE]">Orbit Authentication Gateway</h3>
              <p className="text-xs text-neutral-400">Unlock the secure private stargazing universe and co-resilience space node.</p>
            </div>

            {authError && (
              <div className="bg-red-950/20 border border-red-500/30 p-3.5 rounded-xl flex items-start gap-3 text-xs text-red-300">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p>{authError}</p>
              </div>
            )}

            <form onSubmit={handleOrbitLoginSubmit} className="flex flex-col gap-4 text-sm">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 font-semibold">Security Identifier</label>
                <input 
                  type="text" 
                  required
                  className="bg-black/30 border border-[#2F2F2D] focus:border-gold-premium outline-none text-white px-3 py-2.5 rounded-xl text-xs font-mono"
                  placeholder="e.g. alpha_node127"
                  value={orbitId}
                  onChange={(e) => setOrbitId(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 font-semibold">Security Code Key</label>
                <input 
                  type="password" 
                  required
                  className="bg-black/30 border border-[#2F2F2D] focus:border-gold-premium outline-none text-white px-3 py-2.5 rounded-xl text-xs font-mono"
                  placeholder="••••••••"
                  value={orbitSecret}
                  onChange={(e) => setOrbitSecret(e.target.value)}
                />
              </div>

              <button 
                type="submit"
                className="bg-[#C5A880] hover:bg-[#AF9674] text-black font-semibold rounded-xl py-3 text-xs transition-all duration-300 mt-2 tracking-widest uppercase font-mono"
              >
                Establish Star Connection
              </button>
            </form>

            <p className="text-[10px] text-center text-neutral-500 leading-relaxed italic border-t border-[#FFFFFF10] pt-4">
              Tip: local preview available at localhost:3000. Default coordinates preloaded.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <SusaProvider>
      <SusaAppMain />
    </SusaProvider>
  );
}
