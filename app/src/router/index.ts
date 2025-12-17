import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        // === Core Routes ===
        { path: '/', redirect: '/dashboard' },
        {
            path: '/login',
            name: 'login',
            component: () => import('@/pages/auth/LoginPage.vue'),
            meta: { requiresAuth: false }
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: () => import('@/pages/dashboard/DashboardPage.vue'),
            meta: { requiresAuth: true, title: 'Dashboard' }
        },
        {
            path: '/pos',
            name: 'pos',
            component: () => import('@/pages/pos/POSPage.vue'),
            meta: { requiresAuth: true, title: 'Point of Sale' }
        },

        // === Register Routes ===
        {
            path: '/register/open',
            name: 'register-open',
            component: () => import('@/pages/register/RegisterOpenPage.vue'),
            meta: { requiresAuth: true, title: 'Buka Kasir' }
        },
        {
            path: '/register/close',
            name: 'register-close',
            component: () => import('@/pages/register/RegisterClosePage.vue'),
            meta: { requiresAuth: true, title: 'Tutup Kasir' }
        },
        {
            path: '/register/cash-in',
            name: 'cash-in',
            component: () => import('@/pages/register/CashInPage.vue'),
            meta: { requiresAuth: true, title: 'Kas Masuk' }
        },
        {
            path: '/register/cash-out',
            name: 'cash-out',
            component: () => import('@/pages/register/CashOutPage.vue'),
            meta: { requiresAuth: true, title: 'Kas Keluar' }
        },
        {
            path: '/register/history',
            name: 'register-history',
            component: () => import('@/pages/register/RegisterHistoryPage.vue'),
            meta: { requiresAuth: true, title: 'Riwayat Kasir' }
        },

        // === Products Routes ===
        {
            path: '/products',
            name: 'products',
            component: () => import('@/pages/products/ProductListPage.vue'),
            meta: { requiresAuth: true, title: 'Produk' }
        },
        {
            path: '/products/categories',
            name: 'categories',
            component: () => import('@/pages/products/CategoryListPage.vue'),
            meta: { requiresAuth: true, title: 'Kategori' }
        },
        {
            path: '/products/units',
            name: 'units',
            component: () => import('@/pages/products/UnitListPage.vue'),
            meta: { requiresAuth: true, title: 'Satuan' }
        },

        // === Customers Routes ===
        {
            path: '/customers',
            name: 'customers',
            component: () => import('@/pages/customers/CustomerListPage.vue'),
            meta: { requiresAuth: true, title: 'Pelanggan' }
        },
        {
            path: '/customers/groups',
            name: 'customer-groups',
            component: () => import('@/pages/customers/CustomerGroupsPage.vue'),
            meta: { requiresAuth: true, title: 'Grup Pelanggan' }
        },

        // === Orders Routes ===
        {
            path: '/orders',
            name: 'orders',
            component: () => import('@/pages/orders/OrderListPage.vue'),
            meta: { requiresAuth: true, title: 'Transaksi' }
        },
        {
            path: '/orders/today',
            name: 'orders-today',
            component: () => import('@/pages/orders/TodayOrdersPage.vue'),
            meta: { requiresAuth: true, title: 'Transaksi Hari Ini' }
        },
        {
            path: '/orders/pending',
            name: 'pending-orders',
            component: () => import('@/pages/orders/PendingOrdersPage.vue'),
            meta: { requiresAuth: true, title: 'Order Tertahan' }
        },
        {
            path: '/orders/refund',
            name: 'refund',
            component: () => import('@/pages/orders/RefundPage.vue'),
            meta: { requiresAuth: true, title: 'Refund/Retur' }
        },
        {
            path: '/coupons',
            name: 'coupons',
            component: () => import('@/pages/coupons/CouponListPage.vue'),
            meta: { requiresAuth: true, title: 'Kupon & Diskon' }
        },

        // === Inventory Routes ===
        {
            path: '/inventory',
            name: 'inventory',
            component: () => import('@/pages/inventory/InventoryListPage.vue'),
            meta: { requiresAuth: true, title: 'Stok Produk' }
        },
        {
            path: '/inventory/low-stock',
            name: 'low-stock',
            component: () => import('@/pages/inventory/LowStockPage.vue'),
            meta: { requiresAuth: true, title: 'Stok Menipis' }
        },
        {
            path: '/inventory/adjust',
            name: 'stock-adjust',
            component: () => import('@/pages/inventory/StockAdjustPage.vue'),
            meta: { requiresAuth: true, title: 'Penyesuaian Stok' }
        },
        {
            path: '/inventory/transfer',
            name: 'stock-transfer',
            component: () => import('@/pages/inventory/StockTransferPage.vue'),
            meta: { requiresAuth: true, title: 'Transfer Stok' }
        },
        {
            path: '/procurement/quick',
            name: 'procurement-quick',
            component: () => import('@/pages/procurement/QuickProcurementPage.vue'),
            meta: { requiresAuth: true, title: 'Pembelian Cepat' }
        },
        {
            path: '/procurement',
            name: 'procurement',
            component: () => import('@/pages/procurement/ProcurementListPage.vue'),
            meta: { requiresAuth: true, title: 'Pembelian' }
        },
        {
            path: '/suppliers',
            name: 'suppliers',
            component: () => import('@/pages/suppliers/SupplierListPage.vue'),
            meta: { requiresAuth: true, title: 'Supplier' }
        },

        // === Reports Routes ===
        {
            path: '/reports/sales',
            name: 'sales-report',
            component: () => import('@/pages/reports/SalesReportPage.vue'),
            meta: { requiresAuth: true, title: 'Laporan Penjualan' }
        },
        {
            path: '/reports/daily',
            name: 'daily-report',
            component: () => import('@/pages/reports/DailyReportPage.vue'),
            meta: { requiresAuth: true, title: 'Laporan Harian' }
        },
        {
            path: '/reports/inventory',
            name: 'inventory-report',
            component: () => import('@/pages/reports/InventoryReportPage.vue'),
            meta: { requiresAuth: true, title: 'Laporan Stok' }
        },
        {
            path: '/reports/products',
            name: 'product-report',
            component: () => import('@/pages/reports/ProductReportPage.vue'),
            meta: { requiresAuth: true, title: 'Produk Terlaris' }
        },
        {
            path: '/reports/tax',
            name: 'tax-report',
            component: () => import('@/pages/reports/TaxReportPage.vue'),
            meta: { requiresAuth: true, title: 'Laporan Pajak' }
        },
        {
            path: '/reports/export',
            name: 'export-report',
            component: () => import('@/pages/reports/ExportReportPage.vue'),
            meta: { requiresAuth: true, title: 'Export Data' }
        },

        // === Settings Routes ===
        {
            path: '/settings/store',
            name: 'store-settings',
            component: () => import('@/pages/settings/StoresPage.vue'),
            meta: { requiresAuth: true, title: 'Toko' }
        },
        {
            path: '/settings/payments',
            name: 'payment-settings',
            component: () => import('@/pages/settings/PaymentSettingsPage.vue'),
            meta: { requiresAuth: true, title: 'Jenis Pembayaran' }
        },
        {
            path: '/settings/users',
            name: 'users',
            component: () => import('@/pages/settings/UsersPage.vue'),
            meta: { requiresAuth: true, title: 'Pengguna' }
        },
        {
            path: '/settings/roles',
            name: 'roles',
            component: () => import('@/pages/settings/RolesPage.vue'),
            meta: { requiresAuth: true, title: 'Hak Akses' }
        },
        {
            path: '/settings/tax',
            name: 'tax-settings',
            component: () => import('@/pages/settings/TaxSettingsPage.vue'),
            meta: { requiresAuth: true, title: 'Pengaturan Pajak' }
        },
        {
            path: '/settings/receipt',
            name: 'receipt-settings',
            component: () => import('@/pages/settings/ReceiptSettingsPage.vue'),
            meta: { requiresAuth: true, title: 'Format Struk' }
        },
        {
            path: '/settings/outbox-sync',
            name: 'outbox-sync',
            component: () => import('@/pages/settings/OutboxSyncPage.vue'),
            meta: { requiresAuth: true, title: 'Outbox Sync' }
        },

        // === About ===
        {
            path: '/about',
            name: 'about',
            component: () => import('@/pages/about/AboutPage.vue'),
            meta: { requiresAuth: true, title: 'Tentang' }
        }
    ]
})

// Router guard
router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()

    const hasPersistedSession =
        typeof window !== 'undefined' &&
        !!window.localStorage.getItem('vue-pos-auth')

    if (import.meta.env.DEV) {
        console.log(
            '[RouterGuard] beforeEach',
            'to:', to.path,
            'from:', from.path,
            'hasUser:', !!authStore.user,
            'loading:', authStore.loading,
        )
    }

    if (!authStore.user && !authStore.loading) {
        await authStore.init()
    }

    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth !== false)

    if (import.meta.env.DEV) {
        console.log(
            '[RouterGuard] auth check',
            'to:', to.path,
            'requiresAuth:', requiresAuth,
            'isAuthenticated:', authStore.isAuthenticated,
            'userEmail:', authStore.user?.email || null,
        )
    }

    if (requiresAuth && !authStore.isAuthenticated) {
        // Jika ada session tersimpan di Supabase (localStorage),
        // izinkan akses sementara dan biarkan Supabase rehydrate session.
        if (hasPersistedSession) {
            return next()
        }
        next('/login')
    } else if (to.path === '/login' && authStore.isAuthenticated) {
        next('/dashboard')
    } else {
        next()
    }
})

export default router
