# User Manual

Complete user guide for the Digital Micro-Lending Management System.

## Table of Contents
- [System Overview](#system-overview)
- [Getting Started](#getting-started)
- [Admin Dashboard](#admin-dashboard)
- [Collection Agent Interface](#collection-agent-interface)
- [Customer Management](#customer-management)
- [Loan Management](#loan-management)
- [Payment Processing](#payment-processing)
- [Reports & Analytics](#reports--analytics)
- [Settings Configuration](#settings-configuration)
- [Mobile Usage](#mobile-usage)
- [Troubleshooting](#troubleshooting)

## System Overview

### Purpose
The Digital Micro-Lending Management System is designed for Sri Lankan micro-finance businesses to manage:
- Customer information and KYC documentation
- Loan applications and approvals
- Weekly payment collections
- Business reporting and analytics
- Field agent operations

### User Roles
- **Admin**: Full system access and management
- **Collection Agent**: Customer and payment management for assigned routes

### Language Support
- **Sinhala**: Primary language for local operations
- **English**: Secondary language for system administration

## Getting Started

### System Requirements
- **Internet Connection**: Required for all operations
- **Device**: Computer, tablet, or smartphone
- **Browser**: Chrome, Firefox, Safari, or Edge (latest versions)
- **Screen Resolution**: Minimum 1024x768 (responsive design)

### First Time Login

#### Admin Setup
1. **Access the System**
   ```
   URL: https://your-domain.com
   ```

2. **Initial Login**
   - Use provided admin credentials
   - Email: admin@yourcompany.com
   - Password: (provided separately)

3. **Change Default Password**
   - Navigate to Profile Settings
   - Click "Change Password"
   - Enter current and new password
   - Save changes

4. **Complete Profile**
   - Add profile photo
   - Update contact information
   - Set language preference
   - Configure notification settings

#### Agent Setup
1. **Receive Credentials**
   - Admin will create your account
   - You'll receive login credentials via email or SMS

2. **Mobile Access**
   - Download PWA (if prompted)
   - Bookmark system URL
   - Test offline functionality

## Admin Dashboard

### Dashboard Overview
The admin dashboard provides a comprehensive view of business operations:

```
┌─────────────────────────────────────────────────────────┐
│                    Admin Dashboard                      │
├─────────────────┬─────────────────┬─────────────────────┤
│   Total         │   Active        │   Collections       │
│   Customers     │   Loans         │   Today             │
│   1,245         │   456           │   Rs. 125,000       │
├─────────────────┼─────────────────┼─────────────────────┤
│   New Loans     │   Overdue       │   Outstanding       │
│   This Month    │   Payments      │   Amount            │
│   25            │   12            │   Rs. 2,450,000     │
└─────────────────┴─────────────────┴─────────────────────┘
```

### Navigation Menu
- **🏠 Dashboard**: System overview and key metrics
- **👥 Customers**: Customer management and search
- **💰 Loans**: Loan applications and management
- **💳 Payments**: Payment recording and history
- **📊 Reports**: Business analytics and reports
- **👤 Users**: User management (admin/agents)
- **⚙️ Settings**: System configuration
- **👤 Profile**: Personal profile management

### Key Metrics

#### Today's Summary
- **Collections Made**: Number and amount of payments received
- **New Customers**: Customers added today
- **Loan Applications**: New applications received
- **Agent Performance**: Collection rates by agent

#### Weekly Overview
- **Collection Target vs Actual**: Progress towards weekly goals
- **Loan Disbursements**: New loans issued this week
- **Customer Growth**: New customer acquisition
- **Outstanding Analysis**: Overdue loan tracking

#### Monthly Trends
- **Revenue Growth**: Month-over-month comparison
- **Customer Retention**: Active customer rates
- **Loan Performance**: Default and completion rates
- **Agent Productivity**: Performance metrics

## Collection Agent Interface

### Mobile-Optimized Interface
The agent interface is designed for tablet and smartphone use:

```
┌─────────────────────────────────────┐
│          📱 Agent Dashboard         │
├─────────────────────────────────────┤
│  Today: Saturday, Apr 6, 2024      │
│  Route: Zone A - Colombo            │
├─────────────────────────────────────┤
│  📋 Collections Today: 15/18        │
│  💰 Amount Collected: Rs. 31,625    │
│  🎯 Target: Rs. 35,000              │
│  📍 Next: John Doe                 │
└─────────────────────────────────────┘
```

### Daily Workflow

#### 1. Start Day
- **Login**: Use credentials provided by admin
- **Route Review**: Check today's collection schedule
- **Target Check**: Review collection targets
- **Customer List**: Review customers to visit

#### 2. Customer Visit
- **Locate Customer**: Use built-in GPS navigation
- **Payment Collection**: Record payment amount
- **Receipt Photo**: Take photo of physical receipt
- **Digital Receipt**: Generate and print digital receipt
- **Notes**: Add any relevant notes or issues

#### 3. End of Day
- **Summary Review**: Check day's collection summary
- **Upload Data**: Ensure all data is synchronized
- **Report Issues**: Flag any problem customers
- **Next Day Preview**: Review tomorrow's schedule

### Collection Process

#### Recording a Payment
1. **Select Customer**
   - Search by name or customer ID
   - Select from today's route list
   - Scan QR code (if available)

2. **Payment Details**
   ```
   Customer: John Doe
   Loan: LOAN001234
   Due Amount: Rs. 2,108.33
   Collecting: Rs. 2,108.33
   Payment Date: Today
   ```

3. **Confirmation**
   - Verify payment amount
   - Check installment number
   - Add notes if needed
   - Take receipt photo

4. **Complete Transaction**
   - Generate digital receipt
   - Print receipt (if printer available)
   - Update customer record
   - Move to next customer

### Offline Capability
- **Data Storage**: Payments stored locally when offline
- **Auto-Sync**: Data uploads when connection restored
- **Conflict Resolution**: System handles data conflicts automatically

## Customer Management

### Adding New Customers

#### Personal Information
```
First Name: ජෝන් (John)
Last Name: ඩෝ (Doe)
NIC Number: 199012345678
Date of Birth: 1990-05-15
Gender: Male
Occupation: Teacher
Monthly Income: Rs. 75,000
```

#### Contact Information
```
Primary Phone: +94 77 123 4567
Secondary Phone: +94 11 234 5678
Email: customer.example@email.com
Address: 123 Main Street, Colombo 03
District: Colombo
Postal Code: 00300
```

#### KYC Documentation
Required documents:
- **NIC Front**: Clear photo of front side
- **NIC Back**: Clear photo of back side
- **Proof of Income**: Salary slip or business registration
- **Proof of Address**: Utility bill or bank statement
- **Profile Photo**: Recent passport-size photo

#### Document Guidelines
- **Format**: JPEG or PNG only
- **Size**: Maximum 5MB per document
- **Quality**: Clear, readable text
- **Lighting**: Ensure good lighting, no shadows
- **Completeness**: Full document visible in frame

### Customer Search and Filtering

#### Search Options
- **Name Search**: Search by first name, last name, or full name
- **NIC Search**: Search by National Identity Card number
- **Phone Search**: Search by phone number
- **Customer ID**: Search by system-generated customer ID
- **Loan Number**: Search by active loan number

#### Filter Options
- **Status**: Active, Inactive, Suspended
- **KYC Status**: Pending, Approved, Rejected
- **Assigned Agent**: Filter by collection agent
- **Registration Date**: Date range filter
- **Outstanding Amount**: Amount range filter
- **Location**: Filter by district or city

### Customer Profile Management

#### Profile Overview
```
┌─────────────────────────────────────┐
│        Customer Profile             │
├─────────────────────────────────────┤
│  📸 [Photo] John Doe               │
│  🆔 CUST001234                     │
│  📱 +94 77 123 4567               │
│  🏠 Colombo 03                     │
│  ✅ KYC Approved                   │
├─────────────────────────────────────┤
│  💰 Total Loans: 2                 │
│  📊 Active Loans: 1                │
│  💳 Outstanding: Rs. 75,000        │
│  📅 Next Payment: 2024-04-13       │
└─────────────────────────────────────┘
```

#### Editing Customer Information
1. **Access Profile**: Click on customer name or ID
2. **Edit Mode**: Click "Edit Profile" button
3. **Modify Information**: Update required fields
4. **Document Updates**: Upload new documents if needed
5. **Save Changes**: Confirm and save updates
6. **Audit Trail**: System logs all changes automatically

## Loan Management

### Loan Application Process

#### 1. Create Application
```
Customer: John Doe (CUST001234)
Loan Amount: Rs. 100,000
Purpose: Business Expansion
Loan Term: 52 weeks (1 year)
Interest Rate: 15.5% (reducing balance)
```

#### 2. Calculate Terms
```
Principal Amount: Rs. 100,000
Interest Rate: 15.5% per annum
Calculation Method: Reducing Balance
Loan Term: 52 weeks
Weekly Installment: Rs. 2,108.33
Total Amount: Rs. 109,633.16
Total Interest: Rs. 9,633.16
```

#### 3. Guarantor Information
```
Guarantor Name: Jane Smith
NIC Number: 197512345678
Relationship: Brother
Phone Number: +94 71 234 5678
Address: 456 Second Street, Kandy
```

#### 4. Documentation
Required documents for loan:
- **Loan Application Form**: Completed and signed
- **Income Verification**: Latest salary slips or business proof
- **Bank Statements**: Last 3 months
- **Guarantor Documents**: NIC copies and consent form
- **Collateral Documents**: If applicable

### Loan Approval Workflow

#### Admin Review Process
1. **Application Review**
   - Verify customer information
   - Check credit history
   - Validate income documentation
   - Assess repayment capacity

2. **Risk Assessment**
   - Calculate debt-to-income ratio
   - Review payment history (if existing customer)
   - Evaluate guarantor creditworthiness
   - Assess collateral value (if applicable)

3. **Approval Decision**
   - **Approve**: Set disbursement date and conditions
   - **Reject**: Provide rejection reason
   - **Conditional**: Request additional documentation
   - **Modify**: Suggest alternative terms

#### Loan Status Tracking
```
📋 Application Submitted → ⏳ Under Review → ✅ Approved → 💰 Disbursed → 📊 Active
                                          ↓
                                        ❌ Rejected
```

### Interest Calculation Methods

#### 1. Flat Rate Method
```
Principal: Rs. 100,000
Interest Rate: 15% per annum
Term: 52 weeks

Total Interest = Principal × Rate × Time
Total Interest = 100,000 × 0.15 × 1 = Rs. 15,000
Total Amount = 100,000 + 15,000 = Rs. 115,000
Weekly Payment = 115,000 ÷ 52 = Rs. 2,211.54
```

#### 2. Reducing Balance Method
```
Principal: Rs. 100,000
Interest Rate: 15% per annum
Term: 52 weeks

EMI = P × [r(1+r)^n] / [(1+r)^n-1]
Where:
P = Principal (100,000)
r = Weekly interest rate (0.15/52)
n = Number of weeks (52)

Weekly Payment = Rs. 2,108.33
```

## Payment Processing

### Recording Payments

#### Payment Entry Form
```
┌─────────────────────────────────────┐
│           Record Payment            │
├─────────────────────────────────────┤
│  Customer: John Doe            │
│  Loan: LOAN001234                  │
│  Due Amount: Rs. 2,108.33          │
│  Payment Amount: Rs. 2,108.33      │
│  Payment Date: 2024-04-06          │
│  Installment #: 11                 │
│  Payment Method: Cash              │
│  Notes: Regular weekly payment     │
├─────────────────────────────────────┤
│  📸 Receipt Photo: [Upload]        │
│  📍 GPS Location: Auto-detected    │
│  👤 Collector: Agent Name          │
└─────────────────────────────────────┘
```

#### Payment Validation
System automatically validates:
- **Due Amount**: Confirms payment matches installment
- **Payment Date**: Ensures date is not in future
- **Customer Status**: Verifies customer is active
- **Loan Status**: Confirms loan is active
- **Duplicate Check**: Prevents duplicate payments for same date

#### Receipt Generation
```
┌─────────────────────────────────────┐
│          PAYMENT RECEIPT            │
├─────────────────────────────────────┤
│  ABC Micro Finance                  │
│  123 Business St, Colombo          │
│  Tel: +94 11 234 5678              │
├─────────────────────────────────────┤
│  Receipt No: RCP001234              │
│  Date: 2024-04-06 10:30 AM         │
│  Customer: John Doe            │
│  Loan No: LOAN001234               │
├─────────────────────────────────────┤
│  Payment Amount: Rs. 2,108.33      │
│  Principal: Rs. 1,916.67           │
│  Interest: Rs. 191.66              │
│  Installment: 11 of 52             │
├─────────────────────────────────────┤
│  Balance: Rs. 73,441.70            │
│  Next Payment: 2024-04-13          │
│  Collected by: Agent Name          │
└─────────────────────────────────────┘
```

### Handling Special Cases

#### Partial Payments
```
Due Amount: Rs. 2,108.33
Paid Amount: Rs. 1,500.00
Shortfall: Rs. 608.33

Options:
1. Accept partial payment
2. Schedule follow-up collection
3. Add penalty charges
4. Extend due date
```

#### Advance Payments
```
Current Due: Rs. 2,108.33
Paid Amount: Rs. 4,216.66
Advance: Rs. 2,108.33

System Action:
- Record current installment
- Credit advance to next installment
- Update payment schedule
- Generate receipt for total amount
```

#### Late Payments
```
Due Date: 2024-04-06
Payment Date: 2024-04-10
Days Late: 4
Penalty Rate: 2% per week

Penalty Calculation:
Base Amount: Rs. 2,108.33
Penalty: Rs. 42.17
Total Due: Rs. 2,150.50
```

## Reports & Analytics

### Daily Reports

#### Collection Summary
```
📅 Daily Collection Report - 2024-04-06

Agent Performance:
┌─────────────────┬───────────┬─────────────┬─────────┐
│ Agent Name      │ Target    │ Collected   │ Rate %  │
├─────────────────┼───────────┼─────────────┼─────────┤
│ Nimal Silva     │ 35,000    │ 31,625      │ 90.4%   │
│ Kamala Perera   │ 32,000    │ 28,750      │ 89.8%   │
├─────────────────┼───────────┼─────────────┼─────────┤
│ Total           │ 67,000    │ 60,375      │ 90.1%   │
└─────────────────┴───────────┴─────────────┴─────────┘

Collection Details:
- Total Customers Visited: 33
- Successful Collections: 30
- Missed Collections: 3
- Average Collection Time: 15 minutes
```

#### Outstanding Analysis
```
📊 Outstanding Loans Analysis

By Days Overdue:
- 1-7 days: 15 customers, Rs. 125,000
- 8-14 days: 8 customers, Rs. 85,000
- 15-30 days: 5 customers, Rs. 67,500
- 30+ days: 2 customers, Rs. 45,000

Risk Categories:
🟢 Low Risk (0-7 days): 68%
🟡 Medium Risk (8-30 days): 26%
🔴 High Risk (30+ days): 6%
```

### Weekly Reports

#### Business Performance
```
📈 Weekly Business Report - Week 14, 2024

Financial Summary:
- Total Collections: Rs. 425,000
- New Loans Issued: Rs. 375,000
- Net Cash Flow: Rs. 50,000
- Interest Earned: Rs. 45,000

Customer Metrics:
- New Customers: 12
- Active Customers: 1,245
- Loan Completion Rate: 94.5%
- Customer Satisfaction: 4.7/5.0

Operational Metrics:
- Collection Efficiency: 91.2%
- Agent Productivity: 89.5%
- System Uptime: 99.8%
- Response Time: 1.2 seconds
```

### Monthly Reports

#### Comprehensive Analysis
```
📊 Monthly Report - April 2024

Financial Performance:
┌─────────────────────┬─────────────┬─────────────┐
│ Metric              │ This Month  │ Last Month  │
├─────────────────────┼─────────────┼─────────────┤
│ Total Collections   │ 1,850,000   │ 1,720,000   │
│ New Loans           │ 1,250,000   │ 1,180,000   │
│ Interest Income     │ 185,000     │ 175,000     │
│ Net Profit          │ 125,000     │ 115,000     │
└─────────────────────┴─────────────┴─────────────┘

Growth Metrics:
- Customer Growth: +8.5%
- Loan Portfolio Growth: +12.3%
- Revenue Growth: +7.6%
- Profit Margin: 8.9%
```

### Custom Reports

#### Report Builder
Users can create custom reports with:
- **Date Range Selection**: Custom date ranges
- **Customer Filters**: By location, agent, status
- **Loan Filters**: By amount, term, interest rate
- **Payment Filters**: By method, status, amount
- **Export Options**: PDF, Excel, CSV formats

## Settings Configuration

### System Settings (Admin Only)

#### Interest Rate Configuration
```
Loan Categories:
┌─────────────────┬─────────┬─────────┬─────────────┐
│ Category        │ Min %   │ Max %   │ Default %   │
├─────────────────┼─────────┼─────────┼─────────────┤
│ Personal        │ 12.0    │ 20.0    │ 15.5        │
│ Business        │ 10.0    │ 18.0    │ 14.0        │
│ Emergency       │ 15.0    │ 25.0    │ 18.0        │
│ Agriculture     │ 8.0     │ 15.0    │ 12.0        │
└─────────────────┴─────────┴─────────┴─────────────┘
```

#### Collection Settings
```
Grace Period: 3 days
Penalty Rate: 2% per week
Maximum Missed Payments: 3
Collection Schedule: Monday to Saturday
Working Hours: 8:00 AM - 6:00 PM
```

#### User Management
```
User Roles and Permissions:

Admin:
✅ Full system access
✅ User management
✅ Settings configuration
✅ All reports
✅ Data export

Agent:
✅ Customer management (assigned)
✅ Payment recording
✅ Basic reports
❌ System settings
❌ User management
```

### Business Information
```
Company Details:
- Name: ABC Micro Finance
- License Number: MF001234
- Address: 123 Business Street, Colombo 03
- Phone: +94 11 234 5678
- Email: info@abcmicrofinance.lk
- Website: www.abcmicrofinance.lk

Banking Information:
- Bank: Commercial Bank of Ceylon
- Account Number: 8001234567
- Branch: Colombo 03
- SWIFT Code: CCEYLKLX
```

## Mobile Usage

### Progressive Web App (PWA)

#### Installation
1. **Open Browser**: Chrome, Firefox, or Safari
2. **Visit Site**: Navigate to system URL
3. **Install Prompt**: Tap "Add to Home Screen"
4. **Confirm**: Complete installation process
5. **Access**: Use app icon on home screen

#### Offline Features
- **Data Caching**: Recent customer data stored locally
- **Payment Recording**: Payments saved offline, sync when online
- **Route Information**: Today's collection route available offline
- **Basic Reports**: Summary reports cached for offline viewing

### Touch Interface Optimizations

#### Button Sizes
- **Minimum Touch Target**: 44px × 44px
- **Spacing**: 8px minimum between touch targets
- **Visual Feedback**: Clear pressed states
- **Accessibility**: High contrast and large text options

#### Gesture Support
- **Swipe Navigation**: Swipe between customer records
- **Pull to Refresh**: Update data with pull-down gesture
- **Tap and Hold**: Quick actions menu
- **Pinch to Zoom**: Zoom in on documents and receipts

### Camera Integration

#### Document Capture
- **Auto-Focus**: Automatic focus on documents
- **Edge Detection**: Automatic document boundary detection
- **Quality Enhancement**: Automatic brightness and contrast adjustment
- **Compression**: Optimized file sizes for upload

#### Receipt Photos
- **Quick Capture**: One-tap photo capture
- **Preview**: Review before saving
- **Retake Option**: Easy retake functionality
- **Automatic Upload**: Background upload when online

## Troubleshooting

### Common Issues

#### Login Problems
**Issue**: Cannot login to system
**Solutions**:
1. Check internet connection
2. Verify username and password
3. Clear browser cache and cookies
4. Try different browser
5. Contact admin for password reset

#### Payment Recording Issues
**Issue**: Payment not saving properly
**Solutions**:
1. Check internet connection
2. Verify payment amount and details
3. Ensure customer and loan are active
4. Check for duplicate payments
5. Try refreshing the page

#### Slow Performance
**Issue**: System running slowly
**Solutions**:
1. Check internet speed
2. Close unnecessary browser tabs
3. Clear browser cache
4. Restart browser
5. Use Chrome for best performance

#### Mobile App Issues
**Issue**: Mobile app not working properly
**Solutions**:
1. Update browser to latest version
2. Clear app cache and data
3. Reinstall PWA
4. Check device storage space
5. Restart device

### Error Messages

#### Common Error Codes
```
ERR_001: Invalid credentials
Solution: Check username/password

ERR_002: Customer not found
Solution: Verify customer ID

ERR_003: Loan not active
Solution: Check loan status

ERR_004: Payment already recorded
Solution: Check payment history

ERR_005: Insufficient permissions
Solution: Contact admin

ERR_006: Network connection error
Solution: Check internet connection
```

### Getting Help

#### Support Channels
- **Phone**: +94 11 234 5678 (9 AM - 6 PM)
- **Email**: support@yourcompany.com
- **WhatsApp**: +94 77 123 4567
- **Online Chat**: Available in system (help icon)

#### Self-Help Resources
- **Video Tutorials**: Available in help section
- **User Manual**: This document
- **FAQ**: Frequently asked questions
- **Knowledge Base**: Searchable help articles

#### Emergency Contacts
- **Technical Issues**: +94 77 999 8888
- **Business Critical**: +94 77 999 9999
- **After Hours**: emergency@yourcompany.com

This user manual provides comprehensive guidance for all users of the micro-lending management system. For additional assistance, please contact our support team.