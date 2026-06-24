import React, { useState, useEffect, useRef } from 'react';
import { useSusaStore } from '../store';
import { account } from '../appwrite';
import { OAuthProvider } from 'appwrite';
import {
  Mail, Lock, User, ArrowRight, Sparkles,
  Cpu, Layout, Sliders, Feather,
} from 'lucide-react';
import SusaLogo from './SusaLogo';

interface Particle {
  x: number; y: number; vx: number; vy: number;
  radius: number; color: string; galaxy: 'milkyway' | 'andromeda';
}

type InfoTopic = 'synapse' | 'temple' | 'core' | null;

export default function CosmicLanding() {
  const { login } = useSusaStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [activeInfoTopic, setActiveInfoTopic] = useState<InfoTopic>(null);

  // ── Particle canvas background ───────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let particles: Particle[] = [];
    const COUNT = 90;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize);
    resize();

    for (let i = 0; i < COUNT; i++) {
      const isMW = i < COUNT / 2;
      particles.push({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.5 + 0.5,
        color: isMW ? 'rgba(228,197,158,' : 'rgba(165,180,252,',
        galaxy: isMW ? 'milkyway' : 'andromeda',
      });
    }

    let mx = -1000, my = -1000;
    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    window.addEventListener('mousemove', onMove);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const g1 = ctx.createRadialGradient(canvas.width * 0.2, canvas.height * 0.3, 0, canvas.width * 0.2, canvas.height * 0.3, canvas.width * 0.5);
      g1.addColorStop(0, 'rgba(24,16,11,0.4)'); g1.addColorStop(1, 'rgba(6,6,7,0)');
      ctx.fillStyle = g1; ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (mx !== -1000) { const dx = mx - p.x, dy = my - p.y, d = Math.hypot(dx, dy); if (d < 220) { p.x += dx * 0.003; p.y += dy * 0.003; } }
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        const pulse = 0.4 + Math.sin(Date.now() * 0.0012 + i) * 0.5;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color + pulse + ')'; ctx.fill();
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j]; if (p.galaxy !== q.galaxy) continue;
          const dx = p.x - q.x, dy = p.y - q.y, dist = Math.hypot(dx, dy);
          const max = p.galaxy === 'milkyway' ? 140 : 160;
          if (dist < max) { const a = (1 - dist / max) * 0.12 * pulse;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = p.galaxy === 'milkyway' ? `rgba(228,197,158,${a})` : `rgba(165,180,252,${a})`;
            ctx.lineWidth = 0.5; ctx.stroke(); }
        }
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener('resize', resize); window.removeEventListener('mousemove', onMove); cancelAnimationFrame(animId); };
  }, []);

  // ── Auth helpers ──────────────────────────────────────────────────────────

  const handleGoogleLogin = async () => {
    try {
      await account.createOAuth2Session(
        OAuthProvider.Google,
        window.location.origin,
        window.location.origin
      );
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Google login failed. Please try again.' });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    
    try {
      // First, check if we're already logged in - if yes, log out first
      try {
        await account.get();
        await account.deleteSession('current');
      } catch (err) {
        // No active session, which is fine
      }

      // Check if it's an Orbit ID (no @ symbol)
      if (!email.includes('@')) {
        // Validate Orbit ID and password (these are fixed IDs)
        const cleanId = email.trim().toLowerCase();
        const cleanSecret = password.trim();
        const isSaketh = cleanId === 'saketh_nandu127' || cleanId === 'saketh';
        const isSupriya = cleanId === 'srirenu127' || cleanId === 'supriya';
        const passwordOk = cleanSecret === 'SupriyaSaketh127';

        if (!(isSaketh || isSupriya) || !passwordOk) {
          setMessage({ type: 'error', text: 'Incorrect Orbit ID or password.' });
          setIsLoading(false);
          return;
        }

        // Determine the corresponding email for Appwrite login
        const appwriteEmail = isSaketh ? 'saketh@example.com' : 'supriya@example.com';
        const userName = isSaketh ? 'Saketh' : 'Supriya';
        
        // Try to log in to Appwrite first
        try {
          await account.createEmailPasswordSession(appwriteEmail, password);
        } catch (loginErr: any) {
          // If login fails because user doesn't exist, create them first
          if (loginErr.code === 401 || loginErr.type === 'user_invalid_credentials') {
            try {
              await account.create('unique()', appwriteEmail, password, userName);
              // Now login with the new user
              await account.createEmailPasswordSession(appwriteEmail, password);
            } catch (createErr: any) {
              // If user already exists (409), just try to log in again
              if (createErr.code === 409 || createErr.message.includes('already exists')) {
                await account.createEmailPasswordSession(appwriteEmail, password);
              } else {
                throw createErr;
              }
            }
          } else {
            throw loginErr;
          }
        }

        // Get user info from Appwrite
        const user = await account.get();
        login(user.email, user.name || userName);
      } else {
        // Normal email login
        try {
          await account.createEmailPasswordSession(email, password);
        } catch (loginErr: any) {
          // If user doesn't exist and we're in signup mode, create them
          if (authMode === 'signup' && (loginErr.code === 401 || loginErr.type === 'user_invalid_credentials')) {
            try {
              await account.create('unique()', email, password, fullName || email.split('@')[0]);
              await account.createEmailPasswordSession(email, password);
            } catch (createErr: any) {
              // If user already exists (409), just try to log in again
              if (createErr.code === 409 || createErr.message.includes('already exists')) {
                await account.createEmailPasswordSession(email, password);
              } else {
                throw createErr;
              }
            }
          } else {
            throw loginErr;
          }
        }
        
        const user = await account.get();
        login(user.email, user.name || email.split('@')[0]);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setMessage({ type: 'error', text: err.message || 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMockSelect = (role: 'saketh' | 'supriya') => {
    setIsLoading(true);
    setTimeout(() => {
      if (role === 'saketh') {
        login('nandusaketh5@gmail.com', 'Saketh', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200');
      } else {
        login('supriya@example.com', 'Supriya', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200');
      }
      setIsLoading(false);
    }, 800);
  };

  // ── JSX ──────────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen bg-[#050506] text-neutral-100 flex flex-col justify-between overflow-hidden font-sans">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-auto z-0 opacity-85" />
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#E4C59E]/20 to-transparent z-10" />

      {/* Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
        <SusaLogo size={38} />
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-8 text-[11px] font-mono tracking-widest text-[#9d9da5]">
            <button onClick={() => setActiveInfoTopic('synapse')} className="hover:text-[#E4C59E] transition flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#E4C59E]" /> SYNAPSE SYSTEM
            </button>
            <button onClick={() => setActiveInfoTopic('temple')} className="hover:text-[#E4C59E] transition">ARCHITECTURAL TEMPLE</button>
            <button onClick={() => setActiveInfoTopic('core')} className="hover:text-[#E4C59E] transition">SECURE CORE</button>
          </nav>
          <div className="text-[10px] font-mono tracking-widest text-[#E4C59E] bg-[#E4C59E]/5 border border-[#E4C59E]/15 px-3.5 py-1.5 rounded-full flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E4C59E] animate-ping" /> SECURE MATRIX ONLINE
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center py-8 lg:py-16">

        {/* Left — hero copy */}
        <div className="lg:col-span-7 flex flex-col gap-8 text-left">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#171411] to-[#0d0c0b] border border-[#E4C59E]/20 text-[#E4C59E] rounded-full px-4 py-1.5 text-[11px] font-mono tracking-wider w-fit">
            <Sparkles className="w-3 h-3" /><span className="uppercase">State Synchronization Enabled</span>
          </div>
          <div className="space-y-4">
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-light leading-[1.1] tracking-tight text-white">
              An elegant, modular<br />
              <span className="font-serif italic bg-gradient-to-r from-white via-[#E6D4BE] to-[#bca689] bg-clip-text text-transparent">Second OS Brain</span>.
            </h1>
            <p className="text-sm sm:text-base text-neutral-400 max-w-xl leading-relaxed font-light">
              Simplify your creative and personal universe. SUSA aggregates spatial notebooks, visual timeline planners, focused custom timers, and encrypted coordinates into a highly secure, visually pristine workdesk.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-neutral-900 pt-8 mt-4">
            {[
              { icon: <Layout className="w-3.5 h-3.5 text-amber-200" />, color: 'bg-yellow-950/20 border-amber-600/20', title: 'Temporal Desk', desc: 'Visual hour blocks, Pomodoro timers, and structured calendars.' },
              { icon: <Feather className="w-3.5 h-3.5 text-indigo-300" />, color: 'bg-indigo-950/20 border-indigo-600/20', title: 'Obsidian Locker', desc: 'Editorial logs, mood index tracking, and file preservation nodes.' },
              { icon: <Sliders className="w-3.5 h-3.5 text-emerald-300" />, color: 'bg-emerald-950/20 border-emerald-600/20', title: 'Sovereign State', desc: 'Auto-saved Appwrite cloud, local-first offline fallback.' },
            ].map(p => (
              <div key={p.title} className="flex flex-col gap-2.5 p-4 rounded-2xl bg-gradient-to-b from-neutral-900/40 to-transparent border border-neutral-900 hover:border-neutral-800 transition">
                <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${p.color}`}>{p.icon}</div>
                <h3 className="font-serif text-sm font-medium text-neutral-200">{p.title}</h3>
                <p className="text-[11px] text-neutral-500 leading-normal">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — auth card */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto relative z-20">
          <div className="relative overflow-hidden rounded-3xl bg-neutral-950/70 border border-[#E4C59E]/15 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl flex flex-col gap-6 group">
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-amber-600/5 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-600/10 transition" />
            <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-indigo-600/5 rounded-full blur-2xl pointer-events-none" />

            {/* Mode toggle */}
            <div className="space-y-3 relative z-10">
              <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#E4C59E] block">COSMIC SELECTION GATE</span>
              <div className="grid grid-cols-2 p-1 bg-neutral-900/60 rounded-xl border border-neutral-800/80">
                {(['login', 'signup'] as const).map(m => (
                  <button key={m} onClick={() => { setAuthMode(m); setMessage(null); }}
                    className={`text-[10px] py-2 rounded-lg transition tracking-widest font-mono uppercase ${authMode === m ? 'bg-[#E4C59E] text-neutral-950 font-bold shadow-sm' : 'text-neutral-400 hover:text-white'}`}>
                    {m === 'login' ? 'LOG IN' : 'REGISTER'}
                  </button>
                ))}
              </div>
            </div>

            {message && (
              <div className={`p-3.5 rounded-xl text-[11px] font-mono text-center ${message.type === 'error' ? 'bg-red-950/20 border border-red-500/20 text-red-300' : 'bg-emerald-900/25 border border-emerald-500/25 text-emerald-300'}`}>
                {message.text}
              </div>
            )}

            {/* Google Login Button */}
            <button onClick={handleGoogleLogin} disabled={isLoading}
              className="w-full bg-white hover:bg-neutral-100 text-neutral-900 font-bold py-3 px-4 rounded-xl border border-neutral-200 flex items-center justify-center gap-3 transition">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="text-xs font-mono tracking-widest uppercase">Continue with Google</span>
            </button>

            <div className="flex items-center gap-3 text-neutral-600 font-mono text-[9px] uppercase tracking-[0.2em]">
              <span className="flex-1 h-[1px] bg-neutral-900" />OR USE EMAIL<span className="flex-1 h-[1px] bg-neutral-900" />
            </div>

            {/* Email / password form */}
            <form onSubmit={handleLogin} className="flex flex-col gap-4 text-[11px] font-mono">
              {authMode === 'signup' && (
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-neutral-400 font-medium tracking-wider">YOUR NAME</label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3.5 text-[#E4C59E]/70 w-3.5 h-3.5" />
                  <input type="text" placeholder="e.g. Your name" value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full bg-neutral-900/60 border border-neutral-800 focus:border-[#E4C59E] outline-none rounded-xl py-3 pl-10 pr-4 text-white font-sans tracking-normal transition" />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-neutral-400 font-medium tracking-wider">EMAIL OR ID</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 text-[#E4C59E]/70 w-3.5 h-3.5" />
                  <input type="text" required placeholder="you@example.com or your_id127" value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-neutral-900/60 border border-neutral-800 focus:border-[#E4C59E] outline-none rounded-xl py-3 pl-10 pr-4 text-white font-sans tracking-normal transition" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-neutral-400 font-medium tracking-wider">PASSWORD</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 text-[#E4C59E]/70 w-3.5 h-3.5" />
                  <input type="password" required placeholder="••••••••" minLength={6} value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-neutral-900/60 border border-neutral-800 focus:border-[#E4C59E] outline-none rounded-xl py-3 pl-10 pr-4 text-white font-sans tracking-normal transition" />
                </div>
              </div>

              <button type="submit" disabled={isLoading}
                className="w-full bg-[#E4C59E] hover:bg-[#d4b184] text-neutral-950 font-bold py-3.5 rounded-xl font-mono tracking-widest text-xs transition mt-2 hover:scale-[1.01] flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50">
                {isLoading ? 'CONNECTING...' : authMode === 'login' ? 'ESTABLISH LINK' : 'CREATE ACCOUNT'}
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 font-mono gap-4">
        <span>© 2026 SUSA Space. Private digital workspace.</span>
        <div className="flex items-center gap-6">
          <span>COSMIC PROTOCOLS</span>
          <span className="text-neutral-800">•</span>
          <span>SYNAPTIC MAP</span>
        </div>
      </footer>

      {/* Info modals */}
      {activeInfoTopic && (
        <div className="fixed inset-0 bg-neutral-950/85 backdrop-blur-xl z-[20000] flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-neutral-950/90 border border-[#E6D4BE]/25 rounded-3xl p-7 shadow-2xl flex flex-col gap-6 relative">
            <button onClick={() => setActiveInfoTopic(null)} className="absolute top-5 right-5 text-neutral-400 hover:text-white transition">✕</button>
            {activeInfoTopic === 'synapse' && <>
              <div className="text-3xl">🧠</div>
              <div><h4 className="text-base font-serif italic text-neutral-100 font-bold">Synapse Synchronizer Node</h4><p className="text-[11px] text-[#E4C59E]/75 uppercase tracking-widest font-mono mt-1">Real-Time Data Pipeline</p></div>
              <p className="text-xs text-neutral-400 leading-relaxed font-sans">SUSA's global state layer operates a low-latency reactive link backed by Appwrite Realtime. Changes sync across all devices in under 50ms with local-storage offline fallback.</p>
              <div className="border-t border-neutral-900 pt-4 flex flex-col gap-2 text-[10px] text-neutral-500 font-mono">
                <div className="flex justify-between"><span>PROPAGATION</span><span className="text-[#E4C59E]">&lt;50ms</span></div>
                <div className="flex justify-between"><span>BACKEND</span><span className="text-neutral-300">Appwrite WebSDK</span></div>
                <div className="flex justify-between"><span>OFFLINE</span><span className="text-neutral-300">LocalStorage fallback active</span></div>
              </div>
            </>}
            {activeInfoTopic === 'temple' && <>
              <div className="text-3xl">🏛️</div>
              <div><h4 className="text-base font-serif italic text-neutral-100 font-bold">Architectural Desk Temple</h4><p className="text-[11px] text-indigo-400 uppercase tracking-widest font-mono mt-1">High-Fidelity Design</p></div>
              <p className="text-xs text-neutral-400 leading-relaxed font-sans">Crafted around extreme usability, our modular grid organises your workflow. Spacing and typography maintain focus and minimise cognitive overhead.</p>
              <div className="border-t border-neutral-900 pt-4 flex flex-col gap-2 text-[10px] text-neutral-500 font-mono">
                <div className="flex justify-between"><span>GRID</span><span className="text-indigo-300">7 Core Axis Bento Layout</span></div>
                <div className="flex justify-between"><span>GRAPHICS</span><span className="text-neutral-300">Tailwind v4 + Canvas Particles</span></div>
              </div>
            </>}
            {activeInfoTopic === 'core' && <>
              <div className="text-3xl">🛡️</div>
              <div><h4 className="text-base font-serif italic text-neutral-100 font-bold">Encrypted Secure Core</h4><p className="text-[11px] text-red-400 uppercase tracking-widest font-mono mt-1">Privacy-First Architecture</p></div>
              <p className="text-xs text-neutral-400 leading-relaxed font-sans">Auth via Appwrite, media stored in Appwrite encrypted buckets. No third-party trackers. Orbit is invisible to public users.</p>
              <div className="border-t border-neutral-900 pt-4 flex flex-col gap-2 text-[10px] text-neutral-500 font-mono">
                <div className="flex justify-between"><span>AUTH</span><span className="text-red-300">Appwrite Auth</span></div>
                <div className="flex justify-between"><span>STORAGE</span><span className="text-neutral-300">Appwrite Encrypted Buckets</span></div>
                <div className="flex justify-between"><span>DATABASE</span><span className="text-neutral-300">Appwrite Databases</span></div>
              </div>
            </>}
            <button onClick={() => setActiveInfoTopic(null)}
              className="w-full bg-[#E4C59E] hover:bg-[#d4b184] text-neutral-950 font-bold py-3 rounded-xl text-xs font-mono tracking-widest transition mt-2 cursor-pointer">
              ACKNOWLEDGE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
