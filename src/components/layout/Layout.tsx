import { Loading } from '@/components/ui/Loading';
import { NotificationContainer } from '@/components/ui/Notification';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/router';
import { ReactNode, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
  title?: string;
  role?: string;
}

export default function Layout({ children, requireAuth = true }: LayoutProps) {
  const router = useRouter();
  const { user, loading, initialized } = useAuthStore();

  useEffect(() => {
    if (requireAuth && initialized && !user) {
      router.push('/auth/login');
    }
  }, [user, initialized, requireAuth, router]);

  // Show loading spinner while auth is initializing
  if (loading || !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading message="Initializing..." />
      </div>
    );
  }

  // If auth is required but user is not logged in, show nothing (redirect will happen)
  if (requireAuth && !user) {
    return null;
  }

  // Auth pages and landing page don't need the full layout
  const isAuthPage = router.pathname.startsWith('/auth');
  const isLandingPage = router.pathname === '/';
  
  if (isAuthPage || isLandingPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
        <NotificationContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Page content */}
        <main>
          {/* Header - at top of content */}
          <Header />
          {children}
        </main>
      </div>

      {/* Global notifications */}
      <NotificationContainer />
    </div>
  );
}
