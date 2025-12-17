import Dexie, { type Table } from 'dexie'

/**
 * IndexedDB schema for offline-first functionality
 * Mirrors Supabase tables for local caching and offline support
 */

export interface LocalStore {
    id: string
    name: string
    description?: string
    city?: string
    active: boolean
    synced_at?: number
}

export interface LocalProduct {
    id: string
    store_id: string
    name: string
    sku: string
    barcode?: string
    category_id?: string
    status: string
    synced_at?: number
}

export interface LocalCustomer {
    id: string
    store_id: string
    first_name: string
    last_name?: string
    email?: string
    phone?: string
    synced_at?: number
}

export interface LocalOrder {
    id?: number
    code: string
    store_id: string
    customer_id?: string
    register_id?: string
    total: number
    payment_status: string
    status: string
    created_at?: number
    synced: boolean
}

export interface SyncOutbox {
    id?: number
    table_name: string
    record_id: string
    operation: 'insert' | 'update' | 'delete'
    payload: any
    status: 'pending' | 'syncing' | 'synced' | 'failed'
    retry_count: number
    created_at: number
}

/**
 * Dexie Database Class
 */
class VuePOSDatabase extends Dexie {
    stores!: Table<LocalStore, string>
    products!: Table<LocalProduct, string>
    customers!: Table<LocalCustomer, string>
    orders!: Table<LocalOrder, number>
    sync_outbox!: Table<SyncOutbox, number>

	    constructor() {
	        super('VuePOS')
	
	        this.version(1).stores({
	            // Core tables
	            stores: 'id, name, active',
	            products: 'id, store_id, sku, barcode, name, status',
	            customers: 'id, store_id, phone, email',
	            orders: '++id, code, store_id, customer_id, created_at, synced',
	
	            // Sync infrastructure
	            sync_outbox: '++id, status, table_name, created_at',
	        })

	        // Version 2: add remaining tables so IndexedDB
	        // structure mirrors Supabase public schema.
	        // Most tables use `id` as primary key; for join
	        // tables without `id` we use a composite key.
	        this.version(2).stores({
	            // Auth & RBAC
	            profiles: 'id',
	            roles: 'id',
	            permissions: 'id',
	            role_permissions: '[role_id+permission_id], role_id, permission_id',
	            user_roles: 'id, user_id, role_id',
	            store_users: 'id, store_id, user_id, role_id',

	            // Multi-store & payments
	            payment_types: 'id, identifier',
	            registers: 'id, store_id',
	            register_history: 'id, register_id',

	            // Products & inventory
	            product_categories: 'id, store_id, parent_id',
	            tax_groups: 'id',
	            taxes: 'id, tax_group_id',
	            unit_groups: 'id',
	            units: 'id, group_id',
	            product_unit_quantities: 'id, product_id, unit_id',
	            product_history: 'id, product_id',

	            // Customers
	            customer_groups: 'id, store_id',
	            customer_addresses: 'id, customer_id',
	            customer_account_history: 'id, customer_id',

	            // Suppliers & procurement
	            providers: 'id, store_id',
	            procurements: 'id, store_id, provider_id',
	            procurement_products: 'id, procurement_id, product_id',

	            // Orders & sales (detail tables)
	            coupons: 'id, store_id',
	            order_products: 'id, order_id, product_id',
	            order_payments: 'id, order_id, payment_type_id',
	            order_addresses: 'id, order_id',
	            order_taxes: 'id, order_id, tax_id',
	            order_coupons: 'id, order_id, coupon_id',

	            // Dashboard & analytics
	            dashboard_days: 'id, store_id',
	            dashboard_months: 'id, store_id',

	            // Sync & activity
	            sync_log: 'id, store_id',
	            device_registrations: 'id, user_id, store_id',
	            activity_log: 'id, store_id, user_id',
	        })
	    }
	}

// Export single instance
export const db = new VuePOSDatabase()

/**
 * Helper to add record to sync queue
 */
export const queueSync = async (
    tableName: string,
    recordId: string | number,
    operation: 'insert' | 'update' | 'delete',
    payload: any
) => {
    await db.sync_outbox.add({
        table_name: tableName,
        record_id: recordId.toString(),
        operation,
        payload,
        status: 'pending',
        retry_count: 0,
        created_at: Date.now(),
    })
}

/**
 * Helper to mark record as synced
 */
export const markSynced = async (outboxId: number) => {
    await db.sync_outbox.update(outboxId, {
        status: 'synced',
    })
}

/**
 * Helper to get pending sync items
 */
export const getPendingSync = async () => {
    return await db.sync_outbox
        .where('status')
        .equals('pending')
        .toArray()
}
