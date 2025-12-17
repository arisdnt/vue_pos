import { supabase } from '@/db/supabase'
import type { Database } from '@/types/database'

type ProductCategory = Database['public']['Tables']['product_categories']['Row']
type ProductCategoryInsert = Database['public']['Tables']['product_categories']['Insert']
type ProductCategoryUpdate = Database['public']['Tables']['product_categories']['Update']

/**
 * Get all product categories
 */
export async function getProductCategories(storeId?: string) {
    let query = supabase
        .from('product_categories')
        .select('*')
        .order('display_order', { ascending: true })
        .order('name', { ascending: true })

    if (storeId) {
        query = query.eq('store_id', storeId)
    }

    const { data, error } = await query

    if (error) {
        throw new Error(`Failed to get product categories: ${error.message}`)
    }

    return data || []
}

/**
 * Get single product category by id
 */
export async function getProductCategory(id: string) {
    const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        throw new Error(`Failed to get product category: ${error.message}`)
    }

    return data
}

/**
 * Get parent categories (for dropdown)
 */
export async function getParentCategories(storeId?: string) {
    let query = supabase
        .from('product_categories')
        .select('id, name')
        .is('parent_id', null)
        .order('name', { ascending: true })

    if (storeId) {
        query = query.eq('store_id', storeId)
    }

    const { data, error } = await query

    if (error) {
        throw new Error(`Failed to get parent categories: ${error.message}`)
    }

    return data || []
}

/**
 * Create new product category
 */
export async function createProductCategory(category: ProductCategoryInsert) {
    const { data, error } = await supabase
        .from('product_categories')
        .insert(category)
        .select()
        .single()

    if (error) {
        throw new Error(`Failed to create product category: ${error.message}`)
    }

    return data
}

/**
 * Update product category
 */
export async function updateProductCategory(id: string, category: ProductCategoryUpdate) {
    const { data, error } = await supabase
        .from('product_categories')
        .update({ ...category, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

    if (error) {
        throw new Error(`Failed to update product category: ${error.message}`)
    }

    return data
}

/**
 * Delete product category
 */
export async function deleteProductCategory(id: string) {
    // Check if has children
    const { data: children } = await supabase
        .from('product_categories')
        .select('id')
        .eq('parent_id', id)
        .limit(1)

    if (children && children.length > 0) {
        throw new Error('Tidak dapat menghapus kategori yang memiliki sub-kategori')
    }

    // Check if has products
    const { data: products } = await supabase
        .from('products')
        .select('id')
        .eq('category_id', id)
        .limit(1)

    if (products && products.length > 0) {
        throw new Error('Tidak dapat menghapus kategori yang memiliki produk')
    }

    const { error } = await supabase
        .from('product_categories')
        .delete()
        .eq('id', id)

    if (error) {
        throw new Error(`Failed to delete product category: ${error.message}`)
    }
}
