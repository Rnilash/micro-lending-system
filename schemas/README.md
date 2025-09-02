# Database Schemas

This directory contains TypeScript interfaces and schemas for the Digital Micro-Lending Management System.

## Directory Structure

```
schemas/
├── types/               # Core type definitions
│   ├── user.ts
│   ├── customer.ts
│   ├── loan.ts
│   ├── payment.ts
│   └── common.ts
├── firestore/           # Firestore collection schemas
│   ├── users.schema.ts
│   ├── customers.schema.ts
│   ├── loans.schema.ts
│   ├── payments.schema.ts
│   └── settings.schema.ts
├── validation/          # Zod validation schemas
│   ├── auth.validation.ts
│   ├── customer.validation.ts
│   ├── loan.validation.ts
│   └── payment.validation.ts
├── api/                 # API request/response types
│   ├── requests.ts
│   ├── responses.ts
│   └── errors.ts
└── security/            # Security rule schemas
    ├── firestore.rules
    └── storage.rules
```

## Usage Guidelines

### Type Definitions
- All interfaces are strongly typed with TypeScript
- Includes optional and required fields
- Supports both input and output types
- Includes computed fields and metadata

### Validation Schemas
- Uses Zod for runtime validation
- Includes custom validators for Sri Lankan formats
- Supports multi-language error messages
- Includes field-level and cross-field validation

### Firestore Schemas
- Matches the database design exactly
- Includes index definitions
- Supports subcollections and references
- Includes audit trail fields

### Security Rules
- Comprehensive Firestore security rules
- Role-based access control
- Field-level permissions
- Data validation rules

## Import Examples

```typescript
// Type definitions
import { Customer, Loan, Payment } from '@/schemas/types';

// Validation schemas
import { customerSchema, loanSchema } from '@/schemas/validation';

// Firestore helpers
import { createCustomer, updateLoan } from '@/schemas/firestore';
```

## Validation Usage

```typescript
import { customerSchema } from '@/schemas/validation/customer.validation';

// Validate customer data
const result = customerSchema.safeParse(customerData);
if (!result.success) {
  console.error('Validation errors:', result.error.issues);
}
```