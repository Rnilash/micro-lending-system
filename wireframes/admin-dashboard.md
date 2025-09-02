# Admin Dashboard Wireframes

Comprehensive wireframe specifications for the admin dashboard interface with responsive design and bilingual support.

## Layout Structure

### Desktop Layout (1200px+)
```
┌─────────────────────────────────────────────────────────────────┐
│ Header Bar                                                      │
├─────────────────────────────────────────────────────────────────┤
│ Navigation │ Main Content Area                                  │
│ Sidebar    │                                                    │
│ (240px)    │                                                    │
│            │                                                    │
│            │                                                    │
│            │                                                    │
│            │                                                    │
│            │                                                    │
└─────────────────────────────────────────────────────────────────┘
```

### Tablet Layout (768px - 1199px)
```
┌─────────────────────────────────────────────────────────────────┐
│ Header Bar (with hamburger menu)                               │
├─────────────────────────────────────────────────────────────────┤
│ Main Content Area (full width)                                 │
│                                                                 │
│ [Navigation slides in/out from left]                           │
│                                                                 │
│                                                                 │
│                                                                 │
│                                                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Header Bar Components

### Layout
```
┌──────────────────────────────────────────────────────────────────────────┐
│ [☰] Logo/Title    [Search Bar]    [Notifications] [Language] [Profile] │
│                                                    [🔔]       [සිං/EN] [👤] │
└──────────────────────────────────────────────────────────────────────────┘
```

### Header Elements:
1. **Hamburger Menu** (Mobile/Tablet)
   - 24x24px icon
   - Toggles sidebar navigation
   - Position: left 16px

2. **Logo/Title**
   - Company logo (32x32px) + "Micro Lending System"
   - Bilingual text: "සූක්ෂම් ණයදාන පද්ධතිය / Micro Lending System"
   - Font: 18px semibold

3. **Search Bar** (Desktop only)
   - Width: 300px
   - Placeholder: "Search customers, loans... / ගනුම්කරුවන්, ණය සොයන්න..."
   - Icon: 🔍

4. **Notification Bell**
   - Icon with badge for unread count
   - Dropdown shows recent notifications
   - Real-time updates

5. **Language Switcher**
   - Toggle: "සිං" / "EN" / "Both"
   - Affects entire interface

6. **Profile Menu**
   - User avatar + name
   - Dropdown: Profile, Settings, Logout

## Navigation Sidebar

### Desktop Sidebar (240px width)
```
┌──────────────────────────────┐
│ Dashboard / උපකරණ පුවරුව      │
│ ────────────────────────────  │
│ 📊 Dashboard                 │
│ 👥 Customers / ගනුම්කරුවන්   │
│ 💰 Loans / ණය               │
│ 💳 Payments / ගෙවීම්        │
│ 👨‍💼 Agents / ඒජන්තවරුන්       │
│ 📈 Reports / වාර්තා          │
│ ────────────────────────────  │
│ ADMINISTRATION               │
│ ⚙️ Settings / සැකසීම්       │
│ 👤 Users / පරිශීලකයන්       │
│ 📋 Audit / විගණන            │
│ 🔒 Security / ආරක්ෂණ        │
└──────────────────────────────┘
```

### Navigation Items:
1. **Dashboard** - Overview and metrics
2. **Customers** - Customer management
3. **Loans** - Loan management and approval
4. **Payments** - Payment collection and tracking
5. **Agents** - Agent management and performance
6. **Reports** - Analytics and reporting
7. **Settings** - System configuration
8. **Users** - User management
9. **Audit** - Audit logs and compliance
10. **Security** - Security settings and permissions

### Active State Styling:
- Background: Blue 50 (#EFF6FF)
- Text: Blue 700 (#1D4ED8)
- Border-left: 4px solid Blue 700

## Main Dashboard Content

### Metrics Cards Section
```
┌─────────────────────────────────────────────────────────────────────────┐
│ Key Metrics / ප්‍රධාන ප්‍රමිතික                                          │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ │
│ │ 💰 Collected  │ │ 📊 Outstanding│ │ 👥 Customers  │ │ ⚠️ Defaulters │ │
│ │ LKR 850,000   │ │ LKR 1,200,000 │ │ 245 Active    │ │ 12 Accounts   │ │
│ │ ගෙවන ලද මුදල │ │ ඉතිරි ශේෂය    │ │ සක්‍රීය ගනුම්කරු │ │ පැහැර ගියවුන්  │ │
│ │ +12% ↗️       │ │ -5% ↘️        │ │ +8 new ↗️     │ │ +2 ↗️         │ │
│ └───────────────┘ └───────────────┘ └───────────────┘ └───────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### Chart Section
```
┌─────────────────────────────────────────────────────────────────────────┐
│ Collection Trends / එකතුකිරීමේ ප්‍රවණතා                                │
├─────────────────────────────────────────────────────────────────────────┤
│ [Time Period Tabs: Today/සදා | Week/සතිය | Month/මාසය | Year/වර්ෂය]      │
│                                                                         │
│ ┌─ Collection Chart ──────────────────────────────────────────────────┐ │
│ │                                                               ████  │ │
│ │                                                         ████  ████  │ │
│ │                                                   ████  ████  ████  │ │
│ │                                             ████  ████  ████  ████  │ │
│ │                                       ████  ████  ████  ████  ████  │ │
│ │ ████  ████  ████  ████  ████  ████  ████  ████  ████  ████  ████  │ │
│ │ Mon   Tue   Wed   Thu   Fri   Sat   Sun   Mon   Tue   Wed   Thu     │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ Target: LKR 1,000,000 | Progress: 65% | Remaining: LKR 350,000        │
│ ඉලක්කය: රු. 1,000,000 | ප්‍රගතිය: 65% | ඉතිරි: රු. 350,000              │
└─────────────────────────────────────────────────────────────────────────┘
```

