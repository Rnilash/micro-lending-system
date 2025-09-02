// Firebase Configuration for Micro-Lending System
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase configuration object
// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
  }
}

// Initialize Firebase app
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Initialize Analytics (only in browser and if supported)
export const analytics = typeof window !== 'undefined' 
  ? isSupported().then(yes => yes ? getAnalytics(app) : null)
  : null;

// Development environment setup
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Connect to emulators if running locally
  const useEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true';
  
  if (useEmulators) {
    try {
      // Auth emulator
      if (!auth.config.emulator) {
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      }
      
      // Firestore emulator
      if (!db._settings?.host?.includes('localhost')) {
        connectFirestoreEmulator(db, 'localhost', 8080);
      }
      
      // Storage emulator
      if (!storage._protocol?.includes('localhost')) {
        connectStorageEmulator(storage, 'localhost', 9199);
      }
      
      // Functions emulator
      if (!functions._url?.includes('localhost')) {
        connectFunctionsEmulator(functions, 'localhost', 5001);
      }
      
      console.log('🔥 Connected to Firebase emulators');
    } catch (error) {
      console.warn('Firebase emulators connection failed:', error);
    }
  }
}

// Auth configuration
export const authConfig = {
  // Persistence settings
  persistence: 'local', // 'local', 'session', or 'none'
  
  // Custom claims refresh interval (minutes)
  claimsRefreshInterval: 50,
  
  // Supported sign-in methods
  signInMethods: {
    emailPassword: true,
    phoneNumber: true,
    google: process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === 'true',
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_AUTH_ENABLED === 'true',
  },
  
  // reCAPTCHA configuration
  recaptcha: {
    siteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
    size: 'invisible', // 'invisible', 'compact', or 'normal'
  },
  
  // Multi-factor authentication
  mfa: {
    enabled: process.env.NEXT_PUBLIC_MFA_ENABLED === 'true',
    enforced: process.env.NEXT_PUBLIC_MFA_ENFORCED === 'true',
  }
};

// Firestore configuration
export const firestoreConfig = {
  // Collection names
  collections: {
    users: 'users',
    customers: 'customers',
    loans: 'loans',
    payments: 'payments',
    routes: 'collection_routes',
    notifications: 'notifications',
    settings: 'system_settings',
    audit: 'audit_logs',
    files: 'file_metadata',
    analytics: 'analytics_data'
  },
  
  // Batch operation limits
  batch: {
    maxOperations: 500,
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  
  // Real-time listener configuration
  realtime: {
    // Auto-reconnection settings
    maxRetries: 5,
    retryDelay: 1000, // milliseconds
    
    // Data freshness settings
    cacheSizeBytes: 100 * 1024 * 1024, // 100MB
    synchronizeTabs: true,
  }
};

// Storage configuration
export const storageConfig = {
  // Bucket structure
  buckets: {
    profileImages: 'profile-images',
    documents: 'customer-documents', 
    receipts: 'payment-receipts',
    reports: 'generated-reports',
    backups: 'system-backups',
    temp: 'temporary-uploads'
  },
  
  // File upload limits
  limits: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf', 'text/csv'],
    maxFilesPerUpload: 10,
  },
  
  // Image processing
  images: {
    thumbnailSizes: [150, 300, 600],
    quality: 0.8,
    format: 'webp', // 'webp', 'jpeg', 'png'
  }
};

// Functions configuration
export const functionsConfig = {
  // Region configuration
  region: 'us-central1', // Change to your preferred region
  
  // Timeout settings
  timeout: {
    default: 30000, // 30 seconds
    longRunning: 300000, // 5 minutes for reports, backups
  },
  
  // Retry configuration
  retry: {
    maxAttempts: 3,
    backoffMultiplier: 2,
    maxDelay: 60000, // 1 minute
  }
};

