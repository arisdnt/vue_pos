import { supabase } from '@/db/supabase'
import {
    db,
    type LocalStore,
    type LocalProduct,
    type LocalCustomer,
    type LocalOrder,
    type SyncOutbox,
} from '@/db/dexie'
import type { Database } from '@/types/database'

// Tables we want to fully mirror: 1x bootstrap and realtime sync
const TABLES_TO_BOOTSTRAP: string[] = [
    // Auth & RBAC
    'profiles',
    'roles',
    'permissions',
    'role_permissions',
    'user_roles',
    'store_users',

    // Multi-store & payments
    'stores',
    'payment_types',
    'registers',
    'register_history',

    // Products & inventory
    'product_categories',
    'products',
    'product_history',
    'product_unit_quantities',
    'tax_groups',
    'taxes',
    'unit_groups',
    'units',

    // Customers
    'customer_groups',
    'customers',
    'customer_addresses',
    'customer_account_history',

    // Suppliers & procurement
    'providers',
    'procurements',
    'procurement_products',

    // Orders & sales
    'orders',
    'order_products',
    'order_payments',
    'order_addresses',
    'order_taxes',
    'coupons',
    'order_coupons',

    // Dashboard
    'dashboard_days',
    'dashboard_months',

    // Sync & activity (server-side)
    'activity_log',
    'sync_log',
    'device_registrations',
]

type StoreRow = Database['public']['Tables']['stores']['Row']
type ProductRow = Database['public']['Tables']['products']['Row']

interface CustomerRow {
    id: string
    store_id: string
    first_name: string
    last_name: string | null
    email: string | null
    phone: string | null
    created_at?: string | null
    updated_at?: string | null
}

interface OrderRow {
    id: string
    code: string
    store_id: string
    register_id: string | null
    customer_id: string | null
    payment_status: string
    process_status: string | null
    total: number
    created_at: string
    updated_at?: string | null
}

function mapStoreRowToLocal(row: StoreRow): LocalStore {
    return {
        id: row.id,
        name: row.name,
        description: row.description ?? undefined,
        city: row.city ?? undefined,
        active: row.active,
        synced_at: Date.now(),
    }
}

async function handleStoreChange(payload: any) {
    const eventType = payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE'
    const newRow = payload.new as StoreRow | null
    const oldRow = payload.old as StoreRow | null

    if (eventType === 'DELETE' && oldRow) {
        await db.stores.delete(oldRow.id)
        return
    }

    if ((eventType === 'INSERT' || eventType === 'UPDATE') && newRow) {
        const local = mapStoreRowToLocal(newRow)
        await db.stores.put(local)
    }
}

function mapProductRowToLocal(row: ProductRow): LocalProduct {
    return {
        id: row.id,
        store_id: row.store_id ?? '',
        name: row.name,
        sku: row.sku,
        barcode: row.barcode ?? undefined,
        category_id: row.category_id ?? undefined,
        status: row.status ?? 'active',
        synced_at: Date.now(),
    }
}

async function handleProductChange(payload: any) {
    const eventType = payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE'
    const newRow = payload.new as ProductRow | null
    const oldRow = payload.old as ProductRow | null

    if (eventType === 'DELETE' && oldRow) {
        await db.products.delete(oldRow.id)
        return
    }

    if ((eventType === 'INSERT' || eventType === 'UPDATE') && newRow) {
        const local = mapProductRowToLocal(newRow)
        await db.products.put(local)
    }
}

function mapCustomerRowToLocal(row: CustomerRow): LocalCustomer {
    return {
        id: row.id,
        store_id: row.store_id,
        first_name: row.first_name,
        last_name: row.last_name ?? undefined,
        email: row.email ?? undefined,
        phone: row.phone ?? undefined,
        synced_at: Date.now(),
    }
}

