import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Connect to emulators in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Only run in browser and development mode
  const isEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true';
  
  if (isEmulator) {
    try {
      // Auth emulator
      if (!auth.config.emulator) {
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      }
      
      // Firestore emulator
      if (!(db as any)._delegate?._databaseId?.projectId?.includes('demo-')) {
        connectFirestoreEmulator(db, 'localhost', 8080);
      }
      
      // Storage emulator
      if (!storage.app.options.projectId?.includes('demo-')) {
        connectStorageEmulator(storage, 'localhost', 9199);
      }
      
      // Functions emulator
      if (!functions.app.options.projectId?.includes('demo-')) {
        connectFunctionsEmulator(functions, 'localhost', 5001);
      }
    } catch (error) {
      console.warn('Firebase emulators connection failed:', error);
    }
  }
}

export default app;
