import { ref } from 'vue'
import type { Database } from '@/types/database'
import { db, queueSync } from '@/db/dexie'
import { useDexieLiveQuery } from '@/composables/useDexieLiveQuery'

type Unit = Database['public']['Tables']['units']['Row'] & { group_name?: string }
type UnitInsert = Database['public']['Tables']['units']['Insert']
type UnitUpdate = Database['public']['Tables']['units']['Update']
type UnitGroup = Database['public']['Tables']['unit_groups']['Row']
type UnitGroupInsert = Database['public']['Tables']['unit_groups']['Insert']

export function useUnits() {
    const error = ref('')

    const { data: units, loading } = useDexieLiveQuery<Unit[]>(
        async () => {
            const unitRows = (await db.table('units').toArray()) as Unit[]
            const groups = (await db.table('unit_groups').toArray()) as UnitGroup[]
            const groupById = new Map(groups.map(g => [g.id, g]))

            return unitRows.map((u) => ({
                ...u,
                group_name: u.group_id ? groupById.get(u.group_id)?.name : undefined,
            }))
        },
        [],
    )

    const { data: unitGroups } = useDexieLiveQuery<UnitGroup[]>(
        async () => {
            const rows = (await db.table('unit_groups').toArray()) as UnitGroup[]
            return rows
        },
        [],
    )

    async function fetchUnits() {
        error.value = ''
    }

    async function fetchUnitGroups() {
        // Data unitGroups sudah di-drive oleh liveQuery
    }

    async function createUnit(data: UnitInsert) {
        const id =
            typeof crypto !== 'undefined' && 'randomUUID' in crypto
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random().toString(16).slice(2)}`

        const nowIso = new Date().toISOString()

        const row: Database['public']['Tables']['units']['Row'] = {
            id,
            group_id: data.group_id ?? null,
            name: data.name,
            identifier: data.identifier,
            description: data.description ?? null,
            value: data.value ?? 1,
            base_unit: data.base_unit ?? false,
            created_at: nowIso,
        }

        await db.table('units').put(row)
        await queueSync('units', id, 'insert', row as UnitInsert)

        return row as Unit
    }

    async function updateUnit(id: string, data: UnitUpdate) {
        const tbl = db.table('units')
        const existing = (await tbl.get(id)) as Unit | undefined
        if (!existing) {
            console.warn('[useUnits] Unit not found in Dexie')
            return
        }

        const updated: Unit = {
            ...existing,
            ...data,
        }

        await tbl.put(updated)
        await queueSync('units', id, 'update', data)

        return updated
    }

    async function deleteUnit(id: string) {
        await db.table('units').delete(id)
        await queueSync('units', id, 'delete', null)
    }

    async function createUnitGroup(data: UnitGroupInsert) {
        const id =
            typeof crypto !== 'undefined' && 'randomUUID' in crypto
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random().toString(16).slice(2)}`

        const nowIso = new Date().toISOString()

        const row: UnitGroup = {
            id,
            name: data.name,
            description: data.description ?? null,
            created_at: nowIso,
        }

        await db.table('unit_groups').put(row)
        await queueSync('unit_groups', id, 'insert', row as UnitGroupInsert)

        return row
    }

    async function deleteUnitGroup(id: string) {
        await db.table('unit_groups').delete(id)
        await queueSync('unit_groups', id, 'delete', null)
    }

    function filterUnits(search: string, filters: Record<string, any>) {
        return units.value.filter(u => {
            // Search filter
            if (search) {
                const q = search.toLowerCase()
                const matchSearch =
                    u.name.toLowerCase().includes(q) ||
                    u.identifier.toLowerCase().includes(q) ||
                    (u.description?.toLowerCase().includes(q) ?? false)
                if (!matchSearch) return false
            }

            // Group filter
            if (filters.group_id !== undefined && filters.group_id !== '') {
                if (u.group_id !== filters.group_id) return false
            }

            // Base unit filter
            if (filters.base_unit !== undefined && filters.base_unit !== '') {
                const isBase = filters.base_unit === 'true'
                if (u.base_unit !== isBase) return false
            }

            return true
        })
    }

    return {
        units,
        unitGroups,
        loading,
        error,
        fetchUnits,
        fetchUnitGroups,
        createUnit,
        updateUnit,
        deleteUnit,
        createUnitGroup,
        deleteUnitGroup,
        filterUnits
    }
}
