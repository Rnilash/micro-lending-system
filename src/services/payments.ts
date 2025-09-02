import { db } from '@/lib/firebase';
import type { Payment, PaymentMethod, PaymentStatus } from '@/types';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    runTransaction,
    startAfter,
    Timestamp,
    updateDoc,
    where
} from 'firebase/firestore';

const COLLECTION_NAME = 'payments';

export interface CreatePaymentData {
  loanId: string;
  customerId: string;
  agentId: string;
  amount: number;
  method: PaymentMethod;
  notes?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

export interface PaymentFilters {
  loanId?: string;
  customerId?: string;
  agentId?: string;
  status?: PaymentStatus;
  method?: PaymentMethod;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface PaginationOptions {
  limit?: number;
  lastDoc?: any;
}

// Create a new payment
export async function createPayment(data: CreatePaymentData): Promise<string> {
  try {
    return await runTransaction(db, async (transaction) => {
      // Generate receipt number
      const receiptNumber = await generateReceiptNumber();
      
      const paymentData: Omit<Payment, 'id'> = {
        loanId: data.loanId,
        customerId: data.customerId,
        method: data.method,
        agentId: data.agentId,
        amount: data.amount,
        installmentNumber: 1, // Default to 1, should be calculated based on loan schedule
        paymentDate: Timestamp.now().toDate(),
        dueDate: Timestamp.now().toDate(), // Should be the actual due date
        paymentType: 'regular',
        paymentMethod: data.method as 'cash' | 'bank_transfer' | 'cheque' | 'digital',
        receiptNumber,
        collectedBy: data.agentId,
        location: data.location ? {
          lat: data.location.latitude,
          lng: data.location.longitude,
          address: data.location.address,
        } : undefined,
        notes: data.notes,
        status: 'completed',
        isLate: false,
        lateDays: 0,
        penaltyApplied: 0,
        createdAt: Timestamp.now().toDate(),
        updatedAt: Timestamp.now().toDate(),
      };

      // Create payment document
      const paymentRef = doc(collection(db, COLLECTION_NAME));
      transaction.set(paymentRef, paymentData);

      // Update loan payment details
      const loanRef = doc(db, 'loans', data.loanId);
      const loanDoc = await transaction.get(loanRef);
      
      if (!loanDoc.exists()) {
        throw new Error('Loan not found');
      }

      const loan = loanDoc.data();
      const newPaidAmount = loan.paidAmount + data.amount;
      const newOutstandingAmount = loan.totalAmount - newPaidAmount;
      
      const loanUpdates: any = {
        paidAmount: newPaidAmount,
        outstandingAmount: newOutstandingAmount,
        lastPaymentDate: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // Check if loan is fully paid
      if (newOutstandingAmount <= 0) {
        loanUpdates.status = 'completed';
        loanUpdates.completionDate = Timestamp.now();
      } else {
        // Calculate next payment date
        const nextPaymentDate = new Date();
        nextPaymentDate.setDate(nextPaymentDate.getDate() + 7);
        loanUpdates.nextPaymentDate = Timestamp.fromDate(nextPaymentDate);
      }

      transaction.update(loanRef, loanUpdates);

      // Update customer stats
      const customerRef = doc(db, 'customers', data.customerId);
      const customerDoc = await transaction.get(customerRef);
      
      if (customerDoc.exists()) {
        const customerData = customerDoc.data();
        const newCustomerPaid = (customerData.totalPaid || 0) + data.amount;
        const newCustomerOutstanding = Math.max(0, (customerData.outstandingAmount || 0) - data.amount);
        
        const customerUpdates: any = {
          totalPaid: newCustomerPaid,
          outstandingAmount: newCustomerOutstanding,
          lastPaymentDate: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };

        // If loan is completed, decrease active loans count
        if (newOutstandingAmount <= 0) {
          customerUpdates.activeLoans = Math.max(0, (customerData.activeLoans || 0) - 1);
        }

        transaction.update(customerRef, customerUpdates);
      }

      return paymentRef.id;
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
}

// Get payment by ID
export async function getPaymentById(id: string): Promise<Payment | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Payment;
    }
    return null;
  } catch (error) {
    console.error('Error getting payment:', error);
    throw error;
  }
}

// Get payment by receipt number
export async function getPaymentByReceiptNumber(receiptNumber: string): Promise<Payment | null> {
  try {
    const q = query(collection(db, COLLECTION_NAME), where('receiptNumber', '==', receiptNumber));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Payment;
    }
    return null;
  } catch (error) {
    console.error('Error getting payment by receipt number:', error);
    throw error;
  }
}

// Get payments with filters and pagination
export async function getPayments(
  filters: PaymentFilters = {},
  pagination: PaginationOptions = {}
): Promise<{ payments: Payment[]; hasMore: boolean; lastDoc: any }> {
  try {
    let q = query(collection(db, COLLECTION_NAME));

    // Apply filters
    if (filters.loanId) {
      q = query(q, where('loanId', '==', filters.loanId));
    }
    if (filters.customerId) {
      q = query(q, where('customerId', '==', filters.customerId));
    }
    if (filters.agentId) {
      q = query(q, where('agentId', '==', filters.agentId));
    }
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }
    if (filters.method) {
      q = query(q, where('method', '==', filters.method));
    }

    // Date range filter
    if (filters.dateFrom) {
      q = query(q, where('paymentDate', '>=', Timestamp.fromDate(filters.dateFrom)));
    }
    if (filters.dateTo) {
      const endDate = new Date(filters.dateTo);
      endDate.setHours(23, 59, 59, 999); // End of day
      q = query(q, where('paymentDate', '<=', Timestamp.fromDate(endDate)));
    }

    // Order by payment date (most recent first)
    q = query(q, orderBy('paymentDate', 'desc'));

    // Apply pagination
    const pageLimit = pagination.limit || 50;
    q = query(q, limit(pageLimit + 1));

    if (pagination.lastDoc) {
      q = query(q, startAfter(pagination.lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const docs = querySnapshot.docs;
    
    const hasMore = docs.length > pageLimit;
    const payments = docs.slice(0, pageLimit).map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Payment[];

    // Filter by search term
    let filteredPayments = payments;
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredPayments = payments.filter(payment => 
        payment.receiptNumber.toLowerCase().includes(searchTerm) ||
        (payment.notes && payment.notes.toLowerCase().includes(searchTerm))
      );
    }

    return {
      payments: filteredPayments,
      hasMore,
      lastDoc: hasMore ? docs[pageLimit - 1] : null
    };
  } catch (error) {
    console.error('Error getting payments:', error);
    throw error;
  }
}

// Get payments for a specific loan
export async function getPaymentsByLoan(loanId: string): Promise<Payment[]> {
  try {
    const { payments } = await getPayments({ loanId });
    return payments;
  } catch (error) {
    console.error('Error getting payments by loan:', error);
    throw error;
  }
}

// Get payments by agent for a specific date range
export async function getPaymentsByAgent(
  agentId: string,
  dateFrom?: Date,
  dateTo?: Date
): Promise<Payment[]> {
  try {
    const { payments } = await getPayments({ 
      agentId, 
      dateFrom, 
      dateTo 
    });
    return payments;
  } catch (error) {
    console.error('Error getting payments by agent:', error);
    throw error;
  }
}

// Get daily collection summary for an agent
export async function getDailyCollectionSummary(
  agentId: string,
  date: Date = new Date()
): Promise<{
  totalAmount: number;
  totalPayments: number;
  paymentMethods: Record<PaymentMethod, { count: number; amount: number }>;
}> {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { payments } = await getPayments({
      agentId,
      dateFrom: startOfDay,
      dateTo: endOfDay,
      status: 'completed'
    });

    const summary = {
      totalAmount: 0,
      totalPayments: payments.length,
      paymentMethods: {
        cash: { count: 0, amount: 0 },
        bank_transfer: { count: 0, amount: 0 },
        cheque: { count: 0, amount: 0 },
        digital: { count: 0, amount: 0 },
        mobile_money: { count: 0, amount: 0 },
      } as Record<PaymentMethod, { count: number; amount: number }>
    };

    payments.forEach(payment => {
      summary.totalAmount += payment.amount;
      summary.paymentMethods[payment.method].count += 1;
      summary.paymentMethods[payment.method].amount += payment.amount;
    });

    return summary;
  } catch (error) {
    console.error('Error getting daily collection summary:', error);
    throw error;
  }
}

// Update payment status (for reversals or corrections)
export async function updatePaymentStatus(
  id: string,
  status: PaymentStatus,
  notes?: string
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      status,
      notes,
      updatedAt: Timestamp.now(),
    });

