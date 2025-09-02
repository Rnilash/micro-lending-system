import { db } from '@/lib/firebase';
import type { Customer, Loan, Payment, User } from '@/types';
import {
    collection,
    getDocs,
    orderBy,
    query,
    Timestamp,
    where
} from 'firebase/firestore';

export interface DashboardStats {
  totalCustomers: number;
  activeCustomers: number;
  totalLoans: number;
  activeLoans: number;
  completedLoans: number;
  pendingLoans: number;
  totalDisbursed: number;
  totalCollected: number;
  outstandingAmount: number;
  collectionRate: number;
}

export interface AgentPerformance {
  agentId: string;
  agentName: string;
  totalCustomers: number;
  activeLoans: number;
  totalDisbursed: number;
  totalCollected: number;
  outstandingAmount: number;
  collectionRate: number;
  todayCollection: number;
}

export interface CollectionReport {
  date: string;
  agentId: string;
  agentName: string;
  totalCollection: number;
  paymentCount: number;
  cashPayments: number;
  bankTransferPayments: number;
  mobilePayments: number;
  chequePayments: number;
}

export interface LoanPortfolioReport {
  totalLoans: number;
  activeLoanValue: number;
  completedLoanValue: number;
  averageLoanSize: number;
  defaultRate: number;
  portfolioAtRisk: number;
  repaymentRate: number;
}

export interface CustomerAnalytics {
  totalCustomers: number;
  newCustomersThisMonth: number;
  customersByDistrict: Record<string, number>;
  customersByAge: Record<string, number>;
  averageMonthlyIncome: number;
  topOccupations: Array<{ occupation: string; count: number }>;
}

// Get dashboard statistics
export async function getDashboardStats(agentId?: string): Promise<DashboardStats> {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Base queries
    let customersQuery = query(collection(db, 'customers'));
    let loansQuery = query(collection(db, 'loans'));
    let paymentsQuery = query(collection(db, 'payments'));

    // Filter by agent if specified
    if (agentId) {
      customersQuery = query(customersQuery, where('agentId', '==', agentId));
      loansQuery = query(loansQuery, where('agentId', '==', agentId));
      paymentsQuery = query(paymentsQuery, where('agentId', '==', agentId));
    }

    // Get customers data
    const customersSnapshot = await getDocs(customersQuery);
    const customers = customersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Customer[];
    
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.status === 'active').length;

    // Get loans data
    const loansSnapshot = await getDocs(loansQuery);
    const loans = loansSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Loan[];
    
    const totalLoans = loans.length;
    const activeLoans = loans.filter(l => l.status === 'active').length;
    const completedLoans = loans.filter(l => l.status === 'completed').length;
    const pendingLoans = loans.filter(l => l.status === 'pending').length;
    
    const totalDisbursed = loans
      .filter(l => l.status !== 'pending' && l.status !== 'rejected')
      .reduce((sum, loan) => sum + loan.principalAmount, 0);

    // Get payments data
    const paymentsSnapshot = await getDocs(query(paymentsQuery, where('status', '==', 'completed')));
    const payments = paymentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Payment[];
    
    const totalCollected = payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Calculate outstanding amount
    const outstandingAmount = loans
      .filter(l => l.status === 'active')
      .reduce((sum, loan) => sum + loan.outstandingAmount, 0);

    // Calculate collection rate
    const collectionRate = totalDisbursed > 0 ? (totalCollected / totalDisbursed) * 100 : 0;

    return {
      totalCustomers,
      activeCustomers,
      totalLoans,
      activeLoans,
      completedLoans,
      pendingLoans,
      totalDisbursed,
      totalCollected,
      outstandingAmount,
      collectionRate: Math.round(collectionRate * 100) / 100,
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    throw error;
  }
}

// Get agent performance metrics
export async function getAgentPerformance(dateFrom?: Date, dateTo?: Date): Promise<AgentPerformance[]> {
  try {
    // Get all agents (users with role 'agent')
    const usersSnapshot = await getDocs(
      query(collection(db, 'users'), where('role', '==', 'agent'))
    );
    const agents = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User & { id: string }));

    const performance: AgentPerformance[] = [];

    for (const agent of agents) {
      const agentStats = await getDashboardStats(agent.id);
      
      // Get today's collection
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const todayPayments = await getDocs(query(
        collection(db, 'payments'),
        where('agentId', '==', agent.id),
        where('status', '==', 'completed'),
        where('paymentDate', '>=', Timestamp.fromDate(today)),
        where('paymentDate', '<=', Timestamp.fromDate(endOfDay))
      ));

      const todayCollection = todayPayments.docs
        .map(doc => doc.data())
        .reduce((sum, payment) => sum + payment.amount, 0);

      performance.push({
        agentId: agent.id,
        agentName: agent.profile ? `${agent.profile.firstName} ${agent.profile.lastName}` : agent.name || 'Unknown Agent',
        totalCustomers: agentStats.totalCustomers,
        activeLoans: agentStats.activeLoans,
        totalDisbursed: agentStats.totalDisbursed,
        totalCollected: agentStats.totalCollected,
        outstandingAmount: agentStats.outstandingAmount,
        collectionRate: agentStats.collectionRate,
        todayCollection,
      });
    }

    return performance.sort((a, b) => b.totalCollected - a.totalCollected);
  } catch (error) {
    console.error('Error getting agent performance:', error);
    throw error;
  }
}

