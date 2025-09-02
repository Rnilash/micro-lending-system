import { db } from '@/lib/firebase';
import type { Loan, LoanStatus } from '@/types';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  setDoc,
  startAfter,
  Timestamp,
  updateDoc,
  where
} from 'firebase/firestore';

const COLLECTION_NAME = 'loans';

export interface CreateLoanData {
  customerId: string;
  agentId: string;
  principalAmount: number;
  interestRate: number;
  duration: number; // in weeks
  purpose: string;
  collateral?: string;
  guarantorInfo?: {
    name: string;
    nic: string;
    phone: string;
    address: string;
  };
}

export interface LoanFilters {
  customerId?: string;
  agentId?: string;
  status?: LoanStatus;
  search?: string;
}

export interface PaginationOptions {
  limit?: number;
  lastDoc?: any;
}

// Create a new loan
export async function createLoan(data: CreateLoanData): Promise<string> {
  try {
    // Calculate loan details using simple flat interest method
    const weeklyInterest = data.interestRate / 100;
    const totalWithInterest = data.principalAmount * (1 + (weeklyInterest * data.duration));
    const weeklyPayment = totalWithInterest / data.duration;

    // Generate simple loan number (avoid complex queries for now)
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 9999) + 1;
    const loanNumber = `LN${year}${month}${String(random).padStart(4, '0')}`;

    const loanData: Omit<Loan, 'id'> = {
      customerId: data.customerId,
      loanNumber: loanNumber,
      customerName: '', // Will be populated later
      principalAmount: data.principalAmount,
      weeklyPayment,
      termWeeks: data.duration,
      totalRepayment: totalWithInterest,
      outstandingAmount: totalWithInterest,
      remainingBalance: totalWithInterest,
      paidAmount: 0,
      agentId: data.agentId,
      applicationDate: Timestamp.now().toDate(),
      amount: data.principalAmount,
      interestRate: data.interestRate,
      calculationMethod: 'flat',
      term: data.duration,
      installmentAmount: weeklyPayment,
      totalAmount: totalWithInterest,
      purpose: data.purpose,
      status: 'pending',
      approvalWorkflow: [],
      expectedEndDate: new Date(Date.now() + data.duration * 7 * 24 * 60 * 60 * 1000),
      // Note: disbursementDate, startDate, endDate, nextPaymentDate will be set when loan is approved/disbursed
      paidInstallments: 0,
      totalInstallments: data.duration,
      outstandingBalance: totalWithInterest,
      penaltyAmount: 0,
      collateral: data.collateral ? [{ 
        type: 'Other', 
        description: data.collateral, 
        estimatedValue: 0, 
        documents: [] 
      }] : [],
      guarantors: data.guarantorInfo ? [{ 
        name: data.guarantorInfo.name, 
        nic: data.guarantorInfo.nic,
        phone: data.guarantorInfo.phone, 
        address: data.guarantorInfo.address, 
        relationship: 'Guarantor',
        occupation: '',
        monthlyIncome: 0,
        documents: []
      }] : [],
      documents: [],
      notes: [],
      createdAt: Timestamp.now().toDate(),
      updatedAt: Timestamp.now().toDate(),
      createdBy: data.agentId,
      managedBy: data.agentId,
    };

    // Create loan document
    const loanRef = doc(collection(db, COLLECTION_NAME));
    await setDoc(loanRef, loanData);
    return loanRef.id;
  } catch (error) {
    throw error;
  }
}

// Get loan by ID
export async function getLoanById(id: string): Promise<Loan | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Loan;
    }
    return null;
  } catch (error) {
    console.error('Error getting loan:', error);
    throw error;
  }
}

