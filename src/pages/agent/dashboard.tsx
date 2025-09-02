import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import {
  UsersIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

export default function AgentDashboard() {
  const stats = [
    {
      name: 'My Customers',
      value: '45',
      description: 'Assigned to you',
      icon: UsersIcon,
    },
    {
      name: 'Active Loans',
      value: '32',
      description: 'Currently managed',
      icon: CurrencyDollarIcon,
    },
    {
      name: 'Collections Today',
      value: 'LKR 125K',
      description: 'Target: LKR 150K',
      icon: MapPinIcon,
    },
    {
      name: 'Overdue Payments',
      value: '8',
      description: 'Require attention',
      icon: ClockIcon,
    },
  ];

  const todaysCollections = [
    {
      id: 1,
      customerName: 'John Doe',
      amount: 'LKR 5,000',
      dueDate: 'Today',
      status: 'pending',
      address: '123 Main St, Colombo',
    },
    {
      id: 2,
      customerName: 'Jane Smith',
      amount: 'LKR 7,500',
      dueDate: 'Today',
      status: 'completed',
      address: '456 Park Ave, Kandy',
    },
    {
      id: 3,
      customerName: 'Mike Johnson',
      amount: 'LKR 3,000',
      dueDate: 'Overdue (2 days)',
      status: 'overdue',
      address: '789 Lake Rd, Galle',
    },
    {
      id: 4,
      customerName: 'Sarah Wilson',
      amount: 'LKR 6,000',
      dueDate: 'Today',
      status: 'pending',
      address: '321 Hill St, Matara',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success-100 text-success-800';
      case 'overdue':
        return 'bg-danger-100 text-danger-800';
      default:
        return 'bg-warning-100 text-warning-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Paid';
      case 'overdue':
        return 'Overdue';
      default:
        return 'Pending';
    }
  };

  return (
    <Layout title="Agent Dashboard" role="agent">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.name} padding="md">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-8 w-8 text-primary-500" />
                </div>
                <div className="ml-5">
                  <div className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    {stat.name}
                  </div>
                  <div className="text-xs text-gray-400">
                    {stat.description}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Today's Collections */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Today's Collections
            </h3>
            <p className="text-sm text-gray-500">
              Manage your daily collection routes
            </p>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-4">
              {todaysCollections.map((collection) => (
                <div
                  key={collection.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {collection.customerName}
                      </h4>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          collection.status
                        )}`}
                      >
                        {getStatusText(collection.status)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center justify-between">
                        <span>Amount: {collection.amount}</span>
                        <span>Due: {collection.dueDate}</span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        {collection.address}
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 flex space-x-2">
                    {collection.status === 'pending' && (
                      <>
                        <button className="btn btn-sm btn-primary">
                          Collect
                        </button>
                        <button className="btn btn-sm btn-secondary">
                          Visit
                        </button>
                      </>
                    )}
                    {collection.status === 'overdue' && (
                      <button className="btn btn-sm btn-warning">
                        Follow Up
                      </button>
                    )}
                    {collection.status === 'completed' && (
                      <button className="btn btn-sm btn-secondary" disabled>
                        Completed
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Quick Actions for Agents */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card padding="md">
            <div className="text-center">
              <UsersIcon className="mx-auto h-12 w-12 text-primary-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Visit Customer
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Record customer visit and update status
              </p>
              <button className="btn btn-primary w-full">
                Start Visit
              </button>
            </div>
          </Card>

          <Card padding="md">
            <div className="text-center">
              <CurrencyDollarIcon className="mx-auto h-12 w-12 text-success-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Collect Payment
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Record payment from customer
              </p>
              <button className="btn btn-success w-full">
                Collect Now
              </button>
            </div>
          </Card>

          <Card padding="md">
            <div className="text-center">
              <MapPinIcon className="mx-auto h-12 w-12 text-warning-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                View Route
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Optimize your collection route
              </p>
              <button className="btn btn-warning w-full">
                View Map
              </button>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
