# Development Guide

Complete step-by-step development process for the Digital Micro-Lending Management System.

## Table of Contents
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Feature Development](#feature-development)
- [Code Standards](#code-standards)
- [Testing Strategy](#testing-strategy)
- [Performance Guidelines](#performance-guidelines)
- [Security Implementation](#security-implementation)
- [Internationalization](#internationalization)

## Development Workflow

### 1. Environment Setup
```bash
# Clone repository
git clone https://github.com/Rnilash/micro-lending-system.git
cd micro-lending-system

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Configure Firebase credentials in .env.local

# Start development server
npm run dev
```

### 2. Git Workflow
```bash
# Create feature branch
git checkout -b feature/customer-management

# Make changes and commit
git add .
git commit -m "feat: implement customer search functionality"

# Push and create PR
git push origin feature/customer-management
```

### 3. Code Review Process
1. **Self Review**: Check code quality, tests, and documentation
2. **Automated Checks**: Ensure all CI checks pass
3. **Peer Review**: Request review from team member
4. **Testing**: Verify functionality in development environment
5. **Merge**: Merge to main branch after approval

## Project Structure

### Recommended Directory Structure
```
src/
├── components/              # Reusable UI components
│   ├── ui/                 # Basic UI elements
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── Table.tsx
│   ├── forms/              # Form components
│   │   ├── CustomerForm.tsx
│   │   ├── LoanForm.tsx
│   │   └── PaymentForm.tsx
│   ├── layout/             # Layout components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Layout.tsx
│   └── charts/             # Chart components
│       ├── LineChart.tsx
│       ├── BarChart.tsx
│       └── PieChart.tsx
├── pages/                  # Next.js pages
│   ├── admin/              # Admin pages
│   │   ├── dashboard.tsx
│   │   ├── customers/
│   │   ├── loans/
│   │   └── reports/
│   ├── agent/              # Agent pages
│   │   ├── dashboard.tsx
│   │   ├── collections.tsx
│   │   └── customers.tsx
│   └── api/                # API routes
│       ├── auth/
│       ├── customers/
│       ├── loans/
│       └── payments/
├── hooks/                  # Custom React hooks
│   ├── useAuth.ts
│   ├── useCustomers.ts
│   ├── useLoans.ts
│   └── usePayments.ts
├── services/               # Business logic services
│   ├── customerService.ts
│   ├── loanService.ts
│   ├── paymentService.ts
│   └── reportService.ts
├── lib/                    # Utility libraries
│   ├── firebase.ts
│   ├── auth.ts
│   ├── utils.ts
│   └── validations.ts
├── types/                  # TypeScript definitions
│   ├── index.ts
│   ├── customer.ts
│   ├── loan.ts
│   └── payment.ts
├── styles/                 # Global styles
│   ├── globals.css
│   └── components.css
└── locales/                # Translation files
    ├── si/
    └── en/
```

## Feature Development

### 1. Customer Management Feature

#### Step 1: Define Types
```typescript
// types/customer.ts
export interface Customer {
  id: string;
  customerNumber: string;
  personalInfo: PersonalInfo;
  contactInfo: ContactInfo;
  kycDocuments: KYCDocument[];
  kycStatus: 'pending' | 'approved' | 'rejected';
  status: 'active' | 'inactive' | 'suspended';
  assignedAgent: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  nicNumber: string;
  dateOfBirth: Date;
  gender: 'male' | 'female';
  occupation: string;
  monthlyIncome: number;
}

export interface ContactInfo {
  primaryPhone: string;
  secondaryPhone?: string;
  email?: string;
  address: Address;
}

export interface Address {
  street: string;
  city: string;
  district: string;
  postalCode: string;
}

export interface KYCDocument {
  type: 'nic_front' | 'nic_back' | 'income_proof' | 'address_proof';
  url: string;
  uploadedAt: Date;
  verified: boolean;
}
```

#### Step 2: Create Service Layer
```typescript
// services/customerService.ts
import { db, storage } from '@/lib/firebase';
import { Customer, CreateCustomerData } from '@/types/customer';

export class CustomerService {
  private collection = 'customers';

  async createCustomer(data: CreateCustomerData): Promise<Customer> {
    try {
      // Generate customer number
      const customerNumber = await this.generateCustomerNumber();
      
      // Prepare customer data
      const customerData = {
        ...data,
        customerNumber,
        kycStatus: 'pending' as const,
        status: 'active' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save to Firestore
      const docRef = await db.collection(this.collection).add(customerData);
      
      return {
        id: docRef.id,
        ...customerData,
      };
    } catch (error) {
      throw new Error(`Failed to create customer: ${error.message}`);
    }
  }

  async getCustomer(id: string): Promise<Customer | null> {
    try {
      const doc = await db.collection(this.collection).doc(id).get();
      
      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data(),
      } as Customer;
    } catch (error) {
      throw new Error(`Failed to get customer: ${error.message}`);
    }
  }

  async searchCustomers(query: string, filters?: CustomerFilters): Promise<Customer[]> {
    try {
      let firestoreQuery = db.collection(this.collection);

      // Apply filters
      if (filters?.status) {
        firestoreQuery = firestoreQuery.where('status', '==', filters.status);
      }

      if (filters?.assignedAgent) {
        firestoreQuery = firestoreQuery.where('assignedAgent', '==', filters.assignedAgent);
      }

      // Execute query
      const snapshot = await firestoreQuery.get();
      const customers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Customer[];

      // Client-side filtering for text search
      if (query) {
        return customers.filter(customer => 
          customer.personalInfo.firstName.toLowerCase().includes(query.toLowerCase()) ||
          customer.personalInfo.lastName.toLowerCase().includes(query.toLowerCase()) ||
          customer.personalInfo.nicNumber.includes(query) ||
          customer.contactInfo.primaryPhone.includes(query)
        );
      }

      return customers;
    } catch (error) {
      throw new Error(`Failed to search customers: ${error.message}`);
    }
  }

  private async generateCustomerNumber(): Promise<string> {
    const prefix = 'CUST';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }
}

export const customerService = new CustomerService();
```

#### Step 3: Create React Hook
```typescript
// hooks/useCustomers.ts
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '@/services/customerService';
import { Customer, CreateCustomerData, CustomerFilters } from '@/types/customer';

export function useCustomers(filters?: CustomerFilters) {
  return useQuery({
    queryKey: ['customers', filters],
    queryFn: () => customerService.getCustomers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => customerService.getCustomer(id),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomerData) => customerService.createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useSearchCustomers() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<CustomerFilters>({});

  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers', 'search', query, filters],
    queryFn: () => customerService.searchCustomers(query, filters),
    enabled: query.length > 0 || Object.keys(filters).length > 0,
  });

  return {
    customers: customers || [],
    isLoading,
    query,
    setQuery,
    filters,
    setFilters,
  };
}
```

#### Step 4: Create UI Components
```typescript
// components/forms/CustomerForm.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerSchema } from '@/lib/validations';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { CreateCustomerData } from '@/types/customer';

interface CustomerFormProps {
  onSubmit: (data: CreateCustomerData) => void;
  isLoading?: boolean;
  initialData?: Partial<CreateCustomerData>;
}

export function CustomerForm({ onSubmit, isLoading, initialData }: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CreateCustomerData>({
    resolver: zodResolver(customerSchema),
    defaultValues: initialData,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Personal Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="First Name"
            {...register('personalInfo.firstName')}
            error={errors.personalInfo?.firstName?.message}
            placeholder="Enter first name"
          />
          
          <Input
            label="Last Name"
            {...register('personalInfo.lastName')}
            error={errors.personalInfo?.lastName?.message}
            placeholder="Enter last name"
          />
          
          <Input
            label="NIC Number"
            {...register('personalInfo.nicNumber')}
            error={errors.personalInfo?.nicNumber?.message}
            placeholder="199012345678"
          />
          
          <Input
            label="Date of Birth"
            type="date"
            {...register('personalInfo.dateOfBirth')}
            error={errors.personalInfo?.dateOfBirth?.message}
          />
          
          <Select
            label="Gender"
            {...register('personalInfo.gender')}
            error={errors.personalInfo?.gender?.message}
            options={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
            ]}
          />
          
          <Input
            label="Occupation"
            {...register('personalInfo.occupation')}
            error={errors.personalInfo?.occupation?.message}
            placeholder="Teacher, Business, etc."
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Primary Phone"
            {...register('contactInfo.primaryPhone')}
            error={errors.contactInfo?.primaryPhone?.message}
            placeholder="+94 77 123 4567"
          />
          
          <Input
            label="Secondary Phone"
            {...register('contactInfo.secondaryPhone')}
            error={errors.contactInfo?.secondaryPhone?.message}
            placeholder="+94 11 234 5678"
          />
          
          <Input
            label="Email"
            type="email"
            {...register('contactInfo.email')}
            error={errors.contactInfo?.email?.message}
            placeholder="customer@email.com"
          />
          
          <div className="md:col-span-2">
            <Input
              label="Street Address"
              {...register('contactInfo.address.street')}
              error={errors.contactInfo?.address?.street?.message}
              placeholder="123 Main Street"
            />
          </div>
          
          <Input
            label="City"
            {...register('contactInfo.address.city')}
            error={errors.contactInfo?.address?.city?.message}
            placeholder="Colombo"
          />
          
          <Input
            label="District"
            {...register('contactInfo.address.district')}
            error={errors.contactInfo?.address?.district?.message}
            placeholder="Colombo"
          />
          
          <Input
            label="Postal Code"
            {...register('contactInfo.address.postalCode')}
            error={errors.contactInfo?.address?.postalCode?.message}
            placeholder="00100"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit" loading={isLoading}>
          Create Customer
        </Button>
      </div>
    </form>
  );
}
```

### 2. Loan Management Feature

#### Step 1: Define Loan Types
```typescript
// types/loan.ts
export interface Loan {
  id: string;
  loanNumber: string;
  customerId: string;
  amount: number;
  interestRate: number;
  calculationMethod: 'flat' | 'reducing';
  loanTerm: number; // weeks
  installmentAmount: number;
  totalAmount: number;
  totalInstallments: number;
  paidInstallments: number;
  remainingInstallments: number;
  outstandingBalance: number;
  status: 'pending' | 'approved' | 'active' | 'completed' | 'defaulted';
  purpose: string;
  guarantor?: Guarantor;
  startDate?: Date;
  endDate?: Date;
  nextPaymentDate?: Date;
  createdBy: string;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Guarantor {
  name: string;
  nicNumber: string;
  relationship: string;
  phone: string;
  address: string;
}

export interface LoanCalculation {
  principal: number;
  interestRate: number;
  term: number;
  installmentAmount: number;
  totalAmount: number;
  totalInterest: number;
  schedule: InstallmentSchedule[];
}

export interface InstallmentSchedule {
  installmentNumber: number;
  dueDate: Date;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  balance: number;
}
```

#### Step 2: Create Loan Service
```typescript
// services/loanService.ts
export class LoanService {
  async calculateLoan(data: LoanCalculationInput): Promise<LoanCalculation> {
    const { principal, interestRate, term, calculationMethod } = data;
    
    if (calculationMethod === 'flat') {
      return this.calculateFlatRate(principal, interestRate, term);
    } else {
      return this.calculateReducingBalance(principal, interestRate, term);
    }
  }

  private calculateReducingBalance(
    principal: number,
    annualRate: number,
    weeks: number
  ): LoanCalculation {
    const weeklyRate = annualRate / 100 / 52;
    const installmentAmount = 
      principal * weeklyRate * Math.pow(1 + weeklyRate, weeks) /
      (Math.pow(1 + weeklyRate, weeks) - 1);

    const schedule: InstallmentSchedule[] = [];
    let balance = principal;

    for (let i = 1; i <= weeks; i++) {
      const interestAmount = balance * weeklyRate;
      const principalAmount = installmentAmount - interestAmount;
      balance -= principalAmount;

      schedule.push({
        installmentNumber: i,
        dueDate: this.calculateDueDate(i),
        principalAmount,
        interestAmount,
        totalAmount: installmentAmount,
        balance: Math.max(0, balance),
      });
    }

    return {
      principal,
      interestRate: annualRate,
      term: weeks,
      installmentAmount,
      totalAmount: installmentAmount * weeks,
      totalInterest: (installmentAmount * weeks) - principal,
      schedule,
    };
  }

  private calculateFlatRate(
    principal: number,
    annualRate: number,
    weeks: number
  ): LoanCalculation {
    const totalInterest = principal * (annualRate / 100) * (weeks / 52);
    const totalAmount = principal + totalInterest;
    const installmentAmount = totalAmount / weeks;

    const schedule: InstallmentSchedule[] = [];
    const principalPerInstallment = principal / weeks;
    const interestPerInstallment = totalInterest / weeks;

    for (let i = 1; i <= weeks; i++) {
      schedule.push({
        installmentNumber: i,
        dueDate: this.calculateDueDate(i),
        principalAmount: principalPerInstallment,
        interestAmount: interestPerInstallment,
        totalAmount: installmentAmount,
        balance: principal - (principalPerInstallment * i),
      });
    }

    return {
      principal,
      interestRate: annualRate,
      term: weeks,
      installmentAmount,
      totalAmount,
      totalInterest,
      schedule,
    };
  }

  private calculateDueDate(installmentNumber: number): Date {
    const now = new Date();
    now.setDate(now.getDate() + (installmentNumber * 7));
    return now;
  }
}
```

### 3. Payment Processing Feature

#### Payment Service Implementation
```typescript
// services/paymentService.ts
export class PaymentService {
  async recordPayment(data: CreatePaymentData): Promise<Payment> {
    try {
      // Validate payment data
      await this.validatePayment(data);

      // Calculate payment breakdown
      const breakdown = await this.calculatePaymentBreakdown(data);

      // Create payment record
      const payment = await this.createPaymentRecord({
        ...data,
        ...breakdown,
        receiptNumber: await this.generateReceiptNumber(),
        createdAt: new Date(),
      });

      // Update loan balance
      await this.updateLoanBalance(data.loanId, breakdown);

      // Generate receipt
      await this.generateReceipt(payment);

      return payment;
    } catch (error) {
      throw new Error(`Failed to record payment: ${error.message}`);
    }
  }

  private async validatePayment(data: CreatePaymentData): Promise<void> {
    // Check if loan exists and is active
    const loan = await loanService.getLoan(data.loanId);
    if (!loan || loan.status !== 'active') {
      throw new Error('Loan not found or not active');
    }

    // Check for duplicate payments
    const existingPayment = await this.getPaymentByDateAndLoan(
      data.loanId,
      data.paymentDate
    );
    if (existingPayment) {
      throw new Error('Payment already recorded for this date');
    }

    // Validate payment amount
    if (data.amount <= 0) {
      throw new Error('Payment amount must be greater than zero');
    }
  }

  private async calculatePaymentBreakdown(
    data: CreatePaymentData
  ): Promise<PaymentBreakdown> {
    const loan = await loanService.getLoan(data.loanId);
    const schedule = await loanService.getInstallmentSchedule(data.loanId);
    
    // Find current installment
    const currentInstallment = schedule.find(
      s => s.installmentNumber === data.installmentNumber
    );

    if (!currentInstallment) {
      throw new Error('Invalid installment number');
    }

    return {
      principalAmount: currentInstallment.principalAmount,
      interestAmount: currentInstallment.interestAmount,
      penaltyAmount: this.calculatePenalty(data, currentInstallment),
    };
  }
}
```

## Code Standards

### TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/pages/*": ["./src/pages/*"],
      "@/styles/*": ["./src/styles/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/types/*": ["./src/types/*"],
      "@/services/*": ["./src/services/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### ESLint Configuration
```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-non-null-assertion": "warn",
    "prefer-const": "error",
    "no-var": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "react-hooks/exhaustive-deps": "warn",
    "react/jsx-curly-brace-presence": ["error", "never"],
    "react/self-closing-comp": "error"
  }
}
```

### Naming Conventions
```typescript
// File naming
CustomerForm.tsx          // PascalCase for components
customerService.ts        // camelCase for services
customer.types.ts         // lowercase with dots

// Variable naming
const customerData = {}   // camelCase
const FIREBASE_CONFIG = {}// UPPER_SNAKE_CASE for constants
const CustomersTable = () => {} // PascalCase for components

// Function naming
function createCustomer() {}     // camelCase
function calculateLoanAmount() {} // camelCase
const handleSubmit = () => {}    // camelCase
```

## Testing Strategy

### Unit Testing with Jest
```typescript
// __tests__/services/customerService.test.ts
import { customerService } from '@/services/customerService';
import { mockCustomerData } from '@/tests/mocks';

describe('CustomerService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCustomer', () => {
    it('should create a customer successfully', async () => {
      const customerData = mockCustomerData();
      const result = await customerService.createCustomer(customerData);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('customerNumber');
      expect(result.personalInfo.firstName).toBe(customerData.personalInfo.firstName);
    });

    it('should throw error for invalid data', async () => {
      const invalidData = { ...mockCustomerData(), personalInfo: {} };
      
      await expect(customerService.createCustomer(invalidData))
        .rejects.toThrow('Invalid customer data');
    });
  });

  describe('searchCustomers', () => {
    it('should return filtered customers', async () => {
      const query = 'kasun';
      const results = await customerService.searchCustomers(query);

      expect(results).toBeInstanceOf(Array);
      results.forEach(customer => {
        expect(
          customer.personalInfo.firstName.toLowerCase().includes(query) ||
          customer.personalInfo.lastName.toLowerCase().includes(query)
        ).toBe(true);
      });
    });
  });
});
```

### Component Testing
```typescript
// __tests__/components/CustomerForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CustomerForm } from '@/components/forms/CustomerForm';

describe('CustomerForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('should render all form fields', () => {
    render(<CustomerForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nic number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    render(<CustomerForm onSubmit={mockOnSubmit} />);

    fireEvent.click(screen.getByText(/create customer/i));

    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should submit form with valid data', async () => {
    render(<CustomerForm onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: 'Kasun' }
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: 'Perera' }
    });
    
    fireEvent.click(screen.getByText(/create customer/i));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          personalInfo: expect.objectContaining({
            firstName: 'Kasun',
            lastName: 'Perera'
          })
        })
      );
    });
  });
});
```

## Performance Guidelines

### Code Splitting
```typescript
// pages/admin/customers/index.tsx
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Lazy load heavy components
const CustomerTable = dynamic(() => import('@/components/CustomerTable'), {
  loading: () => <TableSkeleton />,
  ssr: false
});

const CustomersPage = () => {
  return (
    <div>
      <h1>Customers</h1>
      <Suspense fallback={<PageSkeleton />}>
        <CustomerTable />
      </Suspense>
    </div>
  );
};
```

### Image Optimization
```typescript
// components/CustomerPhoto.tsx
import Image from 'next/image';

interface CustomerPhotoProps {
  src: string;
  alt: string;
  size?: number;
}

export function CustomerPhoto({ src, alt, size = 100 }: CustomerPhotoProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="rounded-full object-cover"
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
      priority={false}
    />
  );
}
```

### Database Query Optimization
```typescript
// hooks/useCustomers.ts
export function useCustomers(filters?: CustomerFilters) {
  return useQuery({
    queryKey: ['customers', filters],
    queryFn: async () => {
      // Use indexes for better performance
      let query = db.collection('customers');
      
      if (filters?.status) {
        query = query.where('status', '==', filters.status);
      }
      
      if (filters?.assignedAgent) {
        query = query.where('assignedAgent', '==', filters.assignedAgent);
      }
      
      // Limit results and use pagination
      query = query.limit(20);
      
      return query.get();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
}
```

## Security Implementation

### Input Validation
```typescript
// lib/validations.ts
import { z } from 'zod';

export const customerSchema = z.object({
  personalInfo: z.object({
    firstName: z.string().min(1, 'First name is required').max(50),
    lastName: z.string().min(1, 'Last name is required').max(50),
    nicNumber: z.string().regex(/^\d{9}[vVxX]|\d{12}$/, 'Invalid NIC format'),
    dateOfBirth: z.date().max(new Date(), 'Date cannot be in future'),
    gender: z.enum(['male', 'female']),
    occupation: z.string().min(1, 'Occupation is required'),
    monthlyIncome: z.number().positive('Income must be positive'),
  }),
  contactInfo: z.object({
    primaryPhone: z.string().regex(/^\+94\d{9}$/, 'Invalid phone format'),
    secondaryPhone: z.string().regex(/^\+94\d{9}$/, 'Invalid phone format').optional(),
    email: z.string().email('Invalid email format').optional(),
    address: z.object({
      street: z.string().min(1, 'Street address is required'),
      city: z.string().min(1, 'City is required'),
      district: z.string().min(1, 'District is required'),
      postalCode: z.string().regex(/^\d{5}$/, 'Invalid postal code'),
    }),
  }),
});

export const loanSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  amount: z.number().min(1000, 'Minimum loan amount is Rs. 1,000').max(1000000, 'Maximum loan amount is Rs. 1,000,000'),
  interestRate: z.number().min(1, 'Minimum interest rate is 1%').max(30, 'Maximum interest rate is 30%'),
  loanTerm: z.number().min(4, 'Minimum term is 4 weeks').max(104, 'Maximum term is 104 weeks'),
  purpose: z.string().min(1, 'Loan purpose is required'),
});
```

### API Route Protection
```typescript
// lib/auth.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from 'firebase-admin/auth';

export async function withAuth(
  handler: (req: NextApiRequest, res: NextApiResponse, user: any) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const decodedToken = await getAuth().verifyIdToken(token);
      const user = await getUserById(decodedToken.uid);

      return handler(req, res, user);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}

export function withRole(roles: string[]) {
  return (handler: Function) => {
    return withAuth(async (req, res, user) => {
      if (!roles.includes(user.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      
      return handler(req, res, user);
    });
  };
}

// Usage in API routes
// pages/api/customers/index.ts
export default withRole(['admin', 'agent'])(async (req, res, user) => {
  if (req.method === 'POST') {
    // Create customer logic
  } else if (req.method === 'GET') {
    // Get customers logic
  }
});
```

## Internationalization

### Setting up i18next
```typescript
// lib/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-fs-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: 'si',
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false,
    },
    
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
```

### Translation Files
```json
// locales/si/common.json
{
  "navigation": {
    "dashboard": "උපකරණ පුවරුව",
    "customers": "ගනුදෙනුකරුවන්",
    "loans": "ණය",
    "payments": "ගෙවීම්",
    "reports": "වාර්තා"
  },
  "buttons": {
    "save": "සුරකින්න",
    "cancel": "අවලංගු කරන්න",
    "edit": "සංස්කරණය කරන්න",
    "delete": "මකන්න",
    "create": "නිර්මාණය කරන්න"
  },
  "forms": {
    "firstName": "මුල් නම",
    "lastName": "අවසාන නම",
    "nicNumber": "ජාතික හැඳුනුම්පත් අංකය",
    "phoneNumber": "දුරකථන අංකය",
    "address": "ලිපිනය"
  }
}
```

### Using Translations in Components
```typescript
// components/CustomerForm.tsx
import { useTranslation } from 'react-i18next';

export function CustomerForm() {
  const { t } = useTranslation('common');

  return (
    <form>
      <Input
        label={t('forms.firstName')}
        placeholder={t('forms.firstName')}
        // ...
      />
      
      <Button type="submit">
        {t('buttons.save')}
      </Button>
    </form>
  );
}
```

This development guide provides a comprehensive framework for building the micro-lending management system with best practices, proper architecture, and maintainable code.