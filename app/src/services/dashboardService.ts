// Layer 1: Pure API - Dashboard Service
// No Vue dependencies, pure TypeScript functions

import { db } from '@/db/dexie'

interface Order {
    id: number
    code: string
    store_id: string | null
    customer_id: string | null
    type: string
    payment_status: string
    total: number
    created_at: string
}

interface Product {
    id: string
    name: string
    sku: string | null
}

interface OrderProduct {
    id: string
    order_id: number
    product_id: string
    quantity: number
    total_price: number
}

export interface TodayStats {
    totalSales: number
    totalOrders: number
    avgOrderValue: number
    paidOrders: number
    unpaidOrders: number
}

export interface WeeklySale {
    date: string
    dayName: string
    total: number
    orderCount: number
}

export interface TopProduct {
    id: string
    name: string
    sold: number
    revenue: number
}

export interface RecentOrder {
    id: number
    code: string
    customer_name: string | null
    total: number
    payment_status: string
    created_at: string
}

function getStartOfDay(date: Date): Date {
    const d = new Date(date); d.setHours(0, 0, 0, 0); return d
}

export async function getTodayStats(): Promise<TodayStats> {
    const today = getStartOfDay(new Date())
    const orders = (await db.table('orders').toArray()) as Order[]
    const todayOrders = orders.filter(o => { const d = new Date(o.created_at); return getStartOfDay(d).getTime() === today.getTime() && o.type === 'sale' })
    const totalSales = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0)
    const paidOrders = todayOrders.filter(o => o.payment_status === 'paid').length
    const unpaidOrders = todayOrders.filter(o => o.payment_status !== 'paid').length
    return { totalSales, totalOrders: todayOrders.length, avgOrderValue: todayOrders.length > 0 ? totalSales / todayOrders.length : 0, paidOrders, unpaidOrders }
}

export async function getWeeklySales(): Promise<WeeklySale[]> {
    const orders = (await db.table('orders').toArray()) as Order[]
    const result: WeeklySale[] = []
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
    for (let i = 6; i >= 0; i--) {
        const date = new Date(); date.setDate(date.getDate() - i); const start = getStartOfDay(date)
        const dayOrders = orders.filter(o => { const d = new Date(o.created_at); return getStartOfDay(d).getTime() === start.getTime() && o.type === 'sale' })
        result.push({ date: start.toISOString().split('T')[0], dayName: dayNames[start.getDay()], total: dayOrders.reduce((sum, o) => sum + (o.total || 0), 0), orderCount: dayOrders.length })
    }
    return result
}

export async function getTopProducts(limit: number = 5): Promise<TopProduct[]> {
    const orderProducts = (await db.table('order_products').toArray()) as OrderProduct[]
    const products = (await db.table('products').toArray()) as Product[]
    const productMap = new Map(products.map(p => [p.id, p.name]))
    const salesMap = new Map<string, { sold: number; revenue: number }>()
    for (const op of orderProducts) {
        const existing = salesMap.get(op.product_id) || { sold: 0, revenue: 0 }
        salesMap.set(op.product_id, { sold: existing.sold + op.quantity, revenue: existing.revenue + (op.total_price || 0) })
    }
    return Array.from(salesMap.entries()).map(([id, stats]) => ({ id, name: productMap.get(id) || 'Unknown', ...stats })).sort((a, b) => b.revenue - a.revenue).slice(0, limit)
}

export async function getRecentOrders(limit: number = 10): Promise<RecentOrder[]> {
    const orders = (await db.table('orders').reverse().sortBy('created_at')) as Order[]
    const customers = await db.table('customers').toArray()
    const customerMap = new Map(customers.map((c: any) => [c.id, `${c.first_name} ${c.last_name || ''}`.trim()]))
    return orders.slice(0, limit).map(o => ({ id: o.id, code: o.code, customer_name: o.customer_id ? customerMap.get(o.customer_id) || null : null, total: o.total, payment_status: o.payment_status, created_at: o.created_at }))
}

export async function getProductCount(): Promise<number> {
    return await db.table('products').count()
}

export async function getCustomerCount(): Promise<number> {
    return await db.table('customers').count()
}
