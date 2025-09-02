# API Documentation

This document provides comprehensive API documentation for the Digital Micro-Lending Management System.

## Table of Contents
- [Authentication](#authentication)
- [Base URL & Headers](#base-url--headers)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication-endpoints)
  - [Users](#users)
  - [Customers](#customers)
  - [Loans](#loans)
  - [Payments](#payments)
  - [Reports](#reports)
  - [Settings](#settings)

## Authentication

The API uses Firebase Authentication with JWT tokens. All protected endpoints require a valid Bearer token.

### Authentication Flow
```typescript
// Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// Response
{
  "success": true,
  "data": {
    "user": {
      "uid": "user123",
      "email": "user@example.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJSUzI1NiIs...",
    "refreshToken": "refreshTokenHere"
  }
}
```

### Token Usage
```typescript
// Include token in all requests
headers: {
  'Authorization': 'Bearer your-jwt-token',
  'Content-Type': 'application/json'
}
```

## Base URL & Headers

### Base URL
```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

### Required Headers
```typescript
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer {token}', // For protected routes
  'X-Client-Version': '1.0.0',      // Optional
  'Accept-Language': 'si-LK,en-US'  // For localization
}
```

## Error Handling

### Error Response Format
```typescript
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    },
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Error Codes
```typescript
enum ErrorCodes {
  // Authentication
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  REQUIRED_FIELD = 'REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  
  // Business Logic
  CUSTOMER_NOT_FOUND = 'CUSTOMER_NOT_FOUND',
  LOAN_NOT_FOUND = 'LOAN_NOT_FOUND',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  LOAN_ALREADY_PAID = 'LOAN_ALREADY_PAID',
  
  // System
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  RATE_LIMITED = 'RATE_LIMITED'
}
```

## Rate Limiting

```typescript
// Rate limits per endpoint type
const rateLimits = {
  auth: '10 requests per minute',
  read: '100 requests per minute',
  write: '60 requests per minute',
  reports: '20 requests per minute'
};

// Rate limit headers in response
{
  'X-RateLimit-Limit': '100',
  'X-RateLimit-Remaining': '95',
  'X-RateLimit-Reset': '1642262400'
}
```

## API Endpoints

## Authentication Endpoints

### Login
```typescript
POST /api/auth/login
Content-Type: application/json

Request Body:
{
  "email": "admin@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "user": {
      "uid": "abc123",
      "email": "admin@example.com",
      "name": "Admin User",
      "role": "admin",
      "profile": {
        "avatar": "https://...",
        "phone": "+94771234567"
      }
    },
    "token": "eyJhbGciOiJSUzI1NiIs...",
    "refreshToken": "refreshTokenString"
  }
}
```

### Logout
```typescript
POST /api/auth/logout
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Refresh Token
```typescript
POST /api/auth/refresh
Content-Type: application/json

Request Body:
{
  "refreshToken": "refreshTokenString"
}

Response:
{
  "success": true,
  "data": {
    "token": "newJwtToken",
    "refreshToken": "newRefreshToken"
  }
}
```

## Users

### Get User Profile
```typescript
GET /api/users/profile
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "uid": "user123",
    "email": "agent@example.com",
    "name": "Agent Name",
    "role": "agent",
    "profile": {
      "avatar": "https://...",
      "phone": "+94771234567",
      "address": "Colombo, Sri Lanka"
    },
    "preferences": {
      "language": "si-LK",
      "notifications": true
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Update User Profile
```typescript
PUT /api/users/profile
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "name": "Updated Name",
  "profile": {
    "phone": "+94771234567",
    "address": "New Address"
  },
  "preferences": {
    "language": "en-US",
    "notifications": false
  }
}

Response:
{
  "success": true,
  "data": {
    "uid": "user123",
    "name": "Updated Name",
    // ... updated user data
  }
}
```

### Get All Users (Admin Only)
```typescript
GET /api/users?page=1&limit=20&role=agent
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "users": [
      {
        "uid": "user1",
        "email": "agent1@example.com",
        "name": "Agent 1",
        "role": "agent",
        "status": "active",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

## Customers

### Create Customer
```typescript
POST /api/customers
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "personalInfo": {
    "firstName": "Kasun",
    "lastName": "Perera",
    "nicNumber": "199012345678",
    "dateOfBirth": "1990-05-15",
    "gender": "male",
    "occupation": "Teacher"
  },
  "contactInfo": {
    "phone": "+94771234567",
    "email": "kasun@example.com",
    "address": {
      "street": "123 Main Street",
      "city": "Colombo",
      "district": "Colombo",
      "postalCode": "00100"
    }
  },
  "kycDocuments": [
    {
      "type": "nic_front",
      "url": "https://storage.com/nic-front.jpg"
    },
    {
      "type": "nic_back", 
      "url": "https://storage.com/nic-back.jpg"
    }
  ]
}

Response:
{
  "success": true,
  "data": {
    "customerId": "customer123",
    "customerNumber": "CUST001234",
    "personalInfo": { /* ... */ },
    "contactInfo": { /* ... */ },
    "kycStatus": "pending",
    "status": "active",
    "assignedAgent": "agent123",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Get Customer Details
```typescript
GET /api/customers/customer123
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "customerId": "customer123",
    "customerNumber": "CUST001234",
    "personalInfo": {
      "firstName": "Kasun",
      "lastName": "Perera",
      "nicNumber": "199012345678",
      "dateOfBirth": "1990-05-15",
      "gender": "male",
      "occupation": "Teacher"
    },
    "contactInfo": {
      "phone": "+94771234567",
      "email": "kasun@example.com",
      "address": {
        "street": "123 Main Street",
        "city": "Colombo",
        "district": "Colombo",
        "postalCode": "00100"
      }
    },
    "kycStatus": "approved",
    "status": "active",
    "assignedAgent": "agent123",
    "totalLoans": 2,
    "activeLoans": 1,
    "totalBorrowed": 150000,
    "totalPaid": 75000,
    "outstandingBalance": 75000,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Search Customers
```typescript
GET /api/customers/search?q=kasun&status=active&agent=agent123&page=1&limit=20
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "customers": [
      {
        "customerId": "customer123",
        "customerNumber": "CUST001234",
        "personalInfo": {
          "firstName": "Kasun",
          "lastName": "Perera"
        },
        "contactInfo": {
          "phone": "+94771234567"
        },
        "kycStatus": "approved",
        "status": "active",
        "outstandingBalance": 75000
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

### Update Customer
```typescript
PUT /api/customers/customer123
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "contactInfo": {
    "phone": "+94771234567",
    "address": {
      "street": "New Address",
      "city": "Kandy",
      "district": "Kandy",
      "postalCode": "20000"
    }
  },
  "kycStatus": "approved"
}

Response:
{
  "success": true,
  "data": {
    "customerId": "customer123",
    // ... updated customer data
  }
}
```

## Loans

### Create Loan
```typescript
POST /api/loans
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "customerId": "customer123",
  "amount": 100000,
  "interestRate": 15.5,
  "calculationMethod": "reducing", // 'flat' or 'reducing'
  "loanTerm": 52, // weeks
  "purpose": "Business expansion",
  "guarantor": {
    "name": "Sunil Silva",
    "nic": "197512345678",
    "phone": "+94712345678"
  }
}

Response:
{
  "success": true,
  "data": {
    "loanId": "loan123",
    "loanNumber": "LOAN001234",
    "customerId": "customer123",
    "amount": 100000,
    "interestRate": 15.5,
    "calculationMethod": "reducing",
    "installmentAmount": 2108.33,
    "totalInstallments": 52,
    "totalAmount": 109633.33,
    "status": "pending",
    "startDate": null,
    "endDate": null,
    "createdBy": "admin123",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Approve Loan
```typescript
POST /api/loans/loan123/approve
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "startDate": "2024-01-20",
  "notes": "Loan approved after verification"
}

Response:
{
  "success": true,
  "data": {
    "loanId": "loan123",
    "status": "active",
    "startDate": "2024-01-20T00:00:00Z",
    "endDate": "2025-01-18T00:00:00Z",
    "approvedBy": "admin123",
    "approvedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Get Loan Details
```typescript
GET /api/loans/loan123
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "loanId": "loan123",
    "loanNumber": "LOAN001234",
    "customer": {
      "customerId": "customer123",
      "name": "Kasun Perera",
      "phone": "+94771234567"
    },
    "amount": 100000,
    "interestRate": 15.5,
    "calculationMethod": "reducing",
    "installmentAmount": 2108.33,
    "totalInstallments": 52,
    "paidInstallments": 10,
    "remainingInstallments": 42,
    "totalAmount": 109633.33,
    "paidAmount": 21083.30,
    "outstandingBalance": 88549.03,
    "status": "active",
    "startDate": "2024-01-20T00:00:00Z",
    "endDate": "2025-01-18T00:00:00Z",
    "nextPaymentDate": "2024-04-06T00:00:00Z",
    "isOverdue": false,
    "daysPastDue": 0,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Get Customer Loans
```typescript
GET /api/customers/customer123/loans?status=active
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "loans": [
      {
        "loanId": "loan123",
        "loanNumber": "LOAN001234",
        "amount": 100000,
        "outstandingBalance": 88549.03,
        "status": "active",
        "nextPaymentDate": "2024-04-06T00:00:00Z",
        "isOverdue": false
      }
    ],
    "summary": {
      "totalLoans": 1,
      "totalBorrowed": 100000,
      "totalOutstanding": 88549.03,
      "averageInterestRate": 15.5
    }
  }
}
```

## Payments

### Record Payment
```typescript
POST /api/payments
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "loanId": "loan123",
  "amount": 2108.33,
  "paymentDate": "2024-04-06",
  "installmentNumber": 11,
  "notes": "Weekly payment collected",
  "location": {
    "latitude": 6.9271,
    "longitude": 79.8612
  },
  "receiptPhoto": "https://storage.com/receipt.jpg"
}

Response:
{
  "success": true,
  "data": {
    "paymentId": "payment123",
    "receiptNumber": "RCP001234",
    "loanId": "loan123",
    "customerId": "customer123",
    "amount": 2108.33,
    "paymentDate": "2024-04-06T00:00:00Z",
    "installmentNumber": 11,
    "principalAmount": 1916.67,
    "interestAmount": 191.66,
    "collectedBy": "agent123",
    "notes": "Weekly payment collected",
    "location": {
      "latitude": 6.9271,
      "longitude": 79.8612
    },
    "receiptPhoto": "https://storage.com/receipt.jpg",
    "createdAt": "2024-04-06T10:30:00Z"
  }
}
```

### Get Payment History
```typescript
GET /api/loans/loan123/payments?page=1&limit=20
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "payments": [
      {
        "paymentId": "payment123",
        "receiptNumber": "RCP001234",
        "amount": 2108.33,
        "paymentDate": "2024-04-06T00:00:00Z",
        "installmentNumber": 11,
        "principalAmount": 1916.67,
        "interestAmount": 191.66,
        "collectedBy": "agent123",
        "collectorName": "Agent Name"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 10,
      "totalPages": 1
    },
    "summary": {
      "totalPayments": 10,
      "totalAmount": 21083.30,
      "totalPrincipal": 19166.70,
      "totalInterest": 1916.60
    }
  }
}
```

### Get Agent Collections
```typescript
GET /api/agents/agent123/collections?date=2024-04-06
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "collections": [
      {
        "paymentId": "payment123",
        "receiptNumber": "RCP001234",
        "customer": {
          "customerId": "customer123",
          "name": "Kasun Perera",
          "phone": "+94771234567"
        },
        "loan": {
          "loanId": "loan123",
          "loanNumber": "LOAN001234"
        },
        "amount": 2108.33,
        "paymentDate": "2024-04-06T10:30:00Z",
        "installmentNumber": 11
      }
    ],
    "summary": {
      "totalCollections": 15,
      "totalAmount": 31624.95,
      "collectionTarget": 35000,
      "achievementPercentage": 90.36
    }
  }
}
```

## Reports

### Daily Collection Report
```typescript
GET /api/reports/collections/daily?date=2024-04-06&agent=agent123
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "date": "2024-04-06",
    "agent": {
      "agentId": "agent123",
      "name": "Agent Name"
    },
    "collections": {
      "count": 15,
      "totalAmount": 31624.95,
      "target": 35000,
      "achievement": 90.36
    },
    "customers": {
      "scheduled": 18,
      "collected": 15,
      "missed": 3,
      "collectionRate": 83.33
    },
    "details": [
      {
        "customerId": "customer123",
        "customerName": "Kasun Perera",
        "loanNumber": "LOAN001234",
        "scheduledAmount": 2108.33,
        "collectedAmount": 2108.33,
        "status": "collected",
        "collectionTime": "10:30 AM"
      }
    ]
  }
}
```

### Monthly Report
```typescript
GET /api/reports/monthly?year=2024&month=4
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "period": {
      "year": 2024,
      "month": 4,
      "monthName": "April"
    },
    "overview": {
      "totalCollections": 450,
      "totalAmount": 947498.50,
      "totalLoansIssued": 25,
      "newCustomers": 12,
      "activeLoans": 145,
      "completedLoans": 8
    },
    "collections": {
      "onTime": 380,
      "late": 55,
      "missed": 15,
      "collectionRate": 96.67
    },
    "agents": [
      {
        "agentId": "agent123",
        "name": "Agent Name",
        "collections": 225,
        "amount": 473749.25,
        "achievement": 94.75
      }
    ],
    "trends": {
      "weeklyGrowth": 2.5,
      "monthlyGrowth": 8.3,
      "defaultRate": 1.2
    }
  }
}
```

### Customer Analytics
```typescript
GET /api/reports/customers/analytics?customerId=customer123
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "customer": {
      "customerId": "customer123",
      "name": "Kasun Perera"
    },
    "loanHistory": {
      "totalLoans": 3,
      "completedLoans": 2,
      "activeLoans": 1,
      "totalBorrowed": 275000,
      "totalRepaid": 205000,
      "currentOutstanding": 70000
    },
    "paymentBehavior": {
      "onTimePayments": 45,
      "latePayments": 5,
      "missedPayments": 1,
      "averageDelayDays": 1.2,
      "paymentReliability": 88.24
    },
    "riskProfile": {
      "riskScore": 72,
      "riskCategory": "low",
      "creditworthiness": "good",
      "recommendedActions": []
    }
  }
}
```

## Settings

### Get System Settings
```typescript
GET /api/settings
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "interestRates": [
      {
        "type": "personal",
        "minRate": 12.0,
        "maxRate": 20.0,
        "defaultRate": 15.5
      },
      {
        "type": "business",
        "minRate": 10.0,
        "maxRate": 18.0,
        "defaultRate": 14.0
      }
    ],
    "loanTerms": {
      "minWeeks": 12,
      "maxWeeks": 104,
      "defaultWeeks": 52
    },
    "collectionSettings": {
      "gracePeriodDays": 3,
      "penaltyRate": 2.0,
      "maxMissedPayments": 3
    },
    "businessInfo": {
      "name": "ABC Micro Finance",
      "address": "123 Business Street, Colombo",
      "phone": "+94112345678",
      "email": "info@abcmicrofinance.lk",
      "license": "MF001234"
    }
  }
}
```

### Update Settings (Admin Only)
```typescript
PUT /api/settings
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "interestRates": [
    {
      "type": "personal",
      "minRate": 12.0,
      "maxRate": 22.0,
      "defaultRate": 16.0
    }
  ],
  "collectionSettings": {
    "gracePeriodDays": 5,
    "penaltyRate": 2.5
  }
}

