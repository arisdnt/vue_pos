import { supabase } from '@/db/supabase'
import type { Database } from '@/types/database'

type Store = Database['public']['Tables']['stores']['Row']
type StoreInsert = Database['public']['Tables']['stores']['Insert']
type StoreUpdate = Database['public']['Tables']['stores']['Update']

/**
 * Get all stores
 */
export async function getAllStores(): Promise<Store[]> {
    console.log('📥 [storeService] Getting all stores...')
    const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('❌ [storeService] Error getting stores:', error)
        throw new Error(`Failed to load stores: ${error.message}`)
    }

    console.log(`✅ [storeService] Loaded ${data?.length || 0} stores`)
    return data || []
}

/**
 * Create a new store
 */
export async function createStore(storeData: Partial<StoreInsert>, ownerId: string): Promise<Store> {
    console.log('📝 [storeService] Creating store...', { storeData, ownerId })

    const insertData = {
        ...storeData,
        owner_id: ownerId
    } as StoreInsert

    console.log('💾 [storeService] Insert data:', insertData)

    const { data, error } = await supabase
        .from('stores')
        .insert(insertData)
        .select()
        .single()

    if (error) {
        console.error('❌ [storeService] Error creating store:', error)
        console.error('Error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
        })
        throw new Error(`Failed to create store: ${error.message}`)
    }

    console.log('✅ [storeService] Store created successfully:', data)
    return data
}

/**
 * Update store
 */
export async function updateStore(storeId: number, updates: Partial<StoreUpdate>): Promise<Store> {
    console.log('📝 [storeService] Updating store...', { storeId, updates })

    const { data, error } = await supabase
        .from('stores')
        .update(updates as StoreUpdate)
        .eq('id', storeId)
        .select()
        .single()

    if (error) {
        console.error('❌ [storeService] Error updating store:', error)
        throw new Error(`Failed to update store: ${error.message}`)
    }

    console.log('✅ [storeService] Store updated successfully:', data)
    return data
}

/**
 * Delete store
 */
export async function deleteStore(storeId: number): Promise<void> {
    console.log('🗑️ [storeService] Deleting store...', { storeId })

    const { error } = await supabase
        .from('stores')
        .delete()
        .eq('id', storeId)

    if (error) {
        console.error('❌ [storeService] Error deleting store:', error)
        throw new Error(`Failed to delete store: ${error.message}`)
    }

    console.log('✅ [storeService] Store deleted successfully')
}

/**
 * Get active stores for dropdown
 */
export async function getActiveStores() {
    const { data, error } = await supabase
        .from('stores')
        .select('id, name')
        .eq('active', true)
        .order('name')

    if (error) {
        console.error('Error loading active stores:', error)
        return []
    }

    return data || []
}
