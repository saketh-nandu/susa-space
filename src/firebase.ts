import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// ── Firebase Configuration ────────────────────────────────────────────────────
// Values are loaded from VITE_ environment variables so they can be configured
// per deployment without modifying source code.
//
// Fallbacks to the existing AI Studio project are provided so the app continues
// to work in the AI Studio preview environment where VITE_ vars aren't set.
// ─────────────────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    'AIzaSyDXo9bXtijfq5do88KKVtIW029zz7ltiWA',
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    'gen-lang-client-0098723332.firebaseapp.com',
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID ||
    'gen-lang-client-0098723332',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    'gen-lang-client-0098723332.firebasestorage.app',
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '861264937596',
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    '1:861264937596:web:692da59b0e5123b85e7ff9',
};

const databaseId =
  import.meta.env.VITE_FIREBASE_DATABASE_ID ||
  'ai-studio-f6e71a48-5f5d-4026-a191-b7360f6c3260';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firestore — long-polling helps in environments where WebSocket is blocked
const db = initializeFirestore(
  app,
  {
    experimentalAutoDetectLongPolling: true,
    ignoreUndefinedProperties: true,
  },
  databaseId === '(default)' ? undefined : databaseId
);

// Firebase Auth
const auth = getAuth(app);

// Firebase Storage (used as a secondary fallback if Supabase is not configured)
const storage = getStorage(app);

export { app, db, auth, storage };
