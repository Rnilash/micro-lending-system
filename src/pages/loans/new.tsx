import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { formatCurrency } from '@/lib/utils';
import type { CreateLoanData } from '@/services/loans';
import { useAuthStore } from '@/store/auth';
import { useCustomersStore } from '@/store/customers';
import { useLoansStore } from '@/store/loans';
import { useUIStore } from '@/store/ui';
import type { Customer } from '@/types';
import {
  ArrowLeftIcon,
  CalculatorIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

interface LoanForm {
  customerId: string;
  amount: number;
  termWeeks: number;
  interestRate: number;
  purpose: string;
  collateral?: string;
  guarantorName?: string;
  guarantorPhone?: string;
  guarantorAddress?: string;
  notes?: string;
}

export default function NewLoanPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { customers, fetchCustomers, searchCustomers } = useCustomersStore();
  const { createLoan } = useLoansStore();
  const { addNotification } = useUIStore();
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [calculatedPayment, setCalculatedPayment] = useState(0);
  const [totalRepayment, setTotalRepayment] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoanForm>({
    defaultValues: {
      amount: 50000,
      termWeeks: 12,
      interestRate: 2.5,
      purpose: '',
    },
  });

  const formatAddress = (address: string | object) => {
    if (typeof address === 'string') return address;
    if (typeof address === 'object' && address) {
      const addr = address as { line1?: string; city?: string; district?: string };
      return `${addr.line1 || ''} ${addr.city || ''} ${addr.district || ''}`.trim();
    }
    return '';
  };

  const watchedValues = watch(['amount', 'termWeeks', 'interestRate']);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    // Calculate loan payments when values change
    const [amount, termWeeks, interestRate] = watchedValues;
    if (amount && termWeeks && interestRate) {
      const weeklyInterest = interestRate / 100;
      const totalWithInterest = amount * (1 + (weeklyInterest * termWeeks));
      const weeklyPayment = totalWithInterest / termWeeks;
      
      setCalculatedPayment(weeklyPayment);
      setTotalRepayment(totalWithInterest);
    }
  }, [watchedValues]);

  const handleCustomerSearch = async (term: string) => {
    setCustomerSearch(term);
    if (term.trim()) {
      await searchCustomers(term);
    } else {
      await fetchCustomers();
    }
  };

  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setValue('customerId', customer.id);
    setShowCustomerSearch(false);
    setCustomerSearch(`${customer.firstName} ${customer.lastName} - ${customer.phone}`);
  };

  const onSubmit = async (data: LoanForm) => {
    if (!selectedCustomer) {
      addNotification({
        type: 'error',
        title: 'Customer Required',
        message: 'Please select a customer for this loan.',
      });
      return;
    }

    if (!user) {
      addNotification({
        type: 'error',
        title: 'Authentication Required',
        message: 'You must be logged in to create a loan.',
      });
      return;
    }

    if (!user.uid) {
      addNotification({
        type: 'error',
        title: 'Authentication Error',
        message: 'Invalid user session. Please log in again.',
      });
      return;
    }

    try {
      const createLoanData: CreateLoanData = {
        customerId: selectedCustomer.id,
        agentId: user.uid,
        principalAmount: data.amount,
        interestRate: data.interestRate,
        duration: data.termWeeks,
        purpose: data.purpose,
        collateral: data.collateral,
        guarantorInfo: data.guarantorName ? {
          name: data.guarantorName,
          nic: '',
          phone: data.guarantorPhone || '',
          address: data.guarantorAddress || '',
        } : undefined,
      };

      const loan = await createLoan(createLoanData);
      
      addNotification({
        type: 'success',
        title: 'Loan Application Created',
        message: `Loan application #${loan.loanNumber} has been created successfully.`,
      });

      router.push(`/loans`);
    } catch (error) {
      let errorMessage = 'Failed to create loan application. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      addNotification({
        type: 'error',
        title: 'Error',
        message: errorMessage,
      });
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.firstName.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.lastName.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.phone.includes(customerSearch) ||
    customer.nationalId.includes(customerSearch)
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center space-x-2 hover:bg-white/80 transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">New Loan Application</h1>
            <div className="w-24" /> {/* Spacer for centering */}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Customer Selection */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 backdrop-blur-sm bg-opacity-80 transition-all duration-200 hover:shadow-md">
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-3 rounded-t-lg border border-gray-200">
                    <h2 className="text-lg font-semibold text-white flex items-center">
                      <UserGroupIcon className="w-5 h-5 mr-2" />
                      Customer Information
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Customer *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search by name, phone, or NIC..."
                            value={customerSearch}
                            onChange={(e) => {
                              handleCustomerSearch(e.target.value);
                              setShowCustomerSearch(true);
                            }}
                            onFocus={() => setShowCustomerSearch(true)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        </div>

                        {showCustomerSearch && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {filteredCustomers.length === 0 ? (
                              <div className="p-4 text-gray-500 text-center">
                                No customers found
                              </div>
                            ) : (
                              filteredCustomers.map((customer) => (
                                <button
                                  key={customer.id}
                                  type="button"
                                  onClick={() => selectCustomer(customer)}
                                  className="w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="font-medium text-gray-900">
                                    {customer.firstName} {customer.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {customer.phone} • {customer.nationalId}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {formatAddress(customer.address)}
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>

                      {selectedCustomer && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h3 className="font-medium text-blue-900">Selected Customer</h3>
                          <div className="mt-2 space-y-1 text-sm text-blue-800">
                            <p><strong>Name:</strong> {selectedCustomer.firstName} {selectedCustomer.lastName}</p>
                            <p><strong>Phone:</strong> {selectedCustomer.phone}</p>
                            <p><strong>NIC:</strong> {selectedCustomer.nationalId}</p>
                            <p><strong>Address:</strong> {formatAddress(selectedCustomer.address)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Loan Details */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 backdrop-blur-sm bg-opacity-80 transition-all duration-200 hover:shadow-md">
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-3 rounded-t-lg border border-gray-200">
                    <h2 className="text-lg font-semibold text-white">
                      Loan Details
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Loan Amount (LKR) *"
                        type="number"
                        min="1000"
                        max="1000000"
                        step="1000"
                        {...register('amount', {
                          required: 'Loan amount is required',
                          min: { value: 1000, message: 'Minimum loan amount is LKR 1,000' },
                          max: { value: 1000000, message: 'Maximum loan amount is LKR 1,000,000' },
                        })}
                        error={errors.amount?.message}
                        className="transition-all duration-200 focus:scale-[1.02]"
                      />

                      <Input
                        label="Term (Weeks) *"
                        type="number"
                        min="4"
                        max="52"
                        {...register('termWeeks', {
                          required: 'Loan term is required',
                          min: { value: 4, message: 'Minimum term is 4 weeks' },
                          max: { value: 52, message: 'Maximum term is 52 weeks' },
                        })}
                        error={errors.termWeeks?.message}
                        className="transition-all duration-200 focus:scale-[1.02]"
                      />

                      <Input
                        label="Interest Rate (% per week) *"
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="10"
                        {...register('interestRate', {
                          required: 'Interest rate is required',
                          min: { value: 0.1, message: 'Minimum interest rate is 0.1%' },
                          max: { value: 10, message: 'Maximum interest rate is 10%' },
                        })}
                        error={errors.interestRate?.message}
                        className="transition-all duration-200 focus:scale-[1.02]"
                      />

                      <div className="col-span-full">
                        <Input
                          label="Purpose of Loan *"
                          placeholder="e.g., Business expansion, inventory purchase, emergency medical expenses"
                          {...register('purpose', {
                            required: 'Purpose is required',
                            minLength: { value: 10, message: 'Purpose must be at least 10 characters' },
                          })}
                          error={errors.purpose?.message}
                          className="transition-all duration-200 focus:scale-[1.02]"
                        />
                      </div>

                      <div className="col-span-full">
                        <Input
                          label="Collateral (Optional)"
                          placeholder="Describe any collateral being offered"
                          {...register('collateral')}
                          className="transition-all duration-200 focus:scale-[1.02]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Guarantor Information */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 backdrop-blur-sm bg-opacity-80 transition-all duration-200 hover:shadow-md">
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-3 rounded-t-lg border border-gray-200">
                    <h2 className="text-lg font-semibold text-white">
                      Guarantor Information
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Guarantor Name"
                        {...register('guarantorName')}
                        className="transition-all duration-200 focus:scale-[1.02]"
                      />

                      <Input
                        label="Guarantor Phone"
                        type="tel"
                        {...register('guarantorPhone')}
                        className="transition-all duration-200 focus:scale-[1.02]"
                      />

                      <div className="col-span-full">
                        <Input
                          label="Guarantor Address"
                          {...register('guarantorAddress')}
                          className="transition-all duration-200 focus:scale-[1.02]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 backdrop-blur-sm bg-opacity-80 transition-all duration-200 hover:shadow-md">
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-3 rounded-t-lg border border-gray-200">
                    <h2 className="text-lg font-semibold text-white">
                      Additional Notes
                    </h2>
                  </div>
                  <div className="p-6">
                    <textarea
                      {...register('notes')}
                      rows={4}
                      placeholder="Any additional notes about this loan application..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 focus:scale-[1.02]"
                    />
                  </div>
                </div>
              </div>

              {/* Loan Calculator & Summary */}
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 backdrop-blur-sm bg-opacity-80 transition-all duration-200 hover:shadow-md">
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-3 rounded-t-lg border border-gray-200">
                    <h2 className="text-lg font-semibold text-white flex items-center">
                      <CalculatorIcon className="w-5 h-5 mr-2" />
                      Loan Calculator
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Loan Amount</p>
                            <p className="font-semibold">{formatCurrency(watchedValues[0] || 0)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Term</p>
                            <p className="font-semibold">{watchedValues[1] || 0} weeks</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Interest Rate</p>
                            <p className="font-semibold">{watchedValues[2] || 0}% per week</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Total Interest</p>
                            <p className="font-semibold">{formatCurrency(totalRepayment - (watchedValues[0] || 0))}</p>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Weekly Payment:</span>
                            <span className="font-semibold text-lg">{formatCurrency(calculatedPayment)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Repayment:</span>
                            <span className="font-semibold text-blue-600">{formatCurrency(totalRepayment)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      <Button
                        type="submit"
                        disabled={isSubmitting || !selectedCustomer}
                        className="w-full transition-all duration-200 hover:scale-[1.02]"
                      >
                        {isSubmitting ? <Loading /> : 'Create Loan Application'}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/loans')}
                        className="w-full transition-all duration-200 hover:scale-[1.02]"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
