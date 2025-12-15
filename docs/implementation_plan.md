# VuePOS Indonesia - Technical Documentation & Implementation Plan

## Overview

Sistem Point of Sale (POS) untuk bisnis retail Indonesia dengan arsitektur offline-first, multi-store, dan multi-user. Semua operasi CRUD menggunakan **modal/popup** sesuai pola NexoPOS.

> [!IMPORTANT]
> Semua form Create/Edit/Delete/Detail menggunakan modal popup - bukan halaman terpisah.

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Vue.js | 3.x | Framework UI reaktif dengan Composition API |
| TailwindCSS | 3.x | Utility-first CSS (tanpa rounded corners) |
| Headless UI | 1.7.x | Komponen accessible untuk Vue |
| Tauri | 2.x | Desktop app wrapper (Windows native) |
| Pinia | 2.x | State management |
| Vue Router | 4.x | Routing SPA |

### Backend & Database
| Technology | Purpose |
|------------|---------|
| Supabase Auth | Authentication dengan Row Level Security |
| Supabase Realtime | Sync data antar device/kasir |
| Supabase PostgreSQL | Cloud database utama |
| Dexie.js | IndexedDB wrapper untuk offline-first |

---

## Proposed Changes

### Folder Structure dengan Modal CRUD

#### [NEW] [folder_structure.txt](file:///c:/vue_pos/docs/folder_structure.txt)

