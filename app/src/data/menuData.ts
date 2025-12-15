// Menu structure for POS system
export interface MenuItem {
    id: string
    label: string
    shortcut?: string
    action?: () => void
    route?: string
    disabled?: boolean
    separator?: boolean
}

export interface Menu {
    id: string
    label: string
    items: MenuItem[]
}

export const menus: Menu[] = [
    {
        id: 'file',
        label: 'File',
        items: [
            { id: 'new-transaction', label: 'Transaksi Baru', shortcut: 'Ctrl+N', route: '/pos' },
            { id: 'separator-1', label: '', separator: true },
            { id: 'sync', label: 'Sinkronisasi Data', shortcut: 'F5' },
            { id: 'separator-2', label: '', separator: true },
            { id: 'print-last', label: 'Cetak Struk Terakhir', shortcut: 'Ctrl+P' },
            { id: 'separator-3', label: '', separator: true },
            { id: 'logout', label: 'Logout' },
            { id: 'exit', label: 'Keluar', shortcut: 'Alt+F4' },
        ]
    },
    {
        id: 'pos',
        label: 'Kasir',
        items: [
            { id: 'open-register', label: 'Buka Kasir', route: '/register/open' },
            { id: 'close-register', label: 'Tutup Kasir', route: '/register/close' },
            { id: 'separator-1', label: '', separator: true },
            { id: 'cash-in', label: 'Kas Masuk', route: '/register/cash-in' },
            { id: 'cash-out', label: 'Kas Keluar', route: '/register/cash-out' },
            { id: 'separator-2', label: '', separator: true },
            { id: 'pending-orders', label: 'Order Tertahan', shortcut: 'F4', route: '/orders/pending' },
            { id: 'register-history', label: 'Riwayat Kasir', route: '/register/history' },
        ]
    },
    {
        id: 'products',
        label: 'Produk',
        items: [
            { id: 'product-list', label: 'Daftar Produk', route: '/products' },
            { id: 'add-product', label: 'Tambah Produk', shortcut: 'Ctrl+Shift+P' },
            { id: 'separator-1', label: '', separator: true },
            { id: 'categories', label: 'Kategori', route: '/products/categories' },
            { id: 'units', label: 'Satuan', route: '/products/units' },
            { id: 'separator-2', label: '', separator: true },
            { id: 'stock-adjust', label: 'Penyesuaian Stok', route: '/inventory/adjust' },
        ]
    },
    {
        id: 'customers',
        label: 'Pelanggan',
        items: [
            { id: 'customer-list', label: 'Daftar Pelanggan', route: '/customers' },
            { id: 'add-customer', label: 'Tambah Pelanggan', shortcut: 'Ctrl+Shift+C' },
            { id: 'separator-1', label: '', separator: true },
            { id: 'customer-groups', label: 'Grup Pelanggan', route: '/customers/groups' },
        ]
    },
    {
        id: 'orders',
        label: 'Penjualan',
        items: [
            { id: 'order-list', label: 'Daftar Transaksi', route: '/orders' },
            { id: 'order-today', label: 'Transaksi Hari Ini', route: '/orders/today' },
            { id: 'separator-1', label: '', separator: true },
            { id: 'refund', label: 'Refund/Retur', route: '/orders/refund' },
            { id: 'coupons', label: 'Kupon & Diskon', route: '/coupons' },
        ]
    },
    {
        id: 'inventory',
        label: 'Inventori',
        items: [
            { id: 'stock-list', label: 'Stok Produk', route: '/inventory' },
            { id: 'low-stock', label: 'Stok Menipis', route: '/inventory/low-stock' },
            { id: 'separator-1', label: '', separator: true },
            { id: 'procurement', label: 'Pembelian (PO)', route: '/procurement' },
            { id: 'suppliers', label: 'Supplier', route: '/suppliers' },
            { id: 'separator-2', label: '', separator: true },
            { id: 'stock-transfer', label: 'Transfer Stok', route: '/inventory/transfer' },
        ]
    },
    {
        id: 'reports',
        label: 'Laporan',
        items: [
            { id: 'sales-report', label: 'Laporan Penjualan', route: '/reports/sales' },
            { id: 'daily-report', label: 'Laporan Harian', route: '/reports/daily' },
            { id: 'separator-1', label: '', separator: true },
            { id: 'inventory-report', label: 'Laporan Stok', route: '/reports/inventory' },
            { id: 'product-report', label: 'Produk Terlaris', route: '/reports/products' },
            { id: 'separator-2', label: '', separator: true },
            { id: 'tax-report', label: 'Laporan Pajak (PPN)', route: '/reports/tax' },
            { id: 'export-report', label: 'Export Data', route: '/reports/export' },
        ]
    },
    {
        id: 'settings',
        label: 'Pengaturan',
        items: [
            { id: 'store-settings', label: 'Pengaturan Toko', route: '/settings/store' },
            { id: 'payment-types', label: 'Jenis Pembayaran', route: '/settings/payments' },
            { id: 'separator-1', label: '', separator: true },
            { id: 'users', label: 'Pengguna', route: '/settings/users' },
            { id: 'roles', label: 'Hak Akses', route: '/settings/roles' },
            { id: 'separator-2', label: '', separator: true },
            { id: 'tax-settings', label: 'Pengaturan Pajak', route: '/settings/tax' },
            { id: 'receipt-settings', label: 'Format Struk', route: '/settings/receipt' },
            { id: 'separator-3', label: '', separator: true },
            { id: 'about', label: 'Tentang', shortcut: 'F1', route: '/about' },
        ]
    }
]
