# API Routes Examples

This directory contains Next.js API route implementations for the micro-lending system backend.

## Route Categories

### 1. Authentication (`/auth`)
- `login.ts` - User authentication endpoint
- `logout.ts` - Session termination
- `refresh.ts` - Token refresh endpoint
- `register.ts` - User registration
- `verify.ts` - Email/phone verification

### 2. Customer Management (`/customers`)
- `index.ts` - List and create customers
- `[id].ts` - Get, update, delete customer
- `search.ts` - Customer search functionality
- `export.ts` - Customer data export

### 3. Loan Management (`/loans`)
- `index.ts` - List and create loans
- `[id].ts` - Get, update, delete loan
- `calculate.ts` - Loan calculation endpoint
- `schedule.ts` - Payment schedule generation

### 4. Payment Processing (`/payments`)
- `index.ts` - List and record payments
- `[id].ts` - Get payment details
- `collect.ts` - Payment collection endpoint
- `verify.ts` - Payment verification
- `receipt.ts` - Receipt generation

### 5. Reporting (`/reports`)
- `dashboard.ts` - Dashboard metrics
- `collections.ts` - Collection reports
- `defaulters.ts` - Defaulter analysis
- `financial.ts` - Financial summaries

### 6. Administration (`/admin`)
- `users.ts` - User management
- `settings.ts` - System configuration
- `backup.ts` - Data backup endpoints
- `audit.ts` - Audit log access

## API Standards

### Response Format
```typescript
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### Error Handling
- Consistent error responses across all endpoints
- Proper HTTP status codes
- Bilingual error messages
- Request validation with Zod schemas

### Security
- JWT token validation
- Role-based access control
- Input sanitization
- Rate limiting
- CORS configuration

### Performance
- Database query optimization
- Response caching where appropriate
- Pagination for large datasets
- Gzip compression