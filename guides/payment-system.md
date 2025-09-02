# Payment System Guide

Comprehensive payment processing and management system for the Digital Micro-Lending Management System.

## Table of Contents
- [Payment System Overview](#payment-system-overview)
- [Payment Processing Workflow](#payment-processing-workflow)
- [Interest Calculations](#interest-calculations)
- [Payment Collection](#payment-collection)
- [Receipt Management](#receipt-management)
- [Late Payment Handling](#late-payment-handling)
- [Payment Reconciliation](#payment-reconciliation)
- [Mobile Payment Collection](#mobile-payment-collection)

## Payment System Overview

### Payment Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Collection    │    │   Payment       │    │   Loan          │
│   Interface     │───▶│   Processing    │───▶│   Management    │
│                 │    │                 │    │                 │
│ • Agent App     │    │ • Validation    │    │ • Balance Update│
│ • Receipt Photo │    │ • Calculation   │    │ • Schedule Mgmt │
│ • GPS Location  │    │ • Receipt Gen   │    │ • Status Update │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Payment Types and Methods
```typescript
interface PaymentTypes {
  installment: {
    description: 'Regular weekly/monthly installment';
    calculation: 'Based on loan schedule';
  };
  
  partial: {
    description: 'Partial payment less than due amount';
    handling: 'Track remaining balance';
  };
  
  advance: {
    description: 'Payment in advance of due date';
    handling: 'Credit to future installments';
  };
  
  penalty: {
    description: 'Late payment penalty';
    calculation: 'Based on days overdue';
  };
  
  settlement: {
    description: 'Full loan settlement';
    calculation: 'Outstanding balance + penalties';
  };
}

interface PaymentMethods {
  cash: 'Cash payment to agent';
  bank_transfer: 'Bank transfer with reference';
  mobile_payment: 'Mobile wallet payment';
  check: 'Check payment with number';
}
```

## Payment Processing Workflow

### 1. Payment Collection Service
```typescript
// services/paymentService.ts
import { db } from '@/lib/firebase';
import { collection, doc, addDoc, updateDoc, runTransaction } from 'firebase/firestore';

export interface CreatePaymentData {
  loanId: string;
  customerId: string;
  amount: number;
  installmentNumber: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'mobile_payment' | 'check';
  paymentDate: Date;
  collectedBy: string;
  notes?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  receiptPhoto?: string;
  paymentReference?: string;
}

export interface PaymentBreakdown {
  principalAmount: number;
  interestAmount: number;
  penaltyAmount: number;
  feeAmount: number;
  totalAmount: number;
}

export class PaymentService {
  async recordPayment(data: CreatePaymentData): Promise<Payment> {
    try {
      // Validate payment data
      await this.validatePayment(data);

      // Calculate payment breakdown
      const breakdown = await this.calculatePaymentBreakdown(data);

      // Generate receipt number
      const receiptNumber = await this.generateReceiptNumber();

      // Create payment record in transaction
      const payment = await runTransaction(db, async (transaction) => {
        // Get loan document
        const loanRef = doc(db, 'loans', data.loanId);
        const loanDoc = await transaction.get(loanRef);
        
        if (!loanDoc.exists()) {
          throw new Error('Loan not found');
        }

        const loan = loanDoc.data() as Loan;

        // Create payment document
        const paymentData: Payment = {
          paymentId: '', // Will be set after creation
          receiptNumber,
          loanId: data.loanId,
          customerId: data.customerId,
          
          loanInfo: {
            loanNumber: loan.loanNumber,
            customerName: loan.customerInfo.name,
            customerPhone: loan.customerInfo.phone,
          },
          
          paymentDetails: {
            amount: data.amount,
            installmentNumber: data.installmentNumber,
            principalAmount: breakdown.principalAmount,
            interestAmount: breakdown.interestAmount,
            penaltyAmount: breakdown.penaltyAmount,
            feeAmount: breakdown.feeAmount,
            paymentMethod: data.paymentMethod,
            paymentReference: data.paymentReference,
            currency: 'LKR',
          },
          
          collectionInfo: {
            collectedBy: data.collectedBy,
            collectorName: '', // Will be populated from user data
            collectionDate: data.paymentDate,
            collectionTime: new Date().toLocaleTimeString(),
            collectionLocation: data.location ? {
              address: '', // Would be reverse geocoded
              coordinates: data.location,
            } : undefined,
            receiptPhoto: data.receiptPhoto,
          },
          
          status: 'pending',
          verificationStatus: 'pending',
          
          latePayment: {
            isLate: false,
            dayslate: 0,
            originalDueDate: new Date(), // From schedule
            gracePeriodUsed: false,
            penaltyApplied: breakdown.penaltyAmount > 0,
            penaltyWaived: false,
          },
          
          reconciliation: {
            reconciled: false,
          },
          
          notes: data.notes ? [{
            note: data.notes,
            createdBy: data.collectedBy,
            createdAt: new Date(),
            type: 'collection',
          }] : [],
          
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: data.collectedBy,
        };

        // Add payment to collection
        const paymentRef = doc(collection(db, 'payments'));
        transaction.set(paymentRef, { ...paymentData, paymentId: paymentRef.id });

        // Update loan payment status
        const updatedPaymentStatus = this.updateLoanPaymentStatus(loan, breakdown);
        transaction.update(loanRef, {
          paymentStatus: updatedPaymentStatus,
          updatedAt: new Date(),
        });

        return { ...paymentData, paymentId: paymentRef.id };
      });

      // Post-transaction operations
      await this.processPostPaymentTasks(payment);

      return payment;
    } catch (error: any) {
      throw new Error(`Failed to record payment: ${error.message}`);
    }
  }

  private async validatePayment(data: CreatePaymentData): Promise<void> {
    // Check if loan exists and is active
    const loanDoc = await getDoc(doc(db, 'loans', data.loanId));
    if (!loanDoc.exists()) {
      throw new Error('Loan not found');
    }

    const loan = loanDoc.data() as Loan;
    if (loan.status !== 'active') {
      throw new Error('Loan is not active');
    }

    // Validate payment amount
    if (data.amount <= 0) {
      throw new Error('Payment amount must be greater than zero');
    }

    // Validate installment number
    if (data.installmentNumber < 1 || data.installmentNumber > loan.loanDetails.totalInstallments) {
      throw new Error('Invalid installment number');
    }
  }

  private async generateReceiptNumber(): Promise<string> {
    const counter = await getDoc(doc(db, 'counters', 'receipts'));
    let nextNumber = 1;
    
    if (counter.exists()) {
      nextNumber = counter.data().value + 1;
    }
    
    await setDoc(doc(db, 'counters', 'receipts'), { value: nextNumber });
    
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    return `RCP${year}${month}${nextNumber.toString().padStart(6, '0')}`;
  }
}

export const paymentService = new PaymentService();
```

## Interest Calculations

### 1. Interest Calculation Engine
```typescript
// lib/calculations/interestCalculator.ts
export interface LoanTerms {
  principal: number;
  annualInterestRate: number;
  termWeeks: number;
  calculationMethod: 'flat' | 'reducing';
  startDate: Date;
}

export interface InstallmentSchedule {
  installmentNumber: number;
  dueDate: Date;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  remainingBalance: number;
}

export class InterestCalculator {
  /**
   * Calculate flat rate interest
   * Total interest = Principal × Rate × Time
   * Equal installments throughout the term
   */
  static calculateFlatRate(terms: LoanTerms): InstallmentSchedule[] {
    const { principal, annualInterestRate, termWeeks, startDate } = terms;
    
    // Calculate total interest for entire term
    const totalInterest = principal * (annualInterestRate / 100) * (termWeeks / 52);
    const totalAmount = principal + totalInterest;
    
    // Equal installment amount
    const installmentAmount = totalAmount / termWeeks;
    const principalPerInstallment = principal / termWeeks;
    const interestPerInstallment = totalInterest / termWeeks;
    
    const schedule: InstallmentSchedule[] = [];
    
    for (let i = 1; i <= termWeeks; i++) {
      const dueDate = new Date(startDate);
      dueDate.setDate(dueDate.getDate() + (i * 7)); // Weekly payments
      
      schedule.push({
        installmentNumber: i,
        dueDate,
        principalAmount: principalPerInstallment,
        interestAmount: interestPerInstallment,
        totalAmount: installmentAmount,
        remainingBalance: principal - (principalPerInstallment * i),
      });
    }
    
    return schedule;
  }

  /**
   * Calculate reducing balance interest
   * Interest calculated on outstanding balance
   * Equal installments with varying principal/interest split
   */
  static calculateReducingBalance(terms: LoanTerms): InstallmentSchedule[] {
    const { principal, annualInterestRate, termWeeks, startDate } = terms;
    
    // Weekly interest rate
    const weeklyRate = annualInterestRate / 100 / 52;
    
    // Calculate EMI using formula: EMI = P × [r(1+r)^n] / [(1+r)^n-1]
    const emi = principal * 
      (weeklyRate * Math.pow(1 + weeklyRate, termWeeks)) / 
      (Math.pow(1 + weeklyRate, termWeeks) - 1);
    
    const schedule: InstallmentSchedule[] = [];
    let remainingBalance = principal;
    
    for (let i = 1; i <= termWeeks; i++) {
      const dueDate = new Date(startDate);
      dueDate.setDate(dueDate.getDate() + (i * 7));
      
      // Interest for this period
      const interestAmount = remainingBalance * weeklyRate;
      
      // Principal portion
      const principalAmount = emi - interestAmount;
      
      // Update remaining balance
      remainingBalance -= principalAmount;
      
      schedule.push({
        installmentNumber: i,
        dueDate,
        principalAmount,
        interestAmount,
        totalAmount: emi,
        remainingBalance: Math.max(0, remainingBalance),
      });
    }
    
    return schedule;
  }
}
```

## Payment Collection

### 1. Mobile Payment Collection Interface
```typescript
// components/payments/MobilePaymentCollection.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { paymentService } from '@/services/paymentService';

const paymentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'mobile_payment', 'check']),
  paymentReference: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface MobilePaymentCollectionProps {
  loan: Loan;
  customer: Customer;
  onPaymentRecorded: (payment: Payment) => void;
}

export function MobilePaymentCollection({
  loan,
  customer,
  onPaymentRecorded,
}: MobilePaymentCollectionProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [receiptPhoto, setReceiptPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState<{latitude: number; longitude: number} | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: loan.paymentStatus.nextPaymentAmount,
      paymentMethod: 'cash',
    },
  });

  const paymentMethod = watch('paymentMethod');

  const recordPayment = async (data: PaymentFormData) => {
    setIsRecording(true);

    try {
      const payment = await paymentService.recordPayment({
        loanId: loan.loanId,
        customerId: customer.customerId,
        amount: data.amount,
        installmentNumber: loan.paymentStatus.paidInstallments + 1,
        paymentMethod: data.paymentMethod,
        paymentDate: new Date(),
        collectedBy: 'current-user-id', // Get from auth context
        notes: data.notes,
        location: location || undefined,
        receiptPhoto: receiptPhoto || undefined,
        paymentReference: data.paymentReference,
      });

      onPaymentRecorded(payment);
    } catch (error: any) {
      alert(`Failed to record payment: ${error.message}`);
    } finally {
      setIsRecording(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg">
      {/* Customer Info Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg">
        <h2 className="text-lg font-semibold">{customer.personalInfo.firstName} {customer.personalInfo.lastName}</h2>
        <p className="text-blue-100">Loan: {loan.loanNumber}</p>
        <p className="text-blue-100">Due: LKR {loan.paymentStatus.nextPaymentAmount.toLocaleString()}</p>
      </div>

      <form onSubmit={handleSubmit(recordPayment)} className="p-4 space-y-4">
        {/* Payment Amount */}
        <Input
          label="Payment Amount (LKR)"
          type="number"
          {...register('amount', { valueAsNumber: true })}
          error={errors.amount?.message}
          step={0.01}
          min={0}
        />

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'cash', label: '💵 Cash' },
              { value: 'bank_transfer', label: '🏦 Bank' },
              { value: 'mobile_payment', label: '📱 Mobile' },
              { value: 'check', label: '📄 Check' },
            ].map((method) => (
              <label
                key={method.value}
                className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === method.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  {...register('paymentMethod')}
                  value={method.value}
                  className="sr-only"
                />
                <span className="text-sm font-medium">{method.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          loading={isRecording}
          className="w-full"
          size="lg"
        >
          Record Payment
        </Button>
      </form>
    </div>
  );
}
```

## Receipt Management

### 1. Digital Receipt Generator
```typescript
// services/receiptService.ts
import { jsPDF } from 'jspdf';

export interface ReceiptData {
  receiptNumber: string;
  paymentDate: Date;
  customer: {
    name: string;
    phone: string;
  };
  loan: {
    loanNumber: string;
  };
  payment: {
    amount: number;
    principalAmount: number;
    interestAmount: number;
    installmentNumber: number;
    totalInstallments: number;
  };
  balance: {
    outstandingBalance: number;
    nextPaymentDate?: Date;
    nextPaymentAmount: number;
  };
  collector: {
    name: string;
    id: string;
  };
  businessInfo: {
    name: string;
    address: string;
    phone: string;
  };
}

export class ReceiptService {
  static async generatePDFReceipt(data: ReceiptData): Promise<string> {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 120], // Thermal printer size
    });

    let y = 10;
    const lineHeight = 4;

    // Header
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(data.businessInfo.name, 40, y, { align: 'center' });
    y += lineHeight;

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.businessInfo.address, 40, y, { align: 'center' });
    y += lineHeight;
    pdf.text(data.businessInfo.phone, 40, y, { align: 'center' });
    y += lineHeight * 2;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PAYMENT RECEIPT', 40, y, { align: 'center' });
    y += lineHeight * 2;

    // Receipt details
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Receipt No: ${data.receiptNumber}`, 5, y);
    y += lineHeight;
    pdf.text(`Date: ${data.paymentDate.toLocaleDateString()}`, 5, y);
    y += lineHeight;
    pdf.text(`Time: ${data.paymentDate.toLocaleTimeString()}`, 5, y);
    y += lineHeight * 2;

    // Customer details
    pdf.text(`Customer: ${data.customer.name}`, 5, y);
    y += lineHeight;
    pdf.text(`Phone: ${data.customer.phone}`, 5, y);
    y += lineHeight;
    pdf.text(`Loan No: ${data.loan.loanNumber}`, 5, y);
    y += lineHeight * 2;

    // Payment details
    pdf.text(`Payment Amount: LKR ${data.payment.amount.toFixed(2)}`, 5, y);
    y += lineHeight;
    pdf.text(`Principal: LKR ${data.payment.principalAmount.toFixed(2)}`, 5, y);
    y += lineHeight;
    pdf.text(`Interest: LKR ${data.payment.interestAmount.toFixed(2)}`, 5, y);
    y += lineHeight;
    pdf.text(`Installment: ${data.payment.installmentNumber} of ${data.payment.totalInstallments}`, 5, y);
    y += lineHeight * 2;

    // Balance details
    pdf.text(`Outstanding: LKR ${data.balance.outstandingBalance.toFixed(2)}`, 5, y);
    y += lineHeight;
    
    if (data.balance.nextPaymentDate) {
      pdf.text(`Next Payment: ${data.balance.nextPaymentDate.toLocaleDateString()}`, 5, y);
      y += lineHeight;
      pdf.text(`Next Amount: LKR ${data.balance.nextPaymentAmount.toFixed(2)}`, 5, y);
      y += lineHeight;
    }

    y += lineHeight;
    pdf.text(`Collected by: ${data.collector.name}`, 5, y);
    y += lineHeight;
    pdf.text(`Agent ID: ${data.collector.id}`, 5, y);
    y += lineHeight * 2;

    pdf.text('Thank you for your payment!', 40, y, { align: 'center' });

    // Generate blob URL
    const pdfBlob = pdf.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    return url;
  }

  static async printReceipt(receiptData: ReceiptData): Promise<void> {
    try {
      // Generate PDF
      const pdfUrl = await this.generatePDFReceipt(receiptData);
      
      // Open print dialog
      const printWindow = window.open(pdfUrl, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } catch (error) {
      console.error('Failed to print receipt:', error);
      throw new Error('Failed to print receipt');
    }
  }
}
```

## Late Payment Handling

### 1. Late Payment Calculator
```typescript
// lib/calculations/latePaymentCalculator.ts
export interface LatePaymentConfig {
  gracePeriodDays: number;
  penaltyRate: number; // Percentage per week
  maxPenaltyAmount?: number;
  compoundPenalty: boolean;
}

export interface LatePaymentResult {
  daysLate: number;
  penaltyAmount: number;
  totalAmountDue: number;
  gracePeriodExpired: boolean;
  penaltyWaivable: boolean;
}

export class LatePaymentCalculator {
  static calculateLatePayment(
    originalAmount: number,
    dueDate: Date,
    currentDate: Date,
    config: LatePaymentConfig
  ): LatePaymentResult {
    const daysLate = Math.max(0, Math.ceil(
      (currentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
    ));

    const gracePeriodExpired = daysLate > config.gracePeriodDays;
    let penaltyAmount = 0;

    if (gracePeriodExpired) {
      const penaltyDays = daysLate - config.gracePeriodDays;
      const penaltyWeeks = Math.ceil(penaltyDays / 7);
      
      if (config.compoundPenalty) {
        // Compound penalty calculation
        penaltyAmount = originalAmount * 
          (Math.pow(1 + config.penaltyRate / 100, penaltyWeeks) - 1);
      } else {
        // Simple penalty calculation
        penaltyAmount = originalAmount * (config.penaltyRate / 100) * penaltyWeeks;
      }

      // Apply maximum penalty limit if set
      if (config.maxPenaltyAmount && penaltyAmount > config.maxPenaltyAmount) {
        penaltyAmount = config.maxPenaltyAmount;
      }
    }

    return {
      daysLate,
      penaltyAmount,
      totalAmountDue: originalAmount + penaltyAmount,
      gracePeriodExpired,
      penaltyWaivable: daysLate <= 30, // Penalty can be waived within 30 days
    };
  }
}
```

This comprehensive payment system guide covers all essential aspects of payment processing, from basic collection to advanced features like interest calculations, receipt generation, and late payment handling for the micro-lending management system.