import { supabase } from '@/db/supabase'

export interface StoreUserAssignment {
    id: number
    store_id: number
    user_id: string
    created_at: string
}

export interface StoreWithAssignment {
    id: number
    name: string
    assigned: boolean
}

/**
 * Get all stores assigned to a user
 */
export async function getUserStores(userId: string) {
    const { data, error } = await supabase
        .from('store_users')
        .select('store_id, stores(id, name)')
        .eq('user_id', userId)

    if (error) {
        throw new Error(`Failed to get user stores: ${error.message}`)
    }

    return (data || []).map((item: any) => ({
        id: item.stores.id,
        name: item.stores.name
    }))
}

/**
 * Get all users assigned to a store
 */
export async function getStoreUsers(storeId: number) {
    const { data, error } = await supabase
        .from('store_users')
        .select('user_id, profiles(id, username, active)')
        .eq('store_id', storeId)

    if (error) {
        throw new Error(`Failed to get store users: ${error.message}`)
    }

    return (data || []).map((item: any) => ({
        id: item.profiles.id,
        username: item.profiles.username,
        active: item.profiles.active
    }))
}

/**
 * Assign user to store
 */
export async function assignUserToStore(userId: string, storeId: number) {
    // Check if assignment already exists
    const { data: existing } = await supabase
        .from('store_users')
        .select('id')
        .eq('user_id', userId)
        .eq('store_id', storeId)
        .single()

    if (existing) {
        return existing // Already assigned
    }

    const { data, error } = await supabase
        .from('store_users')
        .insert({ user_id: userId, store_id: storeId })
        .select()
        .single()

    if (error) {
        throw new Error(`Failed to assign user to store: ${error.message}`)
    }

    return data
}

/**
 * Remove user from store
 */
export async function removeUserFromStore(userId: string, storeId: number) {
    const { error } = await supabase
        .from('store_users')
        .delete()
        .eq('user_id', userId)
        .eq('store_id', storeId)

    if (error) {
        throw new Error(`Failed to remove user from store: ${error.message}`)
    }
}

/**
 * Get all store assignments for a user with assignment status
 */
export async function getUserStoreAssignments(userId: string) {
    // Get all stores
    const { data: allStores, error: storesError } = await supabase
        .from('stores')
        .select('id, name')
        .eq('active', true)
        .order('name')

    if (storesError) {
        throw new Error(`Failed to get stores: ${storesError.message}`)
    }

    // Get user's assigned stores
    const assignedStores = await getUserStores(userId)
    const assignedIds = new Set(assignedStores.map(s => s.id))

    return (allStores || []).map(store => ({
        id: store.id,
        name: store.name,
        assigned: assignedIds.has(store.id)
    }))
}

/**
 * Bulk update user store assignments
 */
export async function updateUserStoreAssignments(userId: string, storeIds: number[]) {
    // Get current assignments
    const currentStores = await getUserStores(userId)
    const currentIds = new Set(currentStores.map(s => s.id))
    const newIds = new Set(storeIds)

    // Find stores to add and remove
    const toAdd = storeIds.filter(id => !currentIds.has(id))
    const toRemove = currentStores.filter(s => !newIds.has(s.id)).map(s => s.id)

    // Add new assignments
    for (const storeId of toAdd) {
        await assignUserToStore(userId, storeId)
    }

    // Remove old assignments
    for (const storeId of toRemove) {
        await removeUserFromStore(userId, storeId)
    }
}
