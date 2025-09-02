import { ReactNode, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  UsersIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  DocumentChartBarIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  role?: 'admin' | 'agent';
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: ('admin' | 'agent')[];
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['admin', 'agent'] },
  { name: 'Customers', href: '/customers', icon: UsersIcon, roles: ['admin', 'agent'] },
  { name: 'Loans', href: '/loans', icon: CurrencyDollarIcon, roles: ['admin', 'agent'] },
  { name: 'Payments', href: '/payments', icon: CreditCardIcon, roles: ['admin', 'agent'] },
  { name: 'Reports', href: '/reports', icon: DocumentChartBarIcon, roles: ['admin', 'agent'] },
  { name: 'Settings', href: '/settings', icon: CogIcon, roles: ['admin'] },
];

export default function Layout({ children, title, role = 'agent' }: LayoutProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(role)
  );

  const handleSignOut = async () => {
    // Implement sign out logic
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={cn(
        'fixed inset-0 z-40 lg:hidden',
        sidebarOpen ? 'block' : 'hidden'
      )}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <h1 className="text-xl font-bold text-primary-600">
                Micro Lending
              </h1>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {filteredNavigation.map((item) => (
                <SidebarLink
                  key={item.name}
                  item={item}
                  isActive={router.pathname.startsWith(item.href)}
                />
              ))}
            </nav>
          </div>
          
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <UserMenu onSignOut={handleSignOut} />
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-bold text-primary-600">
                Micro Lending System
              </h1>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {filteredNavigation.map((item) => (
                <SidebarLink
                  key={item.name}
                  item={item}
                  isActive={router.pathname.startsWith(item.href)}
                />
              ))}
            </nav>
          </div>
          
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <UserMenu onSignOut={handleSignOut} />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            className="px-4 border-r border-gray-200 text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              {title && (
                <h1 className="text-2xl font-semibold text-gray-900">
                  {title}
                </h1>
              )}
            </div>
            
            <div className="ml-4 flex items-center md:ml-6">
              {/* Notifications */}
              <button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                <BellIcon className="h-6 w-6" />
              </button>
              
              {/* Profile dropdown - Desktop only */}
              <div className="ml-3 relative hidden md:block">
                <UserMenu onSignOut={handleSignOut} compact />
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarLink({ item, isActive }: { item: NavigationItem; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
        isActive
          ? 'bg-primary-100 text-primary-900'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      )}
    >
      <item.icon
        className={cn(
          'mr-3 h-6 w-6',
          isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
        )}
      />
      {item.name}
    </Link>
  );
}

function UserMenu({ onSignOut, compact = false }: { onSignOut: () => void; compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <UserCircleIcon className="h-8 w-8 text-gray-400" />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSignOut}
          leftIcon={<ArrowRightOnRectangleIcon className="h-4 w-4" />}
        >
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <UserCircleIcon className="h-10 w-10 text-gray-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-700">Demo User</p>
          <p className="text-xs text-gray-500">demo@example.com</p>
        </div>
      </div>
      <div className="mt-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onSignOut}
          leftIcon={<ArrowRightOnRectangleIcon className="h-4 w-4" />}
          className="w-full justify-start"
        >
          Sign out
        </Button>
      </div>
    </div>
  );
}