### Recent Activity Section
```
┌─────────────────────────────────────────────────────────────────────────┐
│ Recent Activity / මෑත ක්‍රියාකාරකම්                                     │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌─ Payments / ගෙවීම් ──────────┐ ┌─ New Customers / නව ගනුම්කරුවන් ──┐ │
│ │ • Saman paid LKR 5,000      │ │ • Kamala Fernando                │ │
│ │   සමන් රු. 5,000 ගෙවීය      │ │   Phone: 0771234567              │ │
│ │   2 mins ago                │ │   Agent: A001                    │ │
│ │                             │ │                                  │ │
│ │ • Nimal paid LKR 3,500      │ │ • Sunil Perera                  │ │
│ │   නිමල් රු. 3,500 ගෙවීය     │ │   Phone: 0779876543              │ │
│ │   15 mins ago               │ │   Agent: A002                    │ │
│ │                             │ │                                  │ │
│ │ [View All]                  │ │ [View All]                       │ │
│ └─────────────────────────────┘ └──────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### Quick Actions Section
```
┌─────────────────────────────────────────────────────────────────────────┐
│ Quick Actions / ඉක්මන් ක්‍රියාමාර්ග                                      │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐ │
│ │ [+ Add Customer]    │ │ [📊 Generate Report]│ │ [⚠️ View Defaulters] │ │
│ │ ගනුම්කරුවෙකු එකතු   │ │ වාර්තාවක් සාදන්න    │ │ පැහැර ගියවුන් බලන්න │ │
│ │ කරන්න              │ │                     │ │                     │ │
│ └─────────────────────┘ └─────────────────────┘ └─────────────────────┘ │
│                                                                         │
│ ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐ │
│ │ [💰 Record Payment] │ │ [👨‍💼 Manage Agents]  │ │ [⚙️ Settings]       │ │
│ │ ගෙවීමක් සටහන් කරන්න │ │ ඒජන්තවරුන් කළමනා    │ │ සැකසීම්            │ │
│ │                     │ │ කරන්න               │ │                     │ │
│ └─────────────────────┘ └─────────────────────┘ └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

## Responsive Breakpoints

### Large Desktop (1440px+)
- 4-column metric cards
- Side-by-side chart and activity panels
- Full navigation always visible

### Desktop (1200px - 1439px)
- 4-column metric cards
- Stacked chart and activity panels
- Full navigation always visible

### Tablet (768px - 1199px)
- 2-column metric cards
- Single column layout
- Collapsible navigation

