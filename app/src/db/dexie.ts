import Dexie, { type Table } from 'dexie'

/**
 * IndexedDB schema for offline-first functionality
 * Mirrors Supabase tables for local caching and offline support
 */

// Type definitions for local database
export interface LocalStore {
    id: number
    name: string
    description?: string
    city?: string
    active: boolean
    synced_at?: number
}

export interface LocalProduct {
    id: number
    store_id: number
    name: string
    sku: string
    barcode?: string
    category_id?: number
    status: string
    synced_at?: number
}

export interface LocalCustomer {
    id: number
    store_id: number
    first_name: string
    last_name?: string
    email?: string
    phone?: string
    synced_at?: number
}

export interface LocalOrder {
    id?: number
    code: string
    store_id: number
    customer_id?: number
    register_id?: number
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
    stores!: Table<LocalStore, number>
    products!: Table<LocalProduct, number>
    customers!: Table<LocalCustomer, number>
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
