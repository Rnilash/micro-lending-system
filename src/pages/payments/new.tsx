import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { formatCurrency, generateReceiptNumber } from '@/lib/utils';
import { useLoansStore } from '@/store/loans';
import { usePaymentsStore } from '@/store/payments';
import { useUIStore } from '@/store/ui';
import type { Loan, PaymentMethod } from '@/types';
import {
  ArrowLeftIcon,
  BanknotesIcon,
  CalculatorIcon,
  CameraIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

interface PaymentForm {
  loanId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  receiptNumber?: string;
  notes?: string;
  receiptFile?: FileList;
}

export default function NewPaymentPage() {
  const router = useRouter();
  const { loanId } = router.query;
  const { loans, fetchLoans, fetchLoan } = useLoansStore();
  const { createPayment } = usePaymentsStore();
  const { addNotification } = useUIStore();
  
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [calculatedBalance, setCalculatedBalance] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PaymentForm>({
    defaultValues: {
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      receiptNumber: generateReceiptNumber(),
    },
  });

  const watchedLoanId = watch('loanId');
  const watchedAmount = watch('amount');

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  useEffect(() => {
    // Auto-select loan if loanId is provided in query
    if (loanId && typeof loanId === 'string') {
      setValue('loanId', loanId);
      const loan = loans.find(l => l.id === loanId);
      if (loan) {
        setSelectedLoan(loan);
        setValue('amount', loan.weeklyPayment);
      } else {
        fetchLoan(loanId).then(setSelectedLoan);
      }
    }
  }, [loanId, loans, setValue, fetchLoan]);

  useEffect(() => {
    // Update selected loan when loanId changes
    if (watchedLoanId) {
      const loan = loans.find(l => l.id === watchedLoanId);
      if (loan) {
        setSelectedLoan(loan);
        setValue('amount', loan.weeklyPayment);
      }
    }
  }, [watchedLoanId, loans, setValue]);

  useEffect(() => {
    // Calculate remaining balance after payment
    if (selectedLoan && watchedAmount) {
      const newBalance = Math.max(0, selectedLoan.remainingBalance - watchedAmount);
      setCalculatedBalance(newBalance);
    }
  }, [selectedLoan, watchedAmount]);

  const handleReceiptUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        addNotification({
          type: 'error',
          title: 'File Too Large',
          message: 'Receipt file must be less than 5MB.',
        });
        return;
      }
      
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const onSubmit = async (data: PaymentForm) => {
    if (!selectedLoan) {
      addNotification({
        type: 'error',
        title: 'Loan Required',
        message: 'Please select a loan for this payment.',
      });
      return;
    }

    try {
      let receiptUrl: string | undefined;
      
      // Upload receipt file if provided
      if (data.receiptFile && data.receiptFile[0]) {
        // TODO: Implement file upload to Firebase Storage
        // For now, we'll skip file upload
      }

      const paymentData = {
        loanId: selectedLoan.id,
        customerId: selectedLoan.customerId,
        customerName: selectedLoan.customerName,
        loanNumber: selectedLoan.loanNumber,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        paymentDate: new Date(data.paymentDate),
        receiptNumber: data.receiptNumber,
        receiptUrl,
        notes: data.notes,
        collectedBy: 'Current User', // TODO: Get from auth context
      };

      const result = await createPayment(paymentData);
      
      addNotification({
        type: 'success',
        title: 'Payment Recorded',
        message: `Payment of ${formatCurrency(data.amount)} has been recorded successfully.`,
      });

      router.push(`/payments/${result.id}`);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to record payment. Please try again.',
      });
    }
  };

  // Filter active loans
  const activeLoans = loans.filter(loan => 
    loan.status === 'active' && loan.remainingBalance > 0
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
            <h1 className="text-3xl font-bold text-gray-900">Record Payment</h1>
            <div className="w-24" /> {/* Spacer for centering */}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Payment Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Loan Selection */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 backdrop-blur-sm bg-opacity-80 transition-all duration-200 hover:shadow-md">
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-3 rounded-t-lg border border-gray-200">
                    <h2 className="text-lg font-semibold text-white flex items-center">
                      <DocumentTextIcon className="w-5 h-5 mr-2" />
                      Loan Information
                    </h2>
                  </div>
                  <div className="p-6">

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Loan *
                        </label>
                        <select
                          {...register('loanId', { required: 'Please select a loan' })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={!!loanId}
                        >
                          <option value="">Choose a loan...</option>
                          {activeLoans.map((loan) => (
                            <option key={loan.id} value={loan.id}>
                              {loan.loanNumber} - {loan.customerName} 
                              (Balance: {formatCurrency(loan.remainingBalance)})
                            </option>
                          ))}
                        </select>
                        {errors.loanId && (
                          <p className="mt-1 text-sm text-red-600">{errors.loanId.message}</p>
                        )}
                      </div>

                      {selectedLoan && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h3 className="font-medium text-blue-900 mb-2">Loan Details</h3>
                          <div className="grid grid-cols-2 gap-4 text-sm text-blue-800">
                            <div>
                              <p><strong>Customer:</strong> {selectedLoan.customerName}</p>
                              <p><strong>Loan Number:</strong> {selectedLoan.loanNumber}</p>
                            </div>
                            <div>
                              <p><strong>Weekly Payment:</strong> {formatCurrency(selectedLoan.weeklyPayment)}</p>
                              <p><strong>Remaining Balance:</strong> {formatCurrency(selectedLoan.remainingBalance)}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 backdrop-blur-sm bg-opacity-80 transition-all duration-200 hover:shadow-md">
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-3 rounded-t-lg border border-gray-200">
                    <h2 className="text-lg font-semibold text-white flex items-center">
                      <BanknotesIcon className="w-5 h-5 mr-2" />
                      Payment Details
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Payment Amount (LKR) *"
                        type="number"
                        min="1"
                        step="0.01"
                        {...register('amount', {
                          required: 'Payment amount is required',
                          min: { value: 1, message: 'Amount must be greater than 0' },
                          max: selectedLoan ? {
                            value: selectedLoan.remainingBalance,
                            message: 'Amount cannot exceed remaining balance'
                          } : undefined,
                        })}
                        error={errors.amount?.message}
                        className="transition-all duration-200 focus:scale-[1.02]"
                      />

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Payment Method *
                        </label>
                        <select
                          {...register('paymentMethod', { required: 'Payment method is required' })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 focus:scale-[1.02]"
                        >
                          <option value="cash">Cash</option>
                          <option value="bank_transfer">Bank Transfer</option>
                          <option value="mobile_money">Mobile Money</option>
                          <option value="check">Check</option>
                        </select>
                        {errors.paymentMethod && (
                          <p className="mt-1 text-sm text-red-600">{errors.paymentMethod.message}</p>
                        )}
                      </div>

                      <Input
                        label="Payment Date *"
                        type="date"
                        max={new Date().toISOString().split('T')[0]}
                        {...register('paymentDate', { required: 'Payment date is required' })}
                        error={errors.paymentDate?.message}
                        className="transition-all duration-200 focus:scale-[1.02]"
                      />

                      <Input
                        label="Receipt Number"
                        {...register('receiptNumber')}
                        placeholder="Auto-generated if empty"
                        className="transition-all duration-200 focus:scale-[1.02]"
                      />

                      <div className="col-span-full">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Notes (Optional)
                        </label>
                        <textarea
                          {...register('notes')}
                          rows={3}
                          placeholder="Any additional notes about this payment..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 focus:scale-[1.02]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Receipt Upload */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 backdrop-blur-sm bg-opacity-80 transition-all duration-200 hover:shadow-md">
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-3 rounded-t-lg border border-gray-200">
                    <h2 className="text-lg font-semibold text-white flex items-center">
                      <CameraIcon className="w-5 h-5 mr-2" />
                      Receipt Upload
                    </h2>
                  </div>
                  <div className="p-6">

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload Receipt Image
                        </label>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          {...register('receiptFile')}
                          onChange={handleReceiptUpload}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all duration-200 focus:scale-[1.02]"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                          Supported formats: JPG, PNG, PDF. Max size: 5MB.
                        </p>
                      </div>

                      {previewUrl && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                          <img
                            src={previewUrl}
                            alt="Receipt preview"
                            className="max-w-xs h-48 object-cover rounded-lg border border-gray-300"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 backdrop-blur-sm bg-opacity-80 transition-all duration-200 hover:shadow-md">
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-3 rounded-t-lg border border-gray-200">
                    <h2 className="text-lg font-semibold text-white flex items-center">
                      <CalculatorIcon className="w-5 h-5 mr-2" />
                      Payment Summary
                    </h2>
                  </div>
                  <div className="p-6">

                    {selectedLoan ? (
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Current Balance:</span>
                              <span className="font-medium">{formatCurrency(selectedLoan.remainingBalance)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Payment Amount:</span>
                              <span className="font-medium">{formatCurrency(watchedAmount || 0)}</span>
                            </div>
                            <div className="border-t border-gray-200 pt-3">
                              <div className="flex justify-between">
                                <span className="text-gray-600">New Balance:</span>
                                <span className="font-semibold text-lg text-blue-600">
                                  {formatCurrency(calculatedBalance)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Suggested Payment:</span>
                            <span className="font-medium">{formatCurrency(selectedLoan.weeklyPayment)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Loan Amount:</span>
                            <span className="font-medium">{formatCurrency(selectedLoan.amount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Weekly Payment:</span>
                            <span className="font-medium">{formatCurrency(selectedLoan.weeklyPayment)}</span>
                          </div>
                        </div>

                        {calculatedBalance === 0 && watchedAmount > 0 && (
                          <div className="bg-green-50 p-4 rounded-lg">
                            <p className="text-green-800 font-medium text-sm">
                              🎉 This payment will complete the loan!
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <BanknotesIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>Select a loan to see payment details</p>
                      </div>
                    )}

                    <div className="mt-6 space-y-3">
                      <Button
                        type="submit"
                        disabled={isSubmitting || !selectedLoan}
                        className="w-full transition-all duration-200 hover:scale-[1.02]"
                      >
                        {isSubmitting ? <Loading /> : 'Record Payment'}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/payments')}
                        className="w-full transition-all duration-200 hover:scale-[1.02]"
                      >
                        Cancel
                      </Button>
                    </div>

                    {selectedLoan && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          Quick Actions:
                        </p>
                        <div className="mt-2 space-y-1">
                          <button
                            type="button"
                            onClick={() => setValue('amount', selectedLoan.weeklyPayment)}
                            className="block w-full text-left text-xs text-blue-600 hover:text-blue-800"
                          >
                            Set to weekly payment ({formatCurrency(selectedLoan.weeklyPayment)})
                          </button>
                          <button
                            type="button"
                            onClick={() => setValue('amount', selectedLoan.remainingBalance)}
                            className="block w-full text-left text-xs text-blue-600 hover:text-blue-800"
                          >
                            Pay full balance ({formatCurrency(selectedLoan.remainingBalance)})
                          </button>
                        </div>
                      </div>
                    )}
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
