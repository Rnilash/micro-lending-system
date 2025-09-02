import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  MapPinIcon,
  CalendarIcon,
  UserGroupIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  PhoneIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loading, Skeleton } from '@/components/ui/Loading';
import { formatCurrency, formatDate, formatPhoneNumber } from '@/lib/utils';
import { useLoansStore } from '@/store/loans';
import { usePaymentsStore } from '@/store/payments';
import { useUIStore } from '@/store/ui';
import type { Loan } from '@/types';

interface CollectionItem {
  loan: Loan;
  dueAmount: number;
  overdueWeeks: number;
  lastPaymentDate?: Date;
  customerPhone: string;
  customerAddress: string;
  priority: 'high' | 'medium' | 'low';
}

export default function CollectionsPage() {
  const router = useRouter();
  const { loans, loading, fetchLoans } = useLoansStore();
  const { payments, fetchPayments } = usePaymentsStore();
  const { addNotification } = useUIStore();
  
  const [selectedRoute, setSelectedRoute] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'amount' | 'overdue'>('priority');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  useEffect(() => {
    fetchLoans();
    fetchPayments();
  }, [fetchLoans, fetchPayments]);

  // Generate collection items from active loans
  const generateCollectionItems = (): CollectionItem[] => {
    const today = new Date();
    
    return loans
      .filter(loan => loan.status === 'active')
      .map(loan => {
        // Calculate overdue weeks
        const startDate = new Date(loan.startDate || loan.applicationDate);
        const weeksElapsed = Math.floor((today.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
        const expectedPayments = Math.min(weeksElapsed, loan.termWeeks);
        const expectedAmount = expectedPayments * loan.weeklyPayment;
        
        // Get payments for this loan
        const loanPayments = payments.filter(p => p.loanId === loan.id);
        const totalPaid = loanPayments.reduce((sum, p) => sum + p.amount, 0);
        const dueAmount = Math.max(0, expectedAmount - totalPaid);
        const overdueWeeks = Math.max(0, expectedPayments - Math.floor(totalPaid / loan.weeklyPayment));
        
        // Get last payment date
        const lastPayment = loanPayments
          .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())[0];
        
        // Determine priority
        let priority: 'high' | 'medium' | 'low' = 'low';
        if (overdueWeeks >= 3 || dueAmount >= loan.weeklyPayment * 2) {
          priority = 'high';
        } else if (overdueWeeks >= 1 || dueAmount >= loan.weeklyPayment) {
          priority = 'medium';
        }

        return {
          loan,
          dueAmount,
          overdueWeeks,
          lastPaymentDate: lastPayment ? new Date(lastPayment.paymentDate) : undefined,
          customerPhone: loan.customerPhone || '',
          customerAddress: loan.customerAddress || '',
          priority,
        };
      })
      .filter(item => item.dueAmount > 0); // Only show items with outstanding amounts
  };

  const collectionItems = generateCollectionItems();

  // Filter and sort collection items
  const filteredItems = collectionItems
    .filter(item => {
      if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;
      // TODO: Add route filtering when route management is implemented
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'amount':
          return b.dueAmount - a.dueAmount;
        case 'overdue':
          return b.overdueWeeks - a.overdueWeeks;
        default:
          return 0;
      }
    });

  // Calculate stats
  const stats = {
    totalDue: collectionItems.reduce((sum, item) => sum + item.dueAmount, 0),
    highPriority: collectionItems.filter(item => item.priority === 'high').length,
    mediumPriority: collectionItems.filter(item => item.priority === 'medium').length,
    lowPriority: collectionItems.filter(item => item.priority === 'low').length,
    totalCustomers: collectionItems.length,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return ExclamationTriangleIcon;
      case 'medium': return ClockIcon;
      case 'low': return CheckCircleIcon;
      default: return ClockIcon;
    }
  };

  if (loading && collectionItems.length === 0) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Collections</h1>
            <p className="text-gray-600 mt-1">Manage field collection operations and overdue payments</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm font-medium ${
                  viewMode === 'list' 
                    ? 'bg-blue-50 text-blue-700 border-blue-300' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-2 text-sm font-medium border-l ${
                  viewMode === 'map' 
                    ? 'bg-blue-50 text-blue-700 border-blue-300' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Map View
              </button>
            </div>
            <Button
              onClick={() => router.push('/collections/routes')}
              className="flex items-center space-x-2"
            >
              <MapPinIcon className="w-4 h-4" />
              <span>Plan Route</span>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Due</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalDue)}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <BanknotesIcon className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-red-600">{stats.highPriority}</p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Medium Priority</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.mediumPriority}</p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Priority</p>
                <p className="text-2xl font-bold text-green-600">{stats.lowPriority}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Customers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
              </div>
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <UserGroupIcon className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex space-x-4">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as typeof priorityFilter)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="priority">Sort by Priority</option>
                <option value="amount">Sort by Amount</option>
                <option value="overdue">Sort by Overdue Period</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Collection Items */}
        {viewMode === 'list' ? (
          <Card>
            {filteredItems.length === 0 ? (
              <div className="p-12 text-center">
                <CheckCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No collections due</h3>
                <p className="text-gray-600">
                  {priorityFilter !== 'all'
                    ? `No ${priorityFilter} priority collections found.`
                    : 'All payments are up to date!'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer & Loan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Payment
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredItems.map((item) => {
                      const PriorityIcon = getPriorityIcon(item.priority);
                      
                      return (
                        <tr key={item.loan.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.loan.customerName}
                              </div>
                              <div className="text-sm text-gray-500">
                                Loan: {item.loan.loanNumber}
                              </div>
                              {item.overdueWeeks > 0 && (
                                <div className="text-sm text-red-600">
                                  {item.overdueWeeks} week{item.overdueWeeks > 1 ? 's' : ''} overdue
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm text-gray-900 flex items-center">
                                <PhoneIcon className="w-4 h-4 mr-1" />
                                {formatPhoneNumber(item.customerPhone)}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center mt-1">
                                <MapPinIcon className="w-4 h-4 mr-1" />
                                {item.customerAddress.length > 30 
                                  ? `${item.customerAddress.substring(0, 30)}...`
                                  : item.customerAddress}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(item.dueAmount)}
                            </div>
                            <div className="text-sm text-gray-500">
                              Weekly: {formatCurrency(item.loan.weeklyPayment)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                              <PriorityIcon className="w-3 h-3 mr-1" />
                              {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.lastPaymentDate 
                              ? formatDate(item.lastPaymentDate)
                              : 'No payments'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => router.push(`/payments/new?loanId=${item.loan.id}`)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Collect
                              </button>
                              <button
                                onClick={() => `tel:${item.customerPhone}`}
                                className="text-green-600 hover:text-green-900"
                              >
                                Call
                              </button>
                              <button
                                onClick={() => router.push(`/loans/${item.loan.id}`)}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        ) : (
          /* Map View Placeholder */
          <Card className="p-12">
            <div className="text-center">
              <MapPinIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Map View</h3>
              <p className="text-gray-600 mb-6">
                Interactive map view for collection routes will be implemented here.
                This will show customer locations and optimized collection routes.
              </p>
              <Button 
                variant="outline"
                onClick={() => setViewMode('list')}
              >
                Switch to List View
              </Button>
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        {filteredItems.length > 0 && (
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Showing {filteredItems.length} collection{filteredItems.length !== 1 ? 's' : ''}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  Total Due: {formatCurrency(filteredItems.reduce((sum, item) => sum + item.dueAmount, 0))}
                </span>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // TODO: Export to Excel/CSV
                    addNotification({
                      type: 'info',
                      title: 'Export Feature',
                      message: 'Export functionality will be implemented soon.',
                    });
                  }}
                >
                  Export List
                </Button>
                <Button
                  size="sm"
                  onClick={() => router.push('/collections/routes')}
                >
                  Optimize Route
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}