Response:
{
  "success": true,
  "data": {
    // Updated settings object
  }
}
```

## Webhooks

### Payment Notification
```typescript
POST /api/webhooks/payment-notification
Content-Type: application/json
X-Webhook-Secret: your-webhook-secret

Request Body:
{
  "event": "payment.created",
  "data": {
    "paymentId": "payment123",
    "loanId": "loan123",
    "customerId": "customer123",
    "amount": 2108.33,
    "paymentDate": "2024-04-06T10:30:00Z"
  },
  "timestamp": "2024-04-06T10:30:00Z"
}
```

### Loan Status Change
```typescript
POST /api/webhooks/loan-status-change
Content-Type: application/json
X-Webhook-Secret: your-webhook-secret

Request Body:
{
  "event": "loan.status_changed",
  "data": {
    "loanId": "loan123",
    "customerId": "customer123",
    "previousStatus": "pending",
    "newStatus": "active",
    "changedBy": "admin123"
  },
  "timestamp": "2024-04-06T10:30:00Z"
}
```

## SDK Examples

### JavaScript/TypeScript SDK
```typescript
import { MicroLendingAPI } from '@/lib/api';

const api = new MicroLendingAPI({
  baseURL: 'https://your-domain.com/api',
  token: 'your-jwt-token'
});

// Create customer
const customer = await api.customers.create({
  personalInfo: {
    firstName: 'Kasun',
    lastName: 'Perera',
    // ...
  }
});

// Record payment
const payment = await api.payments.create({
  loanId: 'loan123',
  amount: 2108.33,
  paymentDate: '2024-04-06'
});

// Get reports
const report = await api.reports.getDaily({
  date: '2024-04-06',
  agentId: 'agent123'
});
```

This API documentation provides a comprehensive guide for integrating with the micro-lending management system, covering all major endpoints and use cases for both admin and agent roles.