import authService from '@/lib/auth';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/store/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';

export default function useAuthInitialization() {
  const { setUser, setLoading, setInitialized } = useAuthStore();

  useEffect(() => {
    setLoading(true);
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // User is signed in, get user profile from Firestore
          const userProfile = await authService.getUserProfile(firebaseUser.uid);
          
          if (userProfile && userProfile.isActive) {
            setUser(userProfile);
          } else {
            // User profile not found or inactive
            setUser(null);
          }
        } else {
          // User is signed out
          setUser(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setUser(null);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [setUser, setLoading, setInitialized]);
}
