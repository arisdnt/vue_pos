import { ref, computed } from 'vue'
import * as paymentTypeService from '@/services/paymentTypeService'
import type { Database } from '@/types/database'

type PaymentType = Database['public']['Tables']['payment_types']['Row']
type PaymentTypeInsert = Database['public']['Tables']['payment_types']['Insert']
type PaymentTypeUpdate = Database['public']['Tables']['payment_types']['Update']

export function usePaymentTypes() {
    const paymentTypes = ref<PaymentType[]>([])
    const loading = ref(false)
    const error = ref('')

    async function fetchPaymentTypes() {
        loading.value = true
        error.value = ''
        try {
            paymentTypes.value = await paymentTypeService.getPaymentTypes()
        } catch (e: any) {
            error.value = e.message || 'Gagal memuat data'
        } finally {
            loading.value = false
        }
    }

    async function createPaymentType(data: PaymentTypeInsert) {
        const result = await paymentTypeService.createPaymentType(data)
        paymentTypes.value.push(result)
        return result
    }

    async function updatePaymentType(id: number, data: PaymentTypeUpdate) {
        const result = await paymentTypeService.updatePaymentType(id, data)
        const index = paymentTypes.value.findIndex(p => p.id === id)
        if (index >= 0) {
            paymentTypes.value[index] = result
        }
        return result
    }

    async function deletePaymentType(id: number) {
        await paymentTypeService.deletePaymentType(id)
        paymentTypes.value = paymentTypes.value.filter(p => p.id !== id)
    }

    async function toggleActive(id: number, active: boolean) {
        const result = await paymentTypeService.togglePaymentTypeActive(id, active)
        const index = paymentTypes.value.findIndex(p => p.id === id)
        if (index >= 0) {
            paymentTypes.value[index] = result
        }
        return result
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
