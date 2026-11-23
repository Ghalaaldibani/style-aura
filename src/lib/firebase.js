import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'

// Values come from .env.local (Vite only exposes variables that start with VITE_).
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// If .env.local is still empty, don't crash the whole app — just run without Firebase.
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

let app = null
let auth = null
let db = null

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  // Offline cache: data stays readable and writes are queued when the network drops.
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  })
} else {
  console.warn('[firebase] Not configured — fill in .env.local and restart `npm run dev`.')
}

export { app, auth, db }
