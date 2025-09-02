/**
 * TypeScript Interfaces for Micro-Lending System
 * 
 * Complete type definitions for all entities in the system with
 * proper typing for Firestore documents and API responses.
 */

import { Timestamp } from 'firebase/firestore';

// ================================
// Base Types
// ================================

export interface BilingualText {
  sinhala: string;
  english: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface AuditFields {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  updatedBy?: string;
}

// ================================
// User Management
// ================================

export type UserRole = 'admin' | 'agent' | 'customer';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User extends AuditFields {
  uid: string;
  email: string;
  phone?: string;
  name: BilingualText;
  role: UserRole;
  status: UserStatus;
  permissions: string[];
  lastLoginAt?: Timestamp;
  profileImageUrl?: string;
}

export interface AdminUser extends User {
  role: 'admin';
  permissions: [
    'user_management',
    'system_config',
    'financial_reports',
    'audit_logs',
    'backup_restore',
    'customer_read',
    'customer_create',
    'customer_update',
    'customer_delete',
    'loan_read',
    'loan_create',
    'loan_update',
    'loan_delete',
    'payment_read',
    'payment_create',
    'payment_update',
    'payment_delete'
  ][number][];
}

export interface AgentUser extends User {
  role: 'agent';
  agentCode: string;
  assignedArea: string;
  assignedRoute?: string;
  permissions: [
    'customer_read',
    'customer_create',
    'customer_update',
    'loan_read',
    'loan_create',
    'payment_read',
    'payment_create',
    'route_read'
  ][number][];
  supervisor?: string;
  targetAmount?: number;
  commissionRate?: number;
}

export interface CustomerUser extends User {
  role: 'customer';
  customerId: string;
  permissions: [
    'loan_read_own',
    'payment_read_own',
    'contact_agent'
  ][number][];
}

// ================================
// Customer Management
// ================================

export type CustomerStatus = 'active' | 'inactive' | 'defaulted' | 'closed';
export type CustomerRiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Customer extends AuditFields {
  id: string;
  name: BilingualText;
  phone: string;
  alternatePhone?: string;
  address: BilingualText;
  nic: string;
  dateOfBirth?: Timestamp;
  occupation?: string;
  monthlyIncome?: number;
  status: CustomerStatus;
  riskLevel: CustomerRiskLevel;
  assignedAgent: string;
  
  // Contact Information
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  
  // Guarantor Information
  guarantor?: {
    name: string;
    phone: string;
    address: string;
    nic: string;
    relationship: string;
  };
  
  // Location Data
  homeLocation?: Location;
  workLocation?: Location;
  
  // Credit Information
  creditScore?: number;
  totalLoans: number;
  activeLoans: number;
  completedLoans: number;
  defaultedLoans: number;
  totalBorrowed: number;
  totalPaid: number;
  outstandingAmount: number;
  
  // Payment History Metrics
  onTimePayments: number;
  latePayments: number;
  missedPayments: number;
  consecutiveMissedPayments: number;
  lastPaymentDate?: Timestamp;
  averagePaymentAmount?: number;
  
  // Collection Metrics
  daysOverdue: number;
  contactAttempts: number;
  lastContactDate?: Timestamp;
  collectionNotes?: string;
  
  // Additional Fields
  profileImageUrl?: string;
  documentsUploaded?: string[];
  notes?: BilingualText;
  tags?: string[];
}

// ================================
// Loan Management
// ================================

export type LoanStatus = 'pending' | 'active' | 'completed' | 'defaulted' | 'closed';
export type LoanType = 'personal' | 'business' | 'emergency' | 'education';
export type InterestType = 'simple' | 'compound';

export interface Loan extends AuditFields {
  id: string;
  customerId: string;
  loanNumber: string;
  
  // Loan Terms
  principal: number;
  interestRate: number; // Weekly percentage rate
  duration: number; // Number of weeks
  interestType: InterestType;
  loanType: LoanType;
  
  // Calculated Amounts
  totalInterest: number;
  totalAmount: number;
  weeklyInstallment: number;
  remainingBalance: number;
  remainingInstallments: number;
  
  // Dates
  startDate: Timestamp;
  endDate: Timestamp;
  nextDueDate: Timestamp;
  lastPaymentDate?: Timestamp;
  