async function handleCustomerChange(payload: any) {
    const eventType = payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE'
    const newRow = payload.new as CustomerRow | null
    const oldRow = payload.old as CustomerRow | null

    if (eventType === 'DELETE' && oldRow) {
        await db.customers.delete(oldRow.id)
        return
    }

    if ((eventType === 'INSERT' || eventType === 'UPDATE') && newRow) {
        const local = mapCustomerRowToLocal(newRow)
        await db.customers.put(local)
    }
}

function mapOrderRowToLocal(row: OrderRow): LocalOrder {
    return {
        code: row.code,
        store_id: row.store_id,
        customer_id: row.customer_id ?? undefined,
        register_id: row.register_id ?? undefined,
        total: Number(row.total),
        payment_status: row.payment_status,
        status: row.process_status ?? 'pending',
        created_at: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
        synced: true,
    }
}

async function handleOrderChange(payload: any) {
    const eventType = payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE'
    const newRow = payload.new as OrderRow | null
    const oldRow = payload.old as OrderRow | null

    if (eventType === 'DELETE' && oldRow) {
        // Orders use autoincrement local IDs in Dexie,
        // so delete by code (indexed) instead of primary key.
        await db.orders.where('code').equals(oldRow.code).delete()
        return
    }

    if ((eventType === 'INSERT' || eventType === 'UPDATE') && newRow) {
        const local = mapOrderRowToLocal(newRow)

        // Upsert by order code to keep a single local row per order.
        const existing = await db.orders.where('code').equals(newRow.code).first()
        if (existing && existing.id !== undefined) {
            await db.orders.update(existing.id, { ...existing, ...local })
        } else {
            await db.orders.add(local)
        }
    }
}

function initRealtimeSync() {
    const channel = supabase.channel('realtime:core')

    // Core tables with custom mapping
    channel
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'stores' },
            async (payload) => {
                try {
                    await handleStoreChange(payload)
                } catch (e) {
                    console.warn('[syncManager] Failed to handle store change', e)
                }
            },
        )
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'products' },
            async (payload) => {
                try {
                    await handleProductChange(payload)
                } catch (e) {
                    console.warn('[syncManager] Failed to handle product change', e)
                }
            },
        )
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'customers' },
            async (payload) => {
                try {
                    await handleCustomerChange(payload)
                } catch (e) {
                    console.warn('[syncManager] Failed to handle customer change', e)
                }
            },
        )
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'orders' },
            async (payload) => {
                try {
                    await handleOrderChange(payload)
                } catch (e) {
                    console.warn('[syncManager] Failed to handle order change', e)
                }
            },
        )

    // Generic realtime mirroring for remaining tables
    const genericTables = TABLES_TO_BOOTSTRAP.filter(
        (t) => !['stores', 'products', 'customers', 'orders'].includes(t),
    )

    for (const table of genericTables) {
        channel.on(
            'postgres_changes',
            { event: '*', schema: 'public', table },
            async (payload) => {
                try {
                    await handleGenericTableChange(table, payload)
                } catch (e) {
                    console.warn(`[syncManager] Failed to handle change for ${table}`, e)
                }
            },
        )
    }

    channel.subscribe()
}

async function handleGenericTableChange(table: string, payload: any) {
    const eventType = payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE'
    const newRow = payload.new as any
    const oldRow = payload.old as any
    const tbl = db.table(table)

    if (eventType === 'DELETE' && oldRow) {
        if (oldRow.id) {
            await tbl.delete(oldRow.id)
            return
        }

        if (table === 'role_permissions') {
            await tbl
                .where('[role_id+permission_id]')
                .equals([oldRow.role_id, oldRow.permission_id])
                .delete()
        }

        return
    }

    if ((eventType === 'INSERT' || eventType === 'UPDATE') && newRow) {
        await tbl.put(newRow)
    }
}