```
vue_pos/
├── docs/                       # Documentation
│   ├── database_schema.sql
│   ├── folder_structure.txt
│   └── technical_notes.md
│
├── src/
│   ├── assets/
│   │   └── icons/              # SVG icons
│   │
│   ├── components/             # Reusable (max 200 LOC each)
│   │   │
│   │   ├── base/               # ═══ BASE FORM COMPONENTS ═══
│   │   │   ├── WinButton.vue   # Button dengan variants
│   │   │   ├── WinIconButton.vue # Icon-only button
│   │   │   ├── WinInput.vue    # Text input
│   │   │   ├── WinSelect.vue   # Dropdown select
│   │   │   ├── WinMultiselect.vue # Multi-select
│   │   │   ├── WinCheckbox.vue # Checkbox
│   │   │   ├── WinSwitch.vue   # Toggle switch
│   │   │   ├── WinRadio.vue    # Radio button
│   │   │   ├── WinTextarea.vue # Textarea
│   │   │   ├── WinDatePicker.vue # Date picker
│   │   │   ├── WinSearchSelect.vue # Searchable select
│   │   │   └── WinField.vue    # Field wrapper (label+input+error)
│   │   │
│   │   ├── layout/             # ═══ LAYOUT COMPONENTS ═══
│   │   │   ├── WinWindow.vue   # Window frame
│   │   │   ├── WinTitleBar.vue # Title bar
│   │   │   ├── WinMenuBar.vue  # Menu bar
│   │   │   ├── WinStatusBar.vue# Status bar
│   │   │   ├── WinToolbar.vue  # Toolbar
│   │   │   ├── WinSidebar.vue  # Sidebar
│   │   │   └── WinTabs.vue     # Tab container
│   │   │
│   │   ├── data/               # ═══ DATA DISPLAY COMPONENTS ═══
│   │   │   ├── WinTable.vue    # Data table dengan actions
│   │   │   ├── WinTableRow.vue # Table row dengan context menu
│   │   │   ├── WinCard.vue     # Card container
│   │   │   ├── WinList.vue     # List view
│   │   │   ├── WinTree.vue     # Tree view
│   │   │   └── WinPaginate.vue # Pagination
│   │   │
│   │   ├── feedback/           # ═══ FEEDBACK COMPONENTS ═══
│   │   │   ├── WinToast.vue    # Toast notification
│   │   │   ├── WinAlert.vue    # Alert box
│   │   │   ├── WinProgress.vue # Progress bar
│   │   │   ├── WinSpinner.vue  # Loading spinner
│   │   │   └── WinNotice.vue   # Notice/warning box
│   │   │
│   │   ├── crud/               # ═══ CRUD COMPONENTS ═══
│   │   │   ├── WinCrud.vue     # Table + actions (create/edit/delete)
│   │   │   └── WinCrudForm.vue # Dynamic form for CRUD
│   │   │
│   │   └── pos/                # ═══ POS-SPECIFIC COMPONENTS ═══
│   │       ├── ProductGrid.vue # Product grid display
│   │       ├── CartList.vue    # Shopping cart list
│   │       ├── CartItem.vue    # Single cart item
│   │       ├── PaymentPanel.vue# Payment panel
│   │       ├── CustomerSelect.vue # Customer selector
│   │       ├── ReceiptPreview.vue # Receipt preview
│   │       └── NumPad.vue      # Numeric keypad
│   │
│   ├── popups/                 # ═══ MODAL POPUPS (43+ files) ═══
│   │   │
│   │   ├── base/               # --- Base Modal Components ---
│   │   │   ├── PopupContainer.vue  # Modal wrapper/overlay
│   │   │   ├── AlertPopup.vue      # Simple alert
│   │   │   ├── ConfirmPopup.vue    # Confirm action (Yes/No)
│   │   │   ├── PromptPopup.vue     # Input prompt
│   │   │   ├── SelectPopup.vue     # Selection list
│   │   │   └── LoadingPopup.vue    # Loading indicator
│   │   │
│   │   ├── crud/               # --- Generic CRUD Modals ---
│   │   │   ├── CreateFormPopup.vue # Generic create form
│   │   │   ├── EditFormPopup.vue   # Generic edit form (preloaded)
│   │   │   ├── DetailPopup.vue     # View detail
│   │   │   └── DeleteConfirmPopup.vue # Delete confirmation
│   │   │
│   │   ├── products/           # --- Product Management ---
│   │   │   ├── ProductFormPopup.vue    # Create/Edit product
│   │   │   ├── ProductDetailPopup.vue  # View product detail
│   │   │   ├── ProductPreviewPopup.vue # Quick preview
│   │   │   ├── CategoryFormPopup.vue   # Create/Edit category
│   │   │   ├── UnitFormPopup.vue       # Create/Edit unit
│   │   │   └── StockAdjustPopup.vue    # Stock adjustment
│   │   │
│   │   ├── customers/          # --- Customer Management ---
│   │   │   ├── CustomerFormPopup.vue   # Create/Edit customer
│   │   │   ├── CustomerDetailPopup.vue # View customer detail
│   │   │   ├── CustomerSelectPopup.vue # Select customer for POS
│   │   │   ├── CustomerGroupFormPopup.vue # Customer group
│   │   │   └── CustomerTransactionPopup.vue # Transaction history
│   │   │
│   │   ├── orders/             # --- Order/Transaction ---
│   │   │   ├── OrderPreviewPopup.vue   # View order detail
│   │   │   ├── OrderFilterPopup.vue    # Filter orders
│   │   │   ├── OrderRefundPopup.vue    # Process refund
│   │   │   └── OrderPrintPopup.vue     # Print receipt options
│   │   │
│   │   ├── pos/                # --- POS Operations ---
│   │   │   ├── POSPaymentPopup.vue     # Payment processing
│   │   │   ├── POSDiscountPopup.vue    # Apply discount
│   │   │   ├── POSQuantityPopup.vue    # Change quantity
│   │   │   ├── POSNotePopup.vue        # Order note
│   │   │   ├── POSHoldOrderPopup.vue   # Hold/pending order
│   │   │   ├── POSPendingOrdersPopup.vue # List pending orders
│   │   │   ├── POSQuickProductPopup.vue  # Quick add product
│   │   │   ├── POSSearchProductPopup.vue # Search product
│   │   │   ├── POSCouponPopup.vue      # Apply coupon
│   │   │   ├── POSShippingPopup.vue    # Shipping info
│   │   │   └── POSOrderTypePopup.vue   # Order type selection
│   │   │
│   │   ├── register/           # --- Cash Register ---
│   │   │   ├── RegisterOpenPopup.vue   # Open register
│   │   │   ├── RegisterClosePopup.vue  # Close register
│   │   │   ├── RegisterActionPopup.vue # Cash in/out
│   │   │   └── RegisterHistoryPopup.vue # Register history
│   │   │
│   │   ├── inventory/          # --- Inventory/Procurement ---
│   │   │   ├── ProcurementFormPopup.vue  # Create/Edit PO
│   │   │   ├── ProcurementDetailPopup.vue # View PO detail
│   │   │   ├── ProviderFormPopup.vue     # Create/Edit supplier
│   │   │   └── StockTransferPopup.vue    # Stock transfer
│   │   │
│   │   ├── settings/           # --- Settings ---
│   │   │   ├── StoreFormPopup.vue       # Store settings
│   │   │   ├── UserFormPopup.vue        # User CRUD
│   │   │   ├── RoleFormPopup.vue        # Role CRUD
│   │   │   ├── PaymentTypeFormPopup.vue # Payment type CRUD
│   │   │   └── TaxFormPopup.vue         # Tax CRUD
│   │   │
│   │   └── reports/            # --- Reports ---
│   │       ├── ReportFilterPopup.vue    # Report date filter
│   │       └── ReportExportPopup.vue    # Export options
│   │
│   ├── composables/            # ═══ COMPOSABLES (max 200 LOC) ═══
│   │   ├── useAuth.ts          # Authentication
│   │   ├── useStore.ts         # Store context
│   │   ├── useRegister.ts      # Cash register ops
│   │   ├── useCart.ts          # Shopping cart
│   │   ├── useProducts.ts      # Product operations
│   │   ├── useCustomers.ts     # Customer operations
│   │   ├── useOrders.ts        # Order operations
│   │   ├── useSync.ts          # Offline sync
│   │   ├── useKeyboard.ts      # Keyboard shortcuts
│   │   ├── usePrint.ts         # Receipt printing
│   │   └── usePopup.ts         # ★ Popup/modal management
│   │
│   ├── libraries/              # ═══ UTILITY LIBRARIES ═══
│   │   ├── popup.ts            # ★ Popup class (open/close/stack)
│   │   ├── popup-closer.ts     # ★ Auto-close on Escape
│   │   ├── form-validation.ts  # Form validation
│   │   ├── http-client.ts      # HTTP wrapper
│   │   └── snackbar.ts         # Toast notifications
│   │
│   ├── db/                     # Database layer
│   │   ├── supabase.ts
│   │   ├── dexie.ts
│   │   └── sync/
│   │       ├── outbox.ts
│   │       ├── resolver.ts
│   │       └── realtime.ts
│   │
│   ├── layouts/
│   │   ├── MainLayout.vue
│   │   ├── AuthLayout.vue
│   │   └── POSLayout.vue
│   │
│   ├── pages/                  # ═══ PAGE VIEWS (list only) ═══
│   │   ├── auth/
│   │   │   ├── LoginPage.vue
│   │   │   └── LogoutPage.vue
│   │   ├── dashboard/
│   │   │   └── DashboardPage.vue
│   │   ├── pos/
│   │   │   ├── POSPage.vue
│   │   │   └── RegisterPage.vue
│   │   ├── products/
│   │   │   ├── ProductListPage.vue   # List + trigger modal
│   │   │   └── CategoryListPage.vue
│   │   ├── inventory/
│   │   │   ├── StockPage.vue
│   │   │   └── ProcurementListPage.vue
│   │   ├── customers/
│   │   │   └── CustomerListPage.vue
│   │   ├── orders/
│   │   │   └── OrderListPage.vue
│   │   ├── reports/
│   │   │   ├── SalesReportPage.vue
│   │   │   └── InventoryReportPage.vue
│   │   └── settings/
│   │       ├── StoreSettingsPage.vue
│   │       ├── UserListPage.vue
│   │       └── PaymentTypesPage.vue
│   │
│   ├── router/
│   │   └── index.ts
│   │
│   ├── stores/                 # Pinia stores
│   │   ├── authStore.ts
│   │   ├── storeStore.ts
│   │   ├── cartStore.ts
│   │   ├── productStore.ts
│   │   ├── popupStore.ts       # ★ Popup state management
│   │   └── settingsStore.ts
│   │
│   ├── styles/
│   │   ├── base.css
│   │   ├── variables.css
│   │   ├── windows.css         # Windows 10 theme
│   │   ├── popup.css           # ★ Modal/popup styles
│   │   └── print.css
│   │
│   ├── types/
│   │   ├── database.ts
│   │   ├── pos.ts
│   │   ├── popup.ts            # ★ Popup prop types
│   │   └── components.ts
│   │
│   ├── utils/
│   │   ├── currency.ts
│   │   ├── date.ts
│   │   ├── validation.ts
│   │   ├── barcode.ts
│   │   └── shortcuts.ts
│   │
│   ├── App.vue
│   └── main.ts
│
├── src-tauri/
│   ├── src/main.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
│
├── .env.example
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Popup/Modal Architecture

### Popup Library Pattern (dari NexoPOS)

```typescript
// libraries/popup.ts
export class Popup {
  static show(component, params = {}, config = {}) {
    // Open modal dengan component
  }
  