  // Status
  status: LoanStatus;
  approvedBy: string;
  approvedAt: Timestamp;
  
  // Payment Tracking
  totalPaid: number;
  principalPaid: number;
  interestPaid: number;
  penaltyPaid: number;
  
  // Collection Information
  assignedAgent: string;
  collectionDay: number; // Day of week (0-6)
  preferredCollectionTime?: string;
  
  // Risk Assessment
  riskScore?: number;
  collateralValue?: number;
  collateralDescription?: string;
  
  // Additional Information
  purpose?: BilingualText;
  terms?: BilingualText;
  notes?: string;
  attachments?: string[];
}

// ================================
// Payment Management
// ================================

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'mobile_money' | 'cheque';
export type PaymentType = 'regular' | 'partial' | 'advance' | 'penalty' | 'settlement';

export interface Payment extends AuditFields {
  id: string;
  paymentNumber: string;
  customerId: string;
  loanId: string;
  
  // Payment Details
  amount: number;
  paymentMethod: PaymentMethod;
  paymentType: PaymentType;
  status: PaymentStatus;
  
  // Collection Information
  collectedBy: string;
  collectedAt: Timestamp;
  location?: Location;
  
  // Payment Allocation
  allocation: {
    principal: number;
    interest: number;
    penalty: number;
    advance: number;
  };
  
  // Due Date Information
  dueDate: Timestamp;
  daysOverdue?: number;
  isOnTime: boolean;
  isPartial: boolean;
  
  // Receipt Information
  receiptNumber: string;
  receiptGenerated: boolean;
  receiptUrl?: string;
  
  // Processing Information
  processedAt?: Timestamp;
  processedBy?: string;
  transactionId?: string;
  
  // Additional Information
  notes?: string;
  attachments?: string[];
  verificationStatus?: 'pending' | 'verified' | 'disputed';
}

// ================================
// Payment Schedule
// ================================

export interface PaymentSchedule {
  id: string;
  loanId: string;
  customerId: string;
  installmentNumber: number;
  
  // Due Information
  dueDate: Timestamp;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  cumulativeBalance: number;
  
  // Payment Status
  isPaid: boolean;
  paidAmount?: number;
  paidDate?: Timestamp;
  paymentId?: string;
  
  // Penalty Information
  penaltyAmount?: number;
  daysOverdue?: number;
  
  // Collection Information
  isCollected: boolean;
  collectionAttempts: number;
  lastAttemptDate?: Timestamp;
  nextAttemptDate?: Timestamp;
}

// ================================
// Collection Routes
// ================================

export interface CollectionRoute extends AuditFields {
  id: string;
  agentId: string;
  routeName: string;
  
  // Route Information
  customers: string[]; // Customer IDs
  optimizedOrder: string[]; // Optimized order of customer visits
  estimatedDuration: number; // Minutes
  totalExpectedAmount: number;
  
  // Schedule
  assignedDay: number; // Day of week
  startTime: string;
  endTime: string;
  
  // Location Data
  startLocation: Location;
  waypoints: Location[];
  totalDistance: number; // Kilometers
  
  // Performance Metrics
  completionRate: number;
  averageCollectionTime: number;
  collectionEfficiency: number;
  
  // Status
  isActive: boolean;
  lastUpdated: Timestamp;
}

// ================================
// Analytics and Reporting
// ================================

export interface DashboardMetrics {
  totalCustomers: number;
  activeCustomers: number;
  totalLoans: number;
  activeLoans: number;
  totalOutstanding: number;
  totalCollected: number;
  collectionRate: number;
  defaultRate: number;
  profitMargin: number;
  
  // Period-specific metrics
  periodStart: Timestamp;
  periodEnd: Timestamp;
  newCustomers: number;
  newLoans: number;
  paymentsCollected: number;
  defaultersCount: number;
}

export interface AgentPerformance {
  agentId: string;
  agentName: string;
  
  // Collection Metrics
  targetAmount: number;
  collectedAmount: number;
  collectionRate: number;
  customersAssigned: number;
  customersVisited: number;
  
  // Performance Indicators
  onTimeCollections: number;
  lateCollections: number;
  missedCollections: number;
  newCustomersAcquired: number;
  
