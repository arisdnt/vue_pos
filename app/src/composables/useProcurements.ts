import { ref, computed } from 'vue'
import { db, queueSync } from '@/db/dexie'
import { useDexieLiveQuery } from '@/composables/useDexieLiveQuery'
import { useAuthStore } from '@/stores/authStore'
import type { Database } from '@/types/database'

type Procurement = Database['public']['Tables']['procurements']['Row']
type ProcurementInsert = Database['public']['Tables']['procurements']['Insert']
type ProcurementUpdate = Database['public']['Tables']['procurements']['Update']
type ProcurementProduct = Database['public']['Tables']['procurement_products']['Row']
type ProcurementProductInsert = Database['public']['Tables']['procurement_products']['Insert']
type Provider = Database['public']['Tables']['providers']['Row']

export interface ProcurementWithProvider extends Procurement {
    provider_name?: string
}

export function useProcurements() {
    const authStore = useAuthStore()
    const error = ref('')

    const { data: procurements } = useDexieLiveQuery<ProcurementWithProvider[]>(
        async () => {
            const procurementRows = (await db.table('procurements').toArray()) as Procurement[]
            const providerRows = (await db.table('providers').toArray()) as Provider[]
            const providerMap = new Map(providerRows.map(p => [p.id, p]))

            return procurementRows.map(p => ({
                ...p,
                provider_name: p.provider_id ? providerMap.get(p.provider_id)?.first_name ?? null : null,
            }))
        },
        [],
    )

    const { data: providers } = useDexieLiveQuery<Provider[]>(
        async () => {
            return (await db.table('providers').toArray()) as Provider[]
        },
        [],
    )

    const loading = computed(() => false)

    async function createProcurement(
        data: Partial<ProcurementInsert>,
        items: Array<{
            product_id: string
            name: string
            unit_id: string | null
            quantity: number
            purchase_price: number
            expiration_date?: string | null
        }>,
    ) {
        if (!authStore.user) {
            throw new Error('User not authenticated')
        }

        const id =
            typeof crypto !== 'undefined' && 'randomUUID' in crypto
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random().toString(16).slice(2)}`

        const nowIso = new Date().toISOString()

        const accessibleStores = (authStore.accessibleStores || []) as any[]
        let storeId: string | null = null
        if (!authStore.isOwner && accessibleStores.length > 0) {
            storeId = accessibleStores[0].id
        } else if (data.store_id) {
            storeId = data.store_id
        } else if (accessibleStores.length === 1) {
            storeId = accessibleStores[0].id
        }

        const totalValue = items.reduce((sum, i) => sum + i.purchase_price * i.quantity, 0)

        const procurement: Procurement = {
            id,
            store_id: storeId,
            provider_id: data.provider_id ?? null,
            name: data.name ?? `PO-${new Date().toISOString().slice(0, 10)}`,
            invoice_reference: data.invoice_reference ?? null,
            invoice_date: data.invoice_date ?? nowIso,
            delivery_time: data.delivery_time ?? null,
            value: totalValue,
            cost: data.cost ?? totalValue,
            tax_value: data.tax_value ?? 0,
            total_items: items.length,
            payment_status: data.payment_status ?? 'unpaid',
            delivery_status: data.delivery_status ?? 'pending',
            automatic_approval: data.automatic_approval ?? true,
            description: data.description ?? null,
            created_by: authStore.user.id,
            created_at: nowIso,
            updated_at: nowIso,
        }

        const productRows: ProcurementProduct[] = items.map(item => ({
            id:
                typeof crypto !== 'undefined' && 'randomUUID' in crypto
                    ? crypto.randomUUID()
                    : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            procurement_id: id,
            product_id: item.product_id,
            unit_id: item.unit_id ?? null,
            name: item.name,
            quantity: item.quantity,
            purchase_price: item.purchase_price,
            purchase_price_with_tax: item.purchase_price,
            purchase_price_without_tax: item.purchase_price,
            purchase_price_tax: 0,
            total_purchase_price: item.purchase_price * item.quantity,
            expiration_date: item.expiration_date ?? null,
            created_at: nowIso,
            updated_at: nowIso,
        }))

        await db.table('procurements').put(procurement)
        if (productRows.length) {
            await db.table('procurement_products').bulkPut(productRows)
        }

        await queueSync('procurements', procurement.id, 'insert', procurement as ProcurementInsert)
        for (const row of productRows) {
            await queueSync('procurement_products', row.id, 'insert', row as ProcurementProductInsert)
        }

        return procurement
    }

    function filterProcurements(search: string, filters: Record<string, any>) {
        let result = procurements.value

        if (search) {
            const q = search.toLowerCase()
            result = result.filter(p => {
                return (
                    p.name.toLowerCase().includes(q) ||
                    p.invoice_reference?.toLowerCase().includes(q) ||
                    p.provider_name?.toLowerCase().includes(q)
                )
            })
        }

        if (filters.payment_status) {
            result = result.filter(p => p.payment_status === filters.payment_status)
        }

        if (filters.delivery_status) {
            result = result.filter(p => p.delivery_status === filters.delivery_status)
        }

        return result
    }

    return {
        procurements,
        providers,
        loading,
        error,
        createProcurement,
        filterProcurements,
    }
}