    // If payment is being cancelled, need to reverse the loan and customer updates
    if (status === 'cancelled') {
      const payment = await getPaymentById(id);
      if (payment) {
        await reverseLoanPayment(payment.loanId, payment.amount);
      }
    }
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
}

// Reverse a loan payment (for cancelled payments)
async function reverseLoanPayment(loanId: string, amount: number): Promise<void> {
  try {
    await runTransaction(db, async (transaction) => {
      const loanRef = doc(db, 'loans', loanId);
      const loanDoc = await transaction.get(loanRef);
      
      if (!loanDoc.exists()) {
        throw new Error('Loan not found');
      }

      const loan = loanDoc.data();
      const newPaidAmount = Math.max(0, loan.paidAmount - amount);
      const newOutstandingAmount = loan.totalAmount - newPaidAmount;
      
      const loanUpdates: any = {
        paidAmount: newPaidAmount,
        outstandingAmount: newOutstandingAmount,
        updatedAt: Timestamp.now(),
      };

      // If loan was completed but now has outstanding amount, reactivate it
      if (loan.status === 'completed' && newOutstandingAmount > 0) {
        loanUpdates.status = 'active';
        // Calculate next payment date
        const nextPaymentDate = new Date();
        nextPaymentDate.setDate(nextPaymentDate.getDate() + 7);
        loanUpdates.nextPaymentDate = Timestamp.fromDate(nextPaymentDate);
      }

      transaction.update(loanRef, loanUpdates);

      // Update customer stats
      const customerRef = doc(db, 'customers', loan.customerId);
      const customerDoc = await transaction.get(customerRef);
      
      if (customerDoc.exists()) {
        const customerData = customerDoc.data();
        const newCustomerPaid = Math.max(0, (customerData.totalPaid || 0) - amount);
        const newCustomerOutstanding = (customerData.outstandingAmount || 0) + amount;
        
        const customerUpdates: any = {
          totalPaid: newCustomerPaid,
          outstandingAmount: newCustomerOutstanding,
          updatedAt: Timestamp.now(),
        };

        // If loan was completed but is now active again, increase active loans count
        if (loan.status === 'completed' && newOutstandingAmount > 0) {
          customerUpdates.activeLoans = (customerData.activeLoans || 0) + 1;
        }

        transaction.update(customerRef, customerUpdates);
      }
    });
  } catch (error) {
    console.error('Error reversing loan payment:', error);
    throw error;
  }
}

