# Firebase Setup Guide

Complete guide for setting up and configuring Firebase for the Digital Micro-Lending Management System.

## Table of Contents
- [Firebase Project Creation](#firebase-project-creation)
- [Authentication Setup](#authentication-setup)
- [Firestore Configuration](#firestore-configuration)
- [Cloud Storage Setup](#cloud-storage-setup)
- [Security Rules](#security-rules)
- [Firebase Functions](#firebase-functions)
- [Performance Monitoring](#performance-monitoring)
- [Local Development](#local-development)

## Firebase Project Creation

### 1. Create Firebase Project
1. **Go to Firebase Console**
   - Visit https://console.firebase.google.com
   - Sign in with your Google account

2. **Create New Project**
   ```
   Project Name: micro-lending-system-prod
   Project ID: micro-lending-system-prod (auto-generated)
   Analytics: Enable Google Analytics (recommended)
   ```

3. **Enable Billing** (Required for production)
   - Upgrade to Blaze plan for production usage
   - Set up budget alerts to monitor costs

### 2. Project Structure
```
Firebase Projects:
├── micro-lending-system-dev     # Development environment
├── micro-lending-system-staging # Staging environment  
└── micro-lending-system-prod    # Production environment
```

### 3. Install Firebase CLI
```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Verify installation
firebase --version
```

## Authentication Setup

### 1. Enable Authentication
1. **Navigate to Authentication**
   - Go to Firebase Console > Authentication
   - Click "Get started"

2. **Configure Sign-in Methods**
   ```
   ✅ Email/Password
   ✅ Google (optional for admin)
   ❌ Phone (future feature)
   ❌ Anonymous
   ```

### 2. Email/Password Configuration
```typescript
// Firebase Auth Configuration
const authConfig = {
  signInOptions: [
    {
      provider: 'password',
      requireDisplayName: true,
      enableEmailLinkSignIn: false,
      emailLinkSignIn: null,
    }
  ],
  signInFlow: 'popup',
  callbacks: {
    signInSuccessWithAuthResult: (authResult) => {
      // Handle successful sign in
      return false; // Avoid redirect
    }
  }
};
```

### 3. User Management Setup
```typescript
// lib/auth.ts
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth, db } from './firebase';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'agent';
  profile: {
    avatar?: string;
    phone?: string;
    address?: string;
  };
  preferences: {
    language: 'si' | 'en';
    notifications: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class AuthService {
  async createUser(userData: CreateUserData): Promise<UserProfile> {
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: userCredential.user.uid,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        profile: {},
        preferences: {
          language: 'si',
          notifications: true,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.collection('users').doc(userCredential.user.uid).set(userProfile);

      return userProfile;
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async signIn(email: string, password: string): Promise<UserProfile> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await db.collection('users').doc(userCredential.user.uid).get();
      
      if (!userDoc.exists) {
        throw new Error('User profile not found');
      }

      return userDoc.data() as UserProfile;
    } catch (error) {
      throw new Error(`Failed to sign in: ${error.message}`);
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      throw new Error(`Failed to sign out: ${error.message}`);
    }
  }

  onAuthStateChange(callback: (user: UserProfile | null) => void) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await db.collection('users').doc(firebaseUser.uid).get();
        const userProfile = userDoc.exists ? userDoc.data() as UserProfile : null;
        callback(userProfile);
      } else {
        callback(null);
      }
    });
  }
}

export const authService = new AuthService();
```

### 4. Custom Claims for Roles
```typescript
// Firebase Cloud Function for setting custom claims
import { auth } from 'firebase-admin';

export const setUserRole = functions.https.onCall(async (data, context) => {
  // Check if request is made by an admin
  if (context.auth?.token.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can set user roles');
  }

  const { uid, role } = data;

  try {
    // Set custom claims
    await auth().setCustomUserClaims(uid, { role });
    
    // Update user document
    await admin.firestore().collection('users').doc(uid).update({
      role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Failed to set user role');
  }
});
```

## Firestore Configuration

### 1. Initialize Firestore
```bash
# Initialize Firestore
firebase init firestore

# Choose existing project
? Please select an option: Use an existing project
? Select a default Firebase project: micro-lending-system-prod

# Rules file
? What file should be used for Firestore Rules? firestore.rules

# Indexes file  
? What file should be used for Firestore indexes? firestore.indexes.json
```

### 2. Database Structure
```typescript
// Database Collections Structure
interface DatabaseSchema {
  users: {
    [userId: string]: UserProfile;
  };
  customers: {
    [customerId: string]: Customer;
  };
  loans: {
    [loanId: string]: Loan;
  };
  payments: {
    [paymentId: string]: Payment;
  };
  settings: {
    [settingId: string]: SystemSettings;
  };
  notifications: {
    [notificationId: string]: Notification;
  };
  audit_logs: {
    [logId: string]: AuditLog;
  };
}
```

### 3. Firestore Indexes
```json
{
  "indexes": [
    {
      "collectionGroup": "customers",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "status", "order": "ASCENDING"},
        {"fieldPath": "createdAt", "order": "DESCENDING"}
      ]
    },
    {
      "collectionGroup": "customers",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "assignedAgent", "order": "ASCENDING"},
        {"fieldPath": "status", "order": "ASCENDING"},
        {"fieldPath": "createdAt", "order": "DESCENDING"}
      ]
    },
    {
      "collectionGroup": "loans",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "customerId", "order": "ASCENDING"},
        {"fieldPath": "status", "order": "ASCENDING"},
        {"fieldPath": "createdAt", "order": "DESCENDING"}
      ]
    },
    {
      "collectionGroup": "loans",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "status", "order": "ASCENDING"},
        {"fieldPath": "nextPaymentDate", "order": "ASCENDING"}
      ]
    },
    {
      "collectionGroup": "payments",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "loanId", "order": "ASCENDING"},
        {"fieldPath": "paymentDate", "order": "DESCENDING"}
      ]
    },
    {
      "collectionGroup": "payments",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "collectedBy", "order": "ASCENDING"},
        {"fieldPath": "paymentDate", "order": "DESCENDING"}
      ]
    },
    {
      "collectionGroup": "payments",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "customerId", "order": "ASCENDING"},
        {"fieldPath": "paymentDate", "order": "DESCENDING"}
      ]
    }
  ]
}
```

### 4. Data Migration and Seeding
```typescript
// scripts/seedDatabase.ts
import { db } from '../lib/firebase';
import { generateSampleData } from './sampleData';

export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Generate sample data
    const { customers, loans, payments, users, settings } = generateSampleData();

    // Seed users collection
    console.log('👥 Seeding users...');
    for (const user of users) {
      await db.collection('users').doc(user.uid).set(user);
    }

    // Seed customers collection
    console.log('🏪 Seeding customers...');
    for (const customer of customers) {
      await db.collection('customers').add(customer);
    }

    // Seed loans collection
    console.log('💰 Seeding loans...');
    for (const loan of loans) {
      await db.collection('loans').add(loan);
    }

    // Seed payments collection
    console.log('💳 Seeding payments...');
    for (const payment of payments) {
      await db.collection('payments').add(payment);
    }

    // Seed settings collection
    console.log('⚙️ Seeding settings...');
    await db.collection('settings').doc('system').set(settings);

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

// Run seeding
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
```

## Cloud Storage Setup

### 1. Initialize Cloud Storage
```bash
# Initialize Firebase Storage
firebase init storage

# Choose existing project
? Please select an option: Use an existing project
? Select a default Firebase project: micro-lending-system-prod

# Rules file
? What file should be used for Storage Rules? storage.rules
```

### 2. Storage Structure
```
Cloud Storage Structure:
├── documents/
│   ├── customers/{customerId}/
│   │   ├── nic_front.jpg
│   │   ├── nic_back.jpg
│   │   ├── income_proof.pdf
│   │   └── profile_photo.jpg
│   └── loans/{loanId}/
│       ├── application.pdf
│       └── guarantor_documents/
├── receipts/
│   └── payments/{paymentId}/
│       └── receipt_photo.jpg
├── avatars/
│   └── users/{userId}/
│       └── avatar.jpg
└── reports/
    ├── daily/
    ├── weekly/
    └── monthly/
```

### 3. Storage Service Implementation
```typescript
// services/storageService.ts
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export class StorageService {
  async uploadCustomerDocument(
    customerId: string,
    documentType: string,
    file: File
  ): Promise<string> {
    try {
      // Validate file type and size
      this.validateFile(file, ['image/jpeg', 'image/png', 'application/pdf'], 5 * 1024 * 1024);

      // Create file reference
      const fileName = `${documentType}_${Date.now()}.${file.name.split('.').pop()}`;
      const storageRef = ref(storage, `documents/customers/${customerId}/${fileName}`);

      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);

      return downloadURL;
    } catch (error) {
      throw new Error(`Failed to upload document: ${error.message}`);
    }
  }

  async uploadReceiptPhoto(paymentId: string, photo: File): Promise<string> {
    try {
      this.validateFile(photo, ['image/jpeg', 'image/png'], 2 * 1024 * 1024);

      const fileName = `receipt_${Date.now()}.jpg`;
      const storageRef = ref(storage, `receipts/payments/${paymentId}/${fileName}`);

      const snapshot = await uploadBytes(storageRef, photo);
      const downloadURL = await getDownloadURL(snapshot.ref);

      return downloadURL;
    } catch (error) {
      throw new Error(`Failed to upload receipt: ${error.message}`);
    }
  }

  async uploadUserAvatar(userId: string, avatar: File): Promise<string> {
    try {
      this.validateFile(avatar, ['image/jpeg', 'image/png'], 1 * 1024 * 1024);

      const fileName = `avatar_${Date.now()}.jpg`;
      const storageRef = ref(storage, `avatars/users/${userId}/${fileName}`);

      const snapshot = await uploadBytes(storageRef, avatar);
      const downloadURL = await getDownloadURL(snapshot.ref);

      return downloadURL;
    } catch (error) {
      throw new Error(`Failed to upload avatar: ${error.message}`);
    }
  }

  async deleteFile(url: string): Promise<void> {
    try {
      const fileRef = ref(storage, url);
      await deleteObject(fileRef);
    } catch (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  private validateFile(file: File, allowedTypes: string[], maxSize: number): void {
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
    }

    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`);
    }
  }
}

export const storageService = new StorageService();
```

## Security Rules

### 1. Firestore Security Rules
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    function getUserRole() {
      return getUserData().role;
    }
    
    function isAdmin() {
      return isAuthenticated() && getUserRole() == 'admin';
    }
    
    function isAgent() {
      return isAuthenticated() && getUserRole() == 'agent';
    }
    
    function isAssignedAgent(customerId) {
      return isAgent() && 
        get(/databases/$(database)/documents/customers/$(customerId)).data.assignedAgent == request.auth.uid;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated() && (isAdmin() || isOwner(userId));
      allow create: if isAdmin();
      allow update: if isAdmin() || (isOwner(userId) && 
        !('role' in request.resource.data) || 
        request.resource.data.role == resource.data.role);
      allow delete: if isAdmin();
    }

    // Customers collection
    match /customers/{customerId} {
      allow read: if isAdmin() || isAssignedAgent(customerId);
      allow create: if isAdmin() || isAgent();
      allow update: if isAdmin() || isAssignedAgent(customerId);
      allow delete: if isAdmin();
    }

    // Loans collection
    match /loans/{loanId} {
      allow read: if isAdmin() || isAssignedAgent(resource.data.customerId);
      allow create: if isAdmin() || isAgent();
      allow update: if isAdmin() || (isAgent() && 
        request.resource.data.diff(resource.data).affectedKeys().hasOnly(['notes', 'status']) &&
        request.resource.data.status in ['active', 'completed']);
      allow delete: if isAdmin();
    }

    // Payments collection
    match /payments/{paymentId} {
      allow read: if isAdmin() || 
        resource.data.collectedBy == request.auth.uid ||
        isAssignedAgent(resource.data.customerId);
      allow create: if isAdmin() || isAgent();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    // Settings collection
    match /settings/{settingId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    // Notifications collection
    match /notifications/{notificationId} {
      allow read: if isAuthenticated() && 
        (isAdmin() || resource.data.userId == request.auth.uid);
      allow create: if isAdmin();
      allow update: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow delete: if isAdmin();
    }

    // Audit logs collection (read-only for non-admins)
    match /audit_logs/{logId} {
      allow read: if isAdmin();
      allow write: if false; // Only system can write audit logs
    }
  }
}
```

### 2. Cloud Storage Security Rules
```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserRole() {
      return firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role;
    }
    
    function isAdmin() {
      return isAuthenticated() && getUserRole() == 'admin';
    }
    
    function isAgent() {
      return isAuthenticated() && getUserRole() == 'agent';
    }
    
    function isAssignedAgent(customerId) {
      return isAgent() && 
        firestore.get(/databases/(default)/documents/customers/$(customerId)).data.assignedAgent == request.auth.uid;
    }
    
    function isValidImageFile() {
      return request.resource.contentType.matches('image/.*') &&
        request.resource.size < 5 * 1024 * 1024; // 5MB limit
    }
    
    function isValidDocumentFile() {
      return (request.resource.contentType.matches('image/.*') ||
        request.resource.contentType == 'application/pdf') &&
        request.resource.size < 10 * 1024 * 1024; // 10MB limit
    }

    // User avatars
    match /avatars/users/{userId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && 
        (isAdmin() || request.auth.uid == userId) &&
        isValidImageFile();
      allow delete: if isAdmin() || request.auth.uid == userId;
    }

    // Customer documents
    match /documents/customers/{customerId}/{fileName} {
      allow read: if isAdmin() || isAssignedAgent(customerId);
      allow write: if (isAdmin() || isAssignedAgent(customerId)) &&
        isValidDocumentFile();
      allow delete: if isAdmin();
    }

    // Loan documents
    match /documents/loans/{loanId}/{fileName} {
      allow read: if isAdmin() || isAgent();
      allow write: if (isAdmin() || isAgent()) &&
        isValidDocumentFile();
      allow delete: if isAdmin();
    }

    // Payment receipts
    match /receipts/payments/{paymentId}/{fileName} {
      allow read: if isAdmin() || isAgent();
      allow write: if (isAdmin() || isAgent()) &&
        isValidImageFile();
      allow delete: if isAdmin();
    }

    // Generated reports (admin only)
    match /reports/{reportType}/{fileName} {
      allow read: if isAdmin();
      allow write: if isAdmin();
      allow delete: if isAdmin();
    }
  }
}
```

## Firebase Functions

### 1. Initialize Cloud Functions
```bash
# Initialize Firebase Functions
firebase init functions

# Choose existing project
? Please select an option: Use an existing project
? Select a default Firebase project: micro-lending-system-prod

# Language selection
? What language would you like to use to write Cloud Functions? TypeScript

# ESLint setup
? Do you want to use ESLint to catch probable bugs and enforce style? Yes

# Install dependencies
? Do you want to install dependencies with npm now? Yes
```

### 2. Essential Cloud Functions
```typescript
// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Trigger when a new customer is created
export const onCustomerCreated = functions.firestore
  .document('customers/{customerId}')
  .onCreate(async (snapshot, context) => {
    const customer = snapshot.data();
    const customerId = context.params.customerId;

    try {
      // Generate customer number if not exists
      if (!customer.customerNumber) {
        const customerNumber = await generateCustomerNumber();
        await snapshot.ref.update({ customerNumber });
      }

      // Create audit log
      await admin.firestore().collection('audit_logs').add({
        action: 'customer_created',
        userId: customer.createdBy || 'system',
        resourceId: customerId,
        resourceType: 'customer',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        details: {
          customerName: `${customer.personalInfo.firstName} ${customer.personalInfo.lastName}`,
        },
      });

      // Send notification to assigned agent
      if (customer.assignedAgent) {
        await sendNotification(customer.assignedAgent, {
          title: 'New Customer Assigned',
          body: `New customer ${customer.personalInfo.firstName} ${customer.personalInfo.lastName} has been assigned to you.`,
          type: 'customer_assigned',
          data: { customerId },
        });
      }

      console.log(`Customer ${customerId} created successfully`);
    } catch (error) {
      console.error('Error processing customer creation:', error);
    }
  });

// Trigger when a payment is recorded
export const onPaymentRecorded = functions.firestore
  .document('payments/{paymentId}')
  .onCreate(async (snapshot, context) => {
    const payment = snapshot.data();
    const paymentId = context.params.paymentId;

    try {
      // Update loan balance and payment tracking
      await updateLoanAfterPayment(payment.loanId, payment);

      // Create audit log
      await admin.firestore().collection('audit_logs').add({
        action: 'payment_recorded',
        userId: payment.collectedBy,
        resourceId: paymentId,
        resourceType: 'payment',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        details: {
          amount: payment.amount,
          loanId: payment.loanId,
          customerId: payment.customerId,
        },
      });

      // Check if loan is completed
      const loan = await admin.firestore().collection('loans').doc(payment.loanId).get();
      if (loan.exists) {
        const loanData = loan.data()!;
        if (loanData.paidInstallments >= loanData.totalInstallments) {
          await loan.ref.update({
            status: 'completed',
            completedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          // Send completion notification
          await sendNotification(loanData.customerId, {
            title: 'Loan Completed',
            body: 'Congratulations! Your loan has been fully paid.',
            type: 'loan_completed',
            data: { loanId: payment.loanId },
          });
        }
      }

      console.log(`Payment ${paymentId} processed successfully`);
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  });

// Scheduled function to check overdue payments
export const checkOverduePayments = functions.pubsub
  .schedule('0 9 * * *') // Daily at 9 AM
  .timeZone('Asia/Colombo')
  .onRun(async (context) => {
    try {
      const now = new Date();
      const threeDaysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000));

      // Find overdue loans
      const overdueLoans = await admin.firestore()
        .collection('loans')
        .where('status', '==', 'active')
        .where('nextPaymentDate', '<', threeDaysAgo)
        .get();

      console.log(`Found ${overdueLoans.size} overdue loans`);

      for (const loanDoc of overdueLoans.docs) {
        const loan = loanDoc.data();
        
        // Send notification to customer
        await sendNotification(loan.customerId, {
          title: 'Payment Overdue',
          body: 'Your loan payment is overdue. Please make payment as soon as possible.',
          type: 'payment_overdue',
          data: { loanId: loanDoc.id },
        });

        // Send notification to assigned agent
        const customer = await admin.firestore().collection('customers').doc(loan.customerId).get();
        if (customer.exists && customer.data()!.assignedAgent) {
          await sendNotification(customer.data()!.assignedAgent, {
            title: 'Customer Payment Overdue',
            body: `Customer ${customer.data()!.personalInfo.firstName} has an overdue payment.`,
            type: 'customer_overdue',
            data: { customerId: loan.customerId, loanId: loanDoc.id },
          });
        }
      }

      return null;
    } catch (error) {
      console.error('Error checking overdue payments:', error);
      throw error;
    }
  });

// Helper functions
async function generateCustomerNumber(): Promise<string> {
  const counter = await admin.firestore().collection('counters').doc('customers').get();
  
  let nextNumber = 1;
  if (counter.exists) {
    nextNumber = counter.data()!.value + 1;
  }

  await admin.firestore().collection('counters').doc('customers').set({
    value: nextNumber
  });

  return `CUST${nextNumber.toString().padStart(6, '0')}`;
}

async function updateLoanAfterPayment(loanId: string, payment: any): Promise<void> {
  const loanRef = admin.firestore().collection('loans').doc(loanId);
  
  await admin.firestore().runTransaction(async (transaction) => {
    const loanDoc = await transaction.get(loanRef);
    
    if (!loanDoc.exists) {
      throw new Error('Loan not found');
    }

    const loan = loanDoc.data()!;
    const newPaidInstallments = loan.paidInstallments + 1;
    const newOutstandingBalance = loan.outstandingBalance - payment.amount;
    
    // Calculate next payment date
    const nextPaymentDate = new Date();
    nextPaymentDate.setDate(nextPaymentDate.getDate() + 7);

    transaction.update(loanRef, {
      paidInstallments: newPaidInstallments,
      outstandingBalance: Math.max(0, newOutstandingBalance),
      nextPaymentDate: newPaidInstallments < loan.totalInstallments ? nextPaymentDate : null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });
}

async function sendNotification(userId: string, notification: any): Promise<void> {
  await admin.firestore().collection('notifications').add({
    userId,
    ...notification,
    read: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}
```

### 3. Deploy Functions
```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:onCustomerCreated

# View function logs
firebase functions:log
```

## Performance Monitoring

### 1. Enable Performance Monitoring
```typescript
// lib/performance.ts
import { getPerformance } from 'firebase/performance';
import { app } from './firebase';

export const perf = getPerformance(app);

// Custom performance traces
export function trace(name: string) {
  const trace = perf.trace(name);
  
  return {
    start: () => trace.start(),
    stop: () => trace.stop(),
    putAttribute: (name: string, value: string) => trace.putAttribute(name, value),
    putMetric: (name: string, value: number) => trace.putMetric(name, value),
  };
}

// Usage in components
export function usePerformanceTrace(traceName: string) {
  useEffect(() => {
    const performanceTrace = trace(traceName);
    performanceTrace.start();

    return () => {
      performanceTrace.stop();
    };
  }, [traceName]);
}
```

### 2. Analytics Setup
```typescript
// lib/analytics.ts
import { getAnalytics, logEvent } from 'firebase/analytics';
import { app } from './firebase';

const analytics = getAnalytics(app);

export function trackEvent(eventName: string, parameters?: any) {
  if (typeof window !== 'undefined') {
    logEvent(analytics, eventName, parameters);
  }
}

// Custom events
export const analytics = {
  customerCreated: (customerId: string) => {
    trackEvent('customer_created', { customer_id: customerId });
  },
  
  loanApproved: (loanId: string, amount: number) => {
    trackEvent('loan_approved', { 
      loan_id: loanId,
      value: amount,
      currency: 'LKR'
    });
  },
  
  paymentRecorded: (paymentId: string, amount: number) => {
    trackEvent('payment_recorded', {
      payment_id: paymentId,
      value: amount,
      currency: 'LKR'
    });
  },
};
```

## Local Development

### 1. Firebase Emulator Setup
```bash
# Install emulator suite
firebase init emulators

# Select emulators to install
? Which Firebase emulators do you want to set up?
 ◉ Authentication Emulator
 ◉ Functions Emulator
 ◉ Firestore Emulator
 ◉ Database Emulator
 ◉ Hosting Emulator
 ◉ Pub/Sub Emulator
 ◉ Storage Emulator

# Configure ports (use defaults or customize)
? Which port do you want to use for the auth emulator? 9099
? Which port do you want to use for the functions emulator? 5001
? Which port do you want to use for the firestore emulator? 8080
? Which port do you want to use for the storage emulator? 9199
? Which port do you want to use for the hosting emulator? 5000
```

### 2. Emulator Configuration
```json
// firebase.json
{
  "emulators": {
    "auth": {
      "port": 9099
    },
    "functions": {
      "port": 5001
    },
    "firestore": {
      "port": 8080
    },
    "hosting": {
      "port": 5000
    },
    "storage": {
      "port": 9199
    },
    "ui": {
      "enabled": true
    }
  }
}
```

### 3. Development Environment Setup
```typescript
// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  // Your Firebase config
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Connect to emulators in development
if (process.env.NODE_ENV === 'development') {
  if (!auth.app.options.projectId?.includes('demo-')) {
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
    connectFunctionsEmulator(functions, 'localhost', 5001);
  }
}
```

### 4. Running Emulators
```bash
# Start all emulators
firebase emulators:start

# Start specific emulators
firebase emulators:start --only firestore,auth

# Import/export data
firebase emulators:export ./emulator-data
firebase emulators:start --import ./emulator-data

# Clear emulator data
firebase emulators:exec --only firestore 'rm -rf firebase-debug.log'
```

This Firebase setup guide provides a complete foundation for your micro-lending management system with proper authentication, database structure, security rules, and development environment configuration.