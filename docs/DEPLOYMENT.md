# Production Deployment Guide

This guide covers deploying the Digital Micro-Lending Management System to production environments.

## Table of Contents
- [Deployment Overview](#deployment-overview)
- [Pre-deployment Checklist](#pre-deployment-checklist)
- [Environment Setup](#environment-setup)
- [Firebase Configuration](#firebase-configuration)
- [Vercel Deployment](#vercel-deployment)
- [Domain Configuration](#domain-configuration)
- [Monitoring Setup](#monitoring-setup)
- [Backup Strategy](#backup-strategy)
- [Troubleshooting](#troubleshooting)

## Deployment Overview

### Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Frontend    │    │     Backend     │    │    Database     │
│   (Vercel)      │───▶│   (Firebase)    │───▶│  (Firestore)    │
│                 │    │                 │    │                 │
│ • Next.js App   │    │ • Cloud Funcs   │    │ • Collections   │
│ • Static Assets │    │ • Authentication│    │ • Security Rules│
│ • Edge Functions│    │ • Storage       │    │ • Indexes       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Deployment Environments
- **Development**: Local development with Firebase emulators
- **Staging**: Testing environment with separate Firebase project
- **Production**: Live environment with production Firebase project

## Pre-deployment Checklist

### Code Quality
- [ ] All tests passing (`npm run test`)
- [ ] TypeScript compilation successful (`npm run type-check`)
- [ ] ESLint checks pass (`npm run lint`)
- [ ] Build completes without errors (`npm run build`)
- [ ] Performance audit scores > 90
- [ ] Security audit completed

### Configuration
- [ ] Environment variables configured
- [ ] Firebase project created and configured
- [ ] Database security rules updated
- [ ] Firebase storage rules configured
- [ ] API endpoints tested
- [ ] Third-party integrations verified

### Documentation
- [ ] README.md updated
- [ ] API documentation current
- [ ] User manual completed
- [ ] Deployment documentation reviewed
- [ ] Change log updated

## Environment Setup

### 1. Create Production Environment Files

Create `.env.production`:
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=prod_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-prod-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-prod-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-prod-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Application Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_APP_VERSION=1.0.0

# Feature Flags
NEXT_PUBLIC_ENABLE_SINHALA=true
NEXT_PUBLIC_ENABLE_OFFLINE_MODE=true
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true

# Security
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=https://your-domain.com

# External Services
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn
NEXT_PUBLIC_ANALYTICS_ID=GA-TRACKING-ID

# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://your-domain.com/api
NEXT_PUBLIC_MAX_FILE_SIZE=5242880
NEXT_PUBLIC_RATE_LIMIT_REQUESTS=100
```

### 2. Staging Environment
Create `.env.staging`:
```env
# Similar to production but with staging values
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-staging-project-id
NEXT_PUBLIC_APP_URL=https://staging-your-domain.vercel.app
NEXT_PUBLIC_ENVIRONMENT=staging
```

## Firebase Configuration

### 1. Create Production Firebase Project
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Create new project (or use existing)
firebase projects:create your-prod-project-id

# Set project alias
firebase use --add your-prod-project-id --alias production
firebase use --add your-staging-project-id --alias staging
```

### 2. Configure Firebase Services

#### Firestore Database
```bash
# Initialize Firestore
firebase init firestore

# Deploy security rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

#### Authentication
```bash
# Configure authentication providers
firebase init auth

# Enable email/password authentication
# Enable Google authentication (optional)
# Configure authorized domains
```

#### Cloud Storage
```bash
# Initialize storage
firebase init storage

# Deploy storage rules
firebase deploy --only storage
```

### 3. Security Rules

#### Firestore Rules (`firestore.rules`)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
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
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated() && (isAdmin() || request.auth.uid == userId);
      allow write: if isAdmin() || (request.auth.uid == userId && 
        !('role' in request.resource.data) || 
        request.resource.data.role == resource.data.role);
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
        request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status', 'notes']));
      allow delete: if isAdmin();
    }
    
    // Payments collection
    match /payments/{paymentId} {
      allow read: if isAdmin() || resource.data.collectedBy == request.auth.uid;
      allow create: if isAdmin() || isAgent();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }
    
    // Settings collection (admin only)
    match /settings/{settingId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
  }
}
```

#### Storage Rules (`storage.rules`)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User avatars
    match /avatars/{userId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.uid == userId &&
        resource == null ||
        (resource.size < 2 * 1024 * 1024 && // 2MB limit
         request.resource.contentType.matches('image/.*'));
    }
    
    // Customer documents
    match /documents/{customerId}/{fileName} {
      allow read: if request.auth != null && 
        (getUserRole() == 'admin' || isAssignedAgent(customerId));
      allow write: if request.auth != null && 
        (getUserRole() == 'admin' || getUserRole() == 'agent') &&
        resource.size < 5 * 1024 * 1024; // 5MB limit
    }
    
    // Payment receipts
    match /receipts/{paymentId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && getUserRole() in ['admin', 'agent'];
    }
    
    function getUserRole() {
      return firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role;
    }
    
    function isAssignedAgent(customerId) {
      return getUserRole() == 'agent' && 
        firestore.get(/databases/(default)/documents/customers/$(customerId)).data.assignedAgent == request.auth.uid;
    }
  }
}
```

### 4. Deploy Firebase Configuration
```bash
# Deploy all Firebase services
firebase deploy --project production

# Deploy specific services
firebase deploy --only firestore --project production
firebase deploy --only storage --project production
firebase deploy --only functions --project production
```

## Vercel Deployment

### 1. Install Vercel CLI
```bash
npm install -g vercel
vercel login
```

### 2. Configure Vercel Project

#### Project Settings (`vercel.json`)
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "regions": ["sin1", "hnd1"],
  "functions": {
    "pages/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/admin",
      "destination": "/admin/dashboard",
      "permanent": false
    }
  ]
}
```

### 3. Environment Variables Setup

#### Add to Vercel Dashboard
```bash
# Using Vercel CLI
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production
# ... add all environment variables

# Or import from file
vercel env pull .env.vercel.local
```

#### Production Environment Variables
```env
# Required for Vercel
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://your-domain.com

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=prod_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=prod-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=prod-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=prod-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Application
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_ENVIRONMENT=production
```

### 4. Deploy to Vercel

#### Manual Deployment
```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# Deploy specific branch
vercel --prod --target production
```

#### Automatic Deployment (GitHub Integration)
1. Connect GitHub repository to Vercel
2. Configure automatic deployments
3. Set up preview deployments for pull requests

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      
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
        if: github.ref == 'refs/heads/main'
```

## Domain Configuration

### 1. Custom Domain Setup
```bash
# Add domain to Vercel project
vercel domains add your-domain.com

# Configure DNS records
# A record: @ -> 76.76.19.61
# CNAME record: www -> cname.vercel-dns.com
```

### 2. SSL Certificate
- Vercel automatically provides SSL certificates
- Certificates auto-renew
- Force HTTPS redirection enabled

### 3. Subdomain Configuration
```bash
# Add subdomains
vercel domains add admin.your-domain.com
vercel domains add api.your-domain.com
```

## Monitoring Setup

### 1. Application Monitoring (Sentry)
```bash
# Install Sentry
npm install @sentry/nextjs

# Configure Sentry
npx @sentry/wizard -i nextjs
```

#### Sentry Configuration (`sentry.client.config.js`)
```javascript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT,
  tracesSampleRate: 1.0,
  beforeSend(event, hint) {
    // Filter out sensitive data
    if (event.user) {
      delete event.user.email;
    }
    return event;
  },
});
```

### 2. Performance Monitoring
```javascript
// pages/_app.tsx
import { Analytics } from '@vercel/analytics/react';

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
```

### 3. Firebase Analytics
```javascript
// lib/analytics.ts
import { getAnalytics, logEvent } from 'firebase/analytics';
import { app } from './firebase';

const analytics = getAnalytics(app);

export const trackEvent = (eventName: string, parameters?: any) => {
  if (typeof window !== 'undefined') {
    logEvent(analytics, eventName, parameters);
  }
};
```

### 4. Health Checks
```typescript
// pages/api/health.ts
export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION,
    environment: process.env.NEXT_PUBLIC_ENVIRONMENT,
  });
}
```

## Backup Strategy

### 1. Database Backup
```bash
# Create backup script
#!/bin/bash
PROJECT_ID="your-prod-project-id"
BUCKET_NAME="your-backup-bucket"
DATE=$(date +%Y%m%d_%H%M%S)

# Export Firestore data
gcloud firestore export gs://$BUCKET_NAME/firestore-backup-$DATE \
  --project=$PROJECT_ID

# Create scheduled backup (Cloud Scheduler)
gcloud scheduler jobs create app-engine backup-firestore \
  --schedule="0 2 * * *" \
  --timezone="Asia/Colombo" \
  --http-method=POST \
  --uri="https://your-domain.com/api/backup"
```

### 2. File Storage Backup
```bash
# Backup Cloud Storage
gsutil -m cp -r gs://your-prod-project.appspot.com \
  gs://your-backup-bucket/storage-backup-$(date +%Y%m%d)
```

### 3. Configuration Backup
```bash
# Export Firebase configuration
firebase use production
firebase functions:config:get > config-backup-$(date +%Y%m%d).json

# Export security rules
cp firestore.rules backup/firestore-rules-$(date +%Y%m%d).rules
cp storage.rules backup/storage-rules-$(date +%Y%m%d).rules
```

## Troubleshooting

### Common Deployment Issues

#### 1. Build Failures
```bash
# Check build logs
vercel logs your-deployment-url

# Local build test
npm run build
npm start

# Check for TypeScript errors
npm run type-check
```

#### 2. Environment Variables
```bash
# Verify environment variables
vercel env ls

# Test locally with production env
vercel env pull .env.local
npm run dev
```

#### 3. Firebase Connection Issues
```bash
# Test Firebase connection
firebase projects:list
firebase use production
firebase firestore:rules:get

# Check authentication
firebase auth:export users.json --project production
```

#### 4. Domain/SSL Issues
```bash
# Check domain configuration
vercel domains ls

# Verify DNS propagation
nslookup your-domain.com
dig your-domain.com

# Check SSL certificate
curl -I https://your-domain.com
```

### Performance Issues

#### 1. Slow Loading
- Check Vercel Analytics for performance metrics
- Analyze bundle size with `npm run analyze`
- Optimize images and static assets
- Review database query performance

#### 2. High Database Usage
```bash
# Monitor Firestore usage
firebase firestore:stats --project production

# Analyze query performance
# Review security rules for efficiency
# Check for missing indexes
```

### Security Issues

#### 1. Authentication Problems
```bash
# Check Firebase Auth logs
firebase auth:import --help

# Verify security rules
firebase firestore:rules:test --project production
```

#### 2. Data Access Issues
- Review Firestore security rules
- Check user roles and permissions
- Verify API endpoint authorization

## Post-Deployment Tasks

### 1. Verification Checklist
- [ ] Application loads successfully
- [ ] User authentication works
- [ ] Database operations function correctly
- [ ] File uploads work
- [ ] Email notifications sent
- [ ] Mobile responsiveness verified
- [ ] Performance metrics acceptable
- [ ] Security scans completed

### 2. User Acceptance Testing
- [ ] Admin dashboard functionality
- [ ] Agent mobile interface
- [ ] Customer data operations
- [ ] Loan processing workflow
- [ ] Payment recording system
- [ ] Report generation
- [ ] Sinhala language support

### 3. Go-Live Tasks
- [ ] DNS records updated
- [ ] SSL certificate verified
- [ ] Monitoring alerts configured
- [ ] Backup procedures tested
- [ ] Documentation updated
- [ ] Team training completed
- [ ] Support procedures established

### 4. Ongoing Maintenance
- [ ] Regular security updates
- [ ] Performance monitoring
- [ ] Database optimization
- [ ] User feedback collection
- [ ] Feature enhancement planning

This deployment guide ensures a smooth, secure, and reliable production deployment of your micro-lending management system.