// Get loans with filters and pagination
export async function getLoans(
  filters: LoanFilters = {},
  pagination: PaginationOptions = {}
): Promise<{ loans: Loan[]; hasMore: boolean; lastDoc: any }> {
  try {
    let q = query(collection(db, COLLECTION_NAME));

    // Apply filters
    if (filters.customerId) {
      q = query(q, where('customerId', '==', filters.customerId));
    }
    if (filters.agentId) {
      q = query(q, where('agentId', '==', filters.agentId));
    }
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }

    // Order by creation date
    q = query(q, orderBy('createdAt', 'desc'));

    // Apply pagination
    const pageLimit = pagination.limit || 20;
    q = query(q, limit(pageLimit + 1));

    if (pagination.lastDoc) {
      q = query(q, startAfter(pagination.lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const docs = querySnapshot.docs;
    
    const hasMore = docs.length > pageLimit;
    const loans = docs.slice(0, pageLimit).map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Loan[];

    // Filter by search term
    let filteredLoans = loans;
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredLoans = loans.filter(loan => 
        loan.loanNumber.toLowerCase().includes(searchTerm) ||
        loan.purpose.toLowerCase().includes(searchTerm)
      );
    }

    return {
      loans: filteredLoans,
      hasMore,
      lastDoc: hasMore ? docs[pageLimit - 1] : null
    };
  } catch (error) {
    console.error('Error getting loans:', error);
    throw error;
  }
}

// Approve loan
export async function approveLoan(loanId: string, approvedBy: string): Promise<void> {
  try {
    await runTransaction(db, async (transaction) => {
      const loanRef = doc(db, COLLECTION_NAME, loanId);
      const loanDoc = await transaction.get(loanRef);
      
      if (!loanDoc.exists()) {
        throw new Error('Loan not found');
      }

      const loan = loanDoc.data() as Loan;
      if (loan.status !== 'pending') {
        throw new Error('Loan is not in pending status');
      }

      // Update loan status
      transaction.update(loanRef, {
        status: 'approved',
        approvalDate: Timestamp.now(),
        approvedBy,
        updatedAt: Timestamp.now(),
      });

      // Update customer stats
      const customerRef = doc(db, 'customers', loan.customerId);
      const customerDoc = await transaction.get(customerRef);
      
      if (customerDoc.exists()) {
        const customerData = customerDoc.data();
        transaction.update(customerRef, {
          activeLoans: (customerData.activeLoans || 0) + 1,
          updatedAt: Timestamp.now(),
        });
      }
    });
  } catch (error) {
    console.error('Error approving loan:', error);
    throw error;
  }
}

// Disburse loan
export async function disburseLoan(loanId: string, disbursedBy: string): Promise<void> {
  try {
    await runTransaction(db, async (transaction) => {
      const loanRef = doc(db, COLLECTION_NAME, loanId);
      const loanDoc = await transaction.get(loanRef);
      
      if (!loanDoc.exists()) {
        throw new Error('Loan not found');
      }

      const loan = loanDoc.data() as Loan;
      if (loan.status !== 'approved') {
        throw new Error('Loan is not approved');
      }

      const disbursementDate = new Date();
      const nextPaymentDate = new Date(disbursementDate);
      nextPaymentDate.setDate(nextPaymentDate.getDate() + 7); // First payment in 1 week

      // Update loan status
      transaction.update(loanRef, {
        status: 'active',
        disbursementDate: Timestamp.fromDate(disbursementDate),
        nextPaymentDate: Timestamp.fromDate(nextPaymentDate),
        disbursedBy,
        updatedAt: Timestamp.now(),
      });

      // Update customer outstanding amount
      const customerRef = doc(db, 'customers', loan.customerId);
      const customerDoc = await transaction.get(customerRef);
      
      if (customerDoc.exists()) {
        const customerData = customerDoc.data();
        transaction.update(customerRef, {
          outstandingAmount: (customerData.outstandingAmount || 0) + loan.totalAmount,
          updatedAt: Timestamp.now(),
        });
      }
    });
  } catch (error) {
    console.error('Error disbursing loan:', error);
    throw error;
  }
}

// Reject loan
export async function rejectLoan(loanId: string, rejectedBy: string, reason: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, loanId);
    await updateDoc(docRef, {
      status: 'rejected',
      rejectedBy,
      rejectionReason: reason,
      rejectionDate: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error rejecting loan:', error);
    throw error;
  }
}

// Update loan payment details (called when payment is made)
export async function updateLoanPayment(
  loanId: string,
  paymentAmount: number
): Promise<void> {
  try {
    await runTransaction(db, async (transaction) => {
      const loanRef = doc(db, COLLECTION_NAME, loanId);
      const loanDoc = await transaction.get(loanRef);
      
      if (!loanDoc.exists()) {
        throw new Error('Loan not found');
      }

      const loan = loanDoc.data() as Loan;
      const newPaidAmount = loan.paidAmount + paymentAmount;
      const newOutstandingAmount = loan.totalAmount - newPaidAmount;
      
      const updates: any = {
        paidAmount: newPaidAmount,
        outstandingAmount: newOutstandingAmount,
        lastPaymentDate: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // Check if loan is fully paid
      if (newOutstandingAmount <= 0) {
        updates.status = 'completed';
        updates.completionDate = Timestamp.now();
      } else {
        // Calculate next payment date
        const nextPaymentDate = new Date();
        nextPaymentDate.setDate(nextPaymentDate.getDate() + 7);
        updates.nextPaymentDate = Timestamp.fromDate(nextPaymentDate);
      }

      transaction.update(loanRef, updates);

      // Update customer stats
      const customerRef = doc(db, 'customers', loan.customerId);
      const customerDoc = await transaction.get(customerRef);
      
      if (customerDoc.exists()) {
        const customerData = customerDoc.data();
        const newCustomerPaid = (customerData.totalPaid || 0) + paymentAmount;
        const newCustomerOutstanding = (customerData.outstandingAmount || 0) - paymentAmount;
        
        const customerUpdates: any = {
          totalPaid: newCustomerPaid,
          outstandingAmount: Math.max(0, newCustomerOutstanding),
          lastPaymentDate: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };

        // If loan is completed, decrease active loans count
        if (newOutstandingAmount <= 0) {
          customerUpdates.activeLoans = Math.max(0, (customerData.activeLoans || 0) - 1);
        }

        transaction.update(customerRef, customerUpdates);
      }
    });
  } catch (error) {
    console.error('Error updating loan payment:', error);
    throw error;
  }
}

// Helper functions
function calculateWeeklyPayment(principal: number, weeklyRate: number, weeks: number): number {
  const rate = weeklyRate / 100; // Convert percentage to decimal
  if (rate === 0) {
    return principal / weeks;
  }
  
  const payment = (principal * rate * Math.pow(1 + rate, weeks)) / 
                  (Math.pow(1 + rate, weeks) - 1);
  
  return Math.round(payment * 100) / 100; // Round to 2 decimal places
}

async function generateLoanNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  
  // Get count of loans this month
  const startOfMonth = new Date(year, new Date().getMonth(), 1);
  const endOfMonth = new Date(year, new Date().getMonth() + 1, 0);
  
  const q = query(
    collection(db, COLLECTION_NAME),
    where('applicationDate', '>=', Timestamp.fromDate(startOfMonth)),
    where('applicationDate', '<=', Timestamp.fromDate(endOfMonth))
  );
  
  const snapshot = await getDocs(q);
  const count = snapshot.size + 1;
  
  return `LN${year}${month}${String(count).padStart(4, '0')}`;
}

// Missing service methods for compatibility
export async function updateLoanStatus(loanId: string, status: LoanStatus): Promise<void> {
  const loanRef = doc(db, COLLECTION_NAME, loanId);
  await updateDoc(loanRef, {
    status,
    updatedAt: Timestamp.now(),
  });
}

export async function getLoan(id: string): Promise<Loan | null> {
  return getLoanById(id);
}

export async function getAllLoans(): Promise<Loan[]> {
  const result = await getLoans();
  return result.loans;
}

export async function searchLoans(searchTerm: string): Promise<Loan[]> {
  // Simple search implementation - in production you'd want full-text search
  const result = await getLoans();
  const searchLower = searchTerm.toLowerCase();
  
  return result.loans.filter((loan: Loan) => 
    loan.loanNumber?.toLowerCase().includes(searchLower) ||
    loan.customerName?.toLowerCase().includes(searchLower) ||
    loan.purpose?.toLowerCase().includes(searchLower)
  );
}
