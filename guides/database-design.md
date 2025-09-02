# Database Design Guide

Comprehensive database design and schema documentation for the Digital Micro-Lending Management System.

## Table of Contents
- [Database Architecture](#database-architecture)
- [Collection Schemas](#collection-schemas)
- [Relationships](#relationships)
- [Indexing Strategy](#indexing-strategy)
- [Data Validation](#data-validation)
- [Performance Optimization](#performance-optimization)
- [Migration Strategies](#migration-strategies)
- [Backup and Recovery](#backup-and-recovery)

## Database Architecture

### NoSQL Design Principles
```
Firestore Database Design:
├── Document-based storage
├── Hierarchical data structure
├── Real-time synchronization
├── Horizontal scaling
└── ACID transaction support
```

### Collection Structure Overview
```
micro-lending-db/
├── users/                    # User authentication and profiles
├── customers/                # Customer information and KYC
├── loans/                    # Loan applications and management
├── payments/                 # Payment records and receipts
├── settings/                 # System configuration
├── notifications/            # User notifications
├── audit_logs/              # System audit trail
├── reports/                 # Generated report cache
└── counters/                # Auto-increment counters
```

## Collection Schemas

### 1. Users Collection

#### Document Structure
```typescript
interface User {
  // Document ID: Firebase Auth UID
  uid: string;                    // Firebase Auth UID
  email: string;                  // User email
  name: string;                   // Full name
  role: 'admin' | 'agent';       // User role
  status: 'active' | 'inactive' | 'suspended';
  
  profile: {
    avatar?: string;              // Profile photo URL
    phone?: string;               // Phone number
    address?: string;             // Physical address
    dateOfBirth?: Date;          // Date of birth
    nic?: string;                // National ID
  };
  
  preferences: {
    language: 'si' | 'en';       // Interface language
    notifications: boolean;       // Enable notifications
    theme: 'light' | 'dark';     // UI theme
    timezone: string;            // User timezone
  };
  
  permissions: {
    customers: string[];          // Assigned customer IDs (agents only)
    regions: string[];           // Assigned regions (agents only)
    features: string[];          // Enabled features
  };
  
  lastLogin?: Date;              // Last login timestamp
  loginCount: number;            // Total login count
  
  createdAt: Date;              // Account creation
  updatedAt: Date;              // Last update
  createdBy?: string;           // Created by user ID
}
```

#### Example Document
```json
{
  "uid": "agent123",
  "email": "nimal.silva@company.com",
  "name": "Nimal Silva",
  "role": "agent",
  "status": "active",
  
  "profile": {
    "avatar": "https://storage.com/avatars/agent123.jpg",
    "phone": "+94771234567",
    "address": "123 Main St, Colombo 03",
    "dateOfBirth": "1985-03-15T00:00:00Z",
    "nic": "198512345678"
  },
  
  "preferences": {
    "language": "si",
    "notifications": true,
    "theme": "light",
    "timezone": "Asia/Colombo"
  },
  
  "permissions": {
    "customers": ["customer1", "customer2"],
    "regions": ["colombo_03", "colombo_04"],
    "features": ["payment_collection", "customer_management"]
  },
  
  "lastLogin": "2024-04-06T09:30:00Z",
  "loginCount": 145,
  
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-04-06T09:30:00Z",
  "createdBy": "admin123"
}
```

### 2. Customers Collection

#### Document Structure
```typescript
interface Customer {
  // Document ID: Auto-generated
  customerId: string;             // Document ID
  customerNumber: string;         // Human-readable customer number
  
  personalInfo: {
    firstName: string;            // First name (Sinhala/English)
    lastName: string;             // Last name (Sinhala/English)
    fullNameSinhala?: string;     // Full name in Sinhala
    nicNumber: string;            // National ID number
    dateOfBirth: Date;           // Date of birth
    gender: 'male' | 'female';   // Gender
    occupation: string;           // Occupation
    monthlyIncome: number;        // Monthly income in LKR
    dependents: number;           // Number of dependents
    maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  };
  
  contactInfo: {
    primaryPhone: string;         // Primary phone number
    secondaryPhone?: string;      // Secondary phone number
    email?: string;               // Email address
    address: {
      street: string;             // Street address
      city: string;               // City
      district: string;           // District
      province: string;           // Province
      postalCode: string;         // Postal code
      coordinates?: {             // GPS coordinates
        latitude: number;
        longitude: number;
      };
    };
    emergencyContact?: {
      name: string;
      relationship: string;
      phone: string;
    };
  };
  
  kycDocuments: Array<{
    type: 'nic_front' | 'nic_back' | 'income_proof' | 'address_proof' | 'profile_photo';
    url: string;                  // Storage URL
    uploadedAt: Date;            // Upload timestamp
    verified: boolean;            // Verification status
    verifiedBy?: string;         // Verified by user ID
    verifiedAt?: Date;           // Verification timestamp
  }>;
  
  kycStatus: 'pending' | 'approved' | 'rejected' | 'expired';
  kycNotes?: string;              // KYC review notes
  
  status: 'active' | 'inactive' | 'suspended' | 'blacklisted';
  statusReason?: string;          // Status change reason
  
  assignedAgent: string;          // Assigned agent user ID
  customerSince: Date;           // Customer registration date
  
  // Loan summary (computed fields)
  loanSummary: {
    totalLoans: number;           // Total number of loans
    activeLoans: number;          // Number of active loans
    completedLoans: number;       // Number of completed loans
    defaultedLoans: number;       // Number of defaulted loans
    totalBorrowed: number;        // Total amount borrowed
    totalRepaid: number;          // Total amount repaid
    currentOutstanding: number;   // Current outstanding balance
    lastPaymentDate?: Date;      // Last payment date
    nextPaymentDate?: Date;      // Next payment due date
  };
  
  creditProfile: {
    creditScore: number;          // Internal credit score (0-100)
    riskCategory: 'low' | 'medium' | 'high';
    paymentHistory: {
      onTimePayments: number;
      latePayments: number;
      missedPayments: number;
      averageDelayDays: number;
    };
    recommendations: string[];    // Credit recommendations
  };
  
  notes: Array<{
    note: string;
    createdBy: string;
    createdAt: Date;
    type: 'general' | 'warning' | 'payment' | 'kyc';
  }>;
  
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;              // Created by user ID
}
```

### 3. Loans Collection

#### Document Structure
```typescript
interface Loan {
  // Document ID: Auto-generated
  loanId: string;                 // Document ID
  loanNumber: string;             // Human-readable loan number
  
  customerId: string;             // Reference to customer
  customerInfo: {                 // Denormalized customer data
    name: string;
    phone: string;
    address: string;
  };
  
  loanDetails: {
    amount: number;               // Principal amount in LKR
    purpose: string;              // Loan purpose
    category: 'personal' | 'business' | 'emergency' | 'agriculture';
    
    interestRate: number;         // Annual interest rate (%)
    calculationMethod: 'flat' | 'reducing';
    
    loanTerm: number;             // Term in weeks
    installmentFrequency: 'weekly' | 'monthly';
    installmentAmount: number;    // Installment amount
    totalInstallments: number;    // Total number of installments
    totalAmount: number;          // Total amount to be repaid
    totalInterest: number;        // Total interest amount
  };
  
  guarantor?: {
    name: string;
    nicNumber: string;
    relationship: string;
    phone: string;
    address: string;
    occupation: string;
    monthlyIncome: number;
    signature: string;            // Digital signature URL
  };
  
  collateral?: Array<{
    type: 'property' | 'vehicle' | 'jewelry' | 'other';
    description: string;
    estimatedValue: number;
    documents: string[];          // Document URLs
  }>;
  
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'defaulted' | 'written_off';
  statusHistory: Array<{
    status: string;
    changedBy: string;
    changedAt: Date;
    reason?: string;
    notes?: string;
  }>;
  
  paymentSchedule: Array<{
    installmentNumber: number;
    dueDate: Date;
    principalAmount: number;
    interestAmount: number;
    totalAmount: number;
    remainingBalance: number;
    
    // Payment tracking
    paid: boolean;
    paidDate?: Date;
    paidAmount?: number;
    paymentId?: string;
    lateDays?: number;
    penaltyAmount?: number;
  }>;
  
  // Current payment status
  paymentStatus: {
    paidInstallments: number;
    remainingInstallments: number;
    totalPaid: number;
    principalPaid: number;
    interestPaid: number;
    penaltiesPaid: number;
    outstandingBalance: number;
    nextPaymentDate?: Date;
    nextPaymentAmount: number;
    isOverdue: boolean;
    overdueAmount: number;
    daysPastDue: number;
  };
  
  // Dates
  applicationDate: Date;
  approvalDate?: Date;
  disbursementDate?: Date;
  completionDate?: Date;
  
  // User tracking
  createdBy: string;              // Applied by user ID
  approvedBy?: string;            // Approved by user ID
  managedBy: string;              // Currently managed by user ID
  
  // Audit trail
  createdAt: Date;
  updatedAt: Date;
  
  // Additional fields
  documents: Array<{
    type: string;
    url: string;
    uploadedAt: Date;
    uploadedBy: string;
  }>;
  
  notes: Array<{
    note: string;
    createdBy: string;
    createdAt: Date;
    type: 'application' | 'approval' | 'disbursement' | 'payment' | 'default';
  }>;
}
```

### 4. Payments Collection

#### Document Structure
```typescript
interface Payment {
  // Document ID: Auto-generated
  paymentId: string;              // Document ID
  receiptNumber: string;          // Human-readable receipt number
  
  // References
  loanId: string;                 // Reference to loan
  customerId: string;             // Reference to customer
  
  // Denormalized data for performance
  loanInfo: {
    loanNumber: string;
    customerName: string;
    customerPhone: string;
  };
  
  // Payment details
  paymentDetails: {
    amount: number;               // Total payment amount
    installmentNumber: number;    // Which installment
    
    // Breakdown
    principalAmount: number;      // Principal portion
    interestAmount: number;       // Interest portion
    penaltyAmount: number;        // Penalty amount
    feeAmount: number;           // Processing fees
    
    // Payment method
    paymentMethod: 'cash' | 'bank_transfer' | 'mobile_payment' | 'check';
    paymentReference?: string;    // Bank reference/check number
    
    // Currency
    currency: 'LKR';
    exchangeRate?: number;        // If foreign currency
  };
  
  // Collection details
  collectionInfo: {
    collectedBy: string;          // Agent user ID
    collectorName: string;        // Agent name
    collectionDate: Date;         // When collected
    collectionTime: string;       // Time of collection
    collectionLocation?: {
      address: string;
      coordinates?: {
        latitude: number;
        longitude: number;
      };
    };
    
    // Receipt and proof
    receiptPhoto?: string;        // Receipt photo URL
    customerSignature?: string;   // Digital signature URL
    witnessSignature?: string;    // Witness signature URL
  };
  
  // Status and verification
  status: 'pending' | 'verified' | 'disputed' | 'cancelled';
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verifiedBy?: string;
  verifiedAt?: Date;
  
  // Late payment handling
  latePayment: {
    isLate: boolean;
    dayslate: number;
    originalDueDate: Date;
    gracePeriodUsed: boolean;
    penaltyApplied: boolean;
    penaltyWaived: boolean;
    waivedBy?: string;
    waiverReason?: string;
  };
  
  // Reconciliation
  reconciliation: {
    reconciled: boolean;
    reconciledBy?: string;
    reconciledAt?: Date;
    batchId?: string;
    bankStatementRef?: string;
  };
  
  // Notes and comments
  notes: Array<{
    note: string;
    createdBy: string;
    createdAt: Date;
    type: 'collection' | 'verification' | 'dispute' | 'general';
  }>;
  
  // Audit trail
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}
```

### 5. Settings Collection

#### Document Structure
```typescript
interface SystemSettings {
  // Document ID: 'system'
  
  // Interest rate configuration
  interestRates: {
    personal: {
      minRate: number;
      maxRate: number;
      defaultRate: number;
    };
    business: {
      minRate: number;
      maxRate: number;
      defaultRate: number;
    };
    emergency: {
      minRate: number;
      maxRate: number;
      defaultRate: number;
    };
    agriculture: {
      minRate: number;
      maxRate: number;
      defaultRate: number;
    };
  };
  
  // Loan term limits
  loanTerms: {
    minWeeks: number;
    maxWeeks: number;
    defaultWeeks: number;
    allowedTerms: number[];       // Specific allowed terms
  };
  
  // Loan amount limits
  loanAmounts: {
    minAmount: number;
    maxAmount: number;
    defaultAmount: number;
    amountSteps: number;          // Increment steps
  };
  
  // Collection settings
  collectionSettings: {
    gracePeriodDays: number;      // Grace period for late payments
    penaltyRate: number;          // Late payment penalty rate (%)
    maxMissedPayments: number;    // Max missed before default
    collectionDays: string[];    // Working days
    workingHours: {
      start: string;              // Start time (HH:mm)
      end: string;                // End time (HH:mm)
    };
    holidaySchedule: Date[];      // Holiday dates
  };
  
  // KYC requirements
  kycSettings: {
    requiredDocuments: string[];
    documentExpiryDays: number;
    autoApprovalEnabled: boolean;
    manualReviewThreshold: number;
  };
  
  // Notification settings
  notifications: {
    paymentReminders: {
      enabled: boolean;
      daysBefore: number[];
      methods: string[];          // email, sms, push
    };
    overdueNotifications: {
      enabled: boolean;
      daysAfter: number[];
      escalationLevels: string[];
    };
    systemAlerts: {
      enabled: boolean;
      recipients: string[];       // User IDs
    };
  };
  
  // Business information
  businessInfo: {
    name: string;
    registrationNumber: string;
    licenseNumber: string;
    address: {
      street: string;
      city: string;
      district: string;
      province: string;
      postalCode: string;
    };
    contact: {
      phone: string;
      email: string;
      website?: string;
    };
    bankDetails: {
      bankName: string;
      accountNumber: string;
      branchCode: string;
      swiftCode?: string;
    };
    logo?: string;                // Logo URL
    signature?: string;           // Digital signature URL
  };
  
  // System configuration
  systemConfig: {
    maintenanceMode: boolean;
    maintenanceMessage?: string;
    apiRateLimit: number;
    sessionTimeout: number;       // Minutes
    backupFrequency: string;      // Daily, weekly, etc.
    dataRetentionPeriod: number;  // Days
  };
  
  // Localization
  localization: {
    defaultLanguage: 'si' | 'en';
    supportedLanguages: string[];
    dateFormat: string;
    numberFormat: string;
    currencyFormat: string;
  };
  
  // Audit trail
  lastUpdatedBy: string;
  lastUpdatedAt: Date;
  version: number;                // Config version
}
```

## Relationships

### Entity Relationship Diagram
```
User (1) ────────── (Many) Customer
                       │
                       │ (1)
                       │
                   (Many) Loan ──────── (Many) Payment
                       │
                       │ (1)
                       │
                   (Many) PaymentSchedule
                   
User (1) ────────── (Many) Payment [collectedBy]
User (1) ────────── (Many) AuditLog [userId]
```

### Reference Patterns

#### 1. Direct References
```typescript
// Customer → User (assignedAgent)
customer.assignedAgent = "user123";

// Loan → Customer
loan.customerId = "customer456";

// Payment → Loan
payment.loanId = "loan789";
```

#### 2. Denormalized Data
```typescript
// Store frequently accessed data
loan.customerInfo = {
  name: "Kasun Perera",
  phone: "+94771234567",
  address: "Colombo 03"
};

payment.loanInfo = {
  loanNumber: "LOAN001234",
  customerName: "Kasun Perera",
  customerPhone: "+94771234567"
};
```

## Indexing Strategy

### Composite Indexes
```json
{
  "indexes": [
    {
      "collectionGroup": "customers",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "assignedAgent", "order": "ASCENDING"},
        {"fieldPath": "status", "order": "ASCENDING"},
        {"fieldPath": "createdAt", "order": "DESCENDING"}
      ]
    },
    {
      "collectionGroup": "customers",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "kycStatus", "order": "ASCENDING"},
        {"fieldPath": "createdAt", "order": "DESCENDING"}
      ]
    },
    {
      "collectionGroup": "loans",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "customerId", "order": "ASCENDING"},
        {"fieldPath": "status", "order": "ASCENDING"},
        {"fieldPath": "createdAt", "order": "DESCENDING"}
      ]
    },
    {
      "collectionGroup": "loans",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "status", "order": "ASCENDING"},
        {"fieldPath": "paymentStatus.nextPaymentDate", "order": "ASCENDING"}
      ]
    },
    {
      "collectionGroup": "loans",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "paymentStatus.isOverdue", "order": "ASCENDING"},
        {"fieldPath": "paymentStatus.daysPastDue", "order": "DESCENDING"}
      ]
    },
    {
      "collectionGroup": "payments",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "loanId", "order": "ASCENDING"},
        {"fieldPath": "collectionInfo.collectionDate", "order": "DESCENDING"}
      ]
    },
    {
      "collectionGroup": "payments",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "collectionInfo.collectedBy", "order": "ASCENDING"},
        {"fieldPath": "collectionInfo.collectionDate", "order": "DESCENDING"}
      ]
    },
    {
      "collectionGroup": "payments",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "customerId", "order": "ASCENDING"},
        {"fieldPath": "status", "order": "ASCENDING"},
        {"fieldPath": "collectionInfo.collectionDate", "order": "DESCENDING"}
      ]
    }
  ]
}
```

### Single Field Indexes (Auto-created)
- `customers.status`
- `customers.assignedAgent`
- `loans.customerId`
- `loans.status`
- `payments.loanId`
- `payments.customerId`
- `payments.collectionInfo.collectedBy`

## Data Validation

### Firestore Rules Validation
```javascript
// Customer validation
function isValidCustomer() {
  let customer = request.resource.data;
  return customer.keys().hasAll(['personalInfo', 'contactInfo', 'status']) &&
         customer.personalInfo.keys().hasAll(['firstName', 'lastName', 'nicNumber']) &&
         customer.personalInfo.firstName is string &&
         customer.personalInfo.firstName.size() > 0 &&
         customer.personalInfo.nicNumber.matches('^[0-9]{9}[vVxX]|[0-9]{12}$') &&
         customer.contactInfo.primaryPhone.matches('^\\+94[0-9]{9}$') &&
         customer.status in ['active', 'inactive', 'suspended', 'blacklisted'];
}

// Loan validation
function isValidLoan() {
  let loan = request.resource.data;
  return loan.keys().hasAll(['customerId', 'loanDetails', 'status']) &&
         loan.loanDetails.amount is number &&
         loan.loanDetails.amount > 0 &&
         loan.loanDetails.amount <= 1000000 &&
         loan.loanDetails.interestRate > 0 &&
         loan.loanDetails.interestRate <= 30 &&
         loan.loanDetails.loanTerm >= 4 &&
         loan.loanDetails.loanTerm <= 104 &&
         loan.status in ['pending', 'approved', 'rejected', 'active', 'completed', 'defaulted'];
}

// Payment validation
function isValidPayment() {
  let payment = request.resource.data;
  return payment.keys().hasAll(['loanId', 'customerId', 'paymentDetails']) &&
         payment.paymentDetails.amount is number &&
         payment.paymentDetails.amount > 0 &&
         payment.paymentDetails.installmentNumber is number &&
         payment.paymentDetails.installmentNumber > 0 &&
         payment.paymentDetails.paymentMethod in ['cash', 'bank_transfer', 'mobile_payment', 'check'];
}
```

### Application-Level Validation
```typescript
// lib/validations.ts
import { z } from 'zod';

export const customerSchema = z.object({
  personalInfo: z.object({
    firstName: z.string().min(1).max(50),
    lastName: z.string().min(1).max(50),
    nicNumber: z.string().regex(/^[0-9]{9}[vVxX]|[0-9]{12}$/),
    dateOfBirth: z.date().max(new Date()),
    gender: z.enum(['male', 'female']),
    occupation: z.string().min(1),
    monthlyIncome: z.number().positive(),
    dependents: z.number().min(0).max(20),
  }),
  contactInfo: z.object({
    primaryPhone: z.string().regex(/^\+94[0-9]{9}$/),
    secondaryPhone: z.string().regex(/^\+94[0-9]{9}$/).optional(),
    email: z.string().email().optional(),
    address: z.object({
      street: z.string().min(1),
      city: z.string().min(1),
      district: z.string().min(1),
      province: z.string().min(1),
      postalCode: z.string().regex(/^[0-9]{5}$/),
    }),
  }),
});

export const loanSchema = z.object({
  customerId: z.string().min(1),
  loanDetails: z.object({
    amount: z.number().min(1000).max(1000000),
    purpose: z.string().min(1),
    category: z.enum(['personal', 'business', 'emergency', 'agriculture']),
    interestRate: z.number().min(1).max(30),
    calculationMethod: z.enum(['flat', 'reducing']),
    loanTerm: z.number().min(4).max(104),
  }),
});

export const paymentSchema = z.object({
  loanId: z.string().min(1),
  customerId: z.string().min(1),
  paymentDetails: z.object({
    amount: z.number().positive(),
    installmentNumber: z.number().positive(),
    paymentMethod: z.enum(['cash', 'bank_transfer', 'mobile_payment', 'check']),
  }),
  collectionInfo: z.object({
    collectionDate: z.date(),
    collectedBy: z.string().min(1),
  }),
});
```

## Performance Optimization

### Query Optimization Patterns

#### 1. Efficient Customer Queries
```typescript
// Good: Use indexes
db.collection('customers')
  .where('assignedAgent', '==', agentId)
  .where('status', '==', 'active')
  .orderBy('createdAt', 'desc')
  .limit(20);

// Bad: Client-side filtering
db.collection('customers')
  .get()
  .then(snapshot => {
    return snapshot.docs.filter(doc => {
      const data = doc.data();
      return data.assignedAgent === agentId && data.status === 'active';
    });
  });
```

#### 2. Loan Status Queries
```typescript
// Get overdue loans
db.collection('loans')
  .where('status', '==', 'active')
  .where('paymentStatus.isOverdue', '==', true)
  .orderBy('paymentStatus.daysPastDue', 'desc');

// Get loans due today
const today = new Date();
today.setHours(0, 0, 0, 0);
const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

db.collection('loans')
  .where('paymentStatus.nextPaymentDate', '>=', today)
  .where('paymentStatus.nextPaymentDate', '<', tomorrow);
```

#### 3. Payment Collection Queries
```typescript
// Agent's collections for a date
db.collection('payments')
  .where('collectionInfo.collectedBy', '==', agentId)
  .where('collectionInfo.collectionDate', '>=', startOfDay)
  .where('collectionInfo.collectionDate', '<', endOfDay)
  .orderBy('collectionInfo.collectionDate', 'desc');
```

### Data Denormalization Strategies

#### 1. Customer Summary in Loans
```typescript
// Store customer info in loan for quick access
const loan = {
  customerId: 'customer123',
  customerInfo: {
    name: 'Kasun Perera',
    phone: '+94771234567',
    address: 'Colombo 03'
  },
  // ... other loan fields
};
```

#### 2. Loan Summary in Customers
```typescript
// Update customer loan summary when loan changes
const updateCustomerLoanSummary = async (customerId: string) => {
  const loans = await db.collection('loans')
    .where('customerId', '==', customerId)
    .get();
    
  const summary = loans.docs.reduce((acc, doc) => {
    const loan = doc.data();
    acc.totalLoans++;
    if (loan.status === 'active') acc.activeLoans++;
    if (loan.status === 'completed') acc.completedLoans++;
    acc.totalBorrowed += loan.loanDetails.amount;
    acc.currentOutstanding += loan.paymentStatus.outstandingBalance;
    return acc;
  }, {
    totalLoans: 0,
    activeLoans: 0,
    completedLoans: 0,
    totalBorrowed: 0,
    currentOutstanding: 0,
  });
  
  await db.collection('customers').doc(customerId).update({
    loanSummary: summary
  });
};
```

### Caching Strategies

#### 1. Application-Level Caching
```typescript
// Use React Query for client-side caching
export function useCustomers(agentId?: string) {
  return useQuery({
    queryKey: ['customers', agentId],
    queryFn: () => customerService.getCustomers({ assignedAgent: agentId }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Cache frequently accessed settings
export function useSystemSettings() {
  return useQuery({
    queryKey: ['settings', 'system'],
    queryFn: () => settingsService.getSystemSettings(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
  });
}
```

#### 2. Server-Side Caching
```typescript
// Cache reports in Firestore
const generateDailyReport = async (date: string, agentId?: string) => {
  const cacheKey = `daily_${date}_${agentId || 'all'}`;
  
  // Check cache first
  const cached = await db.collection('reports').doc(cacheKey).get();
  if (cached.exists && cached.data()!.generatedAt > Date.now() - 3600000) {
    return cached.data()!.report;
  }
  
  // Generate new report
  const report = await generateReport(date, agentId);
  
  // Cache result
  await db.collection('reports').doc(cacheKey).set({
    report,
    generatedAt: Date.now(),
    expiresAt: Date.now() + 3600000, // 1 hour
  });
  
  return report;
};
```

## Migration Strategies

### Data Migration Scripts
```typescript
// migrations/001_add_customer_summary.ts
export async function migrateCustomerSummary() {
  const customers = await db.collection('customers').get();
  
  for (const customerDoc of customers.docs) {
    const customerId = customerDoc.id;
    
    // Calculate loan summary
    const loans = await db.collection('loans')
      .where('customerId', '==', customerId)
      .get();
      
    const loanSummary = calculateLoanSummary(loans.docs);
    
    // Update customer document
    await customerDoc.ref.update({
      loanSummary,
      migratedAt: new Date(),
    });
    
    console.log(`Migrated customer ${customerId}`);
  }
}

// migrations/002_normalize_phone_numbers.ts
export async function normalizePhoneNumbers() {
  const customers = await db.collection('customers').get();
  
  for (const customerDoc of customers.docs) {
    const customer = customerDoc.data();
    const updates: any = {};
    
    if (customer.contactInfo.primaryPhone) {
      updates['contactInfo.primaryPhone'] = normalizePhoneNumber(
        customer.contactInfo.primaryPhone
      );
    }
    
    if (customer.contactInfo.secondaryPhone) {
      updates['contactInfo.secondaryPhone'] = normalizePhoneNumber(
        customer.contactInfo.secondaryPhone
      );
    }
    
    if (Object.keys(updates).length > 0) {
      await customerDoc.ref.update(updates);
    }
  }
}

function normalizePhoneNumber(phone: string): string {
  // Remove spaces, hyphens, parentheses
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Add country code if missing
  if (cleaned.startsWith('0')) {
    return '+94' + cleaned.substring(1);
  } else if (cleaned.startsWith('94')) {
    return '+' + cleaned;
  } else if (cleaned.startsWith('+94')) {
    return cleaned;
  }
  
  return phone; // Return original if can't normalize
}
```

### Schema Versioning
```typescript
// Version tracking in documents
interface VersionedDocument {
  _version: number;
  _lastMigration?: string;
  // ... other fields
}

// Migration runner
export class MigrationRunner {
  private migrations = [
    { version: 1, name: 'add_customer_summary', fn: migrateCustomerSummary },
    { version: 2, name: 'normalize_phone_numbers', fn: normalizePhoneNumbers },
    // Add more migrations here
  ];
  
  async runMigrations() {
    for (const migration of this.migrations) {
      const migrationDoc = await db.collection('_migrations').doc(migration.name).get();
      
      if (!migrationDoc.exists) {
        console.log(`Running migration: ${migration.name}`);
        await migration.fn();
        
        await db.collection('_migrations').doc(migration.name).set({
          version: migration.version,
          name: migration.name,
          completedAt: new Date(),
        });
        
        console.log(`Completed migration: ${migration.name}`);
      }
    }
  }
}
```

## Backup and Recovery

### Automated Backup Strategy
```typescript
// Cloud Function for automated backups
export const createBackup = functions.pubsub
  .schedule('0 2 * * *') // Daily at 2 AM
  .timeZone('Asia/Colombo')
  .onRun(async (context) => {
    const timestamp = new Date().toISOString().split('T')[0];
    const outputUriPrefix = `gs://your-backup-bucket/firestore-backup-${timestamp}`;
    
    try {
      await admin.firestore().export({
        collectionIds: ['users', 'customers', 'loans', 'payments', 'settings'],
        outputUriPrefix,
      });
      
      console.log(`Backup completed: ${outputUriPrefix}`);
      
      // Clean up old backups (keep last 30 days)
      await cleanupOldBackups();
    } catch (error) {
      console.error('Backup failed:', error);
      throw error;
    }
  });

// Backup restoration utility
export async function restoreFromBackup(backupPath: string) {
  try {
    await admin.firestore().import({
      inputUriPrefix: backupPath,
      collectionIds: ['users', 'customers', 'loans', 'payments', 'settings'],
    });
    
    console.log('Restore completed successfully');
  } catch (error) {
    console.error('Restore failed:', error);
    throw error;
  }
}
```

### Point-in-Time Recovery
```typescript
// Export specific collection at timestamp
export async function exportCollectionAtTime(
  collectionId: string,
  timestamp: Date
) {
  const outputUriPrefix = `gs://your-backup-bucket/point-in-time-${collectionId}-${timestamp.toISOString()}`;
  
  await admin.firestore().export({
    collectionIds: [collectionId],
    outputUriPrefix,
    // Note: Firestore doesn't support point-in-time exports directly
    // This would need to be implemented through application-level versioning
  });
}
```

This comprehensive database design provides a solid foundation for the micro-lending management system with proper schema design, indexing, performance optimization, and migration strategies.