# Admin Panel Implementation Instructions
## User Editing UI with Reusable DataTable

### Overview
This feature adds a reusable DataTable component and user editing functionality to the admin panel with:
- Horizontal scrollable table with sticky actions column
- Sticky header row
- Column visibility toggles
- Edit user dialog with validation
- Phone change requires reason confirmation
- Email change with optional reason

### Files to Create/Update

#### 1. DataTable Component (NEW FILE)
**File:** `src/components/DataTable.tsx`

**Purpose:** Reusable table component with advanced features

Copy the entire `DataTable.tsx` file from the updates folder.

**Features:**
- Horizontal scroll with custom scrollbars
- Sticky actions column (always visible on right)
- Sticky header row
- Column visibility toggle menu
- Configurable columns with render functions
- Actions per row with conditional visibility
- Loading and empty states
- Responsive design

**Props:**
```typescript
interface DataTableProps {
  columns: DataTableColumn[];        // Column definitions
  data: any[];                       // Data rows
  actions?: DataTableAction[];       // Row actions
  onRowClick?: (row: any) => void;   // Row click handler
  loading?: boolean;                 // Loading state
  emptyMessage?: string;             // Empty state message
  stickyHeader?: boolean;            // Sticky header (default: true)
  maxHeight?: string | number;       // Max table height
  rowKey: keyof T | ((row: T) => string); // Unique row identifier
}
```

#### 2. Edit User Dialog (NEW FILE)
**File:** `src/components/EditUserDialog.tsx`

**Purpose:** User profile editing dialog

Copy the entire `EditUserDialog.tsx` file from the updates folder.

**Features:**
- Edit name, email, phone, status, level
- Phone change confirmation with mandatory reason
- Email change with optional reason
- Real-time validation
- Warning alerts for critical changes
- Prevents editing admin users
- Level field only for customers

#### 3. User Mutation Hooks (NEW FILE)
**File:** `src/hooks/Admin/mutations/users.ts`

**Purpose:** API hooks for user editing

Copy the entire `users.ts` file from the updates folder.

**Hooks:**
- `useEditUser()` - Edit user profile
- `useChangeUserPhone()` - Change phone with reason
- `useChangeUserEmail()` - Change email with reason

#### 4. Customer Page (UPDATE)
**File:** `src/pages/Customer.tsx`

**Purpose:** Migrate to new DataTable component

Copy the entire updated `Customer.tsx` file from the updates folder.

**Changes:**
- Replaces old Table with new DataTable component
- Adds column definitions (Name, Level, Phone, Email, Status, Created At)
- Adds action definitions (View Details, Edit User)
- Integrates EditUserDialog
- Maintains existing pagination and filters

#### 5. Driver Page (UPDATE)
**File:** `src/pages/Driver.tsx`

**Purpose:** Migrate to new DataTable component

Copy the entire updated `Driver.tsx` file from the updates folder.

**Changes:**
- Replaces old Table with new DataTable component
- Adds column definitions (Name, Phone, Email, Status, Documents, Created At)
- Adds action definitions (View Details, Edit Rider, Manage Documents)
- Integrates EditUserDialog
- Maintains existing document upload dialog functionality

#### 6. Vendor Page (UPDATE)
**File:** `src/pages/Vendor.tsx`

**Purpose:** Migrate to new DataTable component

Copy the entire updated `Vendor.tsx` file from the updates folder.

**Changes:**
- Replaces old Table with new DataTable component
- Adds column definitions (Vendor with Avatar, Phone, Status, Laundries, Created At)
- Adds action definitions (View Details, Edit Vendor, Upload Image)
- Integrates EditUserDialog
- Maintains existing image upload functionality
- Keeps vendor statistics chips

### Implementation Steps

