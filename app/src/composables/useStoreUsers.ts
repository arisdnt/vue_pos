import { ref } from 'vue'
import * as storeUserService from '@/services/storeUserService'
import type { StoreWithAssignment } from '@/services/storeUserService'

export function useStoreUsers() {
    const assignments = ref<StoreWithAssignment[]>([])
    const loading = ref(false)
    const error = ref('')

    async function loadUserStoreAssignments(userId: string) {
        loading.value = true
        error.value = ''

        try {
            assignments.value = await storeUserService.getUserStoreAssignments(userId)
        } catch (e: any) {
            error.value = e.message || 'Gagal memuat assignment toko'
            console.error('Error loading assignments:', e)
        } finally {
            loading.value = false
        }
    }

    async function updateAssignments(userId: string, storeIds: number[]) {
        loading.value = true
        error.value = ''

        try {
            await storeUserService.updateUserStoreAssignments(userId, storeIds)
            await loadUserStoreAssignments(userId)
        } catch (e: any) {
            error.value = e.message || 'Gagal update assignment'
            throw e
        } finally {
            loading.value = false
        }
    }

    function getAssignedStoreIds(): number[] {
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
        getAssignedStoreNames
    }
}
