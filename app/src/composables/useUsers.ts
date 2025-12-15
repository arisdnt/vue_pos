import { ref } from 'vue'
import * as userService from '@/services/userService'

export interface User {
    id: string
    email: string
    role: 'owner' | 'manager' | 'cashier'
    status: 'active' | 'inactive'
    created_at: string
    updated_at: string
}

export function useUsers() {
    const users = ref<User[]>([])
    const loading = ref(false)
    const error = ref('')

    async function fetchUsers() {
        loading.value = true
        error.value = ''

        try {
            const profiles = await userService.getAllUsers()
            users.value = profiles.map(profile => ({
                id: profile.id,
                email: profile.email,
                role: profile.role,
                status: profile.isActive ? 'active' as const : 'inactive' as const,
                created_at: profile.created_at,
                updated_at: profile.created_at
            }))
        } catch (e: any) {
            error.value = e.message || 'Gagal memuat data pengguna'
            console.error('Error fetching users:', e)
        } finally {
            loading.value = false
        }
    }

    async function createUser(email: string, password: string, role: string) {
        await userService.createUser({
            email,
            password,
            role: role as 'owner' | 'manager' | 'cashier',
            isActive: true
        })
        await fetchUsers()
    }

    async function updateUser(id: string, updates: { role?: string; status?: string }) {
        await userService.updateUser(id, {
            role: updates.role as 'owner' | 'manager' | 'cashier' | undefined,
            isActive: updates.status === 'active'
        })
        await fetchUsers()
    }

    async function deleteUser(id: string) {
        await userService.deleteUser(id)
        await fetchUsers()
    }

    function filterUsers(searchQuery: string, filters: Record<string, any>) {
        let result = users.value

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(user =>
                user.email.toLowerCase().includes(query) ||
                user.role.toLowerCase().includes(query)
            )
        }

        if (filters.role) {
            result = result.filter(user => user.role === filters.role)
        }

        if (filters.status) {
            result = result.filter(user => user.status === filters.status)
        }

        return result
    }

    return {
        users,
        loading,
        error,
        fetchUsers,
        createUser,
        updateUser,
        deleteUser,
        filterUsers
    }
}
