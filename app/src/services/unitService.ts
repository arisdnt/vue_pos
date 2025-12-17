import { supabase } from '@/db/supabase'
import type { Database } from '@/types/database'

type Unit = Database['public']['Tables']['units']['Row']
type UnitInsert = Database['public']['Tables']['units']['Insert']
type UnitUpdate = Database['public']['Tables']['units']['Update']
type UnitGroup = Database['public']['Tables']['unit_groups']['Row']
type UnitGroupInsert = Database['public']['Tables']['unit_groups']['Insert']

/**
 * Get all units with group info
 */
export async function getUnits() {
    const { data, error } = await supabase
        .from('units')
        .select('*, unit_groups(name)')
        .order('group_id', { ascending: true })
        .order('value', { ascending: true })

    if (error) {
        throw new Error(`Failed to get units: ${error.message}`)
    }

    return (data || []).map(u => ({
        ...u,
        group_name: (u as any).unit_groups?.name || null
    }))
}

/**
 * Get all unit groups
 */
export async function getUnitGroups() {
    const { data, error } = await supabase
        .from('unit_groups')
        .select('*')
        .order('name', { ascending: true })

    if (error) {
        throw new Error(`Failed to get unit groups: ${error.message}`)
    }

    return data || []
}

/**
 * Create unit
 */
export async function createUnit(unit: UnitInsert) {
    const { data, error } = await supabase
        .from('units')
        .insert(unit)
        .select('*, unit_groups(name)')
        .single()

    if (error) {
        throw new Error(`Failed to create unit: ${error.message}`)
    }

    return {
        ...data,
        group_name: (data as any).unit_groups?.name || null
    }
}

/**
 * Update unit
 */
export async function updateUnit(id: string, unit: UnitUpdate) {
    const { data, error } = await supabase
        .from('units')
        .update(unit)
        .eq('id', id)
        .select('*, unit_groups(name)')
        .single()

    if (error) {
        throw new Error(`Failed to update unit: ${error.message}`)
    }

    return {
        ...data,
        group_name: (data as any).unit_groups?.name || null
    }
}

/**
 * Delete unit
 */
export async function deleteUnit(id: string) {
    // Check if base unit
    const { data: unit } = await supabase
        .from('units')
        .select('base_unit')
        .eq('id', id)
        .single()

    if (unit?.base_unit) {
        throw new Error('Tidak dapat menghapus satuan dasar')
    }

    const { error } = await supabase
        .from('units')
        .delete()
        .eq('id', id)

    if (error) {
        throw new Error(`Failed to delete unit: ${error.message}`)
    }
}

/**
 * Create unit group
 */
export async function createUnitGroup(group: UnitGroupInsert) {
    const { data, error } = await supabase
        .from('unit_groups')
        .insert(group)
        .select()
        .single()

    if (error) {
        throw new Error(`Failed to create unit group: ${error.message}`)
    }

    return data
}

/**
 * Delete unit group
 */
export async function deleteUnitGroup(id: string) {
    // Check if has units
    const { data: units } = await supabase
        .from('units')
        .select('id')
        .eq('group_id', id)
        .limit(1)

    if (units && units.length > 0) {
        throw new Error('Tidak dapat menghapus grup yang memiliki satuan')
    }

    const { error } = await supabase
        .from('unit_groups')
        .delete()
        .eq('id', id)

    if (error) {
        throw new Error(`Failed to delete unit group: ${error.message}`)
    }
}
