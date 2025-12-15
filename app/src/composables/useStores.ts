import { ref } from 'vue'
import * as storeService from '@/services/storeService'
import { supabase } from '@/db/supabase'
import type { Database } from '@/types/database'

type Store = Database['public']['Tables']['stores']['Row']
type StoreInsert = Database['public']['Tables']['stores']['Insert']
type StoreUpdate = Database['public']['Tables']['stores']['Update']

export function useStores() {
    const stores = ref<Store[]>([])
    const loading = ref(false)
    const error = ref('')

    async function fetchStores() {
        console.log('🔄 [useStores] Fetching stores...')
        loading.value = true
        error.value = ''

        try {
            stores.value = await storeService.getAllStores()
            console.log(`✅ [useStores] Fetched ${stores.value.length} stores`)
        } catch (e: any) {
            error.value = e.message || 'Gagal memuat data toko'
            console.error('❌ [useStores] Error fetching stores:', e)
        } finally {
            loading.value = false
        }
    }

    async function createStore(data: Partial<StoreInsert>) {
        console.log('➕ [useStores] Creating store...', data)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            console.error('❌ [useStores] User not authenticated')
            throw new Error('User not authenticated')
        }

        console.log('👤 [useStores] Current user:', { id: user.id, email: user.email })

        await storeService.createStore(data, user.id)
        console.log('✅ [useStores] Store created, refetching list...')
        await fetchStores()
    }

    async function updateStore(id: number, data: Partial<StoreUpdate>) {
        console.log('✏️ [useStores] Updating store...', { id, data })
        await storeService.updateStore(id, data)
        await fetchStores()
    }

    async function deleteStore(id: number) {
        console.log('🗑️ [useStores] Deleting store...', { id })
        await storeService.deleteStore(id)
        await fetchStores()
    }

    function filterStores(searchQuery: string, filters: Record<string, any>) {
        let result = stores.value

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(store =>
                store.name.toLowerCase().includes(query) ||
                store.city?.toLowerCase().includes(query) ||
                store.phone?.toLowerCase().includes(query) ||
                store.email?.toLowerCase().includes(query)
            )
        }

        if (filters.active) {
            const isActive = filters.active === 'true'
            result = result.filter(store => store.active === isActive)
        }

        return result
    }

    return {
        stores,
        loading,
        error,
        fetchStores,
        createStore,
        updateStore,
        deleteStore,
        filterStores
    }
}