  // Efficiency Metrics
  averageCollectionTime: number;
  routeCompletionRate: number;
  customerSatisfactionScore?: number;
  
  // Financial Metrics
  commissionEarned: number;
  expensesIncurred: number;
  netEarnings: number;
}

export interface FinancialReport {
  periodStart: Timestamp;
  periodEnd: Timestamp;
  
  // Revenue
  totalRevenue: number;
  interestRevenue: number;
  penaltyRevenue: number;
  feesRevenue: number;
  
  // Expenses
  totalExpenses: number;
  operationalExpenses: number;
  agentCommissions: number;
  administrativeExpenses: number;
  
  // Profitability
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  roi: number;
  
  // Cash Flow
  cashInflow: number;
  cashOutflow: number;
  netCashFlow: number;
  
  // Risk Metrics
  totalAtRisk: number;
  provisionForBadDebts: number;
  writeOffs: number;
}

// ================================
// Notifications and Communication
// ================================

export type NotificationType = 'payment_due' | 'payment_overdue' | 'payment_received' | 'loan_approved' | 'system_alert';
export type NotificationChannel = 'sms' | 'email' | 'push' | 'in_app';
export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'failed';

export interface Notification extends AuditFields {
  id: string;
  recipientId: string;
  recipientType: UserRole;
  
  // Message Content
  title: BilingualText;
  message: BilingualText;
  type: NotificationType;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Delivery Information
  channels: NotificationChannel[];
  status: NotificationStatus;
  sentAt?: Timestamp;
  deliveredAt?: Timestamp;
  readAt?: Timestamp;
  
  // Related Data
  relatedEntityType?: 'customer' | 'loan' | 'payment';
  relatedEntityId?: string;
  actionUrl?: string;
  
  // Delivery Tracking
  deliveryAttempts: number;
  lastAttemptAt?: Timestamp;
  failureReason?: string;
}

// ================================
// System Configuration
// ================================

export interface SystemSettings {
  // Interest Configuration
  defaultInterestRate: number;
  maxInterestRate: number;
  penaltyRate: number;
  gracePeriodDays: number;
  
  // Loan Configuration
  minLoanAmount: number;
  maxLoanAmount: number;
  defaultLoanDuration: number;
  maxLoanDuration: number;
  
  // Collection Configuration
  collectionDays: number[];
  reminderDaysBeforeDue: number;
  overdueReminderInterval: number;
  maxCollectionAttempts: number;
  
  // Agent Configuration
  defaultCommissionRate: number;
  maxCustomersPerAgent: number;
  
  // System Configuration
  currency: string;
  timezone: string;
  dateFormat: string;
  language: 'sinhala' | 'english' | 'both';
  
  // Business Hours
  businessHours: {
    start: string;
    end: string;
    workingDays: number[];
  };
  
  // Contact Information
  companyInfo: {
    name: BilingualText;
    address: BilingualText;
    phone: string;
    email: string;
    website?: string;
    licenseNumber?: string;
  };
}

// ================================
// API Response Types
// ================================

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface AuthResponse extends APIResponse<{
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: string;
}> {}

// ================================
// Search and Filter Types
// ================================

export interface CustomerFilters {
  status?: CustomerStatus[];
  riskLevel?: CustomerRiskLevel[];
  assignedAgent?: string;
  search?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  hasActiveLoans?: boolean;
  isOverdue?: boolean;
}

export interface LoanFilters {
  status?: LoanStatus[];
  loanType?: LoanType[];
  assignedAgent?: string;
  customer?: string;
  amountMin?: number;
  amountMax?: number;
  startDateAfter?: Date;
  startDateBefore?: Date;
  isOverdue?: boolean;
}

export interface PaymentFilters {
  status?: PaymentStatus[];
  paymentMethod?: PaymentMethod[];
  collectedBy?: string;
  customer?: string;
  loan?: string;
  amountMin?: number;
  amountMax?: number;
  dateAfter?: Date;
  dateBefore?: Date;
}

// ================================
// Export all types
// ================================

export type {
  // Re-export commonly used types
  UserRole,
  UserStatus,
  CustomerStatus,
  LoanStatus,
  PaymentStatus,
  NotificationType
};