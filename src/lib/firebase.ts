import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { Auth, connectAuthEmulator, getAuth } from 'firebase/auth';
import { Firestore, connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { Functions, connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { FirebaseStorage, connectStorageEmulator, getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo-project.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:demo',
};

// Initialize Firebase
const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services with fallbacks
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
export const functions: Functions = getFunctions(app);

// Connect to emulators in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Only run in browser and development mode
  const isEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true';
  
  if (isEmulator) {
    try {
      // Auth emulator - connectAuthEmulator will throw if already connected
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    } catch (error) {
      // Auth emulator already connected
    }
    
    try {
      // Firestore emulator
      connectFirestoreEmulator(db, 'localhost', 8080);
    } catch (error) {
      // Firestore emulator already connected
    }
    
    try {
      // Storage emulator
      connectStorageEmulator(storage, 'localhost', 9199);
    } catch (error) {
      // Storage emulator already connected
    }
    
    try {
      // Functions emulator
      connectFunctionsEmulator(functions, 'localhost', 5001);
    } catch (error) {
      // Functions emulator already connected
    }
  }
}

export default app;
