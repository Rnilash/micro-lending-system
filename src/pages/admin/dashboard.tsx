import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import {
    ArrowTrendingDownIcon,
    ArrowTrendingUpIcon,
    ChartBarIcon,
    CreditCardIcon,
    CurrencyDollarIcon,
    UsersIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function AdminDashboard() {
  const router = useRouter();

  useEffect(() => {
    // Check authentication and role
    // This will be implemented with proper auth state management
  }, [router]);

  const stats = [
    {
      name: 'Total Customers',
      value: '1,234',
      change: '+12%',
      changeType: 'positive',
      icon: UsersIcon,
    },
    {
      name: 'Active Loans',
      value: '856',
      change: '+8%',
      changeType: 'positive',
      icon: CurrencyDollarIcon,
    },
    {
      name: 'Outstanding Amount',
      value: 'LKR 2.5M',
      change: '-3%',
      changeType: 'negative',
      icon: CreditCardIcon,
    },
    {
      name: 'Collection Rate',
      value: '94.2%',
      change: '+2%',
      changeType: 'positive',
      icon: ChartBarIcon,
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'loan_approval',
      message: 'Loan approved for John Doe - LKR 50,000',
      time: '2 hours ago',
    },
    {
      id: 2,
      type: 'payment',
      message: 'Payment received from Jane Smith - LKR 5,000',
      time: '4 hours ago',
    },
    {
      id: 3,
      type: 'customer',
      message: 'New customer registered - Mike Johnson',
      time: '6 hours ago',
    },
    {
      id: 4,
      type: 'overdue',
      message: 'Payment overdue - Sarah Wilson',
      time: '1 day ago',
    },
  ];

  return (
    <Layout title="Admin Dashboard" role="admin">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.name} stat={stat} />
          ))}
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart Card */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Monthly Collections
              </h3>
              <div className="h-64 flex items-center justify-center text-gray-500">
                Chart component will be implemented here
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <QuickActionButton
                title="Add Customer"
                description="Register new customer"
                href="/customers/new"
                color="primary"
              />
              <QuickActionButton
                title="New Loan"
                description="Create loan application"
                href="/loans/new"
                color="success"
              />
              <QuickActionButton
                title="Record Payment"
                description="Add payment entry"
                href="/payments/new"
                color="warning"
              />
              <QuickActionButton
                title="Generate Report"
                description="Create financial report"
                href="/reports"
                color="secondary"
              />
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}

function StatCard({ stat }: { stat: any }) {
  const Icon = stat.icon;
  
  return (
    <Card padding="md">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">
              {stat.name}
            </dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">
                {stat.value}
              </div>
              <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                stat.changeType === 'positive' ? 'text-success-600' : 'text-danger-600'
              }`}>
                {stat.changeType === 'positive' ? (
                  <ArrowTrendingUpIcon className="self-center flex-shrink-0 h-4 w-4 text-success-500" />
                ) : (
                  <ArrowTrendingDownIcon className="self-center flex-shrink-0 h-4 w-4 text-danger-500" />
                )}
                <span className="ml-1">{stat.change}</span>
              </div>
            </dd>
          </dl>
        </div>
      </div>
    </Card>
  );
}

function QuickActionButton({ 
  title, 
  description, 
  href, 
  color 
}: { 
  title: string; 
  description: string; 
  href: string; 
  color: string; 
}) {
  const colorClasses = {
    primary: 'border-primary-200 hover:border-primary-300 hover:bg-primary-50',
    success: 'border-success-200 hover:border-success-300 hover:bg-success-50',
    warning: 'border-warning-200 hover:border-warning-300 hover:bg-warning-50',
    secondary: 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
  };

  return (
    <a
      href={href}
      className={`block p-4 border-2 rounded-lg transition-colors ${colorClasses[color as keyof typeof colorClasses]}`}
    >
      <div className="text-sm font-medium text-gray-900">{title}</div>
      <div className="text-xs text-gray-500 mt-1">{description}</div>
    </a>
  );
}
