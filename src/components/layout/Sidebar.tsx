import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/ui';
import { UserRole } from '@/types';
import {
    BanknotesIcon,
    BuildingLibraryIcon,
    ChartBarIcon,
    CogIcon,
    CreditCardIcon,
    DocumentTextIcon,
    HomeIcon,
    UserGroupIcon,
    UserIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  badge?: string;
}

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: HomeIcon,
    roles: ['admin', 'agent'],
  },
  {
    name: 'Customers',
    href: '/customers',
    icon: UserGroupIcon,
    roles: ['admin', 'agent'],
  },
  {
    name: 'Loans',
    href: '/loans',
    icon: CreditCardIcon,
    roles: ['admin', 'agent'],
  },
  {
    name: 'Payments',
    href: '/payments',
    icon: BanknotesIcon,
    roles: ['admin', 'agent'],
  },
  {
    name: 'Collections',
    href: '/collections',
    icon: BuildingLibraryIcon,
    roles: ['admin', 'agent'],
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: ChartBarIcon,
    roles: ['admin', 'agent'],
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: DocumentTextIcon,
    roles: ['admin'],
  },
  {
    name: 'Users',
    href: '/users',
    icon: UserIcon,
    roles: ['admin'],
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: CogIcon,
    roles: ['admin', 'agent'],
  },
];

export default function Sidebar() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  const userRole = user?.profile?.role || 'agent';
  
  // Filter navigation items based on user role
  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(userRole)
  );

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-25 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        `}
      >
        <div className="flex h-full flex-col">
          {/* Logo and close button */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ML</span>
              </div>
              <span className="text-xl font-bold text-gray-900">MicroLend</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* User info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium text-sm">
                  {user?.profile?.firstName?.[0] || user?.name?.[0] || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.profile?.firstName} {user?.profile?.lastName} || {user?.name}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {userRole}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const isActive = router.pathname === item.href || 
                              router.pathname.startsWith(item.href + '/');
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150
                    ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={`
                      flex-shrink-0 w-5 h-5 mr-3
                      ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                    `}
                  />
                  {item.name}
                  {item.badge && (
                    <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
