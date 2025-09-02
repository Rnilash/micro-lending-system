// Core Customer Type Definitions
// Comprehensive TypeScript interfaces for customer management

export interface Customer {
  // Primary identifiers
  customerId: string;
  customerNumber: string; // Human-readable identifier like CUST001234

  // Personal information
  personalInfo: PersonalInfo;
  
  // Contact details
  contactInfo: ContactInfo;
  
  // KYC documentation
  kycDocuments: KYCDocument[];
  kycStatus: KYCStatus;
  kycNotes?: string;
  
  // Customer status
  status: CustomerStatus;
  statusReason?: string;
  
  // Assignment and relationships
  assignedAgent: string; // User ID of assigned agent
  customerSince: Date;
  
  // Loan summary (computed fields)
  loanSummary: LoanSummary;
  
  // Credit profile
  creditProfile: CreditProfile;
  
  // Notes and comments
  notes: CustomerNote[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // User ID
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  fullNameSinhala?: string; // Full name in Sinhala script
  nicNumber: string; // Sri Lankan NIC format
  dateOfBirth: Date;
  gender: Gender;
  occupation: string;
  monthlyIncome: number; // In LKR
  dependents: number;
  maritalStatus: MaritalStatus;
}

export interface ContactInfo {
  primaryPhone: string; // +94XXXXXXXXX format
  secondaryPhone?: string;
  email?: string;
  address: Address;
  emergencyContact?: EmergencyContact;
}

export interface Address {
  street: string;
  city: string;
  district: string;
  province: string;
  postalCode: string; // 5-digit Sri Lankan postal code
  coordinates?: GeoCoordinates;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export interface KYCDocument {
  type: KYCDocumentType;
  url: string; // Firebase Storage URL
  uploadedAt: Date;
  verified: boolean;
  verifiedBy?: string; // User ID
  verifiedAt?: Date;
  expiryDate?: Date; // For documents with expiry
  notes?: string;
}

export interface LoanSummary {
  totalLoans: number;
  activeLoans: number;
  completedLoans: number;
  defaultedLoans: number;
  totalBorrowed: number; // Total amount ever borrowed
  totalRepaid: number; // Total amount repaid
  currentOutstanding: number; // Current outstanding balance
  lastPaymentDate?: Date;
  nextPaymentDate?: Date;
  averageLoanAmount: number;
  longestLoanTerm: number; // In weeks
}

export interface CreditProfile {
  creditScore: number; // Internal score 0-100
  riskCategory: RiskCategory;
  paymentHistory: PaymentHistory;
  defaultHistory: DefaultHistory[];
  recommendations: string[];
  lastUpdated: Date;
}

export interface PaymentHistory {
  onTimePayments: number;
  latePayments: number;
  missedPayments: number;
  averageDelayDays: number;
  paymentReliability: number; // Percentage
  longestStreak: number; // Consecutive on-time payments
}

export interface DefaultHistory {
  loanId: string;
  defaultDate: Date;
  defaultAmount: number;
  resolutionDate?: Date;
  resolutionMethod?: string;
  notes?: string;
}

export interface CustomerNote {
  noteId: string;
  note: string;
  type: NoteType;
  isPrivate: boolean; // Visible only to admins
  createdBy: string; // User ID
  createdAt: Date;
  updatedAt?: Date;
  attachments?: string[]; // URLs to attached files
}

// Enums and Union Types
export type Gender = 'male' | 'female';

export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';

export type KYCStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export type CustomerStatus = 'active' | 'inactive' | 'suspended' | 'blacklisted';

export type KYCDocumentType = 
  | 'nic_front'           // NIC front side
  | 'nic_back'            // NIC back side
  | 'income_proof'        // Salary slip, business registration, etc.
  | 'address_proof'       // Utility bill, bank statement, etc.
  | 'profile_photo'       // Passport-style photo
  | 'bank_statement'      // Bank statement
  | 'business_license'    // For business owners
  | 'other';              // Other supporting documents

export type RiskCategory = 'low' | 'medium' | 'high' | 'critical';

export type NoteType = 
  | 'general'        // General notes
  | 'warning'        // Warning about customer
  | 'payment'        // Payment-related notes
  | 'kyc'           // KYC verification notes
  | 'contact'       // Contact attempt notes
  | 'complaint'     // Customer complaint
  | 'compliment';   // Positive feedback

// Input Types for Creating/Updating Customers
export interface CreateCustomerData {
  personalInfo: Omit<PersonalInfo, 'monthlyIncome'> & {
    monthlyIncome: number;
  };
  contactInfo: ContactInfo;
  assignedAgent?: string; // Optional, can be assigned later
  initialNotes?: string;
}

export interface UpdateCustomerData {
  personalInfo?: Partial<PersonalInfo>;
  contactInfo?: Partial<ContactInfo>;
  kycStatus?: KYCStatus;
  kycNotes?: string;
  status?: CustomerStatus;
  statusReason?: string;
  assignedAgent?: string;
}

// Filter and Search Types
export interface CustomerFilters {
  status?: CustomerStatus[];
  kycStatus?: KYCStatus[];
  assignedAgent?: string;
  district?: string;
  province?: string;
  riskCategory?: RiskCategory[];
  dateRange?: {
    field: 'createdAt' | 'customerSince' | 'lastPaymentDate';
    from: Date;
    to: Date;
  };
  loanStatus?: {
    hasActiveLoans?: boolean;
    hasOverduePayments?: boolean;
    minimumOutstanding?: number;
    maximumOutstanding?: number;
  };
}

export interface CustomerSearchQuery {
  query: string; // Search text
  searchFields: CustomerSearchField[];
  filters?: CustomerFilters;
  sortBy?: CustomerSortField;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export type CustomerSearchField = 
  | 'name'           // First name + last name
  | 'nicNumber'      // NIC number
  | 'phone'          // Primary or secondary phone
  | 'email'          // Email address
  | 'customerNumber' // Customer number
  | 'address';       // Address fields

export type CustomerSortField = 
  | 'name'
  | 'createdAt'
  | 'customerSince'
  | 'lastPaymentDate'
  | 'outstandingBalance'
  | 'creditScore';

// API Response Types
export interface CustomerListResponse {
  customers: Customer[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  summary?: {
    totalCustomers: number;
    activeCustomers: number;
    newThisMonth: number;
    averageCreditScore: number;
  };
}

export interface CustomerDetailsResponse extends Customer {
  loans: LoanSummaryItem[];
  recentPayments: PaymentSummaryItem[];
  recentNotes: CustomerNote[];
}

export interface LoanSummaryItem {
  loanId: string;
  loanNumber: string;
  amount: number;
  outstandingBalance: number;
  status: string;
  nextPaymentDate?: Date;
  isOverdue: boolean;
}

export interface PaymentSummaryItem {
  paymentId: string;
  amount: number;
  paymentDate: Date;
  loanNumber: string;
  receiptNumber: string;
}

// Utility Types
export type CustomerFormData = CreateCustomerData;
export type CustomerUpdateFormData = UpdateCustomerData;

// Type Guards
export function isValidNIC(nic: string): boolean {
  // Validate Sri Lankan NIC format
  const oldFormat = /^[0-9]{9}[vVxX]$/;
  const newFormat = /^[0-9]{12}$/;
  return oldFormat.test(nic) || newFormat.test(nic);
}

export function isValidPhoneNumber(phone: string): boolean {
  // Validate Sri Lankan phone number format
  const phoneRegex = /^\+94[0-9]{9}$/;
  return phoneRegex.test(phone);
}

export function isValidPostalCode(postalCode: string): boolean {
  // Validate Sri Lankan postal code format
  const postalRegex = /^[0-9]{5}$/;
  return postalRegex.test(postalCode);
}

export default Customer;