1. **Copy all files from updates/admin-panel/ to your admin panel:**
   ```bash
   # From admin-panel root directory
   cp /path/to/updates/admin-panel/DataTable.tsx src/components/
   cp /path/to/updates/admin-panel/EditUserDialog.tsx src/components/
   cp /path/to/updates/admin-panel/users.ts src/hooks/Admin/mutations/
   cp /path/to/updates/admin-panel/Customer.tsx src/pages/
   cp /path/to/updates/admin-panel/Driver.tsx src/pages/
   cp /path/to/updates/admin-panel/Vendor.tsx src/pages/
   ```

2. **Restart development server:**
   ```bash
   npm run dev
   ```

3. **Test the implementation:**
   - Navigate to Customers, Drivers, and Vendors pages
   - Try column visibility toggle
   - Try horizontal scroll
   - Click Edit button on a user
   - Test editing user fields
   - Verify all actions work (View, Edit, Upload Image/Documents)

### DataTable Usage Pattern

The DataTable component can be applied to any list view. Here's the pattern:

```typescript
// Define columns
const columns: DataTableColumn[] = [
  {
    id: 'name',
    label: 'Name',
    minWidth: 150,
    accessor: 'name',  // Direct field access
  },
  {
    id: 'status',
    label: 'Status',
    minWidth: 100,
    render: (row) => (  // Custom render
      <Chip label={row.status} color="success" />
    ),
  },
];

// Define actions
const actions: DataTableAction[] = [
  {
    label: 'View',
    icon: <Visibility fontSize="small" />,
    onClick: (row) => navigate(`/detail/${row.id}`),
    color: 'primary',
  },
  {
    label: 'Edit',
    icon: <Edit fontSize="small" />,
    onClick: (row) => openEditDialog(row),
    show: (row) => row.canEdit,  // Conditional
  },
];

// Use in component
<DataTable
  columns={columns}
  data={data}
  actions={actions}
  onRowClick={handleRowClick}
  rowKey="id"
  maxHeight="65vh"
/>
```

### Updated Pages Features

#### Customer Page
The updated Customer page demonstrates:

1. **Column Definitions:**
   - Name (with fallback to firstName/lastName)
   - Level (with Chip styling: LOYAL, BASIC, ELITE)
   - Phone
   - Email
   - Status (with Chip styling: ACTIVE, INACTIVE)
   - Created At

2. **Actions:**
   - View Details - Opens detail page
   - Edit User - Opens edit dialog

#### Driver Page
The updated Driver page demonstrates:

1. **Column Definitions:**
   - Name (with fallback to firstName/lastName)
   - Phone
   - Email
   - Status (with Chip styling: ACTIVE, INACTIVE, REJECTED)
   - Documents (with status indicator: Complete, Pending, Missing)
   - Created At

2. **Actions:**
   - View Details - Opens detail page
   - Edit Rider - Opens edit dialog
   - Manage Documents - Opens document upload dialog

#### Vendor Page
The updated Vendor page demonstrates:

1. **Column Definitions:**
   - Vendor (with avatar image and email sub-text)
   - Phone
   - Status (with Chip styling: ACTIVE, INACTIVE, REJECTED)
   - Laundries (count with icon)
   - Created At

2. **Actions:**
   - View Details - Opens detail page
   - Edit Vendor - Opens edit dialog
   - Upload Image - Opens file picker for profile image

3. **Additional Features:**
   - Statistics chips showing vendor and laundry counts
   - Avatar click to upload image
   - Upload overlay during image processing

#### Common Features (All Pages)
- Edit Dialog Integration:
  - Opens when Edit button clicked
  - Closes on save or cancel
  - Refreshes data on save
  - Phone changes require reason
  - Email changes have optional reason
  - Level field only for customers

### UI Behavior

#### Column Visibility Toggle
- Click column icon in top right
- Check/uncheck columns to show/hide
- Columns marked `hideable: false` cannot be hidden
- Settings are not persisted (reset on page reload)

#### Horizontal Scroll
- Table scrolls horizontally when columns exceed viewport
- Custom scrollbar styling (thin, gray)
- Actions column stays fixed on right side
- Shadow indicator shows when content is scrollable

#### Sticky Elements
- Header row stays visible when scrolling vertically
- Actions column stays visible when scrolling horizontally
- Both work together for optimal UX

