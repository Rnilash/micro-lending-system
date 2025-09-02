# React Component Examples

This directory contains production-ready React components for the micro-lending system with Tailwind CSS styling and Sinhala language support.

## Component Categories

### 1. Dashboard Components
- `AdminDashboard.tsx` - Main admin dashboard with key metrics
- `AgentDashboard.tsx` - Collection agent dashboard
- `MetricsCard.tsx` - Reusable metrics display component

### 2. Customer Management
- `CustomerForm.tsx` - Add/edit customer form with validation
- `CustomerList.tsx` - Paginated customer listing with search
- `CustomerProfile.tsx` - Detailed customer profile view

### 3. Loan Management
- `LoanForm.tsx` - Loan creation and modification form
- `LoanCalculator.tsx` - Interactive loan calculation component
- `PaymentSchedule.tsx` - Payment schedule display

### 4. Payment Collection
- `PaymentForm.tsx` - Mobile-optimized payment collection
- `PaymentHistory.tsx` - Payment history with filtering
- `ReceiptDisplay.tsx` - Digital receipt component

### 5. UI Components
- `BilingualButton.tsx` - Bilingual button component
- `CurrencyDisplay.tsx` - LKR currency formatting
- `DatePicker.tsx` - Sinhala-enabled date picker
- `LoadingSpinner.tsx` - Loading states
- `Modal.tsx` - Accessible modal component

### 6. Forms
- `FormField.tsx` - Standardized form field component
- `ValidationMessage.tsx` - Form validation messaging
- `SinhalaInput.tsx` - Sinhala text input with transliteration

### 7. Charts and Visualization
- `CollectionChart.tsx` - Payment collection trends
- `DefaulterChart.tsx` - Defaulter analysis visualization
- `ProfitChart.tsx` - Profit/loss tracking

## Component Guidelines

### Design System
- **Colors**: Blue primary (#2563eb), Green success (#059669), Red danger (#dc2626)
- **Typography**: Inter for English, Noto Sans Sinhala for Sinhala text
- **Spacing**: Tailwind spacing scale (4px base unit)
- **Border Radius**: Rounded-md (6px) for most components

### Accessibility
- All components include proper ARIA labels
- Keyboard navigation support
- Screen reader friendly
- High contrast color combinations

### Internationalization
- Bilingual text support (Sinhala/English)
- RTL text handling for Sinhala
- Currency formatting for LKR
- Date formatting for Sri Lankan locale

### Mobile-First Design
- Touch-friendly interactive elements (min 44px)
- Responsive breakpoints
- Optimized for tablet use in field operations
- Offline capability considerations

## Usage Examples

Each component includes:
- TypeScript interfaces for props
- Default prop values
- Usage examples in comments
- Error boundary handling
- Loading states
- Accessibility features

## Testing
- Jest unit tests for logic
- React Testing Library for component testing
- Storybook stories for visual testing
- Accessibility testing with axe-core