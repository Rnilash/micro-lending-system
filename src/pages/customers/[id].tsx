import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatCurrency, formatDate, formatPhoneNumber } from '@/lib/utils';
import { getCustomerById } from '@/services/customers';
import { getLoans } from '@/services/loans';
import { getPayments } from '@/services/payments';
import {
  ArrowLeftIcon,
  BriefcaseIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  PencilIcon,
  PhoneIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { Timestamp } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function CustomerDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  // Helper function to safely convert Firestore Timestamp to Date
  const convertTimestampToDate = (timestamp: Date | Timestamp | null | undefined): Date => {
    if (!timestamp) return new Date();
    if (timestamp instanceof Date) return timestamp;
    if (typeof timestamp === 'object' && 'toDate' in timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    return new Date();
  };

  // Fetch customer data
  const { data: customer, isLoading: customerLoading, error: customerError } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => getCustomerById(id as string),
    enabled: !!id,
  });

  // Fetch customer loans
  const { data: loansData } = useQuery({
    queryKey: ['customer-loans', id],
    queryFn: () => getLoans({ customerId: id as string }),
    enabled: !!id,
  });

  // Fetch recent payments
  const { data: paymentsData } = useQuery({
    queryKey: ['customer-payments', id],
    queryFn: () => getPayments({ customerId: id as string }),
    enabled: !!id,
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-yellow-100 text-yellow-800',
      blacklisted: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (customerLoading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/4" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-gray-300 rounded" />
              <div className="h-64 bg-gray-300 rounded" />
            </div>
            <div className="space-y-6">
              <div className="h-32 bg-gray-300 rounded" />
              <div className="h-32 bg-gray-300 rounded" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (customerError || !customer) {
    return (
      <Layout>
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Customer not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            The customer you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
          </p>
          <div className="mt-6">
            <Button onClick={() => router.push('/customers')}>
              Back to Customers
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const loans = loansData?.loans || [];
  const payments = paymentsData?.payments || [];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push('/customers')}
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Customers
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {customer.firstName} {customer.lastName}
              </h1>
              <p className="text-gray-600">Customer Profile</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Link href={`/customers/${customer.id}/edit`}>
              <Button variant="outline">
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Link href={`/loans/new?customerId=${customer.id}`}>
              <Button>
                New Loan
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-medium text-gray-900">Customer Information</h2>
                  {getStatusBadge(customer.status)}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Full Name</p>
                        <p className="text-sm text-gray-600">{customer.firstName} {customer.lastName}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="h-5 w-5 flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-400">ID</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">NIC Number</p>
                        <p className="text-sm text-gray-600">{customer.nic}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <PhoneIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Phone Number</p>
                        <p className="text-sm text-gray-600">{formatPhoneNumber(customer.phone)}</p>
                      </div>
                    </div>

                    {customer.email && (
                      <div className="flex items-center space-x-3">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Email</p>
                          <p className="text-sm text-gray-600">{customer.email}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Address</p>
                        <p className="text-sm text-gray-600">
                          {customer.address.street}<br />
                          {customer.address.city}, {customer.address.district}<br />
                          {customer.address.postalCode}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <BriefcaseIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Occupation</p>
                        <p className="text-sm text-gray-600">{customer.occupation}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Monthly Income</p>
                        <p className="text-sm text-gray-600">{formatCurrency(customer.monthlyIncome)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <CalendarIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Registration Date</p>
                        <p className="text-sm text-gray-600">{formatDate(convertTimestampToDate(customer.registrationDate))}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Emergency Contact */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Name</p>
                    <p className="text-sm text-gray-600">{customer.emergencyContact.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Phone</p>
                    <p className="text-sm text-gray-600">{formatPhoneNumber(customer.emergencyContact.phone)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Relationship</p>
                    <p className="text-sm text-gray-600">{customer.emergencyContact.relationship}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Loans */}
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Loans</h2>
                  <Link href={`/loans/new?customerId=${customer.id}`}>
                    <Button size="sm">New Loan</Button>
                  </Link>
                </div>

                {loans.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No loans found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Loan #
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Amount
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Outstanding
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {loans.map((loan) => (
                          <tr key={loan.id}>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {loan.loanNumber}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                              {formatCurrency(loan.principalAmount)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              {getStatusBadge(loan.status)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                              {formatCurrency(loan.outstandingAmount)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                              <Link href={`/loans/${loan.id}`}>
                                <Button variant="outline" size="sm">
                                  View
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </Card>

            {/* Recent Payments */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Payments</h2>

                {payments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No payments found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Receipt #
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Amount
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Method
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {payments.slice(0, 5).map((payment) => (
                          <tr key={payment.id}>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {payment.receiptNumber}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                              {formatDate(convertTimestampToDate(payment.paymentDate))}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                              {formatCurrency(payment.amount)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                              {payment.method.replace('_', ' ').toUpperCase()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Financial Summary */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Loans</span>
                    <span className="text-sm font-medium text-gray-900">{customer.totalLoans}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Active Loans</span>
                    <span className="text-sm font-medium text-gray-900">{customer.activeLoans}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Paid</span>
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(customer.totalPaid)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Outstanding</span>
                    <span className="text-sm font-medium text-red-600">{formatCurrency(customer.outstandingAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Credit Score</span>
                    <span className="text-sm font-medium text-gray-900">{customer.creditScore}</span>
                  </div>
                  {customer.lastPaymentDate && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Last Payment</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatDate(convertTimestampToDate(customer.lastPaymentDate))}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link href={`/loans/new?customerId=${customer.id}`}>
                    <Button className="w-full" variant="outline">
                      Create New Loan
                    </Button>
                  </Link>
                  <Link href={`/payments/new?customerId=${customer.id}`}>
                    <Button className="w-full" variant="outline">
                      Record Payment
                    </Button>
                  </Link>
                  <Link href={`/customers/${customer.id}/edit`}>
                    <Button className="w-full" variant="outline">
                      Edit Customer
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
