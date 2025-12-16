import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { supabase, getCurrentUser, getUserStores } from '@/db/supabase'
import type { User, AuthChangeEvent } from '@supabase/supabase-js'

// Inactivity timeout in milliseconds (1 hour)
const INACTIVITY_TIMEOUT = 60 * 60 * 1000

export const useAuthStore = defineStore('auth', () => {
    // State
    const user = ref<User | null>(null)
    const loading = ref(false)
    const role = ref<string | null>(null)
    const accessibleStores = ref<any[]>([])
    const lastActivity = ref<number>(Date.now())

    // Inactivity timer
    let inactivityTimer: ReturnType<typeof setTimeout> | null = null

    // Getters
    const isAuthenticated = computed(() => !!user.value)
    const isOwner = computed(() => role.value === 'owner')
    const isManager = computed(() => role.value === 'manager')
    const isCashier = computed(() => role.value === 'cashier')

    // Update last activity timestamp
    function updateActivity() {
        lastActivity.value = Date.now()
        resetInactivityTimer()
    }

    // Reset inactivity timer
    function resetInactivityTimer() {
        if (inactivityTimer) {
            clearTimeout(inactivityTimer)
        }

        if (user.value) {
            inactivityTimer = setTimeout(() => {
                console.log('Session expired due to inactivity')
                signOut()
            }, INACTIVITY_TIMEOUT)
        }
    }

    // Setup activity listeners
    function setupActivityListeners() {
        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click']

        // Throttled activity update (max once per 30 seconds)
        let lastUpdate = 0
        const throttledUpdate = () => {
            const now = Date.now()
            if (now - lastUpdate > 30000) {
                lastUpdate = now
                updateActivity()
            }
        }

        events.forEach(event => {
            window.addEventListener(event, throttledUpdate, { passive: true })
        })

        // Start the initial timer
        resetInactivityTimer()
    }

    // Actions
    async function init() {
        loading.value = true
        try {
            // Try to get existing session
            const { data: { session }, error } = await supabase.auth.getSession()

            if (error) {
                console.warn('Error getting session:', error.message)
                // Don't clear user on error - might be temporary network issue
                return
            }

            if (session?.user) {
                user.value = session.user
                await loadUserData()
                setupActivityListeners()
            }
        } catch (e) {
            console.warn('Init error:', e)
        } finally {
            loading.value = false
        }

        // Listen to auth changes - but be careful about what events trigger logout
        supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session) => {
            console.log('Auth state changed:', event, session?.user?.email)

            switch (event) {
                case 'SIGNED_IN':
                case 'TOKEN_REFRESHED':
                case 'USER_UPDATED':
                    // User is authenticated or token refreshed
                    if (session?.user) {
                        user.value = session.user
                        await loadUserData()
                        updateActivity()
                    }
                    break

                case 'SIGNED_OUT':
                    // Only clear on explicit sign out
                    user.value = null
                    role.value = null
                    accessibleStores.value = []
                    if (inactivityTimer) {
                        clearTimeout(inactivityTimer)
                        inactivityTimer = null
                    }
                    break

                case 'INITIAL_SESSION':
                    // Initial session load
                    if (session?.user) {
                        user.value = session.user
                        await loadUserData()
                    }
                    break

                default:
                    // For other events (PASSWORD_RECOVERY, etc.), don't logout
                    // Just update session if available
                    if (session?.user) {
                        user.value = session.user
                    }
                    break
            }
        })
    }

    async function loadUserData() {
        if (!user.value) return

        try {
            // Load role
            const { data: roleData, error: roleError } = await supabase
                .from('user_roles')
                .select('roles(namespace)')
                .eq('user_id', user.value.id)
                .single()

            if (roleError) {
                console.warn('Error loading role:', roleError.message)
            } else if (roleData) {
                role.value = (roleData as any).roles?.namespace || null
            }

            // Load accessible stores
            try {
                const stores = await getUserStores()
                accessibleStores.value = stores
            } catch (e) {
                console.warn('Error loading stores:', e)
                accessibleStores.value = []
            }
        } catch (e) {
            console.warn('Error loading user data:', e)
        }
    }

    async function signIn(email: string, password: string) {
        loading.value = true
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })
            if (error) throw error

            // Setup activity tracking after login
            setupActivityListeners()

            return data
        } finally {
            loading.value = false
        }
    }

    async function signOut() {
        loading.value = true
        try {
            // Clear inactivity timer
            if (inactivityTimer) {
                clearTimeout(inactivityTimer)
                inactivityTimer = null
            }

            const { error } = await supabase.auth.signOut()
            if (error) throw error

            user.value = null
            role.value = null
            accessibleStores.value = []
        } finally {
            loading.value = false
        }
    }

    // Force refresh session - call this if you need to ensure valid session
    async function refreshSession() {
        try {
            const { data, error } = await supabase.auth.refreshSession()
            if (error) {
                console.warn('Failed to refresh session:', error.message)
                return false
            }
            if (data.session) {
                user.value = data.session.user
                return true
            }
            return false
        } catch (e) {
            console.warn('Refresh session error:', e)
            return false
        }
    }

    return {
        // State
        user,
        loading,
        role,
        accessibleStores,
        lastActivity,
        // Getters
        isAuthenticated,
        isOwner,
        isManager,
        isCashier,
        // Actions
        init,
        signIn,
        signOut,
        updateActivity,
        refreshSession,
    }
})