// Security rules helpers
export const securityHelpers = {
  // Check if user has required permission
  hasPermission: (userClaims: any, permission: string): boolean => {
    return userClaims?.permissions?.includes(permission) || false;
  },
  
  // Check if user has required role
  hasRole: (userClaims: any, role: string): boolean => {
    return userClaims?.role === role;
  },
  
  // Check if user can access customer data
  canAccessCustomer: (userClaims: any, customerId: string): boolean => {
    if (userClaims?.role === 'admin') return true;
    if (userClaims?.role === 'agent') {
      return userClaims?.assignedCustomers?.includes(customerId) || false;
    }
    if (userClaims?.role === 'customer') {
      return userClaims?.customerId === customerId;
    }
    return false;
  }
};

// Error handling utilities
export const firebaseErrors = {
  // Map Firebase error codes to user-friendly messages
  getErrorMessage: (errorCode: string, language: 'en' | 'si' = 'en'): string => {
    const messages = {
      en: {
        'auth/user-not-found': 'No user found with this email address.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
        'auth/network-request-failed': 'Network error. Please check your connection.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/weak-password': 'Password should be at least 6 characters.',
        'auth/email-already-in-use': 'An account with this email already exists.',
        'permission-denied': 'You do not have permission to perform this action.',
        'not-found': 'The requested resource was not found.',
        'already-exists': 'A resource with this identifier already exists.',
        'unavailable': 'Service is currently unavailable. Please try again later.',
      },
      si: {
        'auth/user-not-found': 'මෙම ඊමේල් ලිපිනය සමඟ පරිශීලකයෙකු හමු නොවිණි.',
        'auth/wrong-password': 'වැරදි මුරපදයකි. කරුණාකර නැවත උත්සාහ කරන්න.',
        'auth/too-many-requests': 'ඉතා අසාර්ථක උත්සාහයන්. කරුණාකර පසුව උත්සාහ කරන්න.',
        'auth/network-request-failed': 'ජාල දෝෂයකි. කරුණාකර සම්බන්ධතාව පරීක්ෂා කරන්න.',
        'auth/invalid-email': 'කරුණාකර වලංගු ඊමේල් ලිපිනයක් ඇතුළත් කරන්න.',
        'auth/weak-password': 'මුරපදය අවම වශයෙන් අකුරු 6ක් විය යුතුයි.',
        'auth/email-already-in-use': 'මෙම ඊමේල් සමඟ ගිණුමක් දැනටමත් පවතී.',
        'permission-denied': 'මෙම ක්‍රියාව සිදු කිරීමට ඔබට අවසර නැත.',
        'not-found': 'ඉල්ලා සිටි සම්පත හමු නොවිණි.',
        'already-exists': 'මෙම හඳුනාගැනීම සමඟ සම්පතක් දැනටමත් පවතී.',
        'unavailable': 'සේවාව දැනට ලබා ගත නොහැක. කරුණාකර පසුව උත්සාහ කරන්න.',
      }
    };
    
    return messages[language][errorCode] || messages[language]['unavailable'];
  }
};

// Performance monitoring
export const performanceConfig = {
  // Enable performance monitoring
  enabled: process.env.NODE_ENV === 'production',
  
  // Custom traces
  traces: {
    pageLoad: 'page_load_time',
    apiCall: 'api_call_time',
    dataLoad: 'data_load_time',
    userAction: 'user_action_time',
  },
  
  // Metrics collection
  metrics: {
    // Automatically collect performance metrics
    automaticDataCollection: true,
    
    // Custom performance marks
    marks: {
      appStart: 'app_start',
      authComplete: 'auth_complete',
      dataReady: 'data_ready',
      uiReady: 'ui_ready',
    }
  }
};

// Export the initialized app for server-side usage
export default app;

// Utility function to check if Firebase is properly configured
export const isFirebaseConfigured = (): boolean => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
  );
};

// Log configuration status
if (typeof window !== 'undefined') {
  console.log('🔥 Firebase configuration loaded');
  console.log('📡 Environment:', process.env.NODE_ENV);
  console.log('🏗️ Project ID:', firebaseConfig.projectId);
  console.log('⚙️ Emulators:', process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true' ? 'Enabled' : 'Disabled');
}