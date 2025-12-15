# VuePOS Indonesia - Database Schema Documentation

## Database Overview

**Platform:** Supabase PostgreSQL  
**Total Tables:** 40+  
**RLS Enabled:** All tables  
**Architecture:** Multi-store with Owner/Manager/Cashier role-based access

---

## Access Control Architecture

### Roles

1. **Owner** (`owner`) - Superadmin
   - **Store Access:** ALL stores (tidak terikat dengan store tertentu)
   - **Permissions:** All permissions
   - **Use Case:** Pemilik bisnis yang memiliki banyak toko

2. **Manager** (`manager`)
   - **Store Access:** Assigned stores only
   - **Permissions:** Management permissions (no user management)
   - **Use Case:** Manager yang mengelola 1 atau beberapa toko tertentu

3. **Cashier** (`cashier`)
   - **Store Access:** Assigned stores only
   - **Permissions:** Limited (POS operations, customer view)
   - **Use Case:** Kasir yang bekerja di toko tertentu

### Key RLS Functions

```sql
-- Check if user is Owner (has access to ALL stores)
public.is_owner(user_id UUID) RETURNS BOOLEAN

-- Check if user has access to specific store
public.has_store_access(user_id UUID, store_id INTEGER) RETURNS BOOLEAN

-- Check if user has specific permission
public.has_permission(user_id UUID, permission_namespace TEXT) RETURNS BOOLEAN

-- Get all stores accessible by user
public.get_user_stores(user_id UUID) RETURNS TABLE
```

---

## Table Categories

### 1. Authentication & Authorization (6 tables)
- `profiles` - Extended user profiles
- `roles` - Owner/Manager/Cashier definitions
- `permissions` - Fine-grained permissions
- `role_permissions` - Role-permission mapping
- `user_roles` - User-role assignments

**RLS Policy:** Users can view all profiles, update own profile only.

### 2. Multi-Store (5 tables)
- `stores` - Store/outlet definitions
- `store_users` - User assignments to stores (Manager/Cashier)
- `payment_types` - Payment methods (Cash, QRIS, Transfer, etc.)
- `registers` - Cash registers per store
- `register_history` - Register transactions log

**RLS Policy:** 
- Owner sees all stores
- Manager/Cashier see only assigned stores
- Store assignment managed by Owner only

### 3. Product Management (9 tables)
- `product_categories` - Hierarchical categories
- `tax_groups` - Tax group definitions
- `taxes` - Tax rates (PPN 11%)
- `unit_groups` - Unit groupings
- `units` - Units (pcs, lusin, kg, liter)
- `products` - Master product catalog
- `product_unit_quantities` - Stock & pricing per unit
- `product_history` - Stock movement log

**RLS Policy:** Store-based access. Users can only see/manage products in accessible stores.

**Default Data:**
- PPN 11% tax group
- Common Indonesian units (pcs, lusin, kodi, kg, liter)

### 4. Customers (4 tables)
- `customer_groups` - Customer grouping
- `customers` - Customer master
- `customer_addresses` - Billing/shipping addresses
- `customer_account_history` - Credit account history

**RLS Policy:** Store-based access.

### 5. Inventory & Procurement (4 tables)
- `providers` - Suppliers
- `procurements` - Purchase orders
- `procurement_products` - PO line items

**RLS Policy:** Store-based access.

### 6. Orders & Sales (7 tables)
- `orders` - Sales transactions
- `order_products` - Line items
- `order_payments` - Payment records
- `order_addresses` - Delivery addresses
- `order_taxes` - Tax breakdown
- `coupons` - Discount coupons
- `order_coupons` - Applied coupons

**RLS Policy:** Store-based access. Auto-generate order code: `INV-YYYYMMDD-000001`

### 7. Dashboard & Analytics (2 tables + 3 views)
- `dashboard_days` - Daily aggregates
- `dashboard_months` - Monthly aggregates

**Views:**
- `vw_sales_summary` - Sales by store and date
- `vw_product_stock` - Stock status
- `vw_top_products` - Best sellers

**RLS Policy:** Store-based access.

### 8. Sync & Offline (4 tables)
- `sync_outbox` - Queue for offline-to-cloud sync
- `sync_log` - Sync operation history
- `device_registrations` - Device management
- `activity_log` - Audit trail

**RLS Policy:** Users can manage own sync queues and devices.

---

## Indonesia-Specific Considerations

### 1. Currency Format
- **Type:** `DECIMAL(18,2)`
- **Currency:** Rupiah (IDR)
- **No decimal cents** - Indonesian Rupiah doesn't use decimal points