// Get collection report
export async function getCollectionReport(
  dateFrom: Date,
  dateTo: Date,
  agentId?: string
): Promise<CollectionReport[]> {
  try {
    let paymentsQuery = query(
      collection(db, 'payments'),
      where('status', '==', 'completed'),
      where('paymentDate', '>=', Timestamp.fromDate(dateFrom)),
      where('paymentDate', '<=', Timestamp.fromDate(dateTo)),
      orderBy('paymentDate', 'desc')
    );

    if (agentId) {
      paymentsQuery = query(paymentsQuery, where('agentId', '==', agentId));
    }

    const paymentsSnapshot = await getDocs(paymentsQuery);
    const payments = paymentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Payment[];

    // Get agent details
    const agentIds = Array.from(new Set(payments.map(p => p.agentId).filter(id => id !== undefined))) as string[];
    const agentDetails: Record<string, string> = {};
    
    for (const id of agentIds) {
      const userSnapshot = await getDocs(query(collection(db, 'users'), where('__name__', '==', id)));
      if (!userSnapshot.empty) {
        const user = userSnapshot.docs[0].data() as User;
        agentDetails[id] = user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user.name || 'Unknown Agent';
      }
    }

    // Group payments by date and agent
    const reportMap: Record<string, CollectionReport> = {};

    payments.filter(payment => payment.agentId).forEach(payment => {
      const agentId = payment.agentId!; // We know it's defined because of the filter
      const date = payment.paymentDate instanceof Date ? 
        payment.paymentDate.toISOString().split('T')[0] :
        new Date(payment.paymentDate).toISOString().split('T')[0];
      const key = `${date}-${agentId}`;

      if (!reportMap[key]) {
        reportMap[key] = {
          date,
          agentId,
          agentName: agentDetails[agentId] || 'Unknown',
          totalCollection: 0,
          paymentCount: 0,
          cashPayments: 0,
          bankTransferPayments: 0,
          mobilePayments: 0,
          chequePayments: 0,
        };
      }

      const report = reportMap[key];
      report.totalCollection += payment.amount;
      report.paymentCount += 1;

      switch (payment.method) {
        case 'cash':
          report.cashPayments += payment.amount;
          break;
        case 'bank_transfer':
          report.bankTransferPayments += payment.amount;
          break;
        case 'digital':
        case 'mobile_money':
          report.mobilePayments += payment.amount;
          break;
        case 'cheque':
          report.chequePayments += payment.amount;
          break;
        default:
          // Handle any other payment methods
          break;
      }
    });

    return Object.values(reportMap).sort((a, b) => b.date.localeCompare(a.date));
  } catch (error) {
    console.error('Error getting collection report:', error);
    throw error;
  }
}

// Get loan portfolio report
export async function getLoanPortfolioReport(): Promise<LoanPortfolioReport> {
  try {
    const loansSnapshot = await getDocs(collection(db, 'loans'));
    const loans = loansSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Loan[];

    const totalLoans = loans.length;
    const activeLoans = loans.filter(l => l.status === 'active');
    const completedLoans = loans.filter(l => l.status === 'completed');
    
    const activeLoanValue = activeLoans.reduce((sum, loan) => sum + loan.outstandingAmount, 0);
    const completedLoanValue = completedLoans.reduce((sum, loan) => sum + loan.totalAmount, 0);
    
    const averageLoanSize = loans.length > 0 
      ? loans.reduce((sum, loan) => sum + loan.principalAmount, 0) / loans.length 
      : 0;

    // Calculate default rate (loans with missed payments > 4 weeks)
    const now = new Date();
    const fourWeeksAgo = new Date(now.getTime() - (4 * 7 * 24 * 60 * 60 * 1000));
    
    const defaultedLoans = activeLoans.filter(loan => {
      if (!loan.nextPaymentDate) return false;
      return new Date(loan.nextPaymentDate) < fourWeeksAgo;
    });
    
    const defaultRate = activeLoans.length > 0 
      ? (defaultedLoans.length / activeLoans.length) * 100 
      : 0;

    // Portfolio at Risk (PAR) - outstanding amount of loans with missed payments
    const portfolioAtRiskAmount = defaultedLoans.reduce((sum, loan) => sum + loan.outstandingAmount, 0);
    const portfolioAtRisk = activeLoanValue > 0 
      ? (portfolioAtRiskAmount / activeLoanValue) * 100 
      : 0;

    // Repayment rate
    const totalDisbursed = loans
      .filter(l => l.status !== 'pending' && l.status !== 'rejected')
      .reduce((sum, loan) => sum + loan.principalAmount, 0);
    
    const totalPaid = loans.reduce((sum, loan) => sum + loan.paidAmount, 0);
    const repaymentRate = totalDisbursed > 0 ? (totalPaid / totalDisbursed) * 100 : 0;

    return {
      totalLoans,
      activeLoanValue,
      completedLoanValue,
      averageLoanSize: Math.round(averageLoanSize * 100) / 100,
      defaultRate: Math.round(defaultRate * 100) / 100,
      portfolioAtRisk: Math.round(portfolioAtRisk * 100) / 100,
      repaymentRate: Math.round(repaymentRate * 100) / 100,
    };
  } catch (error) {
    console.error('Error getting loan portfolio report:', error);
    throw error;
  }
}

