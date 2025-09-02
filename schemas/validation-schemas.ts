import { z } from 'zod';

/**
 * Zod Validation Schemas for Micro-Lending System
 * 
 * Comprehensive validation schemas for all form inputs,
 * API requests, and data transformations with proper
 * error messages in both Sinhala and English.
 */

// ================================
// Base Validation Schemas
// ================================

export const bilingualTextSchema = z.object({
  sinhala: z.string().min(1, 'Sinhala text is required / සිංහල පෙළ අවශ්‍යයි'),
  english: z.string().min(1, 'English text is required / ඉංග්‍රීසි පෙළ අවශ්‍යයි')
});

export const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional()
});

export const phoneSchema = z.string()
  .regex(/^[0-9]{10}$/, 'Phone number must be 10 digits / දුරකථන අංකය ඉලක්කම් 10 ක් විය යුතුයි')
  .transform(phone => phone.replace(/\D/g, ''));

export const nicSchema = z.string()
  .regex(
    /^([0-9]{9}[vVxX]|[0-9]{12})$/, 
    'Invalid NIC format. Use 123456789V or 123456789012 / වලංගු නොවන ජාතික හැඳුනුම්පත් ආකෘතිය'
  )
  .transform(nic => nic.toUpperCase());

export const currencySchema = z.number()
  .min(0, 'Amount cannot be negative / මුදල සෘණ විය නොහැක')
  .max(10000000, 'Amount too large / මුදල ඉතා විශාලයි');

export const percentageSchema = z.number()
  .min(0, 'Percentage cannot be negative / ප්‍රතිශතය සෘණ විය නොහැක')
  .max(100, 'Percentage cannot exceed 100% / ප්‍රතිශතය 100% ඉක්මවා යා නොහැක');

// ================================
// User Management Schemas
// ================================

export const userRoleSchema = z.enum(['admin', 'agent', 'customer']);
export const userStatusSchema = z.enum(['active', 'inactive', 'suspended']);

export const createUserSchema = z.object({
  email: z.string()
    .email('Invalid email format / වලංගු නොවන ඊමේල් ආකෘතිය'),
  phone: phoneSchema.optional(),
  name: bilingualTextSchema,
  role: userRoleSchema,
  password: z.string()
    .min(8, 'Password must be at least 8 characters / මුරපදය අවම වශයෙන් අකුරු 8 ක් විය යුතුයි')
    .regex(/(?=.*[a-z])/, 'Password must contain lowercase letter / මුරපදයේ කුඩා අකුරු තිබිය යුතුයි')
    .regex(/(?=.*[A-Z])/, 'Password must contain uppercase letter / මුරපදයේ ලොකු අකුරු තිබිය යුතුයි')
    .regex(/(?=.*\d)/, 'Password must contain number / මුරපදයේ අංක තිබිය යුතුයි'),
  agentCode: z.string().optional(),
  assignedArea: z.string().optional()
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true });

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password required / වර්තමාන මුරපදය අවශ්‍යයි'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters / මුරපදය අවම වශයෙන් අකුරු 8 ක් විය යුතුයි')
    .regex(/(?=.*[a-z])/, 'Password must contain lowercase letter / මුරපදයේ කුඩා අකුරු තිබිය යුතුයි')
    .regex(/(?=.*[A-Z])/, 'Password must contain uppercase letter / මුරපදයේ ලොකු අකුරු තිබිය යුතුයි')
    .regex(/(?=.*\d)/, 'Password must contain number / මුරපදයේ අංක තිබිය යුතුයි'),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match / මුරපද නොගැලපේ',
  path: ['confirmPassword']
});

// ================================
// Authentication Schemas
// ================================

export const loginSchema = z.object({
  email: z.string()
    .email('Invalid email format / වලංගු නොවන ඊමේල් ආකෘතිය'),
  password: z.string()
    .min(1, 'Password required / මුරපදය අවශ්‍යයි'),
  userType: z.enum(['admin', 'agent']).optional()
});

export const phoneLoginSchema = z.object({
  phone: phoneSchema,
  verificationCode: z.string()
    .length(6, 'Verification code must be 6 digits / සත්‍යාපන කේතය ඉලක්කම් 6 ක් විය යුතුයි')
    .regex(/^[0-9]+$/, 'Verification code must contain only numbers / සත්‍යාපන කේතයේ අංක පමණක් තිබිය යුතුයි')
});

