# Digital Micro-Lending Management System

A comprehensive web-based micro-lending management system tailored for Sri Lankan micro-finance businesses, built with Next.js 14+ and Firebase.

## 🏦 Business Overview

This system is designed for small-scale money lending businesses operating in Sri Lanka with:
- **Weekly collection cycles** for installment payments
- **Field operations** managed by collection agents
- **Bilingual support** (Sinhala/English) for local market needs
- **Mobile-responsive design** for tablet-based field work
- **Comprehensive reporting** for business analytics

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/micro-lending-system.git
cd micro-lending-system

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase configuration

# Run development server
npm run dev
```

## 📚 Documentation

### Core Documentation
- [**Setup Guide**](docs/SETUP.md) - Development environment setup
- [**Architecture Overview**](docs/ARCHITECTURE.md) - System design and structure
- [**API Documentation**](docs/API.md) - Backend endpoints and usage
- [**Deployment Guide**](docs/DEPLOYMENT.md) - Production deployment steps
- [**User Manual**](docs/USER_MANUAL.md) - Complete user guide

### Implementation Guides
- [**Development Guide**](guides/development-guide.md) - Step-by-step development process
- [**Firebase Setup**](guides/firebase-setup.md) - Firebase configuration and setup
- [**Database Design**](guides/database-design.md) - Firestore collections and structure
- [**Authentication Flow**](guides/authentication-flow.md) - User authentication implementation
- [**Payment System**](guides/payment-system.md) - Payment processing workflow

### Code Examples
- [**Component Examples**](examples/) - UI components with Tailwind CSS
- [**API Implementations**](examples/) - Backend route examples
- [**Database Queries**](examples/) - Firestore query patterns

### Technical Specifications
- [**Database Schemas**](schemas/) - Firestore collection structures
- [**TypeScript Interfaces**](schemas/) - Type definitions
- [**Security Rules**](schemas/) - Firebase security configurations

## 🎯 Key Features

### 👥 User Management
- **Admin Dashboard** - Complete system oversight
- **Collection Agent Interface** - Mobile-optimized field operations
- **Role-based Access Control** - Secure permission management

### 🏪 Customer Management
- **Customer Profiles** - Complete KYC and contact information
- **Document Management** - Secure storage of customer documents
- **Advanced Search** - Multi-criteria customer filtering

### 💰 Loan Management
- **Loan Applications** - Streamlined application processing
- **Interest Calculations** - Multiple calculation methods
- **Approval Workflow** - Multi-stage approval process
- **Active Loan Tracking** - Real-time loan status monitoring

### 📊 Payment System
- **Weekly Collections** - Systematic payment recording
- **Payment History** - Complete transaction tracking
- **Outstanding Balances** - Automated balance calculations
- **Receipt Generation** - Digital and printable receipts

### 📈 Reporting & Analytics
- **Collection Reports** - Daily/weekly performance metrics
- **Customer Analytics** - Payment behavior analysis
- **Agent Performance** - Field agent productivity tracking
- **Financial Reports** - Profit/loss and cash flow analysis

## 🌐 Localization

### Sinhala Language Support
- **Bilingual Interface** - Seamless language switching
- **Number Formatting** - Sri Lankan numerical conventions
- **Date Localization** - Local date and time formats
- **Currency Display** - LKR formatting and symbols

## 🔧 Technology Stack

- **Frontend**: Next.js 14+ (React)
- **Backend**: Firebase (Firestore, Functions, Auth)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Deployment**: Vercel/Firebase Hosting
- **Mobile**: Progressive Web App (PWA)

## 📱 Mobile Support

- **Responsive Design** - Optimized for tablets and smartphones
- **Offline Capabilities** - Local data caching for field work
- **Touch-Friendly UI** - Designed for touch interactions
- **Quick Entry Forms** - Streamlined data input

## 🔒 Security Features

- **Firebase Authentication** - Secure user management
- **Role-based Permissions** - Granular access control
- **Data Encryption** - Secure data transmission
- **Audit Logging** - Complete activity tracking
- **Input Validation** - Data sanitization and validation

## 🚀 Performance Optimizations

- **Firestore Query Optimization** - Efficient data retrieval
- **Image Compression** - Optimized document storage
- **Caching Strategies** - Improved loading times
- **Code Splitting** - Optimized bundle sizes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- 📧 Email: support@example.com
- 📚 Documentation: [Full Documentation](docs/)
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/micro-lending-system/issues)

---

**Built with ❤️ for Sri Lankan micro-finance businesses**