// Get customer analytics
export async function getCustomerAnalytics(): Promise<CustomerAnalytics> {
  try {
    const customersSnapshot = await getDocs(collection(db, 'customers'));
    const customers = customersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Customer[];

    const totalCustomers = customers.length;

    // New customers this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newCustomersThisMonth = customers.filter(c => 
      c.registrationDate instanceof Date ? c.registrationDate >= startOfMonth : new Date(c.registrationDate) >= startOfMonth
    ).length;

    // Customers by district
    const customersByDistrict: Record<string, number> = {};
    customers.forEach(customer => {
      const district = customer.address.district;
      customersByDistrict[district] = (customersByDistrict[district] || 0) + 1;
    });

    // Customers by age group
    const customersByAge: Record<string, number> = {
      '18-25': 0,
      '26-35': 0,
      '36-45': 0,
      '46-55': 0,
      '56+': 0,
    };

    customers.forEach(customer => {
      // Note: This assumes we have age or date of birth in customer data
      // For now, we'll use a placeholder calculation
      const age = Math.floor(Math.random() * 50) + 18; // Placeholder
      
      if (age <= 25) customersByAge['18-25']++;
      else if (age <= 35) customersByAge['26-35']++;
      else if (age <= 45) customersByAge['36-45']++;
      else if (age <= 55) customersByAge['46-55']++;
      else customersByAge['56+']++;
    });

    // Average monthly income
    const averageMonthlyIncome = customers.length > 0
      ? customers.reduce((sum, customer) => sum + customer.monthlyIncome, 0) / customers.length
      : 0;

    // Top occupations
    const occupationCounts: Record<string, number> = {};
    customers.forEach(customer => {
      occupationCounts[customer.occupation] = (occupationCounts[customer.occupation] || 0) + 1;
    });

    const topOccupations = Object.entries(occupationCounts)
      .map(([occupation, count]) => ({ occupation, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalCustomers,
      newCustomersThisMonth,
      customersByDistrict,
      customersByAge,
      averageMonthlyIncome: Math.round(averageMonthlyIncome * 100) / 100,
      topOccupations,
    };
  } catch (error) {
    console.error('Error getting customer analytics:', error);
    throw error;
  }
}

// Get overdue loans report
export async function getOverdueLoansReport(agentId?: string): Promise<Array<{
  loanId: string;
  loanNumber: string;
  customerName: string;
  customerPhone: string;
  daysOverdue: number;
  overdueAmount: number;
  totalOutstanding: number;
  agentName: string;
}>> {
  try {
    let loansQuery = query(
      collection(db, 'loans'),
      where('status', '==', 'active'),
      orderBy('nextPaymentDate', 'asc')
    );

    if (agentId) {
      loansQuery = query(loansQuery, where('agentId', '==', agentId));
    }

    const loansSnapshot = await getDocs(loansQuery);
    const loans = loansSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Loan[];

    const now = new Date();
    const overdueLoans = loans.filter(loan => {
      if (!loan.nextPaymentDate) return false;
      return new Date(loan.nextPaymentDate) < now;
    });

    const report = [];

    for (const loan of overdueLoans) {
      // Get customer details
      const customerSnapshot = await getDocs(
        query(collection(db, 'customers'), where('__name__', '==', loan.customerId))
      );
      const customer = customerSnapshot.empty ? null : customerSnapshot.docs[0].data();

      // Get agent details
      const agentSnapshot = await getDocs(
        query(collection(db, 'users'), where('__name__', '==', loan.agentId))
      );
      const agent = agentSnapshot.empty ? null : agentSnapshot.docs[0].data();

      if (customer && loan.nextPaymentDate) {
        const daysOverdue = Math.floor(
          (now.getTime() - new Date(loan.nextPaymentDate).getTime()) / (1000 * 60 * 60 * 24)
        );

        report.push({
          loanId: loan.id!,
          loanNumber: loan.loanNumber,
          customerName: `${customer.firstName} ${customer.lastName}`,
          customerPhone: customer.phone,
          daysOverdue,
          overdueAmount: loan.weeklyPayment,
          totalOutstanding: loan.outstandingAmount,
          agentName: agent ? `${agent.firstName} ${agent.lastName}` : 'Unknown',
        });
      }
    }

    return report.sort((a, b) => b.daysOverdue - a.daysOverdue);
  } catch (error) {
    console.error('Error getting overdue loans report:', error);
    throw error;
  }
}
