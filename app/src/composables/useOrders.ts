import { ref } from 'vue'
import { db } from '@/db/dexie'
import { useDexieLiveQuery } from '@/composables/useDexieLiveQuery'

interface Order {
    id: number
    code: string
    store_id: string | null
    customer_id: string | null
    title: string | null
    type: string
    payment_status: string
    process_status: string | null
    total: number
    created_at: string
    updated_at: string
    synced?: number
}

interface Customer {
    id: string
    first_name: string
    last_name: string | null
}

export interface OrderWithCustomer extends Order {
    customer_name?: string
}

export function useOrders() {
    const error = ref('')

    const { data: orders, loading } = useDexieLiveQuery<OrderWithCustomer[]>(
        async () => {
            const orderRows = (await db.table('orders').reverse().sortBy('created_at')) as Order[]
            const customerRows = (await db.table('customers').toArray()) as Customer[]

            const customerMap = new Map(customerRows.map(c => [c.id, `${c.first_name} ${c.last_name || ''}`.trim()]))

            return orderRows.map<OrderWithCustomer>(o => ({
                ...o,
                customer_name: o.customer_id ? customerMap.get(o.customer_id) : undefined
            }))
        },
        []
    )

    function filterOrders(searchQuery: string, filters: Record<string, any>) {
        let result = orders.value

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(o =>
                o.code.toLowerCase().includes(query) ||
                o.customer_name?.toLowerCase().includes(query) ||
                o.title?.toLowerCase().includes(query)
            )
        }

        if (filters.payment_status) result = result.filter(o => o.payment_status === filters.payment_status)
        if (filters.process_status) result = result.filter(o => o.process_status === filters.process_status)
        if (filters.type) result = result.filter(o => o.type === filters.type)

        return result
    }

    function formatCurrency(value: number | null | undefined): string {
        if (value === null || value === undefined) return 'Rp 0'
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)
    }

    function formatDate(dateStr: string | null): string {
        if (!dateStr) return '-'
        return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    }

    return { orders, loading, error, filterOrders, formatCurrency, formatDate }
}