  close(callback?) {
    // Close dengan animation
  }
}

// Usage di component
import { Popup } from '@/libraries/popup'
import ProductFormPopup from '@/popups/products/ProductFormPopup.vue'

// Create
Popup.show(ProductFormPopup, { 
  mode: 'create',
  resolve: (result) => { /* refresh list */ },
  reject: () => { /* cancelled */ }
})

// Edit
Popup.show(ProductFormPopup, {
  mode: 'edit', 
  productId: 123,
  resolve, reject
})
```

### Modal Component Structure

```vue
<!-- popups/base/PopupContainer.vue -->
<template>
  <div class="popup-overlay">
    <div class="popup-body">
      <!-- Header -->
      <div class="popup-header">
        <h3>{{ title }}</h3>
        <WinIconButton @click="close" icon="close"/>
      </div>
      
      <!-- Content (slot) -->
      <div class="popup-content">
        <slot/>
      </div>
      
      <!-- Footer (slot) -->
      <div class="popup-footer">
        <slot name="footer"/>
      </div>
    </div>
  </div>
</template>
```

---

## Database Schema (Summary)

| Domain | Tables |
|--------|--------|
| Auth & Users | profiles, roles, permissions, role_permissions, user_role_relations |
| Multi-Store | stores, store_users, registers, register_history |
| Products | product_categories, unit_groups, units, products, product_unit_quantities, product_history |
| Inventory | providers, procurements, procurement_products |
| Customers | customers, customer_groups, customer_addresses |
| Sales | orders, order_products, order_payments, payment_types |
| Taxes | tax_groups, taxes |
| Accounting | transaction_accounts, transactions, transaction_history |
| Promotions | coupons, coupon_products, coupon_customers, rewards_system |
| Dashboard | dashboard_days, dashboard_months |
| Sync | sync_outbox, sync_log |

> [!NOTE]
> File `database_schema.sql` lengkap akan dibuat setelah plan disetujui.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `F1` | Help |
| `F2` | Search product |
| `F3` | Search customer |
| `F4` | Hold order |
| `F5` | Refresh |
| `F8` | Payment |
| `F9` | Discount |
| `F10` | Settings |
| `F12` | Full screen |
| `Escape` | Close popup |
| `Ctrl+N` | New transaction |
| `Ctrl+P` | Print receipt |
| `+/-` | Increment/decrement quantity |

---

## Verification Plan

### Document Review
1. Konfirmasi struktur folder sesuai workflow development
2. Konfirmasi popup/modal patterns memenuhi kebutuhan CRUD
3. Konfirmasi keyboard shortcuts sesuai kebutuhan kasir Indonesia

### Next Steps (setelah approval)
1. Buat `database_schema.sql` lengkap
2. Buat `folder_structure.txt` final
3. Buat `technical_notes.md` dengan detail implementasi
