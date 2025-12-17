import { supabase } from '@/db/supabase'
import type { Database } from '@/types/database'

type PaymentType = Database['public']['Tables']['payment_types']['Row']
type PaymentTypeInsert = Database['public']['Tables']['payment_types']['Insert']
type PaymentTypeUpdate = Database['public']['Tables']['payment_types']['Update']

/**
 * Get all payment types
 */
export async function getPaymentTypes() {
    const { data, error } = await supabase
        .from('payment_types')
        .select('*')
        .order('priority', { ascending: true })

    if (error) {
        throw new Error(`Failed to get payment types: ${error.message}`)
    }

    return data || []
}

/**
 * Get single payment type by id
 */
export async function getPaymentType(id: string) {
    const { data, error } = await supabase
        .from('payment_types')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        throw new Error(`Failed to get payment type: ${error.message}`)
    }

    return data
}

/**
 * Create new payment type
 */
export async function createPaymentType(paymentType: PaymentTypeInsert) {
    const { data, error } = await supabase
        .from('payment_types')
        .insert(paymentType)
        .select()
        .single()

    if (error) {
        throw new Error(`Failed to create payment type: ${error.message}`)
    }

    return data
}

/**
 * Update payment type
 */
export async function updatePaymentType(id: string, paymentType: PaymentTypeUpdate) {
    const { data, error } = await supabase
        .from('payment_types')
        .update({ ...paymentType, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

    if (error) {
        throw new Error(`Failed to update payment type: ${error.message}`)
    }

    return data
}

/**
 * Delete payment type
 */
export async function deletePaymentType(id: string) {
    // Check if readonly
    const { data: existing } = await supabase
        .from('payment_types')
        .select('readonly')
        .eq('id', id)
        .single()

    if (existing?.readonly) {
        throw new Error('Tidak dapat menghapus tipe pembayaran bawaan sistem')
    }

    const { error } = await supabase
        .from('payment_types')
        .delete()
        .eq('id', id)

    if (error) {
        throw new Error(`Failed to delete payment type: ${error.message}`)
    }
}

/**
 * Toggle payment type active status
 */
export async function togglePaymentTypeActive(id: string, active: boolean) {
    const { data, error } = await supabase
        .from('payment_types')
        .update({ active, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

    if (error) {
        throw new Error(`Failed to toggle payment type: ${error.message}`)
    }

    return data
}
