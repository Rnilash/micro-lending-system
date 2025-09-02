import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  BanknotesIcon,
  ReceiptPercentIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loading, Skeleton } from '@/components/ui/Loading';
import { formatCurrency, formatDate } from '@/lib/utils';
import { usePaymentsStore } from '@/store/payments';
import { useUIStore } from '@/store/ui';
import type { Payment, PaymentMethod } from '@/types';

const paymentMethodColors = {
  cash: 'bg-green-100 text-green-800',
  bank_transfer: 'bg-blue-100 text-blue-800',
  mobile_money: 'bg-purple-100 text-purple-800',
  cheque: 'bg-orange-100 text-orange-800',
  digital: 'bg-indigo-100 text-indigo-800',
};

export default function PaymentsPage() {
  const router = useRouter();
  const { payments, loading, fetchPayments, searchPayments } = usePaymentsStore();
  const { addNotification } = useUIStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'customer'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      await searchPayments(term);
    } else {
      await fetchPayments();
    }
  };

  // Filter payments by date
  const filterByDate = (payment: Payment) => {
    if (dateFilter === 'all') return true;
    
    const paymentDate = new Date(payment.paymentDate);
    const now = new Date();
    
    switch (dateFilter) {
      case 'today':
        return paymentDate.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return paymentDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return paymentDate >= monthAgo;
      default:
        return true;
    }
  };

  // Filter and sort payments
  const filteredPayments = payments
    .filter(payment => {
      if (methodFilter !== 'all' && payment.paymentMethod !== methodFilter) return false;
      if (!filterByDate(payment)) return false;
      if (searchTerm && 
          !payment.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !payment.loanNumber?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !payment.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'customer':
          comparison = (a.customerName || '').localeCompare(b.customerName || '');
          break;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  // Calculate stats
  const stats = {
    total: payments.length,
    todayCount: payments.filter(p => new Date(p.paymentDate).toDateString() === new Date().toDateString()).length,
    weekCount: payments.filter(p => {
      const weekAgo = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
      return new Date(p.paymentDate) >= weekAgo;
    }).length,
    totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
    todayAmount: payments
      .filter(p => new Date(p.paymentDate).toDateString() === new Date().toDateString())
      .reduce((sum, p) => sum + p.amount, 0),
  };

  if (loading && payments.length === 0) {
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
            <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
            <p className="text-gray-600 mt-1">Track and manage loan payments</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Button
              variant="outline"
              onClick={() => router.push('/reports/payments')}
              className="flex items-center space-x-2"
            >
              <ReceiptPercentIcon className="w-4 h-4" />
              <span>Reports</span>
            </Button>
            <Button
              onClick={() => router.push('/payments/new')}
              className="flex items-center space-x-2"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Record Payment</span>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Payments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <BanknotesIcon className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Payments</p>
                <p className="text-2xl font-bold text-green-600">{stats.todayCount}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalAmount)}</p>
              </div>
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <BanknotesIcon className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Amount</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.todayAmount)}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by customer, loan number, or receipt..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value as PaymentMethod | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Methods</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="check">Check</option>
              </select>
              
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
              
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [by, order] = e.target.value.split('-');
                  setSortBy(by as typeof sortBy);
                  setSortOrder(order as typeof sortOrder);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="amount-desc">Highest Amount</option>
                <option value="amount-asc">Lowest Amount</option>
                <option value="customer-asc">Customer A-Z</option>
                <option value="customer-desc">Customer Z-A</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Payments List */}
        <Card>
          {filteredPayments.length === 0 ? (
            <div className="p-12 text-center">
              <BanknotesIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || methodFilter !== 'all' || dateFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Start recording payments for your loans.'}
              </p>
              <Button onClick={() => router.push('/payments/new')}>
                Record Payment
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer & Loan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Receipt
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(payment.paymentDate)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment.collectedBy && `Collected by: ${payment.collectedBy}`}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {payment.customerName}
                          </div>
                          <div className="text-sm text-gray-500">
                            Loan: {payment.loanNumber}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(payment.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          paymentMethodColors[payment.paymentMethod]
                        }`}>
                          {payment.paymentMethod.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {payment.receiptNumber || 'N/A'}
                        </div>
                        {payment.receiptUrl && (
                          <a
                            href={payment.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            View Receipt
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link
                            href={`/payments/${payment.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </Link>
                          <Link
                            href={`/loans/${payment.loanId}`}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Loan
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Summary Footer */}
        {filteredPayments.length > 0 && (
          <Card className="p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Showing {filteredPayments.length} of {payments.length} payments
              </span>
              <div className="text-sm font-medium text-gray-900">
                Total: {formatCurrency(filteredPayments.reduce((sum, p) => sum + p.amount, 0))}
              </div>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}
