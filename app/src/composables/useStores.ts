import { ref } from 'vue'
import type { Database } from '@/types/database'
import { db, type LocalStore, queueSync } from '@/db/dexie'
import { useDexieLiveQuery } from '@/composables/useDexieLiveQuery'
import { useAuthStore } from '@/stores/authStore'

type Store = Database['public']['Tables']['stores']['Row']
type StoreInsert = Database['public']['Tables']['stores']['Insert']
type StoreUpdate = Database['public']['Tables']['stores']['Update']

export function useStores() {
    const authStore = useAuthStore()
    const error = ref('')

    const { data: stores, loading } = useDexieLiveQuery<Store[]>(
        async () => {
            const localStores = await db.stores.toArray()
            return localStores.map<Store>((ls) => ({
                id: ls.id,
                name: ls.name,
                description: ls.description ?? null,
                address_line1: null,
                address_line2: null,
                city: ls.city ?? null,
                province: null,
                postal_code: null,
                phone: null,
                email: null,
                active: ls.active,
                owner_id: null,
                created_at: new Date(ls.synced_at ?? Date.now()).toISOString(),
                updated_at: new Date(ls.synced_at ?? Date.now()).toISOString(),
            }))
        },
        [],
    )

    // Dipertahankan untuk kompatibilitas; sekarang tidak memanggil Supabase.
    async function fetchStores() {
        error.value = ''
    }

    async function createStore(data: Partial<StoreInsert>) {
        console.log('➕ [useStores] Creating store (Dexie + sync_outbox)...', data)

        if (!authStore.user) {
            console.error('❌ [useStores] User not authenticated')
            throw new Error('User not authenticated')
        }

        const id =
            typeof crypto !== 'undefined' && 'randomUUID' in crypto
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random().toString(16).slice(2)}`

        const nowIso = new Date().toISOString()

        const store: Store = {
            id,
            name: data.name ?? '',
            description: data.description ?? null,
            address_line1: data.address_line1 ?? null,
            address_line2: data.address_line2 ?? null,
            city: data.city ?? null,
            province: data.province ?? null,
            postal_code: data.postal_code ?? null,
            phone: data.phone ?? null,
            email: data.email ?? null,
            active: data.active ?? true,
            owner_id: authStore.user.id,
            created_at: nowIso,
            updated_at: nowIso,
        }

        // 1) Update local Dexie cache immediately
        const local: LocalStore = {
            id: store.id,
            name: store.name,
            description: store.description ?? undefined,
            city: store.city ?? undefined,
            active: store.active,
            synced_at: undefined,
        }
        await db.stores.put(local)

        // 2) Update in-memory state for instant UI feedback
        stores.value.push(store)

        // 3) Queue write to Supabase via sync_outbox
        await queueSync('stores', store.id, 'insert', store as StoreInsert)

        console.log('✅ [useStores] Store created locally and queued for sync')
    }

    async function updateStore(id: string, data: Partial<StoreUpdate>) {
        console.log('✏️ [useStores] Updating store (Dexie + sync_outbox)...', { id, data })

        const index = stores.value.findIndex(s => s.id === id)
        const existing = index >= 0 ? stores.value[index] : null

        if (!existing) {
            console.warn('[useStores] Store not found in local state, refetching...')
            await fetchStores()
            return
        }

        const nowIso = new Date().toISOString()
        const updated: Store = {
            ...existing,
            ...data,
            updated_at: nowIso,
        }

        // 1) Update Dexie cache
        await db.stores.update(id, {
            name: updated.name,
            description: updated.description ?? undefined,
            city: updated.city ?? undefined,
            active: updated.active,
            synced_at: undefined,
        })

        // 2) Update in-memory state
        stores.value[index] = updated

        // 3) Queue update for Supabase
        const patch: StoreUpdate = {
            ...data,
            updated_at: updated.updated_at,
        }
        await queueSync('stores', id, 'update', patch)

        console.log('✅ [useStores] Store updated locally and queued for sync')
    }

    async function deleteStore(id: string) {
        console.log('🗑️ [useStores] Deleting store (Dexie + sync_outbox)...', { id })

        // 1) Remove from Dexie
        await db.stores.delete(id)

        // 2) Remove from in-memory state
        stores.value = stores.value.filter(store => store.id !== id)

        // 3) Queue delete for Supabase
        await queueSync('stores', id, 'delete', null)

        console.log('✅ [useStores] Store deleted locally and queued for sync')
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
