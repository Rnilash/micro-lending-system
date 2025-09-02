# Development Environment Setup

This guide will help you set up your development environment for the Digital Micro-Lending Management System.

## Prerequisites

### Required Software
- **Node.js** (v18.0.0 or higher)
- **npm** (v8.0.0 or higher) or **yarn** (v1.22.0 or higher)
- **Git** (v2.30.0 or higher)
- **VS Code** (recommended) or your preferred editor

### Recommended VS Code Extensions
```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "firebase.vscode-firebase",
    "ms-vscode.vscode-json"
  ]
}
```

## Project Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Rnilash/micro-lending-system.git
cd micro-lending-system
```

### 2. Install Dependencies
```bash
# Using npm
npm install

# Using yarn
yarn install
```

### 3. Environment Configuration

Create environment files:
```bash
cp .env.example .env.local
cp .env.example .env.production
```

Configure your `.env.local` file:
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ENVIRONMENT=development

# Feature Flags
NEXT_PUBLIC_ENABLE_SINHALA=true
NEXT_PUBLIC_ENABLE_OFFLINE_MODE=true
NEXT_PUBLIC_ENABLE_PWA=true

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

### 4. Firebase Setup

#### Install Firebase CLI
```bash
npm install -g firebase-tools
```

#### Login to Firebase
```bash
firebase login
```

#### Initialize Firebase Project
```bash
firebase init
```

Select the following features:
- ✅ Firestore: Configure security rules and indexes
- ✅ Functions: Configure Cloud Functions
- ✅ Hosting: Configure files for Firebase Hosting
- ✅ Storage: Configure a security rules file for Cloud Storage

#### Project Configuration
```bash
# Select existing project or create new one
? Please select an option: Use an existing project
? Select a default Firebase project: your-project-id

# Firestore Setup
? What file should be used for Firestore Rules? firestore.rules
? What file should be used for Firestore indexes? firestore.indexes.json

# Functions Setup
? What language would you like to use to write Cloud Functions? TypeScript
? Do you want to use ESLint to catch probable bugs and enforce style? Yes
? Do you want to install dependencies with npm now? Yes

# Hosting Setup
? What do you want to use as your public directory? out
? Configure as a single-page app (rewrite all urls to /index.html)? No
? Set up automatic builds and deploys with GitHub? No

# Storage Setup
? What file should be used for Storage Rules? storage.rules
```

## Development Workflow

### 1. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 2. Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # TypeScript type checking

# Testing
npm run test         # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
npm run e2e          # Run Playwright E2E tests

# Firebase
npm run firebase:emulator  # Start Firebase emulators
npm run firebase:deploy    # Deploy to Firebase
npm run firebase:functions # Deploy only functions

# Database
npm run db:seed      # Seed database with sample data
npm run db:reset     # Reset database (development only)
npm run db:backup    # Backup database
```

### 3. Firebase Emulator Setup

Start the Firebase emulator suite for local development:
```bash
firebase emulators:start
```

This will start:
- **Firestore Emulator**: `localhost:8080`
- **Authentication Emulator**: `localhost:9099`
- **Functions Emulator**: `localhost:5001`
- **Storage Emulator**: `localhost:9199`
- **Hosting Emulator**: `localhost:5000`

### 4. Database Seeding

Seed your local database with sample data:
```bash
npm run db:seed
```

This will create:
- Sample customers (50 records)
- Sample loans (25 active loans)
- Sample payments (100+ payment records)
- Admin and agent user accounts
- System configuration

## IDE Configuration

### VS Code Settings
Create `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

### Prettier Configuration
Create `.prettierrc`:
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### ESLint Configuration
Your `.eslintrc.json` should include:
```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

## Database Schema Setup

### 1. Firestore Security Rules
Update `firestore.rules`:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Customers collection
    match /customers/{customerId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'agent'];
    }
    
    // Loans collection
    match /loans/{loanId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'agent'];
    }
    
    // Payments collection
    match /payments/{paymentId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'agent'];
    }
  }
}
```

### 2. Firestore Indexes
Update `firestore.indexes.json`:
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
      "collectionGroup": "loans",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "customerId", "order": "ASCENDING"},
        {"fieldPath": "status", "order": "ASCENDING"},
        {"fieldPath": "createdAt", "order": "DESCENDING"}
      ]
    },
    {
      "collectionGroup": "payments",
      "queryScope": "COLLECTION", 
      "fields": [
        {"fieldPath": "loanId", "order": "ASCENDING"},
        {"fieldPath": "paymentDate", "order": "DESCENDING"}
      ]
    }
  ]
}
```

## Troubleshooting

### Common Issues

#### 1. Firebase Configuration Issues
```bash
# Verify Firebase project
firebase projects:list

# Check current project
firebase use

# Switch project if needed
firebase use your-project-id
```

#### 2. Node Modules Issues
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 3. Port Already in Use
```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)

# Or use different port
npm run dev -- --port 3001
```

#### 4. TypeScript Errors
```bash
# Clear Next.js cache
rm -rf .next

# Type check
npm run type-check

# Rebuild
npm run build
```

### Environment-Specific Issues

#### Development
- Ensure Firebase emulators are running
- Check environment variables in `.env.local`
- Verify database seeding completed successfully

#### Production
- Validate Firebase project configuration
- Check production environment variables
- Verify Firestore security rules are deployed

## Next Steps

After completing the setup:

1. **Read the Architecture Guide**: [docs/ARCHITECTURE.md](ARCHITECTURE.md)
2. **Follow the Development Guide**: [guides/development-guide.md](../guides/development-guide.md)
3. **Set up Firebase**: [guides/firebase-setup.md](../guides/firebase-setup.md)
4. **Understand the Database Design**: [guides/database-design.md](../guides/database-design.md)

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)