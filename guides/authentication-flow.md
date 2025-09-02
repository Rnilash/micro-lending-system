# Authentication Flow Guide

Complete guide for implementing user authentication in the Digital Micro-Lending Management System.

## Table of Contents
- [Authentication Architecture](#authentication-architecture)
- [User Types and Roles](#user-types-and-roles)
- [Firebase Auth Setup](#firebase-auth-setup)
- [Login Flow Implementation](#login-flow-implementation)
- [Role-Based Access Control](#role-based-access-control)
- [Session Management](#session-management)
- [Security Best Practices](#security-best-practices)
- [Multi-Factor Authentication](#multi-factor-authentication)

## Authentication Architecture

### Firebase Authentication Integration
```
Authentication Flow:
├── Firebase Auth (Primary)
├── Custom Claims (Role Management)
├── Firestore (User Profiles)
├── Session Management
└── Route Protection
```

### Security Layers
```
Security Implementation:
├── Firebase Auth Rules
├── Firestore Security Rules
├── API Route Middleware
├── Client-Side Protection
└── RBAC (Role-Based Access Control)
```

## User Types and Roles

### 1. System Admin
**Permissions:**
- Full system access
- User management
- System configuration
- Financial reporting
- Audit logs access

**Authentication:**
```typescript
interface AdminUser {
  uid: string;
  email: string;
  role: 'admin';
  permissions: [
    'user_management',
    'system_config',
    'financial_reports',
    'audit_logs',
    'backup_restore'
  ];
  createdAt: Timestamp;
  lastLogin: Timestamp;
}
```

### 2. Collection Agent
**Permissions:**
- Customer management (assigned area)
- Payment collection
- Route management
- Customer reports

**Authentication:**
```typescript
interface AgentUser {
  uid: string;
  email: string;
  phone: string;
  role: 'agent';
  permissions: [
    'customer_read',
    'customer_update',
    'payment_create',
    'route_read'
  ];
  assignedArea: string;
  agentCode: string;
  createdAt: Timestamp;
  isActive: boolean;
}
```

### 3. Customer (Optional)
**Permissions:**
- View own loan details
- Payment history
- Contact agent

**Authentication:**
```typescript
interface CustomerUser {
  uid: string;
  phone: string;
  role: 'customer';
  customerId: string;
  permissions: [
    'loan_read_own',
    'payment_read_own',
    'contact_agent'
  ];
  createdAt: Timestamp;
}
```

## Firebase Auth Setup

### 1. Enable Authentication Methods
```javascript
// Firebase Console Configuration
Authentication Methods:
├── Email/Password (Primary for Admin/Agents)
├── Phone (Primary for Customers)
├── Google Sign-In (Optional for Admin)
└── Anonymous (For demo/testing)
```

### 2. Custom Claims Setup
```javascript
// Cloud Function for setting custom claims
const admin = require('firebase-admin');

exports.setUserRole = functions.https.onCall(async (data, context) => {
  // Verify admin permissions
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can assign roles'
    );
  }

  const { uid, role, permissions } = data;
  
  // Set custom claims
  await admin.auth().setCustomUserClaims(uid, {
    role,
    permissions,
    assignedAt: Date.now()
  });

  return { success: true };
});
```

## Login Flow Implementation

### 1. Admin/Agent Login Component
```typescript
// components/auth/LoginForm.tsx
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface LoginFormProps {
  userType: 'admin' | 'agent';
}

export function LoginForm({ userType }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      // Get custom claims to verify role
      const idTokenResult = await user.getIdTokenResult();
      const userRole = idTokenResult.claims.role;
      
      if (userRole !== userType) {
        setError('Invalid user type for this login portal');
        await auth.signOut();
        return;
      }

      // Redirect based on role
      router.push(userType === 'admin' ? '/admin/dashboard' : '/agent/dashboard');
      
    } catch (error) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Signing In...' : 'Sign In'}
      </button>
    </form>
  );
}
```

### 2. Phone-Based Customer Login
```typescript
// components/auth/PhoneLogin.tsx
import { useState } from 'react';
import { signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function PhoneLogin() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const setupRecaptcha = () => {
    return new RecaptchaVerifier('recaptcha-container', {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved
      }
    }, auth);
  };

  const sendVerificationCode = async () => {
    setLoading(true);
    try {
      const appVerifier = setupRecaptcha();
      const confirmation = await signInWithPhoneNumber(
        auth, 
        `+94${phoneNumber}`, 
        appVerifier
      );
      setConfirmationResult(confirmation);
    } catch (error) {
      console.error('Error sending verification code:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    setLoading(true);
    try {
      await confirmationResult.confirm(verificationCode);
      // Customer authenticated successfully
    } catch (error) {
      console.error('Error verifying code:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {!confirmationResult ? (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone Number (without +94)
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="771234567"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <button
            onClick={sendVerificationCode}
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md"
          >
            Send Verification Code
          </button>
        </>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Verification Code
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <button
            onClick={verifyCode}
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md"
          >
            Verify Code
          </button>
        </>
      )}
      <div id="recaptcha-container"></div>
    </div>
  );
}
```

## Role-Based Access Control

### 1. RBAC Hook
```typescript
// hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthUser extends User {
  role?: string;
  permissions?: string[];
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const idTokenResult = await firebaseUser.getIdTokenResult();
        setUser({
          ...firebaseUser,
          role: idTokenResult.claims.role,
          permissions: idTokenResult.claims.permissions
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const hasPermission = (permission: string) => {
    return user?.permissions?.includes(permission) || false;
  };

  const hasRole = (role: string) => {
    return user?.role === role;
  };

  return {
    user,
    loading,
    hasPermission,
    hasRole,
    isAdmin: hasRole('admin'),
    isAgent: hasRole('agent'),
    isCustomer: hasRole('customer')
  };
}
```

### 2. Route Protection
```typescript
// components/auth/ProtectedRoute.tsx
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermission?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  requiredPermission 
}: ProtectedRouteProps) {
  const { user, loading, hasRole, hasPermission } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }

      if (requiredRole && !hasRole(requiredRole)) {
        router.push('/unauthorized');
        return;
      }

      if (requiredPermission && !hasPermission(requiredPermission)) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [user, loading, requiredRole, requiredPermission]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return null;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return null;
  }

  return <>{children}</>;
}
```

## Session Management

### 1. Session Persistence
```typescript
// lib/auth-persistence.ts
import { auth } from './firebase';
import { setPersistence, browserLocalPersistence } from 'firebase/auth';

export async function initializeAuthPersistence() {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (error) {
    console.error('Failed to set auth persistence:', error);
  }
}

export function logout() {
  return auth.signOut();
}

export function getCurrentUser() {
  return auth.currentUser;
}
```

### 2. Token Refresh
```typescript
// lib/token-manager.ts
import { auth } from './firebase';

export async function refreshUserToken() {
  const user = auth.currentUser;
  if (user) {
    try {
      await user.getIdToken(true); // Force refresh
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }
  return false;
}

// Automatic token refresh every 50 minutes
setInterval(refreshUserToken, 50 * 60 * 1000);
```

## Security Best Practices

### 1. Input Validation
```typescript
// lib/validation.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

export const phoneSchema = z.object({
  phone: z.string().regex(/^[0-9]{9}$/, 'Invalid Sri Lankan phone number')
});
```

### 2. Rate Limiting
```typescript
// lib/rate-limiter.ts
const attempts = new Map();

export function checkRateLimit(identifier: string, maxAttempts = 5) {
  const now = Date.now();
  const userAttempts = attempts.get(identifier) || [];
  
  // Remove attempts older than 15 minutes
  const recentAttempts = userAttempts.filter(
    (time: number) => now - time < 15 * 60 * 1000
  );
  
  if (recentAttempts.length >= maxAttempts) {
    throw new Error('Too many login attempts. Please try again later.');
  }
  
  recentAttempts.push(now);
  attempts.set(identifier, recentAttempts);
}
```

### 3. Password Security
```typescript
// lib/password-utils.ts
export function generateSecurePassword(): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < 12; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
}

export function validatePasswordStrength(password: string): {
  isValid: boolean;
  requirements: string[];
} {
  const requirements = [];
  
  if (password.length < 8) {
    requirements.push('At least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    requirements.push('At least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    requirements.push('At least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    requirements.push('At least one number');
  }
  
  if (!/[!@#$%^&*]/.test(password)) {
    requirements.push('At least one special character');
  }
  
  return {
    isValid: requirements.length === 0,
    requirements
  };
}
```

## Multi-Factor Authentication

### 1. SMS-Based MFA
```typescript
// lib/mfa.ts
import { PhoneAuthProvider, linkWithCredential } from 'firebase/auth';
import { auth } from './firebase';

export async function enableSMSMFA(phoneNumber: string) {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');

  const provider = new PhoneAuthProvider(auth);
  const verificationId = await provider.verifyPhoneNumber(
    phoneNumber,
    window.recaptchaVerifier
  );

  return verificationId;
}

export async function confirmSMSMFA(verificationId: string, code: string) {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');

  const credential = PhoneAuthProvider.credential(verificationId, code);
  await linkWithCredential(user, credential);
}
```

### 2. App-Based MFA (Future Enhancement)
```typescript
// lib/totp-mfa.ts
import { authenticator } from 'otplib';

export function generateMFASecret(): string {
  return authenticator.generateSecret();
}

export function generateQRCode(secret: string, email: string): string {
  return authenticator.keyuri(email, 'Micro Lending System', secret);
}

export function verifyTOTP(token: string, secret: string): boolean {
  return authenticator.verify({ token, secret });
}
```

## Implementation Checklist

### Authentication Setup
- [ ] Configure Firebase Authentication methods
- [ ] Implement custom claims for role management
- [ ] Set up Firestore security rules
- [ ] Create user profile management

### Login Flows
- [ ] Admin/Agent email/password login
- [ ] Customer phone-based authentication
- [ ] Password reset functionality
- [ ] Account activation flow

### Security Implementation
- [ ] Role-based access control
- [ ] Route protection middleware
- [ ] Input validation and sanitization
- [ ] Rate limiting for login attempts
- [ ] Session management and token refresh

### User Management
- [ ] User creation and role assignment
- [ ] Profile management
- [ ] Password policy enforcement
- [ ] Account deactivation/reactivation

### Advanced Features
- [ ] Multi-factor authentication
- [ ] Audit logging
- [ ] Device management
- [ ] Single sign-on (future)

## Testing Authentication

### Unit Tests
```typescript
// __tests__/auth.test.ts
import { validatePasswordStrength } from '@/lib/password-utils';

describe('Password Validation', () => {
  test('should require minimum length', () => {
    const result = validatePasswordStrength('short');
    expect(result.isValid).toBe(false);
    expect(result.requirements).toContain('At least 8 characters long');
  });

  test('should accept strong password', () => {
    const result = validatePasswordStrength('StrongPass123!');
    expect(result.isValid).toBe(true);
    expect(result.requirements).toHaveLength(0);
  });
});
```

### Integration Tests
```typescript
// __tests__/auth-flow.test.ts
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

describe('Authentication Flow', () => {
  test('should authenticate admin user', async () => {
    const result = await signInWithEmailAndPassword(
      auth,
      'admin@test.com',
      'testpassword'
    );
    
    const token = await result.user.getIdTokenResult();
    expect(token.claims.role).toBe('admin');
  });
});
```

## Troubleshooting

### Common Issues
1. **CORS Errors**: Configure Firebase Auth domains
2. **Token Expiry**: Implement automatic refresh
3. **Role Sync**: Ensure custom claims propagation
4. **Recaptcha Issues**: Verify site configuration

### Debug Tools
```typescript
// lib/auth-debug.ts
export function debugAuthState() {
  auth.onAuthStateChanged((user) => {
    console.log('Auth State:', {
      uid: user?.uid,
      email: user?.email,
      emailVerified: user?.emailVerified,
      customClaims: user?.getIdTokenResult().then(r => r.claims)
    });
  });
}
```

This authentication flow provides a secure, scalable foundation for the micro-lending system with proper role-based access control and Sri Lankan market considerations.