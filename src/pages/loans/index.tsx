import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Loading';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useLoansStore } from '@/store/loans';
import type { LoanStatus } from '@/types';
import {
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  active: 'bg-blue-100 text-blue-800',
  completed: 'bg-gray-100 text-gray-800',
  defaulted: 'bg-red-100 text-red-800',
  rejected: 'bg-red-100 text-red-800',
};

const statusIcons = {
  pending: ClockIcon,
  approved: CheckCircleIcon,
  active: BanknotesIcon,
  completed: CheckCircleIcon,
  defaulted: XCircleIcon,
  rejected: XCircleIcon,
};

export default function LoansPage() {
  const router = useRouter();
  const { loans, loading, fetchLoans, searchLoans } = useLoansStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LoanStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      await searchLoans(term);
    } else {
      await fetchLoans();
    }
  };

  // Filter and sort loans
  const filteredLoans = loans
    .filter(loan => {
      if (statusFilter !== 'all' && loan.status !== statusFilter) return false;
      if (searchTerm && !loan.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !loan.loanNumber?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  const stats = {
    total: loans.length,
    pending: loans.filter(l => l.status === 'pending').length,
    active: loans.filter(l => l.status === 'active').length,
    completed: loans.filter(l => l.status === 'completed').length,
    defaulted: loans.filter(l => l.status === 'defaulted').length,
  };

  const totalActiveAmount = loans
    .filter(l => l.status === 'active')
    .reduce((sum, loan) => sum + loan.remainingBalance, 0);

  if (loading && loans.length === 0) {
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
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Loans</h1>
                <p className="text-gray-600">Manage loan applications and active loans</p>
              </div>
              <div className="mt-4 sm:mt-0 flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => router.push('/reports/loans')}
                  className="flex items-center space-x-2"
                >
                  <DocumentTextIcon className="w-4 h-4" />
                  <span>Reports</span>
                </Button>
                <Button
                  onClick={() => router.push('/loans/new')}
                  className="flex items-center space-x-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>New Loan</span>
                </Button>
              </div>
            </div>
          </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Loans</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <BanknotesIcon className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Outstanding</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalActiveAmount)}</p>
              </div>
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <BanknotesIcon className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by customer name or loan number..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as LoanStatus | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="defaulted">Defaulted</option>
                <option value="rejected">Rejected</option>
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
                <option value="status-asc">Status A-Z</option>
                <option value="status-desc">Status Z-A</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Loans List */}
        <Card>
          {filteredLoans.length === 0 ? (
            <div className="p-12 text-center">
              <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No loans found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating your first loan application.'}
              </p>
              <Button onClick={() => router.push('/loans/new')}>
                Create New Loan
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loan Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLoans.map((loan) => {
                    const StatusIcon = statusIcons[loan.status];
                    const progress = loan.status === 'active' 
                      ? ((loan.amount - loan.remainingBalance) / loan.amount) * 100
                      : loan.status === 'completed' ? 100 : 0;

                    return (
                      <tr key={loan.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {loan.loanNumber}
                            </div>
                            <div className="text-sm text-gray-500">
                              Created {formatDate(loan.createdAt)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {loan.customerName}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {loan.customerId}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(loan.amount)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {loan.termWeeks} weeks @ {loan.interestRate}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[loan.status]}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {loan.status === 'active' ? (
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${progress}%` }}
                               />
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">
                              {loan.status === 'completed' ? 'Completed' : 
                               loan.status === 'pending' ? 'Pending approval' : 
                               loan.status}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/loans/${loan.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
        </div>
      </div>
    </Layout>
  );
}