async function processSyncItem(item: SyncOutbox) {
    const table = item.table_name as string
    const recordId = item.record_id
    const operation = item.operation
    const payload = item.payload

    // Basic safety: require table_name and operation
    if (!table || !operation) return

    let error: any | null = null

    try {
        // Use untyped client here because table_name is dynamic and
        // not limited to the generated Database['public']['Tables'] union.
        const client = supabase as any

        if (operation === 'insert') {
            const { error: insertError } = await client.from(table).insert(payload as any)
            if (insertError) error = insertError
        } else if (operation === 'update') {
            const { error: updateError } = await client
                .from(table)
                .update(payload as any)
                .eq('id', recordId)
            if (updateError) error = updateError
        } else if (operation === 'delete') {
            const { error: deleteError } = await client
                .from(table)
                .delete()
                .eq('id', recordId)
            if (deleteError) error = deleteError
        }

        if (!error) {
            await db.sync_outbox.update(item.id!, {
                status: 'synced',
                retry_count: item.retry_count + 1,
            })
        } else {
            await db.sync_outbox.update(item.id!, {
                status: 'failed',
                retry_count: item.retry_count + 1,
            })
        }
    } catch (e: any) {
        await db.sync_outbox.update(item.id!, {
            status: 'failed',
            retry_count: item.retry_count + 1,
        })
        console.warn('[syncManager] Unexpected error processing sync item', e)
    }
}

export async function processSyncOutboxOnce() {
    const pending = await db.sync_outbox.where('status').equals('pending').limit(50).toArray()
    if (!pending.length) return

    for (const item of pending) {
        await processSyncItem(item)
    }
}

let syncStarted = false

async function bootstrapAllTablesOnce() {
    const client = supabase as any

    for (const table of TABLES_TO_BOOTSTRAP) {
        try {
            const { data, error } = await client.from(table).select('*')
            if (error) {
                console.warn(`[syncManager] Failed to bootstrap ${table}:`, error.message)
                continue
            }

            const rows = (data as any[]) || []

            // Core tables use dedicated mapping to Local* types
            if (table === 'stores') {
                const locals = (rows as StoreRow[]).map(mapStoreRowToLocal)
                await db.stores.clear()
                if (locals.length) {
                    await db.stores.bulkPut(locals)
                }
                continue
            }

            if (table === 'products') {
                const locals = (rows as ProductRow[]).map(mapProductRowToLocal)
                await db.products.clear()
                if (locals.length) {
                    await db.products.bulkPut(locals)
                }
                continue
            }

            if (table === 'customers') {
                const locals = (rows as CustomerRow[]).map(mapCustomerRowToLocal)
                await db.customers.clear()
                if (locals.length) {
                    await db.customers.bulkPut(locals)
                }
                continue
            }

            if (table === 'orders') {
                const locals = (rows as OrderRow[]).map(mapOrderRowToLocal)
                await db.orders.clear()
                if (locals.length) {
                    await db.orders.bulkAdd(locals)
                }
                continue
            }

            // Generic: mirror Supabase rows as-is into corresponding Dexie table
            const tbl = db.table(table)
            await tbl.clear()
            if (rows.length) {
                await tbl.bulkPut(rows)
            }
        } catch (e: any) {
            console.warn(`[syncManager] Unexpected error bootstrapping ${table}:`, e)
        }
    }
}

export function startSyncManager() {
    if (typeof window === 'undefined') return
    if (syncStarted) return
    syncStarted = true

    if (typeof window === 'undefined') return

    // Make sure Dexie DB is opened early so it appears
    // in IndexedDB devtools and is ready for use, then bootstrap all tables once.
    db.open()
        .then(() => {
            bootstrapAllTablesOnce().catch((e) => {
                console.warn('[syncManager] Failed to bootstrap tables', e)
            })
        })
        .catch((e) => {
            console.warn('[syncManager] Failed to open Dexie database', e)
        })

    // Initialize realtime subscriptions once
    initRealtimeSync()

    // Periodically flush sync_outbox to Supabase
    window.setInterval(() => {
        processSyncOutboxOnce().catch((e) => {
            console.warn('[syncManager] Error while processing sync outbox', e)
        })
    }, 10_000)
}
