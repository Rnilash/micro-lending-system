# System Architecture

This document outlines the comprehensive architecture of the Digital Micro-Lending Management System, designed for Sri Lankan micro-finance businesses.

## Table of Contents
- [System Overview](#system-overview)
- [Technology Stack](#technology-stack)
- [Application Architecture](#application-architecture)
- [Database Design](#database-design)
- [Security Architecture](#security-architecture)
- [Performance Considerations](#performance-considerations)
- [Deployment Architecture](#deployment-architecture)

## System Overview

### Business Context
The system serves a small-scale money lending business with:
- **2 collection agents** for field operations
- **Weekly collection cycles** for payment processing
- **Sri Lankan market focus** with Sinhala language support
- **Mobile-first approach** for field agent productivity

### Core Components
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Admin Panel   │    │  Agent Mobile   │    │  Customer API   │
│   (Dashboard)   │    │   Interface     │    │   (Optional)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Next.js App   │
                    │   (Frontend)    │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Firebase API   │
                    │   (Backend)     │
                    └─────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Firestore     │    │ Authentication  │    │  Cloud Storage  │
│  (Database)     │    │   (Auth)        │    │   (Files)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Technology Stack

### Frontend Stack
```typescript
// Core Framework
- Next.js 14+ (React 18+)
- TypeScript 5.0+
- Tailwind CSS 3.3+

// State Management
- Zustand (Lightweight state management)
- React Query (Server state management)

// UI Components
- Headless UI (Accessible components)
- Heroicons (Icon library)
- React Hook Form (Form management)

// Internationalization
- Next-i18next (Sinhala/English support)
- React-i18next (Client-side translations)

// PWA & Mobile
- Next-PWA (Progressive Web App)
- Workbox (Service Worker)
```

### Backend Stack
```typescript
// Infrastructure
- Firebase (BaaS)
- Vercel (Hosting & Edge Functions)

// Database
- Firestore (NoSQL Document DB)
- Firebase Realtime Database (Real-time updates)

// Authentication
- Firebase Auth (User management)
- Custom claims (Role-based access)

// Storage
- Firebase Cloud Storage (File storage)
- CDN (Content delivery)

// Functions
- Next.js API Routes (Server-side logic)
- Firebase Cloud Functions (Background tasks)
```

### Development Tools
```typescript
// Code Quality
- ESLint (Linting)
- Prettier (Code formatting)
- Husky (Git hooks)
- TypeScript (Type safety)

// Testing
- Jest (Unit testing)
- Playwright (E2E testing)
- React Testing Library (Component testing)

// Build & Deploy
- Next.js Build (Static generation)
- Vercel CLI (Deployment)
- Firebase CLI (Firebase deployment)
```

## Application Architecture

### Layer Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Admin     │  │   Agent     │  │    Shared UI        │ │
│  │ Dashboard   │  │  Mobile     │  │   Components        │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                     Business Logic Layer                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Customer   │  │    Loan     │  │     Payment         │ │
│  │  Service    │  │   Service   │  │     Service         │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                      Data Access Layer                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ Firestore   │  │ Firebase    │  │   Cloud Storage     │ │
│  │ Repository  │  │    Auth     │  │   Repository        │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Component Structure
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Basic UI elements
│   ├── forms/           # Form components
│   ├── tables/          # Data table components
│   └── charts/          # Chart components
├── pages/               # Next.js pages
│   ├── admin/           # Admin dashboard pages
│   ├── agent/           # Agent interface pages
│   └── api/             # API routes
├── hooks/               # Custom React hooks
├── services/            # Business logic services
├── utils/               # Utility functions
├── types/               # TypeScript type definitions
└── styles/              # Global styles
```

### State Management Architecture
```typescript
// Global State (Zustand)
interface AppState {
  user: User | null;
  customers: Customer[];
  loans: Loan[];
  payments: Payment[];
  ui: UIState;
}

// Server State (React Query)
interface QueryKeys {
  customers: ['customers', filters?];
  loans: ['loans', customerId?, status?];
  payments: ['payments', loanId?, dateRange?];
  reports: ['reports', type, dateRange];
}

// Local State (React Hooks)
// Component-specific state managed with useState/useReducer
```

## Database Design

### Firestore Collection Structure
```
/users/{userId}
  - email: string
  - name: string
  - role: 'admin' | 'agent'
  - profile: UserProfile
  - createdAt: Timestamp
  - updatedAt: Timestamp

/customers/{customerId}
  - personalInfo: PersonalInfo
  - contactInfo: ContactInfo
  - documents: Document[]
  - kycStatus: 'pending' | 'approved' | 'rejected'
  - status: 'active' | 'inactive'
  - assignedAgent: string (userId)
  - createdAt: Timestamp
  - updatedAt: Timestamp

/loans/{loanId}
  - customerId: string
  - amount: number
  - interestRate: number
  - calculationMethod: 'flat' | 'reducing'
  - installmentAmount: number
  - totalInstallments: number
  - paidInstallments: number
  - status: 'pending' | 'active' | 'completed' | 'defaulted'
  - startDate: Timestamp
  - endDate: Timestamp
  - createdBy: string (userId)
  - createdAt: Timestamp
  - updatedAt: Timestamp

/payments/{paymentId}
  - loanId: string
  - customerId: string
  - amount: number
  - paymentDate: Timestamp
  - installmentNumber: number
  - collectedBy: string (userId)
  - receiptNumber: string
  - notes: string
  - location: GeoPoint
  - photo: string (URL)
  - createdAt: Timestamp

/settings/{settingId}
  - interestRates: InterestRate[]
  - systemConfig: SystemConfig
  - businessInfo: BusinessInfo
  - updatedBy: string (userId)
  - updatedAt: Timestamp
```

### Data Relationships
```
Customer (1) ──────── (Many) Loan
    │                     │
    │                     │
    └── (Many) ─────── (Many) Payment
              Payment
```

### Indexes for Performance
```json
{
  "indexes": [
    {
      "collectionGroup": "customers",
      "fields": [
        {"fieldPath": "assignedAgent", "order": "ASCENDING"},
        {"fieldPath": "status", "order": "ASCENDING"},
        {"fieldPath": "createdAt", "order": "DESCENDING"}
      ]
    },
    {
      "collectionGroup": "loans", 
      "fields": [
        {"fieldPath": "customerId", "order": "ASCENDING"},
        {"fieldPath": "status", "order": "ASCENDING"}
      ]
    },
    {
      "collectionGroup": "payments",
      "fields": [
        {"fieldPath": "collectedBy", "order": "ASCENDING"},
        {"fieldPath": "paymentDate", "order": "DESCENDING"}
      ]
    }
  ]
}
```

## Security Architecture

### Authentication Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Login     │    │  Firebase   │    │  Firestore  │
│   Request   │───▶│    Auth     │───▶│   User      │
└─────────────┘    └─────────────┘    │  Validation │
                          │           └─────────────┘
                          ▼
                   ┌─────────────┐
                   │   JWT       │
                   │   Token     │
                   │ (with roles)│
                   └─────────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │  App State  │
                   │  Updates    │
                   └─────────────┘
```

### Authorization Model
```typescript
// Role-based permissions
interface UserRole {
  admin: {
    customers: ['read', 'write', 'delete'];
    loans: ['read', 'write', 'delete'];
    payments: ['read', 'write', 'delete'];
    reports: ['read', 'export'];
    settings: ['read', 'write'];
    users: ['read', 'write', 'delete'];
  };
  
  agent: {
    customers: ['read', 'write']; // Only assigned customers
    loans: ['read', 'write'];     // Only related loans
    payments: ['read', 'write'];  // Only own collections
    reports: ['read'];            // Own performance only
  };
}
```

### Data Security
```typescript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isAgent() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'agent';
    }
    
    function isAssignedAgent(customerId) {
      return isAgent() && 
        get(/databases/$(database)/documents/customers/$(customerId)).data.assignedAgent == request.auth.uid;
    }
  }
}
```

## Performance Considerations

### Frontend Optimization
```typescript
// Code Splitting
const AdminDashboard = dynamic(() => import('../components/AdminDashboard'), {
  loading: () => <PageSkeleton />
});

// Image Optimization
import Image from 'next/image';
<Image
  src="/customer-photo.jpg"
  alt="Customer"
  width={150}
  height={150}
  priority={false}
  placeholder="blur"
/>

// Bundle Analysis
npm run analyze
```

### Database Optimization
```typescript
// Query Optimization
const getActiveLoans = async (customerId: string) => {
  return db.collection('loans')
    .where('customerId', '==', customerId)
    .where('status', '==', 'active')
    .orderBy('createdAt', 'desc')
    .limit(10)
    .get();
};

// Pagination
const getPaginatedCustomers = async (lastDoc?: DocumentSnapshot) => {
  let query = db.collection('customers')
    .orderBy('createdAt', 'desc')
    .limit(20);
    
  if (lastDoc) {
    query = query.startAfter(lastDoc);
  }
  
  return query.get();
};
```

### Caching Strategy
```typescript
// React Query Configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Service Worker Caching
const CACHE_NAME = 'micro-lending-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
];
```

## Deployment Architecture

### Production Environment
```
┌─────────────────┐    ┌─────────────────┐
│     Vercel      │    │    Firebase     │
│   (Frontend)    │───▶│   (Backend)     │
└─────────────────┘    └─────────────────┘
         │                       │
         │              ┌─────────────────┐
         │              │   Firestore     │
         └──────────────│  (Database)     │
                        └─────────────────┘
```

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build application
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### Environment Configuration
```typescript
// Production Environment Variables
NEXT_PUBLIC_FIREBASE_API_KEY=prod_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=prod-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=prod-project-id
NEXT_PUBLIC_APP_URL=https://your-domain.com

// Development Environment Variables  
NEXT_PUBLIC_FIREBASE_API_KEY=dev_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dev-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dev-project-id
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Monitoring & Analytics

### Application Monitoring
```typescript
// Error Tracking (Sentry)
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

// Performance Monitoring
import { performance } from 'perf_hooks';

const measureDBQuery = async (operation: string, query: () => Promise<any>) => {
  const start = performance.now();
  const result = await query();
  const end = performance.now();
  
  console.log(`${operation} took ${end - start} milliseconds`);
  return result;
};
```

### Business Analytics
```typescript
// Custom Analytics Events
const trackLoanCreation = (loanData: Loan) => {
  analytics.track('loan_created', {
    amount: loanData.amount,
    customer_type: loanData.customerType,
    agent_id: loanData.createdBy,
  });
};

const trackPaymentCollection = (paymentData: Payment) => {
  analytics.track('payment_collected', {
    amount: paymentData.amount,
    loan_id: paymentData.loanId,
    collection_method: paymentData.method,
    agent_id: paymentData.collectedBy,
  });
};
```

## Scalability Considerations

### Horizontal Scaling
- **Frontend**: Vercel Edge Network automatically scales
- **Database**: Firestore auto-scales with usage
- **Functions**: Firebase Functions auto-scale with load

### Data Growth Planning
```typescript
// Collection Partitioning Strategy
/payments_2024_01/{paymentId}  // Monthly partitions
/payments_2024_02/{paymentId}
/payments_2024_03/{paymentId}

// Archive Strategy
const archiveOldPayments = async () => {
  const cutoffDate = new Date();
  cutoffDate.setFullYear(cutoffDate.getFullYear() - 2);
  
  // Move old payments to archive collection
  const oldPayments = await db.collection('payments')
    .where('paymentDate', '<', cutoffDate)
    .get();
    
  // Batch operations for archiving
};
```

### Performance Thresholds
- **Page Load Time**: < 3 seconds
- **Database Queries**: < 500ms average
- **Bundle Size**: < 250KB initial load
- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1

This architecture provides a solid foundation for a scalable, maintainable, and performant micro-lending management system tailored for Sri Lankan businesses.