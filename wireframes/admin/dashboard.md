# Admin Dashboard Wireframe

Main dashboard interface for system administrators.

## Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Logo] Micro Lending System    [🔔] [🌐 Si/En] [👤 Admin] [⚙️] [🚪]         │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🏠 Dashboard  👥 Customers  💰 Loans  💳 Payments  📊 Reports  👤 Users      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │ Total Customers │  │   Active Loans  │  │ Today's Collection│             │
│  │      1,245      │  │       456       │  │   Rs. 125,000   │              │
│  │   ↗️ +25 today   │  │  ↗️ +8 this week │  │   📈 92% target  │              │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘              │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │  Outstanding   │  │  Overdue Loans  │  │  New Applications│              │
│  │  Rs. 2,450,000 │  │       12        │  │        8        │              │
│  │   ⚠️ 3% increase │  │   🔴 Urgent     │  │   📋 Pending    │              │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘              │
│                                                                             │
│  ┌───────────────────────────────────────┐  ┌─────────────────────────────┐ │
│  │        📈 Collection Trends           │  │     🎯 Agent Performance    │ │
│  │                                       │  │                             │ │
│  │  ├─┐                                  │  │ Nimal Silva      89% ■■■■░  │ │
│  │  │ │     ├─┐                          │  │ Kamala Perera    92% ■■■■■  │ │
│  │  │ │  ├─┐│ │     ├─┐                  │  │ Sunil Fernando   76% ■■■░░  │ │
│  │  │ │  │ ││ │  ├─┐│ │                  │  │ Priya Rajesh     94% ■■■■■  │ │
│  │  └─┴──┴─┘└─┴──┴─┘└─┘                  │  │                             │ │
│  │   M  T  W  T  F  S  S                 │  │ [View Details] [Assign]     │ │
│  └───────────────────────────────────────┘  └─────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                     🚨 Alerts & Notifications                        │ │
│  │                                                                       │ │
│  │ 🔴 HIGH: 5 customers with payments >30 days overdue                  │ │
│  │ 🟡 MED:  Loan application #LN789 needs approval                      │ │
│  │ 🟢 INFO: Weekly backup completed successfully                        │ │
│  │ 🔵 NEW:  Agent Nimal submitted 15 collections                        │ │
│  │                                                                       │ │
│  │ [Mark All Read] [View All Notifications]                             │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌─────────────────────────────┐  ┌─────────────────────────────────────┐   │
│  │      📅 Quick Actions       │  │         📊 Recent Activity          │   │
│  │                             │  │                                     │   │
│  │ [+ Add Customer]            │  │ 10:30 Payment recorded - CUST001   │   │
│  │ [+ Create Loan]             │  │ 10:15 Loan approved - LN456        │   │
│  │ [📊 Generate Report]        │  │ 09:45 Customer added - CUST234     │   │
│  │ [⚙️ System Settings]        │  │ 09:30 Payment overdue - CUST789    │   │
│  │ [👥 Manage Users]           │  │ 09:15 Agent login - Nimal Silva    │   │
│  │                             │  │                                     │   │
│  └─────────────────────────────┘  └─────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### Header Section
- **Logo & Brand**: Company branding on top left
- **Language Toggle**: Sinhala/English switcher (🌐 Si/En)
- **Notifications**: Bell icon with badge for unread notifications
- **User Menu**: Admin profile dropdown with settings and logout
- **Settings**: Quick access to system settings
- **Logout**: Clear logout button

### Navigation Bar
- **Dashboard**: Current page (highlighted)
- **Customers**: Customer management section
- **Loans**: Loan processing and management
- **Payments**: Payment collection and tracking
- **Reports**: Analytics and reporting
- **Users**: User and agent management

### Key Metrics Cards (Top Row)
1. **Total Customers**
   - Current count: 1,245
   - Daily change indicator: +25 today
   - Trend arrow (up/down)

2. **Active Loans**
   - Current count: 456
   - Weekly change: +8 this week
   - Growth indicator

3. **Today's Collection**
   - Amount: Rs. 125,000
   - Target achievement: 92%
   - Performance indicator

### Secondary Metrics Cards
1. **Outstanding Amount**
   - Total: Rs. 2,450,000
   - Change indicator: 3% increase
   - Warning if significant increase

2. **Overdue Loans**
   - Count: 12
   - Status: Urgent (red indicator)
   - Quick action needed

3. **New Applications**
   - Count: 8
   - Status: Pending review
   - Approval workflow

### Charts Section
1. **Collection Trends**
   - Weekly bar chart
   - Shows daily collection amounts
   - Hover details for exact amounts
   - Export functionality

2. **Agent Performance**
   - List of agents with performance percentages
   - Progress bars for visual representation
   - Quick actions: View Details, Assign customers
   - Color coding for performance levels

### Alerts & Notifications Panel
- **Priority-based alerts** (High, Medium, Info, New)
- **Color coding** for different alert types
- **Quick actions**: Mark as read, view details
- **Expandable list** with pagination

### Quick Actions Panel
- **Frequently used functions**
- **One-click access** to common tasks
- **Role-appropriate actions** for admins
- **Customizable shortcuts**

### Recent Activity Feed
- **Real-time activity stream**
- **Timestamped entries**
- **Filterable by type**
- **Click to view details**

## Responsive Behavior

### Desktop (1200px+)
- Full layout as shown above
- All components visible
- Maximum information density

### Tablet (768px - 1199px)
- Metrics cards stack in 2x3 grid
- Charts become scrollable horizontally
- Side panels stack vertically

### Mobile (< 768px)
- Single column layout
- Metrics cards stack vertically
- Charts become swipeable
- Navigation collapses to hamburger menu

## Interactions

### Metric Cards
- **Click**: Navigate to detailed view
- **Hover**: Show additional context
- **Color changes** based on performance

### Charts
- **Hover**: Show data tooltips
- **Click**: Drill down to details
- **Touch**: Swipe for mobile navigation

### Alerts
- **Click**: View full alert details
- **Dismiss**: Mark as read/resolved
- **Filter**: By priority or type

### Quick Actions
- **Direct navigation** to respective sections
- **Modal dialogs** for quick tasks
- **Keyboard shortcuts** support

## Accessibility Features

### Visual
- **High contrast** color scheme option
- **Large text** mode available
- **Focus indicators** on all interactive elements

### Navigation
- **Keyboard navigation** throughout
- **Skip links** for screen readers
- **Logical tab order**

### Content
- **Alt text** for all charts and graphics
- **ARIA labels** for complex components
- **Screen reader** compatible

## Sinhala Language Considerations

### Text Display
- **Font**: Noto Sans Sinhala for proper rendering
- **Numbers**: Support for Sinhala numerals option
- **Date formats**: Sri Lankan date formats
- **Currency**: LKR symbol and formatting

### Layout
- **Text expansion**: Allow for longer Sinhala text
- **Reading patterns**: Consider reading flow
- **Cultural colors**: Use appropriate color schemes

### Input Methods
- **Sinhala keyboard** support
- **Transliteration** for names
- **Mixed language** content handling

## Performance Considerations

### Loading
- **Skeleton screens** while loading data
- **Progressive loading** of non-critical content
- **Cached metric** updates

### Real-time Updates
- **WebSocket connections** for live data
- **Efficient polling** for critical metrics
- **Background sync** for offline capability

### Data Management
- **Pagination** for large datasets
- **Lazy loading** for charts and tables
- **Local caching** for frequently accessed data

This dashboard provides a comprehensive overview while maintaining usability and performance for Sri Lankan micro-finance business administrators.