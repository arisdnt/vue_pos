import { ref } from 'vue'
import * as storeUserService from '@/services/storeUserService'
import type { StoreWithAssignment } from '@/services/storeUserService'
import { useDexieLiveQuery } from '@/composables/useDexieLiveQuery'
import { db } from '@/db/dexie'

export function useStoreUsers() {
    const error = ref('')
    const currentUserId = ref<string | null>(null)

    const { data: assignments, loading } = useDexieLiveQuery<StoreWithAssignment[]>(
        async () => {
            if (!currentUserId.value) {
                return []
            }
            return await storeUserService.getUserStoreAssignments(currentUserId.value)
        },
        [],
    )

    async function loadUserStoreAssignments(userId: string) {
        currentUserId.value = userId
        error.value = ''
        // liveQuery akan memicu ulang query di atas
        // dan data assignments akan ter-update otomatis
        await db.table('store_users').toArray()
    }

    async function updateAssignments(userId: string, storeIds: string[]) {
        error.value = ''
        try {
            await storeUserService.updateUserStoreAssignments(userId, storeIds)
        } catch (e: any) {
            error.value = e.message || 'Gagal update assignment'
            throw e
        }
    }

    function getAssignedStoreIds(): string[] {
        return assignments.value.filter(s => s.assigned).map(s => s.id)
    }

    function getAssignedStoreNames(): string[] {
        return assignments.value.filter(s => s.assigned).map(s => s.name)
    }

    return {
        assignments,
        loading,
        error,
        loadUserStoreAssignments,
        updateAssignments,
        getAssignedStoreIds,
        getAssignedStoreNames,
    }
}
