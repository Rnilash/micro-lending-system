import { User as AppUser } from '@/types';
import {
    EmailAuthProvider,
    User,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    reauthenticateWithCredential,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    updatePassword,
    updateProfile,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

class AuthService {
  constructor() {
    // Initialize auth state listener
    this.initAuthStateListener();
  }

  private initAuthStateListener() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Update last login time
        await this.updateLastLogin(user.uid);
      }
    });
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<AppUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get user profile from Firestore
      const userProfile = await this.getUserProfile(user.uid);
      
      if (!userProfile) {
        throw new Error('User profile not found');
      }

      if (!userProfile.isActive) {
        throw new Error('Account is deactivated. Please contact administrator.');
      }

      return userProfile;
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  /**
   * Create new user account
   */
  async createUser(
    email: string,
    password: string,
    profile: Partial<AppUser>
  ): Promise<AppUser> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: `${profile.profile?.firstName} ${profile.profile?.lastName}`,
      });

      // Create user profile in Firestore
      const userProfile: AppUser = {
        uid: user.uid,
        id: user.uid, // Add for compatibility
        email: user.email!,
        name: `${profile.profile?.firstName} ${profile.profile?.lastName}`,
        role: profile.role || 'agent',
        profile: {
          firstName: profile.profile?.firstName || '',
          lastName: profile.profile?.lastName || '',
          phone: profile.profile?.phone || '',
          preferences: {
            language: 'en',
            theme: 'light',
            notifications: {
              email: true,
              push: true,
              sms: false,
              paymentReminders: true,
              systemAlerts: true,
            },
            dateFormat: 'DD/MM/YYYY',
            currency: 'LKR',
          },
          permissions: this.getDefaultPermissions(profile.role || 'agent'),
          ...profile.profile,
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'users', user.uid), {
        ...userProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return userProfile;
    } catch (error: any) {
      console.error('Create user error:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  /**
   * Get user profile from Firestore
   */
  async getUserProfile(uid: string): Promise<AppUser | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      
      if (!userDoc.exists()) {
        return null;
      }

      const data = userDoc.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as AppUser;
    } catch (error) {
      console.error('Get user profile error:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(uid: string, updates: Partial<AppUser>): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', uid), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Update user profile error:', error);
      throw error;
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  /**
   * Update user password
   */
  async updateUserPassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user');
      }

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);
    } catch (error: any) {
      console.error('Update password error:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  /**
   * Check if user has permission
   */
  hasPermission(user: AppUser, resource: string, action: string): boolean {
    if (user.role === 'admin') {
      return true; // Admin has all permissions
    }

    const permission = user.profile.permissions.find(p => p.resource === resource);
    return permission ? permission.actions.includes(action) : false;
  }

  /**
   * Update last login time
   */
  private async updateLastLogin(uid: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', uid), {
        lastLoginAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Update last login error:', error);
    }
  }

  /**
   * Get default permissions for role
   */
  private getDefaultPermissions(role: 'admin' | 'agent') {
    const adminPermissions = [
      { resource: 'customers', actions: ['read', 'write', 'delete'] },
      { resource: 'loans', actions: ['read', 'write', 'delete', 'approve'] },
      { resource: 'payments', actions: ['read', 'write', 'delete'] },
      { resource: 'reports', actions: ['read', 'export'] },
      { resource: 'settings', actions: ['read', 'write'] },
      { resource: 'users', actions: ['read', 'write', 'delete'] },
    ];

    const agentPermissions = [
      { resource: 'customers', actions: ['read', 'write'] },
      { resource: 'loans', actions: ['read', 'write'] },
      { resource: 'payments', actions: ['read', 'write'] },
      { resource: 'reports', actions: ['read'] },
    ];

    return role === 'admin' ? adminPermissions : agentPermissions;
  }

  /**
   * Get user-friendly error messages
   */
  private getAuthErrorMessage(code: string): string {
    switch (code) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/requires-recent-login':
        return 'Please log in again to perform this action.';
      default:
        return 'An error occurred. Please try again.';
    }
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!auth.currentUser;
  }
}

export const authService = new AuthService();
export default authService;
