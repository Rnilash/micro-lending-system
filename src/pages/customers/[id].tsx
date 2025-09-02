import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatCurrency, formatDate, formatPhoneNumber } from '@/lib/utils';
import { getCustomerById } from '@/services/customers';
import { getLoans } from '@/services/loans';
import { getPayments } from '@/services/payments';
import {
  ArrowLeftIcon,
  BanknotesIcon,
  BriefcaseIcon,
  CalendarIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  PencilIcon,
  PhoneIcon,
  PlusIcon,
  UserGroupIcon,
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
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      suspended: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      blacklisted: 'bg-red-100 text-red-800 border-red-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (customerLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          </div>
        </div>
      </Layout>
    );
  }

  if (customerError || !customer) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          </div>
        </div>
      </Layout>
    );
  }

  const loans = loansData?.loans || [];
  const payments = paymentsData?.payments || [];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => router.push('/customers')}
                  className="flex items-center space-x-2 hover:bg-white hover:shadow-sm transition-all duration-200"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span>Back to Customers</span>
                </Button>
              </div>
              
              <div className="text-center lg:text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {customer.firstName} {customer.lastName}
                </h1>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                  <p className="text-gray-600">Customer Profile</p>
                  {getStatusBadge(customer.status)}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
                <Link href={`/customers/${customer.id}/edit`}>
                  <Button variant="outline" className="w-full sm:w-auto hover:bg-white hover:shadow-sm transition-all duration-200">
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit Customer
                  </Button>
                </Link>
                <Link href={`/loans/new?customerId=${customer.id}`}>
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 transition-all duration-200 transform hover:scale-105">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    New Loan
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information */}
              <Card className="overflow-hidden bg-white/90 backdrop-blur-sm border-0 shadow-medium animate-fade-in">
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <UserIcon className="h-6 w-6 mr-3" />
                    Personal Information
                  </h2>
                  <p className="text-primary-100 mt-1">Complete customer details and contact information</p>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                        <div className="flex-shrink-0">
                          <UserIcon className="h-6 w-6 text-primary-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Full Name</p>
                          <p className="text-base text-gray-700 mt-1">{customer.firstName} {customer.lastName}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                        <div className="flex-shrink-0">
                          <div className="h-6 w-6 flex items-center justify-center bg-primary-100 rounded">
                            <span className="text-xs font-bold text-primary-600">ID</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">NIC Number</p>
                          <p className="text-base text-gray-700 mt-1">{customer.nic}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                        <div className="flex-shrink-0">
                          <PhoneIcon className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Phone Number</p>
                          <p className="text-base text-gray-700 mt-1">{formatPhoneNumber(customer.phone)}</p>
                        </div>
                      </div>

                      {customer.email && (
                        <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                          <div className="flex-shrink-0">
                            <EnvelopeIcon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Email Address</p>
                            <p className="text-base text-gray-700 mt-1">{customer.email}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                        <div className="flex-shrink-0">
                          <MapPinIcon className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Address</p>
                          <p className="text-base text-gray-700 mt-1">
                            {customer.address.street}<br />
                            {customer.address.city}, {customer.address.district}<br />
                            {customer.address.postalCode}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                        <div className="flex-shrink-0">
                          <BriefcaseIcon className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Occupation</p>
                          <p className="text-base text-gray-700 mt-1">{customer.occupation}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                        <div className="flex-shrink-0">
                          <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Monthly Income</p>
                          <p className="text-base text-gray-700 mt-1">{formatCurrency(customer.monthlyIncome)}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                        <div className="flex-shrink-0">
                          <CalendarIcon className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Registration Date</p>
                          <p className="text-base text-gray-700 mt-1">{formatDate(convertTimestampToDate(customer.registrationDate))}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Emergency Contact */}
              <Card className="overflow-hidden bg-white/90 backdrop-blur-sm border-0 shadow-medium animate-fade-in">
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <UserGroupIcon className="h-6 w-6 mr-3" />
                    Emergency Contact
                  </h2>
                  <p className="text-primary-100 mt-1">Emergency contact person details</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                      <p className="text-sm font-medium text-gray-900 mb-2">Contact Name</p>
                      <p className="text-base text-gray-700">{customer.emergencyContact.name}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                      <p className="text-sm font-medium text-gray-900 mb-2">Phone Number</p>
                      <p className="text-base text-gray-700">{formatPhoneNumber(customer.emergencyContact.phone)}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                      <p className="text-sm font-medium text-gray-900 mb-2">Relationship</p>
                      <p className="text-base text-gray-700">{customer.emergencyContact.relationship}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Loans */}
              <Card className="overflow-hidden bg-white/90 backdrop-blur-sm border-0 shadow-medium animate-fade-in">
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-white flex items-center">
                        <BanknotesIcon className="h-6 w-6 mr-3" />
                        Active Loans
                      </h2>
                      <p className="text-primary-100 mt-1">Customer loan history and status</p>
                    </div>
                    <Link href={`/loans/new?customerId=${customer.id}`}>
                      <Button size="sm" variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                        <PlusIcon className="h-4 w-4 mr-2" />
                        New Loan
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="p-6">
                  {loans.length === 0 ? (
                    <div className="text-center py-12">
                      <BanknotesIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500 text-lg">No loans found</p>
                      <p className="text-gray-400 text-sm">This customer hasn't applied for any loans yet</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Loan Number
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Outstanding
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {loans.map((loan) => (
                            <tr key={loan.id} className="hover:bg-gray-50 transition-colors duration-200">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                #{loan.loanNumber}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {formatCurrency(loan.principalAmount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {getStatusBadge(loan.status)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {formatCurrency(loan.outstandingAmount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <Link href={`/loans/${loan.id}`}>
                                  <Button variant="outline" size="sm" className="hover:bg-primary-50 hover:border-primary-300">
                                    View Details
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
              <Card className="overflow-hidden bg-white/90 backdrop-blur-sm border-0 shadow-medium animate-fade-in">
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <ClockIcon className="h-6 w-6 mr-3" />
                    Recent Payments
                  </h2>
                  <p className="text-primary-100 mt-1">Latest payment transactions</p>
                </div>

                <div className="p-6">
                  {payments.length === 0 ? (
                    <div className="text-center py-12">
                      <ClockIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500 text-lg">No payments found</p>
                      <p className="text-gray-400 text-sm">No payment records available for this customer</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Receipt #
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Method
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {payments.slice(0, 5).map((payment) => (
                            <tr key={payment.id} className="hover:bg-gray-50 transition-colors duration-200">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                #{payment.receiptNumber}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {formatDate(convertTimestampToDate(payment.paymentDate))}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {formatCurrency(payment.amount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
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
              <Card className="overflow-hidden bg-white/90 backdrop-blur-sm border-0 shadow-medium animate-fade-in">
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <ChartBarIcon className="h-5 w-5 mr-2" />
                    Financial Summary
                  </h3>
                  <p className="text-primary-100 text-sm mt-1">Overview of financial status</p>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Total Loans</span>
                      <span className="text-lg font-bold text-gray-900">{customer.totalLoans}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-green-700">Active Loans</span>
                      <span className="text-lg font-bold text-green-800">{customer.activeLoans}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-blue-700">Total Paid</span>
                      <span className="text-lg font-bold text-blue-800">{formatCurrency(customer.totalPaid)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="text-sm font-medium text-red-700">Outstanding</span>
                      <span className="text-lg font-bold text-red-800">{formatCurrency(customer.outstandingAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm font-medium text-purple-700">Credit Score</span>
                      <span className="text-lg font-bold text-purple-800">{customer.creditScore}</span>
                    </div>
                    {customer.lastPaymentDate && (
                      <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                        <span className="text-sm font-medium text-yellow-700">Last Payment</span>
                        <span className="text-sm font-semibold text-yellow-800">
                          {formatDate(convertTimestampToDate(customer.lastPaymentDate))}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>


            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
