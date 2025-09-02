import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/lib/utils';
import { getCustomers } from '@/services/customers';
import { useAuthStore } from '@/store/auth';
import { useCustomerStore } from '@/store/customers';
import type { CustomerStatus } from '@/types';
import {
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  PencilIcon,
  PhoneIcon,
  PlusIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

const ITEMS_PER_PAGE = 20;

export default function CustomersPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { 
    customers, 
    searchTerm, 
    filters, 
    pagination,
    setCustomers,
    setSearchTerm,
    setFilters,
    setPagination,
    setLoading
  } = useCustomerStore();

  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [showFilters, setShowFilters] = useState(false);

  // Query to fetch customers
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['customers', filters, searchTerm, pagination.currentPage],
    queryFn: async () => {
      const agentFilter = user?.role === 'agent' ? { agentId: user.id } : {};
      const result = await getCustomers(
        {
          ...filters,
          ...agentFilter,
          search: searchTerm,
          status: filters.status as CustomerStatus | undefined,
        },
        {
          limit: ITEMS_PER_PAGE,
          lastDoc: pagination.currentPage > 1 ? pagination.lastDoc : undefined,
        }
      );
      return result;
    },
    enabled: !!user,
  });

  // Update store when data changes
  useEffect(() => {
    if (data) {
      setCustomers(data.customers);
      setPagination({
        hasMore: data.hasMore,
        lastDoc: data.lastDoc,
      });
    }
    setLoading(isLoading);
  }, [data, isLoading, setCustomers, setPagination, setLoading]);

  // Handle search
  const handleSearch = () => {
    setSearchTerm(localSearchTerm);
    setPagination({ currentPage: 1, lastDoc: null });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value || undefined });
    setPagination({ currentPage: 1, lastDoc: null });
  };

  // Handle pagination
  const handleNextPage = () => {
    if (pagination.hasMore) {
      setPagination({ currentPage: pagination.currentPage + 1 });
    }
  };

  const handlePrevPage = () => {
    if (pagination.currentPage > 1) {
      setPagination({ 
        currentPage: pagination.currentPage - 1,
        lastDoc: null // Reset for refetch
      });
    }
  };

  const getStatusBadge = (status: CustomerStatus) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-yellow-100 text-yellow-800',
      blacklisted: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
                <p className="text-gray-600">Manage your customer database</p>
              </div>
              <Link href="/customers/new">
                <Button>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Customer
                </Button>
              </Link>
            </div>
          </div>

        {/* Search and Filters */}
        <Card>
          <div className="p-6 space-y-4">
            {/* Search Bar */}
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search customers by name, NIC, or phone..."
                  value={localSearchTerm}
                  onChange={(e) => setLocalSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                />
              </div>
              <Button onClick={handleSearch} variant="outline">
                Search
              </Button>
              <Button 
                onClick={() => setShowFilters(!showFilters)} 
                variant="outline"
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                    <option value="blacklisted">Blacklisted</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    District
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.district || ''}
                    onChange={(e) => handleFilterChange('district', e.target.value)}
                  >
                    <option value="">All Districts</option>
                    <option value="Colombo">Colombo</option>
                    <option value="Gampaha">Gampaha</option>
                    <option value="Kalutara">Kalutara</option>
                    <option value="Kandy">Kandy</option>
                    <option value="Matale">Matale</option>
                    <option value="Nuwara Eliya">Nuwara Eliya</option>
                    <option value="Galle">Galle</option>
                    <option value="Matara">Matara</option>
                    <option value="Hambantota">Hambantota</option>
                    <option value="Jaffna">Jaffna</option>
                    <option value="Kilinochchi">Kilinochchi</option>
                    <option value="Mannar">Mannar</option>
                    <option value="Vavuniya">Vavuniya</option>
                    <option value="Mullaitivu">Mullaitivu</option>
                    <option value="Batticaloa">Batticaloa</option>
                    <option value="Ampara">Ampara</option>
                    <option value="Trincomalee">Trincomalee</option>
                    <option value="Kurunegala">Kurunegala</option>
                    <option value="Puttalam">Puttalam</option>
                    <option value="Anuradhapura">Anuradhapura</option>
                    <option value="Polonnaruwa">Polonnaruwa</option>
                    <option value="Badulla">Badulla</option>
                    <option value="Moneragala">Moneragala</option>
                    <option value="Ratnapura">Ratnapura</option>
                    <option value="Kegalle">Kegalle</option>
                  </select>
                </div>

                {user.role === 'admin' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Agent
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={filters.agentId || ''}
                      onChange={(e) => handleFilterChange('agentId', e.target.value)}
                    >
                      <option value="">All Agents</option>
                      {/* TODO: Load agents from API */}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Customer List */}
        <Card>
          {isLoading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="rounded-full bg-gray-300 h-12 w-12" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-1/4" />
                      <div className="h-3 bg-gray-300 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <p className="text-red-600">Error loading customers. Please try again.</p>
              <Button onClick={() => refetch()} className="mt-2" variant="outline">
                Retry
              </Button>
            </div>
          ) : customers.length === 0 ? (
            <div className="p-6 text-center">
              <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No customers</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding your first customer.
              </p>
              <div className="mt-6">
                <Link href="/customers/new">
                  <Button>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Customer
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Loan Summary
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-700">
                                  {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {customer.firstName} {customer.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                NIC: {customer.nic}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <PhoneIcon className="h-4 w-4 mr-1 text-gray-400" />
                            {customer.phone}
                          </div>
                          {customer.email && (
                            <div className="text-sm text-gray-500">
                              {customer.email}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <MapPinIcon className="h-4 w-4 mr-1 text-gray-400" />
                            {customer.address.city}
                          </div>
                          <div className="text-sm text-gray-500">
                            {customer.address.district}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>Active: {customer.activeLoans}</div>
                          <div>Total: {customer.totalLoans}</div>
                          <div className="text-xs text-gray-500">
                            Outstanding: {formatCurrency(customer.outstandingAmount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(customer.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link href={`/customers/${customer.id}`}>
                              <Button variant="outline" size="sm">
                                <EyeIcon className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/customers/${customer.id}/edit`}>
                              <Button variant="outline" size="sm">
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Button
                    onClick={handlePrevPage}
                    disabled={pagination.currentPage === 1}
                    variant="outline"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={handleNextPage}
                    disabled={!pagination.hasMore}
                    variant="outline"
                  >
                    Next
                  </Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Page <span className="font-medium">{pagination.currentPage}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <Button
                        onClick={handlePrevPage}
                        disabled={pagination.currentPage === 1}
                        variant="outline"
                        className="rounded-r-none"
                      >
                        Previous
                      </Button>
                      <Button
                        onClick={handleNextPage}
                        disabled={!pagination.hasMore}
                        variant="outline"
                        className="rounded-l-none"
                      >
                        Next
                      </Button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
        </div>
      </div>
    </Layout>
  );
}
