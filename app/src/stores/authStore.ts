import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, getCurrentUser, getUserStores } from '@/db/supabase'
import type { User } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
    // State
    const user = ref<User | null>(null)
    const loading = ref(false)
    const role = ref<string | null>(null)
    const accessibleStores = ref<any[]>([])

    // Getters
    const isAuthenticated = computed(() => !!user.value)
    const isOwner = computed(() => role.value === 'owner')
    const isManager = computed(() => role.value === 'manager')
    const isCashier = computed(() => role.value === 'cashier')

    // Actions
    async function init() {
        loading.value = true
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user) {
                user.value = session.user
                await loadUserData()
            }
        } finally {
            loading.value = false
        }

        // Listen to auth changes
        supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                user.value = session.user
                await loadUserData()
            } else {
                user.value = null
                role.value = null
                accessibleStores.value = []
            }
        })
    }

    async function loadUserData() {
        if (!user.value) return

        // Load role
        const { data: roleData } = await supabase
            .from('user_roles')
            .select('roles(namespace)')
            .eq('user_id', user.value.id)
            .single()

        if (roleData) {
            role.value = (roleData as any).roles.namespace
        }

        // Load accessible stores
        const stores = await getUserStores()
        accessibleStores.value = stores
    }

    async function signIn(email: string, password: string) {
        loading.value = true
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })
            if (error) throw error
            return data
        } finally {
            loading.value = false
        }
    }

    async function signOut() {
        loading.value = true
        try {
            const { error } = await supabase.auth.signOut()
            if (error) throw error
            user.value = null
            role.value = null
            accessibleStores.value = []
        } finally {
            loading.value = false
        }
    }

    return {
        // State
        user,
        loading,
        role,
        accessibleStores,
        // Getters
        isAuthenticated,
        isOwner,
        isManager,
        isCashier,
        // Actions
        init,
        signIn,
        signOut,
    }
})