// Generate receipt number
async function generateReceiptNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const day = String(new Date().getDate()).padStart(2, '0');
  
  // Get count of payments today
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  
  const q = query(
    collection(db, COLLECTION_NAME),
    where('paymentDate', '>=', Timestamp.fromDate(startOfDay)),
    where('paymentDate', '<=', Timestamp.fromDate(endOfDay))
  );
  
  const snapshot = await getDocs(q);
  const count = snapshot.size + 1;
  
  return `RC${year}${month}${day}${String(count).padStart(4, '0')}`;
}

// Missing service methods for compatibility
export async function getAllPayments(): Promise<Payment[]> {
  const result = await getPayments();
  return result.payments;
}

export async function updatePayment(id: string, updates: Partial<Payment>): Promise<void> {
  const paymentRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(paymentRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

export async function deletePayment(id: string): Promise<void> {
  const paymentRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(paymentRef, {
    status: 'cancelled',
    updatedAt: Timestamp.now(),
  });
}

export async function searchPayments(query: string): Promise<Payment[]> {
  const result = await getPayments();
  const searchLower = query.toLowerCase();
  
  return result.payments.filter((payment: Payment) => 
    payment.customerName?.toLowerCase().includes(searchLower) ||
    payment.loanNumber?.toLowerCase().includes(searchLower) ||
    payment.receiptNumber?.toLowerCase().includes(searchLower)
  );
}
