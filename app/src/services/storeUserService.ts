import { db, queueSync } from '@/db/dexie'
import type { Database } from '@/types/database'

type ProfileRow = Database['public']['Tables']['profiles']['Row']
type StoreRow = Database['public']['Tables']['stores']['Row']
type StoreUserRow = Database['public']['Tables']['store_users']['Row']

export interface StoreUserAssignment {
    id: string
    store_id: string
    user_id: string
    created_at: string
}

export interface StoreWithAssignment {
    id: string
    name: string
    assigned: boolean
}

/**
 * Get all stores assigned to a user (from Dexie)
 */
export async function getUserStores(userId: string) {
    const assignments = (await db
        .table('store_users')
        .where('user_id')
        .equals(userId)
        .toArray()) as StoreUserRow[]

    if (!assignments.length) {
        return []
    }

    const storeIds = assignments
        .map(a => a.store_id)
        .filter((id): id is string => !!id)

    if (!storeIds.length) {
        return []
    }

    const stores = (await db
        .table('stores')
        .filter((s: any) => storeIds.includes(s.id))
        .toArray()) as StoreRow[]

    return stores.map(s => ({
        id: s.id,
        name: s.name,
    }))
}

/**
 * Get all users assigned to a store (from Dexie)
 */
export async function getStoreUsers(storeId: string) {
    const assignments = (await db
        .table('store_users')
        .where('store_id')
        .equals(storeId)
        .toArray()) as StoreUserRow[]

    const userIds = assignments
        .map(a => a.user_id)
        .filter((id): id is string => !!id)

    if (!userIds.length) {
        return []
    }

    const profiles = (await db
        .table('profiles')
        .filter((p: any) => userIds.includes(p.id))
        .toArray()) as ProfileRow[]

    return profiles.map(p => ({
        id: p.id,
        username: p.username,
        active: p.active,
    }))
}

/**
 * Assign user to store (Dexie + sync_outbox)
 */
export async function assignUserToStore(userId: string, storeId: string) {
    const existing = (await db
        .table('store_users')
        .where('store_id')
        .equals(storeId)
        .and((row: any) => row.user_id === userId)
        .first()) as StoreUserRow | undefined

    if (existing) {
        return existing
    }

    const id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(16).slice(2)}`

    const nowIso = new Date().toISOString()

    const row: StoreUserRow = {
        id,
        store_id: storeId,
        user_id: userId,
        role_id: null,
        created_at: nowIso,
    }

    await db.table('store_users').put(row)
    await queueSync('store_users', id, 'insert', row)

    return row
}

/**
 * Remove user from store (Dexie + sync_outbox)
 */
export async function removeUserFromStore(userId: string, storeId: string) {
    const tbl = db.table('store_users')
    const existing = (await tbl
        .where('store_id')
        .equals(storeId)
        .and((r: any) => r.user_id === userId)
        .first()) as StoreUserRow | undefined

    if (!existing) {
        return
    }

    await tbl.delete(existing.id)
    await queueSync('store_users', existing.id, 'delete', null)
}

/**
 * Get all store assignments for a user with assignment status (from Dexie)
 */
export async function getUserStoreAssignments(userId: string) {
    const stores = (await db.table('stores').where('active').equals(true).toArray()) as StoreRow[]
    const assignedStores = await getUserStores(userId)
    const assignedIds = new Set(assignedStores.map(s => s.id))

    return stores.map(store => ({
        id: store.id,
        name: store.name,
        assigned: assignedIds.has(store.id),
    }))
}

/**
 * Bulk update user store assignments (Dexie + sync_outbox)
 */
export async function updateUserStoreAssignments(userId: string, storeIds: string[]) {
    const currentStores = await getUserStores(userId)
    const currentIds = new Set(currentStores.map(s => s.id))
    const newIds = new Set(storeIds)

    const toAdd = storeIds.filter(id => !currentIds.has(id))
    const toRemove = currentStores.filter(s => !newIds.has(s.id)).map(s => s.id)

    for (const storeId of toAdd) {
        await assignUserToStore(userId, storeId)
    }

    for (const storeId of toRemove) {
        await removeUserFromStore(userId, storeId)
    }
}