#### Edit Dialog
- **Phone Change:**
  - Shows warning alert
  - Requires reason (min 10 chars)
  - Validates Saudi format
  - Shows confirmation details

- **Email Change:**
  - Optional reason field
  - Validates email format
  - Shows change confirmation

- **Status/Level:**
  - Dropdown selections
  - Level only for customers
  - Status options vary by user type

### Applying to Other Lists

To apply the DataTable to other list pages (Drivers, Vendors, Orders, etc.):

1. **Import components:**
   ```typescript
   import DataTable, { DataTableColumn, DataTableAction } from '../components/DataTable';
   ```

2. **Define columns based on your data:**
   ```typescript
   const columns: DataTableColumn[] = [
     { id: 'field1', label: 'Label 1', accessor: 'field1' },
     { id: 'field2', label: 'Label 2', render: (row) => <CustomRender /> },
   ];
   ```

3. **Define actions:**
   ```typescript
   const actions: DataTableAction[] = [
     { label: 'View', icon: <Visibility />, onClick: handleView },
     { label: 'Edit', icon: <Edit />, onClick: handleEdit },
   ];
   ```

4. **Replace old Table with DataTable:**
   ```typescript
   <DataTable
     columns={columns}
     data={items}
     actions={actions}
     rowKey="id"
   />
   ```

### Testing Checklist

#### DataTable Component
- [ ] DataTable component renders correctly on all three pages
- [ ] Column visibility toggle works
- [ ] Horizontal scroll works (if many columns)
- [ ] Actions column stays fixed on right
- [ ] Header row stays fixed on scroll
- [ ] Row click navigation works
- [ ] Uniform header color across all pages (secondary theme color)

#### Customer Page
- [ ] All columns display correctly (Name, Level, Phone, Email, Status, Created At)
- [ ] Level chips show correct colors (LOYAL = secondary, others = default)
- [ ] View Details and Edit User actions work
- [ ] Edit button opens dialog
- [ ] Pagination and filters work

#### Driver Page
- [ ] All columns display correctly (Name, Phone, Email, Status, Documents, Created At)
- [ ] Document status indicators show correctly (Complete/Pending/Missing)
- [ ] View Details, Edit Rider, and Manage Documents actions work
- [ ] Document upload dialog works
- [ ] Pagination works

#### Vendor Page
- [ ] All columns display correctly (Vendor with Avatar, Phone, Status, Laundries, Created At)
- [ ] Statistics chips display correctly
- [ ] Avatar displays and can be clicked to upload
- [ ] View Details, Edit Vendor, and Upload Image actions work
- [ ] Image upload overlay appears during processing
- [ ] Laundry count displays correctly for each vendor
- [ ] Pagination works

#### Edit Dialog (All Pages)
- [ ] Edit dialog form validates correctly
- [ ] Phone change requires reason (min 10 chars)
- [ ] Email change validates format
- [ ] Status dropdown works
- [ ] Level field only shows for customers
- [ ] Save button updates user
- [ ] Cancel button closes without saving
- [ ] Success/error toasts appear
- [ ] Table data refreshes after edit
- [ ] Cannot edit admin users

### TypeScript Types

The user type should include:
```typescript
interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'REJECTED';
  level?: 'BASIC' | 'LOYAL' | 'ELITE' | null;
  type: 'USER' | 'VENDOR' | 'RIDER' | 'ADMIN';
}
```

### Styling

The DataTable uses Material-UI theming:
- Header background: `theme.palette.secondary.main`
- Header text: `white`
- Actions column shadow: `rgba(0,0,0,0.1)`
- Scrollbar: Custom styling for better UX
- Chips: Color-coded by status/level

### Notes

- The DataTable is fully responsive
- Column `minWidth` prevents columns from being too small
- Actions column width adapts to number of actions
- Row hover effect provides visual feedback
- Loading state shows centered text
- Empty state shows custom message
- All icons use Material-UI icons
- Tooltips on action buttons improve accessibility