export const forgotPasswordSchema = z.object({
  email: z.string()
    .email('Invalid email format / වලංගු නොවන ඊමේල් ආකෘතිය')
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token required / නැවත සැකසීමේ ටෝකනය අවශ්‍යයි'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters / මුරපදය අවම වශයෙන් අකුරු 8 ක් විය යුතුයි')
    .regex(/(?=.*[a-z])/, 'Password must contain lowercase letter / මුරපදයේ කුඩා අකුරු තිබිය යුතුයි')
    .regex(/(?=.*[A-Z])/, 'Password must contain uppercase letter / මුරපදයේ ලොකු අකුරු තිබිය යුතුයි')
    .regex(/(?=.*\d)/, 'Password must contain number / මුරපදයේ අංක තිබිය යුතුයි'),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match / මුරපද නොගැලපේ',
  path: ['confirmPassword']
});

// ================================
// Customer Management Schemas
// ================================

export const customerStatusSchema = z.enum(['active', 'inactive', 'defaulted', 'closed']);
export const riskLevelSchema = z.enum(['low', 'medium', 'high', 'critical']);

export const customerSchema = z.object({
  name: bilingualTextSchema,
  phone: phoneSchema,
  alternatePhone: phoneSchema.optional(),
  address: bilingualTextSchema,
  nic: nicSchema,
  dateOfBirth: z.date().optional(),
  occupation: z.string().optional(),
  monthlyIncome: currencySchema.optional(),
  
  emergencyContact: z.object({
    name: z.string().min(1, 'Emergency contact name required / හදිසි සම්බන්ධතා නම අවශ්‍යයි'),
    phone: phoneSchema,
    relationship: z.string().min(1, 'Relationship required / සම්බන්ධතාව අවශ්‍යයි')
  }).optional(),
  
  guarantor: z.object({
    name: z.string().min(1, 'Guarantor name required / ප්‍රතිභූ නම අවශ්‍යයි'),
    phone: phoneSchema,
    address: z.string().min(1, 'Guarantor address required / ප්‍රතිභූ ලිපිනය අවශ්‍යයි'),
    nic: nicSchema,
    relationship: z.string().min(1, 'Relationship required / සම්බන්ධතාව අවශ්‍යයි')
  }).optional(),
  
  homeLocation: locationSchema.optional(),
  workLocation: locationSchema.optional(),
  
  assignedAgent: z.string().min(1, 'Assigned agent required / වර්ගීකරණ ඒජන්ත අවශ්‍යයි'),
  initialLoanAmount: currencySchema.min(1000, 'Minimum loan amount is LKR 1,000 / අවම ණය මුදල රු. 1,000').optional(),
  
  notes: bilingualTextSchema.optional(),
  tags: z.array(z.string()).optional()
});

export const updateCustomerSchema = customerSchema.partial();

