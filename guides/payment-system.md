# Payment System Guide

Comprehensive guide for implementing the payment collection and processing system in the Digital Micro-Lending Management System.

## Table of Contents
- [Payment System Architecture](#payment-system-architecture)
- [Payment Types and Methods](#payment-types-and-methods)
- [Collection Workflow](#collection-workflow)
- [Interest Calculation Engine](#interest-calculation-engine)
- [Payment Processing](#payment-processing)
- [Mobile Payment Integration](#mobile-payment-integration)
- [Defaulter Management](#defaulter-management)
- [Reporting and Analytics](#reporting-and-analytics)

## Payment System Architecture

### System Overview
```
Payment Processing Architecture:
├── Collection Interface (Mobile/Tablet)
├── Payment Validation Engine
├── Interest Calculation Service
├── Transaction Recording
├── Receipt Generation
├── Notification System
└── Reporting Dashboard
```

### Data Flow
```
Payment Collection Flow:
Customer → Agent App → Validation → Calculation → Recording → Receipt → Notifications
```

## Payment Types and Methods

### 1. Weekly Installments
**Primary Collection Method:**
- Fixed weekly amounts
- Doorstep collection by agents
- Cash-based transactions
- Immediate receipt generation

```typescript
interface WeeklyPayment {
  paymentId: string;
  customerId: string;
  loanId: string;
  agentId: string;
  amount: number;
  installmentNumber: number;
  dueDate: Date;
  paidDate: Date;
  paymentMethod: 'cash' | 'digital';
  receiptNumber: string;
  status: 'paid' | 'partial' | 'overdue' | 'defaulted';
  interestAmount: number;
  principalAmount: number;
  penaltyAmount?: number;
  collectedBy: string;
  location: {
    latitude: number;
    longitude: number;
  };
  notes?: string;
}
```

### 2. Lump Sum Payments
**Full/Partial Loan Settlement:**
- Early settlement discounts
- Partial lump sum payments
- Interest calculation adjustments

```typescript
interface LumpSumPayment {
  paymentId: string;
  customerId: string;
  loanId: string;
  amount: number;
  paymentType: 'full_settlement' | 'partial_payment';
  remainingBalance: number;
  discountApplied?: number;
  effectiveDate: Date;
  approvedBy: string;
}
```

### 3. Digital Payments (Future)
**Mobile Money Integration:**
- Dialog eZ Cash
- Mobitel mCash
- Bank transfers
- QR code payments

```typescript
interface DigitalPayment {
  paymentId: string;
  provider: 'ezCash' | 'mCash' | 'bank_transfer' | 'qr_code';
  transactionId: string;
  amount: number;
  processingFee: number;
  status: 'pending' | 'confirmed' | 'failed';
  confirmationCode?: string;
}
```

## Collection Workflow

### 1. Daily Route Planning
```typescript
// lib/route-planning.ts
interface CollectionRoute {
  agentId: string;
  date: Date;
  customers: RouteCustomer[];
  estimatedDuration: number;
  totalExpectedAmount: number;
  startLocation: Location;
  optimizedOrder: string[]; // customer IDs in visit order
}

interface RouteCustomer {
  customerId: string;
  name: string;
  address: string;
  location: Location;
  expectedAmount: number;
  dueDate: Date;
  lastPaymentDate?: Date;
  riskLevel: 'low' | 'medium' | 'high';
  preferredVisitTime?: string;
}

export function generateDailyRoute(agentId: string, date: Date): CollectionRoute {
  // Algorithm to optimize collection route
  // Factors: due dates, amounts, risk levels, geographical proximity
}
```

### 2. Payment Collection Interface
```typescript
// components/payments/PaymentCollectionForm.tsx
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface PaymentCollectionFormProps {
  customer: Customer;
  loan: Loan;
  expectedAmount: number;
  onPaymentComplete: (payment: PaymentRecord) => void;
}

export function PaymentCollectionForm({ 
  customer, 
  loan, 
  expectedAmount, 
  onPaymentComplete 
}: PaymentCollectionFormProps) {
  const [amount, setAmount] = useState(expectedAmount);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'digital'>('cash');
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);

  useEffect(() => {
    // Get current location for payment verification
    navigator.geolocation.getCurrentPosition((position) => {
      setLocation(position.coords);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payment: PaymentRecord = {
      customerId: customer.id,
      loanId: loan.id,
      amount: parseFloat(amount.toString()),
      paymentMethod,
      collectedAt: new Date(),
      collectedBy: getCurrentAgent().id,
      location: location ? {
        latitude: location.latitude,
        longitude: location.longitude
      } : undefined,
      notes
    };

    try {
      const result = await processPayment(payment);
      onPaymentComplete(result);
    } catch (error) {
      console.error('Payment processing failed:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Payment Collection
        </h3>
        <div className="mt-2 text-sm text-gray-600">
          <p>Customer: {customer.name}</p>
          <p>Expected Amount: LKR {expectedAmount.toLocaleString()}</p>
          <p>Due Date: {loan.nextDueDate.toLocaleDateString()}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Payment Amount (LKR)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value))}
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-lg p-3"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Payment Method
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'digital')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="cash">Cash Payment</option>
            <option value="digital">Digital Payment</option>
          </select>
        </div>

        {paymentMethod === 'digital' && (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Show QR code to customer for payment
            </p>
            <QRCodeSVG
              value={`payment:${customer.id}:${amount}`}
              size={200}
              className="mx-auto"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            placeholder="Any additional notes about this payment..."
          />
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md text-lg font-medium hover:bg-green-700"
          >
            Collect Payment
          </button>
          <button
            type="button"
            onClick={() => handlePartialPayment()}
            className="flex-1 bg-yellow-600 text-white py-3 px-4 rounded-md text-lg font-medium hover:bg-yellow-700"
          >
            Partial Payment
          </button>
        </div>
      </form>
    </div>
  );
}
```

## Interest Calculation Engine

### 1. Weekly Interest Calculation
```typescript
// lib/interest-calculator.ts
interface LoanTerms {
  principal: number;
  interestRate: number; // Weekly percentage
  duration: number; // Number of weeks
  startDate: Date;
}

interface PaymentSchedule {
  installmentNumber: number;
  dueDate: Date;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  cumulativeBalance: number;
}

export class InterestCalculator {
  
  static calculateWeeklyInstallment(terms: LoanTerms): number {
    const { principal, interestRate, duration } = terms;
    const weeklyRate = interestRate / 100;
    
    // Simple interest calculation for micro-lending
    const totalInterest = principal * weeklyRate * duration;
    const totalAmount = principal + totalInterest;
    
    return totalAmount / duration;
  }

  static generatePaymentSchedule(terms: LoanTerms): PaymentSchedule[] {
    const schedule: PaymentSchedule[] = [];
    const weeklyInstallment = this.calculateWeeklyInstallment(terms);
    const weeklyInterest = terms.principal * (terms.interestRate / 100);
    const weeklyPrincipal = weeklyInstallment - weeklyInterest;
    
    let remainingBalance = terms.principal;
    
    for (let week = 1; week <= terms.duration; week++) {
      const dueDate = new Date(terms.startDate);
      dueDate.setDate(dueDate.getDate() + (week * 7));
      
      schedule.push({
        installmentNumber: week,
        dueDate,
        principalAmount: weeklyPrincipal,
        interestAmount: weeklyInterest,
        totalAmount: weeklyInstallment,
        cumulativeBalance: remainingBalance - (weeklyPrincipal * week)
      });
    }
    
    return schedule;
  }

  static calculatePenalty(
    dueDate: Date,
    currentDate: Date,
    originalAmount: number,
    penaltyRate: number = 2 // 2% per week
  ): number {
    const daysOverdue = Math.floor(
      (currentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysOverdue <= 0) return 0;
    
    const weeksOverdue = Math.ceil(daysOverdue / 7);
    return originalAmount * (penaltyRate / 100) * weeksOverdue;
  }

  static calculateEarlySettlement(
    loan: Loan,
    settleDate: Date,
    discountRate: number = 10 // 10% discount for early settlement
  ): {
    remainingPrincipal: number;
    savedInterest: number;
    discount: number;
    settlementAmount: number;
  } {
    const remainingWeeks = this.getRemainingWeeks(loan, settleDate);
    const weeklyInterest = loan.principal * (loan.interestRate / 100);
    const savedInterest = weeklyInterest * remainingWeeks;
    const discount = savedInterest * (discountRate / 100);
    
    return {
      remainingPrincipal: loan.remainingPrincipal,
      savedInterest,
      discount,
      settlementAmount: loan.remainingPrincipal - discount
    };
  }

  private static getRemainingWeeks(loan: Loan, currentDate: Date): number {
    const endDate = new Date(loan.startDate);
    endDate.setDate(endDate.getDate() + (loan.duration * 7));
    
    const remainingTime = endDate.getTime() - currentDate.getTime();
    return Math.max(0, Math.ceil(remainingTime / (1000 * 60 * 60 * 24 * 7)));
  }
}
```

### 2. Payment Allocation Logic
```typescript
// lib/payment-allocation.ts
interface PaymentAllocation {
  principal: number;
  interest: number;
  penalty: number;
  remaining: number;
}

export function allocatePayment(
  paymentAmount: number,
  outstandingPenalty: number,
  outstandingInterest: number,
  outstandingPrincipal: number
): PaymentAllocation {
  let remaining = paymentAmount;
  let penalty = 0;
  let interest = 0;
  let principal = 0;

  // 1. First, pay any outstanding penalties
  if (remaining > 0 && outstandingPenalty > 0) {
    penalty = Math.min(remaining, outstandingPenalty);
    remaining -= penalty;
  }

  // 2. Then, pay outstanding interest
  if (remaining > 0 && outstandingInterest > 0) {
    interest = Math.min(remaining, outstandingInterest);
    remaining -= interest;
  }

  // 3. Finally, pay principal
  if (remaining > 0 && outstandingPrincipal > 0) {
    principal = Math.min(remaining, outstandingPrincipal);
    remaining -= principal;
  }

  return {
    principal,
    interest,
    penalty,
    remaining
  };
}
```

## Payment Processing

### 1. Payment Validation
```typescript
// lib/payment-validator.ts
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class PaymentValidator {
  
  static validatePayment(
    payment: PaymentRecord,
    customer: Customer,
    loan: Loan
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validations
    if (payment.amount <= 0) {
      errors.push('Payment amount must be greater than zero');
    }

    if (payment.amount > loan.remainingBalance * 1.5) {
      errors.push('Payment amount exceeds reasonable limit');
    }

    // Business rule validations
    if (customer.status === 'inactive') {
      errors.push('Cannot collect payment from inactive customer');
    }

    if (loan.status === 'closed') {
      errors.push('Cannot collect payment for closed loan');
    }

    // Location validation for field collection
    if (!payment.location && payment.collectionType === 'field') {
      warnings.push('Location not recorded for field collection');
    }

    // Amount warnings
    if (payment.amount < loan.expectedWeeklyAmount * 0.5) {
      warnings.push('Payment is significantly less than expected amount');
    }

    if (payment.amount > loan.expectedWeeklyAmount * 2) {
      warnings.push('Payment is significantly more than expected amount');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateDuplicatePayment(
    payment: PaymentRecord,
    recentPayments: PaymentRecord[]
  ): boolean {
    const timeWindow = 5 * 60 * 1000; // 5 minutes
    const amountTolerance = 10; // LKR 10

    return recentPayments.some(recent => 
      Math.abs(recent.amount - payment.amount) <= amountTolerance &&
      Math.abs(recent.collectedAt.getTime() - payment.collectedAt.getTime()) <= timeWindow
    );
  }
}
```

### 2. Transaction Processing
```typescript
// lib/payment-processor.ts
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, runTransaction } from 'firebase/firestore';

export class PaymentProcessor {
  
  static async processPayment(payment: PaymentRecord): Promise<ProcessedPayment> {
    return await runTransaction(db, async (transaction) => {
      // 1. Validate payment
      const validation = PaymentValidator.validatePayment(payment, customer, loan);
      if (!validation.isValid) {
        throw new Error(`Payment validation failed: ${validation.errors.join(', ')}`);
      }

      // 2. Calculate allocation
      const allocation = allocatePayment(
        payment.amount,
        loan.outstandingPenalty,
        loan.outstandingInterest,
        loan.outstandingPrincipal
      );

      // 3. Create payment record
      const paymentDoc = await addDoc(collection(db, 'payments'), {
        ...payment,
        allocation,
        processedAt: new Date(),
        receiptNumber: generateReceiptNumber(),
        status: 'completed'
      });

      // 4. Update loan status
      const newBalance = loan.remainingBalance - allocation.principal;
      await updateDoc(doc(db, 'loans', payment.loanId), {
        remainingBalance: newBalance,
        lastPaymentDate: payment.collectedAt,
        lastPaymentAmount: payment.amount,
        totalPaid: loan.totalPaid + payment.amount,
        status: newBalance <= 0 ? 'completed' : 'active'
      });

      // 5. Update customer status
      await updateDoc(doc(db, 'customers', payment.customerId), {
        lastPaymentDate: payment.collectedAt,
        paymentHistory: [...customer.paymentHistory, paymentDoc.id]
      });

      // 6. Generate receipt
      const receipt = await generateReceipt(payment, allocation);

      return {
        paymentId: paymentDoc.id,
        receipt,
        newLoanBalance: newBalance,
        allocation
      };
    });
  }

  private static generateReceiptNumber(): string {
    const date = new Date();
    const timestamp = date.getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `RCP${timestamp}${random}`;
  }
}
```

## Mobile Payment Integration

### 1. Dialog eZ Cash Integration
```typescript
// lib/integrations/ez-cash.ts
interface EzCashPayment {
  merchantId: string;
  amount: number;
  currency: 'LKR';
  description: string;
  customerPhone: string;
  referenceId: string;
}

export class EzCashService {
  private apiUrl = process.env.EZCASH_API_URL;
  private merchantId = process.env.EZCASH_MERCHANT_ID;
  private apiKey = process.env.EZCASH_API_KEY;

  async initiatePayment(payment: EzCashPayment): Promise<{
    transactionId: string;
    paymentUrl: string;
    qrCode: string;
  }> {
    const payload = {
      merchant_id: this.merchantId,
      amount: payment.amount,
      currency: payment.currency,
      description: payment.description,
      customer_phone: payment.customerPhone,
      reference_id: payment.referenceId,
      callback_url: `${process.env.BASE_URL}/api/payments/ezcash/callback`
    };

    const response = await fetch(`${this.apiUrl}/initiate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('Failed to initiate eZ Cash payment');
    }

    return await response.json();
  }

  async verifyPayment(transactionId: string): Promise<{
    status: 'success' | 'failed' | 'pending';
    amount: number;
    fee: number;
  }> {
    const response = await fetch(`${this.apiUrl}/verify/${transactionId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    return await response.json();
  }
}
```

### 2. QR Code Payment System
```typescript
// components/payments/QRPayment.tsx
import { QRCodeSVG } from 'qrcode.react';
import { useState, useEffect } from 'react';

interface QRPaymentProps {
  customerId: string;
  amount: number;
  onPaymentComplete: (payment: any) => void;
}

export function QRPayment({ customerId, amount, onPaymentComplete }: QRPaymentProps) {
  const [qrData, setQrData] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'scanning' | 'processing' | 'completed'>('pending');

  useEffect(() => {
    // Generate QR code data for payment
    const paymentData = {
      type: 'micro_lending_payment',
      customer_id: customerId,
      amount: amount,
      currency: 'LKR',
      timestamp: Date.now(),
      merchant: 'Micro Lending System'
    };

    setQrData(JSON.stringify(paymentData));
  }, [customerId, amount]);

  const pollPaymentStatus = async () => {
    // Poll for payment completion
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/payments/check/${customerId}`);
        const data = await response.json();
        
        if (data.status === 'completed') {
          setPaymentStatus('completed');
          onPaymentComplete(data.payment);
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    }, 2000);

    return () => clearInterval(interval);
  };

  return (
    <div className="text-center p-6">
      <h3 className="text-lg font-semibold mb-4">QR Code Payment</h3>
      
      {qrData && (
        <div className="mb-4">
          <QRCodeSVG
            value={qrData}
            size={256}
            level="H"
            includeMargin={true}
            className="mx-auto border-2 border-gray-200 rounded-lg"
          />
        </div>
      )}

      <div className="text-gray-600 mb-4">
        <p className="text-xl font-bold">LKR {amount.toLocaleString()}</p>
        <p className="text-sm">Show this QR code to customer for payment</p>
      </div>

      <div className="space-y-2">
        <button
          onClick={pollPaymentStatus}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          disabled={paymentStatus === 'processing'}
        >
          {paymentStatus === 'processing' ? 'Checking Payment...' : 'Check for Payment'}
        </button>
        
        <button
          onClick={() => setPaymentStatus('completed')}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
        >
          Mark as Cash Payment
        </button>
      </div>

      {paymentStatus === 'completed' && (
        <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-md">
          Payment completed successfully!
        </div>
      )}
    </div>
  );
}
```

## Defaulter Management

### 1. Defaulter Identification
```typescript
// lib/defaulter-detector.ts
interface DefaulterCriteria {
  missedPayments: number;
  daysOverdue: number;
  riskScore: number;
}

export class DefaulterDetector {
  
  static identifyDefaulters(customers: Customer[]): Customer[] {
    return customers.filter(customer => 
      this.isDefaulter(customer, this.getDefaultCriteria())
    );
  }

  private static getDefaultCriteria(): DefaulterCriteria {
    return {
      missedPayments: 3, // 3 consecutive missed payments
      daysOverdue: 21,   // 3 weeks overdue
      riskScore: 70      // Risk score above 70%
    };
  }

  private static isDefaulter(customer: Customer, criteria: DefaulterCriteria): boolean {
    const { missedPayments, daysOverdue, riskScore } = criteria;
    
    return (
      customer.consecutiveMissedPayments >= missedPayments ||
      customer.daysOverdue >= daysOverdue ||
      customer.riskScore >= riskScore
    );
  }

  static calculateRiskScore(customer: Customer): number {
    let score = 0;

    // Payment history (40% weight)
    const paymentReliability = customer.onTimePayments / customer.totalExpectedPayments;
    score += (1 - paymentReliability) * 40;

    // Days overdue (30% weight)
    if (customer.daysOverdue > 0) {
      score += Math.min(customer.daysOverdue / 30, 1) * 30;
    }

    // Consecutive missed payments (20% weight)
    score += Math.min(customer.consecutiveMissedPayments / 5, 1) * 20;

    // Contact attempts (10% weight)
    const contactScore = customer.contactAttempts / 10;
    score += Math.min(contactScore, 1) * 10;

    return Math.round(score);
  }
}
```

### 2. Collection Strategy
```typescript
// lib/collection-strategy.ts
interface CollectionAction {
  type: 'phone_call' | 'visit' | 'sms' | 'email' | 'legal_notice';
  priority: 1 | 2 | 3 | 4 | 5;
  dueDate: Date;
  assignedTo: string;
  template?: string;
}

export class CollectionStrategy {
  
  static generateCollectionPlan(customer: Customer): CollectionAction[] {
    const actions: CollectionAction[] = [];
    const daysOverdue = customer.daysOverdue;

    if (daysOverdue >= 1 && daysOverdue <= 7) {
      // Gentle reminder phase
      actions.push({
        type: 'sms',
        priority: 1,
        dueDate: new Date(),
        assignedTo: customer.assignedAgent,
        template: 'gentle_reminder'
      });
    }

    if (daysOverdue >= 8 && daysOverdue <= 14) {
      // Follow-up phase
      actions.push({
        type: 'phone_call',
        priority: 2,
        dueDate: new Date(),
        assignedTo: customer.assignedAgent
      });
    }

    if (daysOverdue >= 15 && daysOverdue <= 21) {
      // Serious follow-up
      actions.push({
        type: 'visit',
        priority: 3,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        assignedTo: customer.assignedAgent
      });
    }

    if (daysOverdue > 21) {
      // Legal action consideration
      actions.push({
        type: 'legal_notice',
        priority: 5,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        assignedTo: 'legal_team'
      });
    }

    return actions;
  }
}
```

## Reporting and Analytics

### 1. Payment Analytics
```typescript
// lib/payment-analytics.ts
interface PaymentMetrics {
  totalCollected: number;
  totalExpected: number;
  collectionRate: number;
  averagePaymentAmount: number;
  onTimePayments: number;
  latePayments: number;
  missedPayments: number;
  defaultedAmount: number;
}

export class PaymentAnalytics {
  
  static calculateMetrics(
    payments: PaymentRecord[],
    expectedPayments: ExpectedPayment[],
    dateRange: { start: Date; end: Date }
  ): PaymentMetrics {
    const filteredPayments = payments.filter(p => 
      p.collectedAt >= dateRange.start && p.collectedAt <= dateRange.end
    );

    const filteredExpected = expectedPayments.filter(p =>
      p.dueDate >= dateRange.start && p.dueDate <= dateRange.end
    );

    const totalCollected = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalExpected = filteredExpected.reduce((sum, p) => sum + p.amount, 0);
    
    return {
      totalCollected,
      totalExpected,
      collectionRate: totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0,
      averagePaymentAmount: filteredPayments.length > 0 ? totalCollected / filteredPayments.length : 0,
      onTimePayments: filteredPayments.filter(p => p.isOnTime).length,
      latePayments: filteredPayments.filter(p => !p.isOnTime && !p.isDefaulted).length,
      missedPayments: filteredExpected.length - filteredPayments.length,
      defaultedAmount: filteredPayments.filter(p => p.isDefaulted).reduce((sum, p) => sum + p.amount, 0)
    };
  }

  static generateCollectionReport(agentId: string, month: number, year: number) {
    // Generate detailed collection report for agent
    return {
      agentId,
      period: { month, year },
      metrics: this.calculateMetrics(/* ... */),
      topPerformers: [],
      defaulters: [],
      recommendations: []
    };
  }
}
```

### 2. Receipt Generation
```typescript
// lib/receipt-generator.ts
interface ReceiptData {
  receiptNumber: string;
  customerName: string;
  customerId: string;
  amount: number;
  paymentDate: Date;
  collectedBy: string;
  loanId: string;
  allocation: PaymentAllocation;
  remainingBalance: number;
}

export class ReceiptGenerator {
  
  static generateReceipt(data: ReceiptData): string {
    const sinhalaDate = formatSinhalaDate(data.paymentDate);
    
    return `
MICRO LENDING SYSTEM
Payment Receipt / ගෙවීම් රිසිට්පත්

Receipt No: ${data.receiptNumber}
Date / දිනය: ${data.paymentDate.toLocaleDateString()} / ${sinhalaDate}

Customer / ගැනුම්කරු: ${data.customerName}
Customer ID: ${data.customerId}
Loan ID: ${data.loanId}

PAYMENT DETAILS / ගෙවීම් විස්තර:
Amount Paid / ගෙවන ලද මුදල: LKR ${data.amount.toLocaleString()}

ALLOCATION / බෙදාහැරීම:
Principal / මූලධනය: LKR ${data.allocation.principal.toLocaleString()}
Interest / පොලිය: LKR ${data.allocation.interest.toLocaleString()}
Penalty / දඩය: LKR ${data.allocation.penalty.toLocaleString()}

Remaining Balance / ඉතිරි ශේෂය: LKR ${data.remainingBalance.toLocaleString()}

Collected By / එකතු කරන ලද්දේ: ${data.collectedBy}
Time / වේලාව: ${data.paymentDate.toLocaleTimeString()}

Thank you for your payment!
ගෙවීම සඳහා ස්තූතියි!

This is a computer generated receipt.
    `.trim();
  }

  static generatePrintableReceipt(data: ReceiptData): string {
    // Generate HTML for printing
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Payment Receipt - ${data.receiptNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
    .content { margin: 20px 0; }
    .amount { font-size: 18px; font-weight: bold; }
    .footer { margin-top: 30px; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h2>MICRO LENDING SYSTEM</h2>
    <h3>Payment Receipt / ගෙවීම් රිසිට්පත්</h3>
  </div>
  
  <div class="content">
    <p><strong>Receipt No:</strong> ${data.receiptNumber}</p>
    <p><strong>Date:</strong> ${data.paymentDate.toLocaleDateString()}</p>
    <p><strong>Customer:</strong> ${data.customerName}</p>
    <p><strong>Customer ID:</strong> ${data.customerId}</p>
    
    <div class="amount">
      <p><strong>Amount Paid:</strong> LKR ${data.amount.toLocaleString()}</p>
    </div>
    
    <p><strong>Remaining Balance:</strong> LKR ${data.remainingBalance.toLocaleString()}</p>
    <p><strong>Collected By:</strong> ${data.collectedBy}</p>
  </div>
  
  <div class="footer">
    <p>Thank you for your payment! / ගෙවීම සඳහා ස්තූතියි!</p>
    <p>This is a computer generated receipt.</p>
  </div>
</body>
</html>
    `;
  }
}
```

## Implementation Checklist

### Core Payment System
- [ ] Payment collection interface for agents
- [ ] Interest calculation engine
- [ ] Payment validation and processing
- [ ] Receipt generation system
- [ ] Transaction recording

### Advanced Features
- [ ] Mobile payment integration (eZ Cash, mCash)
- [ ] QR code payment system
- [ ] Offline payment capability
- [ ] Bulk payment processing
- [ ] Payment scheduling

### Defaulter Management
- [ ] Automated defaulter identification
- [ ] Collection strategy engine
- [ ] Risk scoring algorithm
- [ ] Follow-up action tracking
- [ ] Legal notice generation

### Reporting & Analytics
- [ ] Payment analytics dashboard
- [ ] Collection efficiency reports
- [ ] Agent performance metrics
- [ ] Defaulter analysis
- [ ] Financial projections

### Mobile Optimization
- [ ] Touch-friendly payment interface
- [ ] Offline data synchronization
- [ ] GPS location tracking
- [ ] Camera integration for documentation
- [ ] Voice notes for payment context

This comprehensive payment system provides a robust foundation for efficient micro-lending operations with proper Sri Lankan market considerations and mobile-first design.