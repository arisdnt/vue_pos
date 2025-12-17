// Layer 2: Reactive State - Dashboard Composable
import { ref, computed } from 'vue'
import * as dashboardService from '@/services/dashboardService'
import type { TodayStats, WeeklySale, TopProduct, RecentOrder } from '@/services/dashboardService'

export function useDashboard() {
    const loading = ref(false)
    const error = ref('')

    const todayStats = ref<TodayStats>({ totalSales: 0, totalOrders: 0, avgOrderValue: 0, paidOrders: 0, unpaidOrders: 0 })
    const weeklySales = ref<WeeklySale[]>([])
    const topProducts = ref<TopProduct[]>([])
    const recentOrders = ref<RecentOrder[]>([])
    const productCount = ref(0)
    const customerCount = ref(0)

    async function fetchDashboardData() {
        loading.value = true
        error.value = ''
        try {
            const [stats, weekly, top, recent, products, customers] = await Promise.all([
                dashboardService.getTodayStats(),
                dashboardService.getWeeklySales(),
                dashboardService.getTopProducts(5),
                dashboardService.getRecentOrders(10),
                dashboardService.getProductCount(),
                dashboardService.getCustomerCount()
            ])
            todayStats.value = stats
            weeklySales.value = weekly
            topProducts.value = top
            recentOrders.value = recent
            productCount.value = products
            customerCount.value = customers
        } catch (e: any) {
            error.value = e.message || 'Gagal memuat data dashboard'
        } finally {
            loading.value = false
        }
    }

    const maxWeeklySale = computed(() => Math.max(...weeklySales.value.map(w => w.total), 1))

    function formatCurrency(value: number): string {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)
    }

    function formatShortCurrency(value: number): string {
        if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(1)}jt`
        if (value >= 1000) return `Rp ${(value / 1000).toFixed(0)}rb`
        return `Rp ${value}`
    }

    function formatTime(dateStr: string): string {
        return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    }

    function formatDate(dateStr: string): string {
        return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
    }

    return {
        loading, error,
        todayStats, weeklySales, topProducts, recentOrders,
        productCount, customerCount,
        maxWeeklySale,
        fetchDashboardData,
        formatCurrency, formatShortCurrency, formatTime, formatDate
    }
}