### Mobile (< 768px)
- Single column metric cards
- Single column layout
- Hidden navigation (hamburger menu)

## Color Scheme

### Primary Colors
- **Blue 600**: #2563EB (Primary buttons, active states)
- **Blue 50**: #EFF6FF (Light backgrounds)
- **Blue 700**: #1D4ED8 (Text, borders)

### Status Colors
- **Green 500**: #10B981 (Success, positive metrics)
- **Yellow 500**: #F59E0B (Warning, pending items)
- **Red 500**: #EF4444 (Error, negative metrics)
- **Purple 500**: #8B5CF6 (Information, neutral items)

### Text Colors
- **Gray 900**: #111827 (Primary text)
- **Gray 600**: #4B5563 (Secondary text)
- **Gray 400**: #9CA3AF (Placeholder text)

## Typography

### Font Stack
- **English**: 'Inter', 'Arial', sans-serif
- **Sinhala**: 'Noto Sans Sinhala', 'Iskoola Pota', sans-serif
- **Bilingual**: 'Noto Sans Sinhala', 'Inter', sans-serif

### Font Sizes
- **3xl**: 30px (Main headings)
- **2xl**: 24px (Section headings)
- **xl**: 20px (Card headings)
- **lg**: 18px (Subheadings)
- **base**: 16px (Body text)
- **sm**: 14px (Helper text)
- **xs**: 12px (Captions)

## Interactive Elements

### Buttons
```
Primary Button:
┌─────────────────────┐
│ Add Customer        │ ← bg-blue-600, text-white, hover:bg-blue-700
│ ගනුම්කරුවෙකු එකතු   │
│ කරන්න              │
└─────────────────────┘

Secondary Button:
┌─────────────────────┐
│ Cancel              │ ← border-gray-300, text-gray-700, hover:bg-gray-50
│ අවලංගු කරන්න        │
└─────────────────────┘
```

### Form Fields
```
Input Field:
┌─────────────────────────────────────┐
│ Customer Name / ගනුම්කරුගේ නම        │ ← Label
├─────────────────────────────────────┤
│ Enter name... / නම ඇතුළත් කරන්න... │ ← Input with placeholder
└─────────────────────────────────────┘
```

### Navigation States
```
Default:     👥 Customers / ගනුම්කරුවන්
Hover:       👥 Customers / ගනුම්කරුවන් (bg-gray-100)
Active:      👥 Customers / ගනුම්කරුවන් (bg-blue-50, text-blue-700, border-left-blue)
```

## Accessibility Requirements

### ARIA Labels
- All interactive elements have proper ARIA labels
- Screen reader support for Sinhala content
- Keyboard navigation support

### Color Contrast
- Minimum 4.5:1 contrast ratio for normal text
- Minimum 3:1 contrast ratio for large text
- High contrast mode support

### Focus States
- Visible focus indicators (2px blue ring)
- Logical tab order
- Skip links for keyboard users

## Performance Considerations

### Loading States
- Skeleton screens for metric cards
- Progressive loading for charts
- Lazy loading for activity feeds

### Data Refresh
- Real-time updates for critical metrics
- 30-second refresh for dashboard data
- Manual refresh button available

### Offline Support
- Cached dashboard data
- Offline indicator
- Graceful degradation

## Implementation Notes

### Component Structure
```
AdminDashboard/
├── DashboardHeader/
├── MetricsGrid/
│   ├── MetricCard/
│   └── MetricCard/
├── ChartsSection/
│   ├── CollectionChart/
│   └── TargetProgress/
├── ActivityFeed/
│   ├── RecentPayments/
│   └── NewCustomers/
└── QuickActions/
    └── ActionButton/
```

### State Management
- Global state for dashboard metrics
- Local state for UI interactions
- Real-time subscriptions for live data

### API Endpoints
- `/api/dashboard/metrics` - Key metrics
- `/api/dashboard/activity` - Recent activity
- `/api/dashboard/charts` - Chart data
- `/api/dashboard/refresh` - Manual refresh

This wireframe provides a comprehensive foundation for implementing a user-friendly, bilingual admin dashboard optimized for Sri Lankan micro-lending operations.