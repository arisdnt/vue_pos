import { ref } from 'vue'
import type { Database } from '@/types/database'
import { db, queueSync } from '@/db/dexie'
import { useDexieLiveQuery } from '@/composables/useDexieLiveQuery'

type PaymentType = Database['public']['Tables']['payment_types']['Row']
type PaymentTypeInsert = Database['public']['Tables']['payment_types']['Insert']
type PaymentTypeUpdate = Database['public']['Tables']['payment_types']['Update']

export function usePaymentTypes() {
    const error = ref('')

    const { data: paymentTypes, loading } = useDexieLiveQuery<PaymentType[]>(
        async () => {
            const rows = (await db.table('payment_types').toArray()) as PaymentType[]
            return rows
        },
        [],
    )

    async function fetchPaymentTypes() {
        // Data sekarang di-drive oleh Dexie liveQuery.
        error.value = ''
    }

    async function createPaymentType(data: PaymentTypeInsert) {
        const id =
            typeof crypto !== 'undefined' && 'randomUUID' in crypto
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random().toString(16).slice(2)}`

        const nowIso = new Date().toISOString()

        const row: PaymentType = {
            id,
            label: data.label,
            identifier: data.identifier,
            description: data.description ?? null,
            priority: data.priority ?? 0,
            active: data.active ?? true,
            readonly: data.readonly ?? false,
            icon: data.icon ?? null,
            created_at: nowIso,
            updated_at: nowIso,
        }

        await db.table('payment_types').put(row)
        await queueSync('payment_types', id, 'insert', row as PaymentTypeInsert)

        return row
    }

    async function updatePaymentType(id: string, data: PaymentTypeUpdate) {
        const tbl = db.table('payment_types')
        const existing = (await tbl.get(id)) as PaymentType | undefined
        if (!existing) {
            console.warn('[usePaymentTypes] Payment type not found in Dexie')
            return
        }

        const nowIso = new Date().toISOString()
        const updated: PaymentType = {
            ...existing,
            ...data,
            updated_at: nowIso,
        }

        await tbl.put(updated)

        const patch: PaymentTypeUpdate = {
            ...data,
            updated_at: updated.updated_at,
        }

        await queueSync('payment_types', id, 'update', patch)

        return updated
    }

    async function deletePaymentType(id: string) {
        await db.table('payment_types').delete(id)
        await queueSync('payment_types', id, 'delete', null)
    }

    async function toggleActive(id: string, active: boolean) {
        return updatePaymentType(id, { active })
    }

    function filterPaymentTypes(search: string, filters: Record<string, any>) {
        return paymentTypes.value.filter(p => {
            // Search filter
            if (search) {
                const q = search.toLowerCase()
                const matchSearch =
                    p.label.toLowerCase().includes(q) ||
                    p.identifier.toLowerCase().includes(q) ||
                    (p.description?.toLowerCase().includes(q) ?? false)
                if (!matchSearch) return false
            }

            // Active filter
            if (filters.active !== undefined && filters.active !== '') {
                const isActive = filters.active === 'true'
                if (p.active !== isActive) return false
            }

            return true
        })
    }

    return {
        paymentTypes,
        loading,
        error,
        fetchPaymentTypes,
        createPaymentType,
        updatePaymentType,
        deletePaymentType,
        toggleActive,
        filterPaymentTypes
    }
}
