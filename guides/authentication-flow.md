# Authentication Flow Guide

Complete authentication and authorization implementation guide for the Digital Micro-Lending Management System.

## Table of Contents
- [Authentication Overview](#authentication-overview)
- [Firebase Authentication Setup](#firebase-authentication-setup)
- [User Registration Flow](#user-registration-flow)
- [Login Implementation](#login-implementation)
- [Role-Based Access Control](#role-based-access-control)
- [Session Management](#session-management)
- [Security Best Practices](#security-best-practices)
- [Mobile Authentication](#mobile-authentication)

## Authentication Overview

### Authentication Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Firebase      │    │   Firestore     │
│   (Next.js)     │───▶│   Auth          │───▶│   User Profile  │
│                 │    │                 │    │                 │
│ • Login Forms   │    │ • JWT Tokens    │    │ • Role Data     │
│ • Route Guards  │    │ • Session Mgmt  │    │ • Permissions   │
│ • Role Checks   │    │ • Custom Claims │    │ • Preferences   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### User Roles and Permissions
```typescript
interface UserRoles {
  admin: {
    description: 'Full system access';
    permissions: [
      'users:read', 'users:write', 'users:delete',
      'customers:read', 'customers:write', 'customers:delete',
      'loans:read', 'loans:write', 'loans:delete',
      'payments:read', 'payments:write', 'payments:delete',
      'reports:read', 'reports:export',
      'settings:read', 'settings:write'
    ];
  };
  
  agent: {
    description: 'Field collection agent';
    permissions: [
      'customers:read', 'customers:write', // Assigned customers only
      'loans:read', 'loans:write',         // Related loans only
      'payments:read', 'payments:write',   // Own collections only
      'reports:read'                       // Own performance only
    ];
  };
}
```

## Firebase Authentication Setup

### 1. Initialize Firebase Auth
```typescript
// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### 2. Authentication Context
```typescript
// contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'agent';
  status: 'active' | 'inactive' | 'suspended';
  profile: {
    avatar?: string;
    phone?: string;
    address?: string;
  };
  preferences: {
    language: 'si' | 'en';
    notifications: boolean;
    theme: 'light' | 'dark';
  };
  permissions: string[];
  lastLogin?: Date;
  createdAt: Date;
}

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<UserProfile>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setFirebaseUser(firebaseUser);
          
          // Get user profile from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as UserProfile;
            
            // Update last login
            await updateUserLastLogin(firebaseUser.uid);
            
            setUser({
              ...userData,
              uid: firebaseUser.uid,
              lastLogin: new Date(),
            });
          } else {
            // User profile doesn't exist, sign out
            await signOut(auth);
            setUser(null);
          }
        } else {
          setFirebaseUser(null);
          setUser(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string): Promise<UserProfile> => {
    try {
      setLoading(true);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Get user profile
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }
      
      const userData = userDoc.data() as UserProfile;
      
      // Check if user is active
      if (userData.status !== 'active') {
        await signOut(auth);
        throw new Error(`Account is ${userData.status}. Please contact administrator.`);
      }
      
      // Update last login
      await updateUserLastLogin(firebaseUser.uid);
      
      const userProfile = {
        ...userData,
        uid: firebaseUser.uid,
        lastLogin: new Date(),
      };
      
      setUser(userProfile);
      return userProfile;
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (error: any) {
      throw new Error(error.message || 'Logout failed');
    }
  };

  const register = async (userData: RegisterData): Promise<UserProfile> => {
    try {
      setLoading(true);
      
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );
      
      // Create user profile
      const userProfile: UserProfile = {
        uid: userCredential.user.uid,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        status: 'active',
        profile: {},
        preferences: {
          language: 'si',
          notifications: true,
          theme: 'light',
        },
        permissions: getRolePermissions(userData.role),
        createdAt: new Date(),
      };
      
      // Save to Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), userProfile);
      
      setUser(userProfile);
      return userProfile;
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!user) throw new Error('No user logged in');
    
    try {
      const updatedUser = { ...user, ...updates, updatedAt: new Date() };
      
      await setDoc(doc(db, 'users', user.uid), updatedUser, { merge: true });
      setUser(updatedUser);
    } catch (error: any) {
      throw new Error(error.message || 'Profile update failed');
    }
  };

  const hasPermission = (permission: string): boolean => {
    return user?.permissions.includes(permission) || false;
  };

  const hasRole = (role: string): boolean => {
    return user?.role === role || false;
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    login,
    logout,
    register,
    updateProfile,
    hasPermission,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper functions
async function updateUserLastLogin(uid: string): Promise<void> {
  try {
    await setDoc(
      doc(db, 'users', uid),
      {
        lastLogin: new Date(),
        updatedAt: new Date(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Failed to update last login:', error);
  }
}

function getRolePermissions(role: 'admin' | 'agent'): string[] {
  const permissions = {
    admin: [
      'users:read', 'users:write', 'users:delete',
      'customers:read', 'customers:write', 'customers:delete',
      'loans:read', 'loans:write', 'loans:delete',
      'payments:read', 'payments:write', 'payments:delete',
      'reports:read', 'reports:export',
      'settings:read', 'settings:write',
    ],
    agent: [
      'customers:read', 'customers:write',
      'loans:read', 'loans:write',
      'payments:read', 'payments:write',
      'reports:read',
    ],
  };
  
  return permissions[role] || [];
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'agent';
}
```

## User Registration Flow

### 1. Registration Component
```typescript
// components/auth/RegisterForm.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  confirmPassword: z.string(),
  role: z.enum(['admin', 'agent']),
  phone: z.string().regex(/^\+94[0-9]{9}$/, 'Invalid phone number format'),
  address: z.string().min(1, 'Address is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSuccess?: () => void;
  adminOnly?: boolean;
}

export function RegisterForm({ onSuccess, adminOnly = false }: RegisterFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser, hasRole } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'agent',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    if (adminOnly && !hasRole('admin')) {
      setError('root', { message: 'Only administrators can register new users' });
      return;
    }

    setIsLoading(true);

    try {
      await registerUser({
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
      });

      // Create user profile with additional info
      // This would be handled in the register function or a separate profile update

      onSuccess?.();
    } catch (error: any) {
      setError('root', { message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          {...register('name')}
          error={errors.name?.message}
          placeholder="Enter full name"
        />
        
        <Input
          label="Email Address"
          type="email"
          {...register('email')}
          error={errors.email?.message}
          placeholder="Enter email address"
        />
        
        <Input
          label="Password"
          type="password"
          {...register('password')}
          error={errors.password?.message}
          placeholder="Enter password"
        />
        
        <Input
          label="Confirm Password"
          type="password"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
          placeholder="Confirm password"
        />
        
        <Select
          label="Role"
          {...register('role')}
          error={errors.role?.message}
          options={[
            { value: 'agent', label: 'Collection Agent' },
            { value: 'admin', label: 'Administrator' },
          ]}
        />
        
        <Input
          label="Phone Number"
          {...register('phone')}
          error={errors.phone?.message}
          placeholder="+94 77 123 4567"
        />
      </div>
      
      <Input
        label="Address"
        {...register('address')}
        error={errors.address?.message}
        placeholder="Enter full address"
      />

      {errors.root && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600 text-sm">{errors.root.message}</p>
        </div>
      )}

      <Button
        type="submit"
        loading={isLoading}
        className="w-full"
      >
        Create Account
      </Button>
    </form>
  );
}
```

### 2. Registration Process
```typescript
// services/userService.ts
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export class UserService {
  async createUser(userData: CreateUserData): Promise<UserProfile> {
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      const uid = userCredential.user.uid;

      // Create user profile
      const userProfile: UserProfile = {
        uid,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        status: 'active',
        profile: {
          phone: userData.phone,
          address: userData.address,
        },
        preferences: {
          language: 'si',
          notifications: true,
          theme: 'light',
        },
        permissions: this.getRolePermissions(userData.role),
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userData.createdBy,
      };

      // Save to Firestore
      await setDoc(doc(db, 'users', uid), userProfile);

      // Log user creation
      await this.logUserAction(uid, 'user_created', userData.createdBy);

      // Send welcome notification
      await this.sendWelcomeNotification(uid);

      return userProfile;
    } catch (error: any) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  private getRolePermissions(role: 'admin' | 'agent'): string[] {
    const rolePermissions = {
      admin: [
        'users:read', 'users:write', 'users:delete',
        'customers:read', 'customers:write', 'customers:delete',
        'loans:read', 'loans:write', 'loans:delete',
        'payments:read', 'payments:write', 'payments:delete',
        'reports:read', 'reports:export',
        'settings:read', 'settings:write',
      ],
      agent: [
        'customers:read', 'customers:write',
        'loans:read', 'loans:write',
        'payments:read', 'payments:write',
        'reports:read',
      ],
    };

    return rolePermissions[role] || [];
  }

  private async logUserAction(userId: string, action: string, performedBy?: string): Promise<void> {
    try {
      await addDoc(collection(db, 'audit_logs'), {
        userId,
        action,
        performedBy,
        timestamp: new Date(),
        details: {
          userAgent: navigator.userAgent,
          ipAddress: '', // Would need server-side implementation
        },
      });
    } catch (error) {
      console.error('Failed to log user action:', error);
    }
  }

  private async sendWelcomeNotification(userId: string): Promise<void> {
    try {
      await addDoc(collection(db, 'notifications'), {
        userId,
        title: 'Welcome to Micro Lending System',
        message: 'Your account has been created successfully. Please complete your profile setup.',
        type: 'welcome',
        read: false,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Failed to send welcome notification:', error);
    }
  }
}

export const userService = new UserService();
```

## Login Implementation

### 1. Login Form Component
```typescript
// components/auth/LoginForm.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const user = await login(data.email, data.password);
      
      // Redirect based on user role
      const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/agent/dashboard';
      
      // Get redirect URL from query params (if coming from protected route)
      const redirect = router.query.redirect as string;
      
      router.push(redirect || redirectPath);
    } catch (error: any) {
      setError('root', { message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Sign In</h1>
          <p className="text-gray-600 mt-2">Access your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Email Address"
            type="email"
            {...register('email')}
            error={errors.email?.message}
            placeholder="Enter your email"
            autoComplete="email"
          />
          
          <Input
            label="Password"
            type="password"
            {...register('password')}
            error={errors.password?.message}
            placeholder="Enter your password"
            autoComplete="current-password"
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('rememberMe')}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            
            <button
              type="button"
              className="text-sm text-blue-600 hover:text-blue-500"
              onClick={() => router.push('/auth/forgot-password')}
            >
              Forgot password?
            </button>
          </div>

          {errors.root && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600 text-sm">{errors.root.message}</p>
            </div>
          )}

          <Button
            type="submit"
            loading={isLoading}
            className="w-full"
          >
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
```

### 2. Login Page
```typescript
// pages/auth/login.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { LanguageSelector } from '@/components/ui/LanguageSelector';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // User is already logged in, redirect to dashboard
      const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/agent/dashboard';
      router.push(redirectPath);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <img
            className="mx-auto h-12 w-auto"
            src="/logo.png"
            alt="Micro Lending System"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Micro Lending System
          </h2>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}

// Redirect if already authenticated
export const getServerSideProps: GetServerSideProps = async (context) => {
  // Check for auth token in cookies
  const token = context.req.cookies.authToken;
  
  if (token) {
    // Verify token and redirect if valid
    // This would require server-side token verification
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
```

## Role-Based Access Control

### 1. Route Protection
```typescript
// components/auth/ProtectedRoute.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'agent';
  requiredPermissions?: string[];
  fallbackUrl?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  requiredPermissions = [],
  fallbackUrl = '/auth/login',
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Still loading, don't redirect yet

    if (!user) {
      // Not authenticated, redirect to login
      router.push(`${fallbackUrl}?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }

    if (user.status !== 'active') {
      // User account is not active
      router.push('/auth/account-suspended');
      return;
    }

    if (requiredRole && user.role !== requiredRole) {
      // User doesn't have required role
      router.push('/auth/unauthorized');
      return;
    }

    if (requiredPermissions.length > 0) {
      const hasAllPermissions = requiredPermissions.every(permission =>
        user.permissions.includes(permission)
      );

      if (!hasAllPermissions) {
        // User doesn't have required permissions
        router.push('/auth/unauthorized');
        return;
      }
    }
  }, [user, loading, router, requiredRole, requiredPermissions, fallbackUrl]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || user.status !== 'active') {
    return null; // Will redirect
  }

  if (requiredRole && user.role !== requiredRole) {
    return null; // Will redirect
  }

  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission =>
      user.permissions.includes(permission)
    );

    if (!hasAllPermissions) {
      return null; // Will redirect
    }
  }

  return <>{children}</>;
}
```

### 2. Permission Hook
```typescript
// hooks/usePermissions.ts
import { useAuth } from '@/contexts/AuthContext';

export function usePermissions() {
  const { user, hasPermission, hasRole } = useAuth();

  const checkPermission = (permission: string): boolean => {
    return hasPermission(permission);
  };

  const checkRole = (role: string): boolean => {
    return hasRole(role);
  };

  const checkMultiplePermissions = (permissions: string[], requireAll = true): boolean => {
    if (!user) return false;

    if (requireAll) {
      return permissions.every(permission => user.permissions.includes(permission));
    } else {
      return permissions.some(permission => user.permissions.includes(permission));
    }
  };

  const canAccessCustomer = (customerId?: string): boolean => {
    if (!user) return false;

    // Admins can access all customers
    if (user.role === 'admin') return true;

    // Agents can only access their assigned customers
    if (user.role === 'agent' && customerId) {
      return user.permissions.includes(`customer:${customerId}`) ||
             checkPermission('customers:read');
    }

    return false;
  };

  const canCollectPayments = (): boolean => {
    return checkPermission('payments:write');
  };

  const canManageUsers = (): boolean => {
    return checkRole('admin') && checkPermission('users:write');
  };

  const canViewReports = (reportType?: string): boolean => {
    if (!checkPermission('reports:read')) return false;

    // Agents can only view their own performance reports
    if (user?.role === 'agent' && reportType === 'performance') {
      return true;
    }

    // Admins can view all reports
    return user?.role === 'admin';
  };

  return {
    user,
    checkPermission,
    checkRole,
    checkMultiplePermissions,
    canAccessCustomer,
    canCollectPayments,
    canManageUsers,
    canViewReports,
    isAdmin: user?.role === 'admin',
    isAgent: user?.role === 'agent',
    isActive: user?.status === 'active',
  };
}
```

### 3. Component-Level Access Control
```typescript
// components/ui/ConditionalRender.tsx
import { usePermissions } from '@/hooks/usePermissions';

interface ConditionalRenderProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'agent';
  requiredPermissions?: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

export function ConditionalRender({
  children,
  requiredRole,
  requiredPermissions = [],
  requireAll = true,
  fallback = null,
}: ConditionalRenderProps) {
  const { user, checkRole, checkMultiplePermissions } = usePermissions();

  if (!user) return <>{fallback}</>;

  if (requiredRole && !checkRole(requiredRole)) {
    return <>{fallback}</>;
  }

  if (requiredPermissions.length > 0 && !checkMultiplePermissions(requiredPermissions, requireAll)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Usage example
export function CustomerActions({ customerId }: { customerId: string }) {
  return (
    <div className="flex space-x-2">
      <ConditionalRender requiredPermissions={['customers:write']}>
        <Button variant="outline" size="sm">
          Edit Customer
        </Button>
      </ConditionalRender>
      
      <ConditionalRender requiredRole="admin">
        <Button variant="destructive" size="sm">
          Delete Customer
        </Button>
      </ConditionalRender>
      
      <ConditionalRender requiredPermissions={['payments:write']}>
        <Button variant="primary" size="sm">
          Record Payment
        </Button>
      </ConditionalRender>
    </div>
  );
}
```

## Session Management

### 1. Token Management
```typescript
// lib/auth/tokenManager.ts
import { getAuth, onIdTokenChanged, User } from 'firebase/auth';
import { app } from '@/lib/firebase';

class TokenManager {
  private auth = getAuth(app);
  private tokenRefreshInterval: NodeJS.Timeout | null = null;
  private tokenExpiryWarningShown = false;

  startTokenRefresh() {
    this.stopTokenRefresh(); // Clear any existing interval

    this.tokenRefreshInterval = setInterval(async () => {
      try {
        const user = this.auth.currentUser;
        if (user) {
          // Refresh token every 45 minutes (tokens expire after 1 hour)
          await user.getIdToken(true);
          console.log('Token refreshed successfully');
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        this.handleTokenRefreshError();
      }
    }, 45 * 60 * 1000); // 45 minutes
  }

  stopTokenRefresh() {
    if (this.tokenRefreshInterval) {
      clearInterval(this.tokenRefreshInterval);
      this.tokenRefreshInterval = null;
    }
  }

  async getCurrentToken(): Promise<string | null> {
    try {
      const user = this.auth.currentUser;
      if (!user) return null;

      return await user.getIdToken();
    } catch (error) {
      console.error('Failed to get current token:', error);
      return null;
    }
  }

  async refreshToken(): Promise<string | null> {
    try {
      const user = this.auth.currentUser;
      if (!user) return null;

      return await user.getIdToken(true);
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return null;
    }
  }

  private handleTokenRefreshError() {
    if (!this.tokenExpiryWarningShown) {
      this.tokenExpiryWarningShown = true;
      
      // Show warning to user
      if (typeof window !== 'undefined') {
        const shouldRefresh = window.confirm(
          'Your session is about to expire. Would you like to refresh it?'
        );
        
        if (shouldRefresh) {
          window.location.reload();
        } else {
          // Redirect to login
          window.location.href = '/auth/login';
        }
      }
    }
  }

  // Monitor token changes
  onTokenChange(callback: (token: string | null) => void) {
    return onIdTokenChanged(this.auth, async (user: User | null) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          callback(token);
        } catch (error) {
          console.error('Failed to get token on change:', error);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }
}

export const tokenManager = new TokenManager();
```

### 2. Session Timeout Handling
```typescript
// hooks/useSessionTimeout.ts
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';

interface UseSessionTimeoutOptions {
  timeoutMinutes?: number;
  warningMinutes?: number;
  checkInterval?: number;
}

export function useSessionTimeout({
  timeoutMinutes = 60,
  warningMinutes = 5,
  checkInterval = 60000, // 1 minute
}: UseSessionTimeoutOptions = {}) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const lastActivityRef = useRef(Date.now());
  const intervalRef = useRef<NodeJS.Timeout>();

  const updateActivity = () => {
    lastActivityRef.current = Date.now();
    setShowWarning(false);
  };

  const checkSession = () => {
    if (!user) return;

    const now = Date.now();
    const timeSinceActivity = now - lastActivityRef.current;
    const timeoutMs = timeoutMinutes * 60 * 1000;
    const warningMs = warningMinutes * 60 * 1000;

    if (timeSinceActivity >= timeoutMs) {
      // Session expired
      logout();
      router.push('/auth/login?reason=session_expired');
    } else if (timeSinceActivity >= timeoutMs - warningMs) {
      // Show warning
      const remainingMs = timeoutMs - timeSinceActivity;
      setTimeLeft(Math.ceil(remainingMs / 1000));
      setShowWarning(true);
    }
  };

  const extendSession = () => {
    updateActivity();
    setShowWarning(false);
  };

  useEffect(() => {
    if (!user) return;

    // Set up activity listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Set up session check interval
    intervalRef.current = setInterval(checkSession, checkInterval);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user, timeoutMinutes, warningMinutes, checkInterval]);

  return {
    showWarning,
    timeLeft,
    extendSession,
  };
}
```

### 3. Session Warning Modal
```typescript
// components/auth/SessionWarningModal.tsx
import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface SessionWarningModalProps {
  isOpen: boolean;
  timeLeft: number;
  onExtend: () => void;
  onLogout: () => void;
}

export function SessionWarningModal({
  isOpen,
  timeLeft,
  onExtend,
  onLogout,
}: SessionWarningModalProps) {
  const [countdown, setCountdown] = useState(timeLeft);

  useEffect(() => {
    setCountdown(timeLeft);
  }, [timeLeft]);

  useEffect(() => {
    if (!isOpen || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, countdown, onLogout]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onExtend} closeOnOverlayClick={false}>
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <svg
              className="h-6 w-6 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Session Expiring Soon
          </h3>
          
          <p className="text-sm text-gray-500 mb-4">
            Your session will expire in{' '}
            <span className="font-mono font-bold text-red-600">
              {formatTime(countdown)}
            </span>
          </p>
          
          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={onLogout}
              className="flex-1"
            >
              Logout Now
            </Button>
            
            <Button
              variant="primary"
              onClick={onExtend}
              className="flex-1"
            >
              Extend Session
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
```

## Security Best Practices

### 1. Password Security
```typescript
// lib/auth/passwordSecurity.ts
import bcrypt from 'bcryptjs';

export class PasswordSecurity {
  private static readonly MIN_LENGTH = 8;
  private static readonly SALT_ROUNDS = 12;

  static validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < this.MIN_LENGTH) {
      errors.push(`Password must be at least ${this.MIN_LENGTH} characters long`);
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Check for common passwords
    if (this.isCommonPassword(password)) {
      errors.push('Password is too common. Please choose a more secure password');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  private static isCommonPassword(password: string): boolean {
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', 'monkey'
    ];

    return commonPasswords.includes(password.toLowerCase());
  }

  static generateSecurePassword(length: number = 12): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*(),.?":{}|<>';
    
    const allChars = uppercase + lowercase + numbers + symbols;
    
    let password = '';
    
    // Ensure at least one character from each category
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}
```

### 2. Security Headers and CSRF Protection
```typescript
// lib/security/headers.ts
export function securityHeaders() {
  return {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://api.github.com https://*.firebase.com https://*.firebaseapp.com",
      "frame-src 'self' https://*.firebase.com",
    ].join('; '),
  };
}

// CSRF Token generation and validation
export class CSRFProtection {
  private static readonly TOKEN_LENGTH = 32;

  static generateToken(): string {
    const array = new Uint8Array(this.TOKEN_LENGTH);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  static validateToken(token: string, expectedToken: string): boolean {
    if (!token || !expectedToken) return false;
    
    // Use timing-safe comparison
    let result = 0;
    for (let i = 0; i < Math.max(token.length, expectedToken.length); i++) {
      result |= (token.charCodeAt(i) || 0) ^ (expectedToken.charCodeAt(i) || 0);
    }
    
    return result === 0 && token.length === expectedToken.length;
  }
}
```

## Mobile Authentication

### 1. PWA Authentication
```typescript
// hooks/usePWAAuth.ts
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function usePWAAuth() {
  const { user } = useAuth();
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if running as PWA
    setIsInstalled(window.matchMedia('(display-mode: standalone)').matches);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return {
    isInstalled,
    canInstall: !!deferredPrompt,
    installPWA,
  };
}
```

### 2. Biometric Authentication (Future Enhancement)
```typescript
// lib/auth/biometric.ts
export class BiometricAuth {
  static async isAvailable(): Promise<boolean> {
    if (!window.PublicKeyCredential) return false;
    
    try {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      return false;
    }
  }

  static async register(userId: string, username: string): Promise<string> {
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: {
          name: 'Micro Lending System',
          id: window.location.hostname,
        },
        user: {
          id: new TextEncoder().encode(userId),
          name: username,
          displayName: username,
        },
        pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
        },
        timeout: 60000,
        attestation: 'direct',
      },
    });

    // Store credential ID for user
    return (credential as any).id;
  }

  static async authenticate(credentialId: string): Promise<boolean> {
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    try {
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials: [{
            id: new TextEncoder().encode(credentialId),
            type: 'public-key',
          }],
          userVerification: 'required',
          timeout: 60000,
        },
      });

      return !!assertion;
    } catch {
      return false;
    }
  }
}
```

This authentication flow guide provides a complete implementation for secure user authentication, role-based access control, and session management for the micro-lending management system.