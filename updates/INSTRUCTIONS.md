# Admin Panel Updates - Sidebar Sections & Category Navigation

## 📋 Overview
This update implements:
1. Collapsible sidebar with sections
2. Category-based navigation flow (Laundry → Services → Categories → Items)
3. Reordering hooks for services and items
4. @dnd-kit library integration

## 🎯 Changes Summary
- Refactor Sidebar component with collapsible sections
- Create new LaundryServiceCategories page
- Update routing in App.tsx
- Update LaundryServices navigation
- Add reordering hooks to laundryHooks.ts
- Install @dnd-kit dependencies

## 📝 Step-by-Step Instructions

### 1. Install Dependencies
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### 2. Update Sidebar Component
**File:** `src/components/Sidebar.tsx`
**Action:** Replace entire file with content from `files/Sidebar.tsx`

**Key changes:**
- Adds collapsible sections support
- Creates "Laundry" section with: Laundry, Categories, Icons
- Auto-expands section when on active route
- Uses Material-UI Collapse component

### 3. Update App.tsx
**File:** `src/App.tsx`

**Change 1:** Add import (around line 32)
```typescript
import LaundryServiceCategories from './pages/LaundryServiceCategories';
```

**Change 2:** Update routes (around line 90-97)
Replace:
```typescript
<Route
  path='/laundry/:laundryId/service/:serviceId/items'
  element={<LaundryServiceItems />}
/>
```

With:
```typescript
<Route
  path='/laundry/:laundryId/service/:serviceId/categories'
  element={<LaundryServiceCategories />}
/>
<Route
  path='/laundry/:laundryId/service/:serviceId/category/:categoryId/items'
  element={<LaundryServiceItems />}
/>
```

**Full section should look like:**
```typescript
<Route path='/laundry' element={<Laundry />} />
<Route path='/laundry/categories' element={<Categories />} />
<Route path='/laundry/:laundryId/edit' element={<EditLaundry />} />
<Route
  path='/laundry/:laundryId/services'
  element={<LaundryServices />}
/>
<Route
  path='/laundry/:laundryId/service/:serviceId/categories'
  element={<LaundryServiceCategories />}
/>
<Route
  path='/laundry/:laundryId/service/:serviceId/category/:categoryId/items'
  element={<LaundryServiceItems />}
/>
```

### 4. Create New Page
**File:** `src/pages/LaundryServiceCategories.tsx`
**Action:** Copy entire file from `files/LaundryServiceCategories.tsx`

This page:
- Shows all global categories as cards
- Allows clicking to navigate to items for that category
- Includes breadcrumb navigation
- Has hover effects and responsive grid

### 5. Update LaundryServices Page
**File:** `src/pages/LaundryServices.tsx`
**Location:** Line 194

**Change:**
```typescript
// OLD:
navigate(`/laundry/${laundryId}/service/${serviceId}/items`);

// NEW:
navigate(`/laundry/${laundryId}/service/${serviceId}/categories`);
```

### 6. Add Reordering Hooks
**File:** `src/hooks/Admin/laundryHooks.ts`
**Location:** At the end of the file (after `useDeleteCategory`)

**Action:** Add content from `files/reordering-hooks.ts`

This adds:
- `useReorderLaundryServices()` - Reorder services within a laundry
- `useReorderLaundryServiceItems()` - Reorder items within service + category

## ✅ Verification Checklist
- [ ] Dependencies installed (@dnd-kit packages)
- [ ] Sidebar shows collapsible "Laundry" section
- [ ] Routes updated in App.tsx
- [ ] LaundryServiceCategories page created
- [ ] LaundryServices navigation updated
- [ ] Reordering hooks added
- [ ] No TypeScript errors
- [ ] App compiles successfully

## 🚀 Testing the Flow
1. Start dev server: `npm run dev`
2. Navigate to Laundry page
3. Click "View Services" on a laundry
4. Click "View Items" on a service → Should show categories page
5. Click a category → Should show items for that service+category
6. Check sidebar "Laundry" section is collapsible

## 🚀 Deployment
After applying changes:
```bash
git add -A
git commit -m "feat: Implement category-based navigation and sidebar sections"
git push -u origin claude/sidebar-and-categories-0145k7K8cqxXHiKhaxSNNE1u
```

## 📌 Notes
- Navigation flow: Laundry → Services → **Categories** → Items
- Sidebar auto-expands when on active route
- All categories shown (not filtered by service)
- Ready for drag-and-drop implementation (libraries installed)
