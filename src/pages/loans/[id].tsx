import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, formatDate, formatPhoneNumber } from '@/lib/utils';
import { useLoansStore } from '@/store/loans';
import { usePaymentsStore } from '@/store/payments';
import { useUIStore } from '@/store/ui';
import type { LoanStatus } from '@/types';
import {
    ArrowLeftIcon,
    BanknotesIcon,
    CalendarIcon,
    CheckIcon,
    CurrencyDollarIcon,
    DocumentTextIcon,
    PrinterIcon,
    UserIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function LoanDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { 
    currentLoan, 
    loading, 
    fetchLoan, 
    approveLoan, 
    rejectLoan, 
    updateLoanStatus 
  } = useLoansStore();
  const { payments, fetchPaymentsByLoan } = usePaymentsStore();
  const { addNotification } = useUIStore();

  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'payments' | 'schedule'>('details');

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchLoan(id);
      fetchPaymentsByLoan(id);
    }
  }, [id, fetchLoan, fetchPaymentsByLoan]);

  if (loading || !currentLoan) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <Loading message="Loading loan details..." />
        </div>
      </Layout>
    );
  }

  const handleApproval = async () => {
    try {
      await approveLoan(currentLoan.id);
      addNotification({
        type: 'success',
        title: 'Loan Approved',
        message: `Loan ${currentLoan.loanNumber} has been approved successfully.`,
      });
      setShowApprovalModal(false);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to approve loan. Please try again.',
      });
    }
  };

  const handleRejection = async () => {
    if (!rejectionReason.trim()) {
      addNotification({
        type: 'error',
        title: 'Reason Required',
        message: 'Please provide a reason for rejection.',
      });
      return;
    }

    try {
      await rejectLoan(currentLoan.id, rejectionReason);
      addNotification({
        type: 'success',
        title: 'Loan Rejected',
        message: `Loan ${currentLoan.loanNumber} has been rejected.`,
      });
      setShowRejectionModal(false);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to reject loan. Please try again.',
      });
    }
  };

  const getStatusColor = (status: LoanStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'defaulted': return 'bg-red-100 text-red-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const remainingBalance = currentLoan.amount + (currentLoan.amount * currentLoan.interestRate * currentLoan.termWeeks / 100) - totalPaid;
  const paymentProgress = totalPaid / (currentLoan.amount + (currentLoan.amount * currentLoan.interestRate * currentLoan.termWeeks / 100)) * 100;

  // Generate payment schedule
  const generatePaymentSchedule = () => {
    const schedule = [];
    const startDate = new Date(currentLoan.startDate || currentLoan.applicationDate);
    const weeklyPayment = currentLoan.weeklyPayment;
    
    for (let week = 1; week <= currentLoan.termWeeks; week++) {
      const dueDate = new Date(startDate);
      dueDate.setDate(dueDate.getDate() + (week * 7));
      
      const payment = payments.find(p => {
        const paymentDate = new Date(p.paymentDate);
        const weekStart = new Date(dueDate);
        weekStart.setDate(weekStart.getDate() - 7);
        return paymentDate >= weekStart && paymentDate <= dueDate;
      });

      schedule.push({
        week,
        dueDate,
        amount: weeklyPayment,
        status: payment ? 'paid' : new Date() > dueDate ? 'overdue' : 'pending',
        payment,
      });
    }
    
    return schedule;
  };

  const paymentSchedule = generatePaymentSchedule();

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push('/loans')}
              className="flex items-center space-x-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Back to Loans</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Loan {currentLoan.loanNumber}
              </h1>
              <p className="text-gray-600 mt-1">
                Created {formatDate(currentLoan.applicationDate)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentLoan.status)}`}>
              {currentLoan.status.charAt(0).toUpperCase() + currentLoan.status.slice(1)}
            </span>
            
            {currentLoan.status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowRejectionModal(true)}
                  className="flex items-center space-x-2 text-red-600 border-red-300 hover:bg-red-50"
                >
                  <XMarkIcon className="w-4 h-4" />
                  <span>Reject</span>
                </Button>
                <Button
                  onClick={() => setShowApprovalModal(true)}
                  className="flex items-center space-x-2"
                >
                  <CheckIcon className="w-4 h-4" />
                  <span>Approve</span>
                </Button>
              </>
            )}
            
            <Button variant="outline" className="flex items-center space-x-2">
              <PrinterIcon className="w-4 h-4" />
              <span>Print</span>
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        {currentLoan.status === 'active' && (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Payment Progress</span>
              <span className="text-sm text-gray-500">
                {formatCurrency(totalPaid)} of {formatCurrency(currentLoan.totalRepayment || 0)} paid
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(paymentProgress, 100)}%` }}
               />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>{paymentProgress.toFixed(1)}%</span>
              <span>100%</span>
            </div>
          </Card>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'details', name: 'Loan Details', icon: DocumentTextIcon },
              { id: 'payments', name: 'Payment History', icon: BanknotesIcon },
              { id: 'schedule', name: 'Payment Schedule', icon: CalendarIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'details' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customer Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <UserIcon className="w-5 h-5 mr-2" />
                Customer Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{currentLoan.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Customer ID</p>
                  <p className="font-medium">{currentLoan.customerId}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/customers/${currentLoan.customerId}`)}
                >
                  View Customer Profile
                </Button>
              </div>
            </Card>

            {/* Loan Summary */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CurrencyDollarIcon className="w-5 h-5 mr-2" />
                Loan Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Principal Amount</span>
                  <span className="font-medium">{formatCurrency(currentLoan.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Interest Rate</span>
                  <span className="font-medium">{currentLoan.interestRate}% per week</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Term</span>
                  <span className="font-medium">{currentLoan.termWeeks} weeks</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Weekly Payment</span>
                  <span className="font-medium">{formatCurrency(currentLoan.weeklyPayment)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Repayment</span>
                    <span className="font-bold">{formatCurrency(currentLoan.totalRepayment || 0)}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Payment Status */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BanknotesIcon className="w-5 h-5 mr-2" />
                Payment Status
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Paid</span>
                  <span className="font-medium text-green-600">{formatCurrency(totalPaid)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining Balance</span>
                  <span className="font-medium text-blue-600">{formatCurrency(Math.max(0, remainingBalance))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payments Made</span>
                  <span className="font-medium">{payments.length} payments</span>
                </div>
              </div>
            </Card>

            {/* Loan Details */}
            <div className="lg:col-span-3">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Additional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Purpose</p>
                    <p className="font-medium">{currentLoan.purpose || 'Not specified'}</p>
                  </div>
                  {currentLoan.collateral && currentLoan.collateral.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Collateral</p>
                      <div className="space-y-2">
                        {currentLoan.collateral.map((item, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded">
                            <p className="font-medium">{item.type}</p>
                            {item.estimatedValue && <p className="text-sm text-gray-600">Value: {formatCurrency(item.estimatedValue)}</p>}
                            {item.description && <p className="text-sm text-gray-600">{item.description}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {currentLoan.guarantors && currentLoan.guarantors.length > 0 && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600 mb-2">Guarantor Information</p>
                      <div className="space-y-4">
                        {currentLoan.guarantors.map((guarantor, index) => (
                          <div key={index} className="bg-gray-50 p-4 rounded-lg">
                            <p><strong>Name:</strong> {guarantor.name}</p>
                            <p><strong>Phone:</strong> {formatPhoneNumber(guarantor.phone)}</p>
                            <p><strong>Address:</strong> {guarantor.address}</p>
                            {guarantor.relationship && <p><strong>Relationship:</strong> {guarantor.relationship}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {currentLoan.notes && currentLoan.notes.length > 0 && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Notes</p>
                      <div className="space-y-2">
                        {currentLoan.notes.map((note, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded">
                            <p className="font-medium">{note.content}</p>
                            {note.createdAt && (
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDate(note.createdAt)} {note.createdBy && `by ${note.createdBy}`}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <Card>
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
                <Button
                  onClick={() => router.push(`/payments/new?loanId=${currentLoan.id}`)}
                  className="flex items-center space-x-2"
                >
                  <BanknotesIcon className="w-4 h-4" />
                  <span>Record Payment</span>
                </Button>
              </div>
            </div>
            
            {payments.length === 0 ? (
              <div className="p-12 text-center">
                <BanknotesIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No payments recorded</h3>
                <p className="text-gray-600 mb-6">Start recording payments for this loan.</p>
                <Button onClick={() => router.push(`/payments/new?loanId=${currentLoan.id}`)}>
                  Record First Payment
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Receipt
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(payment.paymentDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                          {payment.paymentMethod}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payment.receiptNumber || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {payment.notes || 'No notes'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {activeTab === 'schedule' && (
          <Card>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Payment Schedule</h3>
              <p className="text-gray-600 mt-1">Weekly payment schedule for this loan</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Week
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount Due
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Paid Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paymentSchedule.map((item) => (
                    <tr 
                      key={item.week} 
                      className={`hover:bg-gray-50 ${
                        item.status === 'overdue' ? 'bg-red-50' : 
                        item.status === 'paid' ? 'bg-green-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Week {item.week}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(item.dueDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'paid' ? 'bg-green-100 text-green-800' :
                          item.status === 'overdue' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.payment ? formatDate(item.payment.paymentDate) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Approval Modal */}
        <Modal
          isOpen={showApprovalModal}
          onClose={() => setShowApprovalModal(false)}
          title="Approve Loan"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to approve this loan for {currentLoan.customerName}?
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p><strong>Loan Amount:</strong> {formatCurrency(currentLoan.amount)}</p>
              <p><strong>Weekly Payment:</strong> {formatCurrency(currentLoan.weeklyPayment)}</p>
              <p><strong>Term:</strong> {currentLoan.termWeeks} weeks</p>
            </div>
            <div className="flex space-x-3 pt-4">
              <Button onClick={handleApproval} className="flex-1">
                Approve Loan
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowApprovalModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        {/* Rejection Modal */}
        <Modal
          isOpen={showRejectionModal}
          onClose={() => setShowRejectionModal(false)}
          title="Reject Loan"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Please provide a reason for rejecting this loan application:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              placeholder="Enter rejection reason..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div className="flex space-x-3 pt-4">
              <Button
                onClick={handleRejection}
                variant="outline"
                className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
              >
                Reject Loan
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowRejectionModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}