### 2. Tax (PPN)
- **Current Rate:** 11% (berlaku sejak April 2022)
- **Table:** `taxes` with rate field
- **Flexibility:** Can add historical rates if needed

### 3. Payment Types
Default payment types for Indonesia:
- **Tunai** (Cash)
- **QRIS** (QR Code Payment)
- **Transfer Bank** (BCA, Mandiri, BRI, BNI)
- **Debit Card**
- **Credit Card**
- **E-Wallet** (GoPay, OVO, Dana, ShopeePay)

### 4. Units
Common Indonesian units included:
- **Pieces:** pcs, lusin (12), kodi (20), box
- **Weight:** gram, kg
- **Volume:** ml, liter

### 5. Address Format
- Province (Provinsi)
- City (Kota/Kabupaten)
- Postal Code (Kode Pos)
- Default Country: Indonesia

---

## Security Features

### Row Level Security (RLS)
All tables have RLS enabled with policies based on:
1. **User Role** (Owner/Manager/Cashier)
2. **Store Access** (via `store_users` table)
3. **Permission** (via `role_permissions`)

### Example RLS Policy Structure
```sql
-- Products can only be viewed in accessible stores
CREATE POLICY "Users can view products in accessible stores"
    ON public.products FOR SELECT
    USING (public.has_store_access(auth.uid(), store_id));

-- Only users with permission can create products
CREATE POLICY "Users with permission can create products"
    ON public.products FOR INSERT
    WITH CHECK (
        public.has_store_access(auth.uid(), store_id) AND
        public.has_permission(auth.uid(), 'nexopos.products.create')
    );
```

### Audit Trail
- `activity_log` table tracks all CRUD operations
- Stores: user_id, action, resource_type, resource_id, timestamp

---

## Offline-First Strategy

### Dexie (IndexedDB) ↔ Supabase Sync

1. **Write to Dexie first** (instant UI response)
2. **Queue to `sync_outbox`**
3. **Background sync** to Supabase
4. **Supabase Realtime** broadcasts changes to other devices
5. **Conflict resolution** via timestamps

### Sync Flow
```
[Local Write] → Dexie → sync_outbox → Supabase → Realtime → Other Devices
```

---

## Key Triggers

### Auto-Create Profile
When user signs up via Supabase Auth, profile is automatically created:
```sql
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
```

### Auto-Generate Order Code
Order codes auto-generated as `INV-YYYYMMDD-000001`:
```sql
CREATE TRIGGER generate_order_code_trigger
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_order_code();
```

### Auto-Update Timestamps
`updated_at` automatically updated on all tables with:
```sql
CREATE TRIGGER update_{table}_updated_at
    BEFORE UPDATE ON public.{table}
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();
```

---

## Sample Data Seeded

### Roles
- Owner, Manager, Cashier

### Permissions
24 permissions across stores, products, customers, orders, registers, reports, users

### Tax Groups & Taxes
- PPN 11% (Indonesia VAT)

### Unit Groups & Units
- Pieces: pcs, lusin, kodi, box
- Weight: gram, kg  
- Volume: ml, liter

### Payment Types
- Cash, QRIS, Bank Transfer, Debit/Credit Card, E-Wallet

---

## Migration Files Created

1. `create_profiles_and_roles` - Core auth & RBAC
2. `create_stores_and_registers` - Multi-store setup
3. `create_products_schema` - Product management
4. `create_customers_and_inventory` - Customers & procurement
5. `create_orders_and_dashboard` - Sales & analytics
6. `create_sync_and_offline_support` - Sync & audit

---

## Next Steps for Frontend Implementation

1. **Supabase Client Setup**
   - Initialize with project URL and anon key
   - Configure auth persistence

2. **Dexie Schema**
   - Mirror Supabase schema for offline tables
   - Implement sync queue

3. **RLS-Aware Queries**
   - All queries automatically filtered by RLS policies
   - No need to manually filter by `store_id` if user has proper access

4. **Realtime Subscriptions**
   - Subscribe to `orders`, `products`, `register_history` for live updates

5. **Offline Sync Manager**
   - Monitor `sync_outbox` table
   - Batch sync when online
   - Handle conflicts

---

## Schema Verification

✅ All 40+ tables created successfully  
✅ All RLS policies applied  
✅ All indexes created  
✅ All triggers active  
✅ All helper functions deployed  
✅ Sample data seeded  
✅ Analytics views created  

**Database Ready for Frontend Development!**