export const customerSearchSchema = z.object({
  search: z.string().optional(),
  status: customerStatusSchema.optional(),
  riskLevel: riskLevelSchema.optional(),
  assignedAgent: z.string().optional(),
  hasActiveLoans: z.boolean().optional(),
  isOverdue: z.boolean().optional(),
  createdAfter: z.date().optional(),
  createdBefore: z.date().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['name', 'createdAt', 'lastPayment', 'outstandingAmount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// ================================
// Loan Management Schemas
// ================================

export const loanStatusSchema = z.enum(['pending', 'active', 'completed', 'defaulted', 'closed']);
export const loanTypeSchema = z.enum(['personal', 'business', 'emergency', 'education']);
export const interestTypeSchema = z.enum(['simple', 'compound']);

export const loanSchema = z.object({
  customerId: z.string().min(1, 'Customer ID required / ගනුම්කරු හැඳුනුම අවශ්‍යයි'),
  principal: currencySchema
    .min(1000, 'Minimum loan amount is LKR 1,000 / අවම ණය මුදල රු. 1,000')
    .max(5000000, 'Maximum loan amount is LKR 5,000,000 / උපරිම ණය මුදල රු. 5,000,000'),
  interestRate: z.number()
    .min(1, 'Interest rate must be at least 1% / පොලී අනුපාතය අවම වශයෙන් 1% විය යුතුයි')
    .max(50, 'Interest rate cannot exceed 50% / පොලී අනුපාතය 50% ඉක්මවා යා නොහැක'),
  duration: z.number()
    .min(1, 'Duration must be at least 1 week / කාලසීමාව අවම වශයෙන් සති 1 ක් විය යුතුයි')
    .max(52, 'Duration cannot exceed 52 weeks / කාලසීමාව සති 52 ඉක්මවා යා නොහැක'),
  interestType: interestTypeSchema.default('simple'),
  loanType: loanTypeSchema.default('personal'),
  startDate: z.date(),
  
  purpose: bilingualTextSchema.optional(),
  terms: bilingualTextSchema.optional(),
  collateralValue: currencySchema.optional(),
  collateralDescription: z.string().optional(),
  assignedAgent: z.string().min(1, 'Assigned agent required / වර්ගීකරණ ඒජන්ත අවශ්‍යයි'),
  
  notes: z.string().optional(),
  attachments: z.array(z.string()).optional()
});

export const updateLoanSchema = loanSchema.partial().omit({ customerId: true });

export const loanCalculationSchema = z.object({
  principal: currencySchema
    .min(1000, 'Minimum loan amount is LKR 1,000 / අවම ණය මුදල රු. 1,000'),
  interestRate: z.number()
    .min(1, 'Interest rate must be at least 1% / පොලී අනුපාතය අවම වශයෙන් 1% විය යුතුයි')
    .max(50, 'Interest rate cannot exceed 50% / පොලී අනුපාතය 50% ඉක්මවා යා නොහැක'),
  duration: z.number()
    .min(1, 'Duration must be at least 1 week / කාලසීමාව අවම වශයෙන් සති 1 ක් විය යුතුයි')
    .max(52, 'Duration cannot exceed 52 weeks / කාලසීමාව සති 52 ඉක්මවා යා නොහැක'),
  interestType: interestTypeSchema.default('simple')
});

export const loanApprovalSchema = z.object({
  loanId: z.string().min(1, 'Loan ID required / ණය හැඳුනුම අවශ්‍යයි'),
  approved: z.boolean(),
  approvalNotes: z.string().optional(),
  modifiedTerms: z.object({
    principal: currencySchema.optional(),
    interestRate: z.number().optional(),
    duration: z.number().optional()
  }).optional()
});

// ================================
// Payment Management Schemas
// ================================

export const paymentStatusSchema = z.enum(['pending', 'completed', 'failed', 'cancelled']);
export const paymentMethodSchema = z.enum(['cash', 'bank_transfer', 'mobile_money', 'cheque']);
export const paymentTypeSchema = z.enum(['regular', 'partial', 'advance', 'penalty', 'settlement']);

export const paymentSchema = z.object({
  customerId: z.string().min(1, 'Customer ID required / ගනුම්කරු හැඳුනුම අවශ්‍යයි'),
  loanId: z.string().min(1, 'Loan ID required / ණය හැඳුනුම අවශ්‍යයි'),
  amount: currencySchema
    .min(1, 'Payment amount must be greater than zero / ගෙවීම් මුදල ශුන්‍යයට වඩා විශාල විය යුතුයි'),
  paymentMethod: paymentMethodSchema.default('cash'),
  paymentType: paymentTypeSchema.default('regular'),
  
  collectedAt: z.date(),
  location: locationSchema.optional(),
  
  notes: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  
  // For digital payments
  transactionId: z.string().optional(),
  referenceNumber: z.string().optional()
});

export const bulkPaymentSchema = z.object({
  payments: z.array(paymentSchema)
    .min(1, 'At least one payment required / අවම වශයෙන් එක් ගෙවීමක් අවශ්‍යයි')
    .max(100, 'Maximum 100 payments allowed / උපරිම ගෙවීම් 100 ක් අනුමතයි'),
  collectedBy: z.string().min(1, 'Collector ID required / එකතුකරන්නාගේ හැඳුනුම අවශ්‍යයි')
});

export const paymentVerificationSchema = z.object({
  paymentId: z.string().min(1, 'Payment ID required / ගෙවීම් හැඳුනුම අවශ්‍යයි'),
  verified: z.boolean(),
  verificationNotes: z.string().optional(),
  adjustedAmount: currencySchema.optional()
});

// ================================
// Reporting and Analytics Schemas
// ================================

export const dateRangeSchema = z.object({
  startDate: z.date(),
  endDate: z.date()
}).refine(data => data.startDate <= data.endDate, {
  message: 'Start date must be before end date / ආරම්භ දිනය අවසන් දිනයට පෙර විය යුතුයි',
  path: ['endDate']
});

export const reportTypeSchema = z.enum([
  'dashboard',
  'collections',
  'defaulters',
  'financial',
  'agent_performance',
  'customer_analysis'
]);

export const reportParametersSchema = z.object({
  type: reportTypeSchema,
  dateRange: dateRangeSchema,
  agentId: z.string().optional(),
  customerId: z.string().optional(),
  format: z.enum(['json', 'csv', 'pdf']).default('json'),
  includeCharts: z.boolean().default(false),
  language: z.enum(['sinhala', 'english', 'both']).default('both')
});

// ================================
// System Configuration Schemas
// ================================

export const systemSettingsSchema = z.object({
  // Interest Configuration
  defaultInterestRate: z.number().min(1).max(50),
  maxInterestRate: z.number().min(1).max(100),
  penaltyRate: z.number().min(0).max(50),
  gracePeriodDays: z.number().min(0).max(30),
  
  // Loan Configuration
  minLoanAmount: currencySchema.min(100),
  maxLoanAmount: currencySchema.min(1000),
  defaultLoanDuration: z.number().min(1).max(52),
  maxLoanDuration: z.number().min(1).max(104),
  
  // Collection Configuration
  collectionDays: z.array(z.number().min(0).max(6)),
  reminderDaysBeforeDue: z.number().min(0).max(7),
  overdueReminderInterval: z.number().min(1).max(30),
  maxCollectionAttempts: z.number().min(1).max(10),
  
  // Agent Configuration
  defaultCommissionRate: percentageSchema,
  maxCustomersPerAgent: z.number().min(1).max(1000),
  
  // System Configuration
  currency: z.string().length(3),
  timezone: z.string(),
  dateFormat: z.string(),
  language: z.enum(['sinhala', 'english', 'both']),
  
  // Business Hours
  businessHours: z.object({
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    workingDays: z.array(z.number().min(0).max(6))
  }),
  
  // Company Information
  companyInfo: z.object({
    name: bilingualTextSchema,
    address: bilingualTextSchema,
    phone: phoneSchema,
    email: z.string().email(),
    website: z.string().url().optional(),
    licenseNumber: z.string().optional()
  })
});

// ================================
// File Upload Schemas
// ================================

export const fileUploadSchema = z.object({
  file: z.any(), // File object from form data
  category: z.enum(['profile', 'document', 'receipt', 'report']),
  description: z.string().optional(),
  isPublic: z.boolean().default(false)
}).refine(data => {
  if (!(data.file instanceof File)) {
    return false;
  }
  
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'text/csv'];
  return allowedTypes.includes(data.file.type);
}, {
  message: 'Invalid file type. Allowed: JPEG, PNG, PDF, CSV / වලංගු නොවන ගොනු වර්ගය',
  path: ['file']
}).refine(data => {
  if (!(data.file instanceof File)) {
    return false;
  }
  
  const maxSize = 5 * 1024 * 1024; // 5MB
  return data.file.size <= maxSize;
}, {
  message: 'File size must be less than 5MB / ගොනු ප්‍රමාණය 5MB ට වඩා අඩු විය යුතුයි',
  path: ['file']
});

// ================================
// Notification Schemas
// ================================

export const notificationTypeSchema = z.enum([
  'payment_due',
  'payment_overdue', 
  'payment_received',
  'loan_approved',
  'system_alert'
]);

export const notificationChannelSchema = z.enum(['sms', 'email', 'push', 'in_app']);

export const notificationSchema = z.object({
  recipientId: z.string().min(1, 'Recipient ID required / ලබන්නාගේ හැඳුනුම අවශ්‍යයි'),
  recipientType: userRoleSchema,
  title: bilingualTextSchema,
  message: bilingualTextSchema,
  type: notificationTypeSchema,
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  channels: z.array(notificationChannelSchema),
  
  relatedEntityType: z.enum(['customer', 'loan', 'payment']).optional(),
  relatedEntityId: z.string().optional(),
  actionUrl: z.string().url().optional(),
  
  scheduledFor: z.date().optional()
});

export const bulkNotificationSchema = z.object({
  recipients: z.array(z.string()).min(1, 'At least one recipient required / අවම වශයෙන් එක් ලබන්නෙකු අවශ්‍යයි'),
  recipientType: userRoleSchema,
  title: bilingualTextSchema,
  message: bilingualTextSchema,
  type: notificationTypeSchema,
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  channels: z.array(notificationChannelSchema),
  
  filterCriteria: z.object({
    status: z.array(z.string()).optional(),
    location: z.string().optional(),
    hasOverduePayments: z.boolean().optional()
  }).optional()
});

// ================================
// Export all schemas
// ================================

export {
  // Re-export commonly used schemas
  phoneSchema,
  nicSchema,
  currencySchema,
  bilingualTextSchema,
  locationSchema
};