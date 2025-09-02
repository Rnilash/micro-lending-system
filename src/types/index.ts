// Core entity types
export interface User {
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'agent';
  profile: UserProfile;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  phone: string;
  avatar?: string;
  address?: Address;
  preferences: UserPreferences;
  permissions: Permission[];
}

export interface UserPreferences {
  language: 'en' | 'si';
  theme: 'light' | 'dark';
  notifications: NotificationSettings;
  dateFormat: string;
  currency: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  paymentReminders: boolean;
  systemAlerts: boolean;
}

export interface Permission {
  resource: string;
  actions: string[];
}

export interface Customer {
  id: string;
  personalInfo: PersonalInfo;
  contactInfo: ContactInfo;
  kycInfo: KYCInfo;
  financialInfo: FinancialInfo;
  documents: Document[];
  status: 'active' | 'inactive' | 'suspended';
  kycStatus: 'pending' | 'approved' | 'rejected';
  assignedAgent: string; // User ID
  riskRating: 'low' | 'medium' | 'high';
  creditScore?: number;
  notes: Note[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  fullNameSinhala?: string;
  nic: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  occupation: string;
  employer?: string;
  emergencyContact: EmergencyContact;
}

export interface ContactInfo {
  phone: string;
  alternatePhone?: string;
  email?: string;
  address: Address;
  permanentAddress?: Address;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  district: string;
  province: string;
  postalCode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  address?: string;
}

export interface KYCInfo {
  identityVerified: boolean;
  addressVerified: boolean;
  incomeVerified: boolean;
  verificationDate?: Date;
  verifiedBy?: string;
  verificationNotes?: string;
}

export interface FinancialInfo {
  monthlyIncome: number;
  monthlyExpenses: number;
  bankAccount?: BankAccount;
  existingLoans: ExistingLoan[];
  collateral?: Collateral[];
}

export interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountType: 'savings' | 'current';
  branch: string;
}

export interface ExistingLoan {
  lender: string;
  amount: number;
  monthlyPayment: number;
  remainingBalance: number;
  endDate: Date;
}

export interface Collateral {
  type: string;
  description: string;
  estimatedValue: number;
  documents: string[];
}

export interface Loan {
  id: string;
  customerId: string;
  applicationDate: Date;
  amount: number;
  approvedAmount?: number;
  interestRate: number;
  calculationMethod: 'flat' | 'reducing';
  term: number; // Number of weeks
  installmentAmount: number;
  totalAmount: number;
  purpose: string;
  status: 'pending' | 'approved' | 'active' | 'completed' | 'defaulted' | 'rejected';
  approvalWorkflow: ApprovalStep[];
  disbursementDate?: Date;
  startDate?: Date;
  endDate?: Date;
  expectedEndDate: Date;
  nextPaymentDate?: Date;
  paidInstallments: number;
  totalInstallments: number;
  outstandingBalance: number;
  penaltyAmount: number;
  collateral?: Collateral[];
  guarantors: Guarantor[];
  documents: Document[];
  notes: Note[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  managedBy: string;
}

export interface ApprovalStep {
  step: number;
  name: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  comments?: string;
  requiredRole: 'agent' | 'admin';
}

export interface Guarantor {
  name: string;
  nic: string;
  phone: string;
  address: string;
  relationship: string;
  occupation: string;
  monthlyIncome: number;
  documents: string[];
}

export interface Payment {
  id: string;
  loanId: string;
  customerId: string;
  amount: number;
  installmentNumber: number;
  paymentDate: Date;
  dueDate: Date;
  paymentType: 'regular' | 'penalty' | 'advance' | 'partial';
  paymentMethod: 'cash' | 'bank_transfer' | 'cheque' | 'digital';
  receiptNumber: string;
  collectedBy: string; // User ID
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  photo?: string;
  notes?: string;
  status: 'completed' | 'pending' | 'failed';
  transactionId?: string;
  isLate: boolean;
  lateDays: number;
  penaltyApplied: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
  uploadedBy: string;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
  expiryDate?: Date;
  tags: string[];
}

export type DocumentType = 
  | 'nic_front'
  | 'nic_back'
  | 'utility_bill'
  | 'bank_statement'
  | 'salary_slip'
  | 'business_registration'
  | 'guarantor_nic'
  | 'collateral_documents'
  | 'other';

export interface Note {
  id: string;
  content: string;
  type: 'general' | 'application' | 'approval' | 'payment' | 'collection' | 'default';
  priority: 'low' | 'medium' | 'high';
  isPrivate: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface SystemSettings {
  id: string;
  category: string;
  key: string;
  value: any;
  description: string;
  isPublic: boolean;
  updatedBy: string;
  updatedAt: Date;
}

export interface InterestRate {
  id: string;
  name: string;
  rate: number;
  calculationMethod: 'flat' | 'reducing';
  minAmount: number;
  maxAmount: number;
  minTerm: number;
  maxTerm: number;
  isActive: boolean;
  createdAt: Date;
}

export interface BusinessInfo {
  name: string;
  registrationNumber: string;
  address: Address;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  bankDetails: BankAccount;
  taxNumber?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  actionUrl?: string;
  data?: any;
  expiresAt?: Date;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  oldData?: any;
  newData?: any;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Query and Filter types
export interface CustomerFilters {
  status?: string;
  kycStatus?: string;
  assignedAgent?: string;
  riskRating?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface LoanFilters {
  status?: string;
  customerId?: string;
  managedBy?: string;
  amountMin?: number;
  amountMax?: number;
  dateFrom?: Date;
  dateTo?: Date;
  overdue?: boolean;
}

export interface PaymentFilters {
  loanId?: string;
  customerId?: string;
  collectedBy?: string;
  paymentType?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

// UI State types
export interface UIState {
  isLoading: boolean;
  error: string | null;
  currentUser: User | null;
  sidebar: {
    isOpen: boolean;
    isCollapsed: boolean;
  };
  modals: {
    [key: string]: boolean;
  };
  notifications: Notification[];
  theme: 'light' | 'dark';
  language: 'en' | 'si';
}

// Form types
export interface CustomerFormData {
  personalInfo: Partial<PersonalInfo>;
  contactInfo: Partial<ContactInfo>;
  financialInfo: Partial<FinancialInfo>;
  documents: File[];
}

export interface LoanFormData {
  customerId: string;
  amount: number;
  interestRateId: string;
  term: number;
  purpose: string;
  collateral?: Partial<Collateral>[];
  guarantors?: Partial<Guarantor>[];
  documents: File[];
}

export interface PaymentFormData {
  loanId: string;
  amount: number;
  paymentMethod: string;
  notes?: string;
  photo?: File;
  location?: {
    lat: number;
    lng: number;
  };
}

// Chart and Analytics types
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
  }[];
}

export interface AnalyticsData {
  totalCustomers: number;
  activeLoans: number;
  totalOutstanding: number;
  collectionRate: number;
  trends: {
    period: string;
    customers: number;
    loans: number;
    collections: number;
  }[];
}

// Error types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormErrors {
  [key: string]: string | ValidationError[];
}

export default {};
