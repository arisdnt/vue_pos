import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { supabase, getCurrentUser, getUserStores } from '@/db/supabase'
import type { User, AuthChangeEvent } from '@supabase/supabase-js'
import { startSyncManager } from '@/db/syncManager'

// Inactivity timeout configuration
// - Default production: 60 menit (kasir otomatis logout jika lama tidak dipakai)
// - Default development: 720 menit / 12 jam (agar tidak sering terlogout saat coding)
// - Bisa dioverride lewat VITE_INACTIVITY_TIMEOUT_MINUTES
//   * > 0  : timeout dalam menit
//   * = 0  : nonaktifkan auto-logout karena inactivity
const DEFAULT_TIMEOUT_MINUTES = import.meta.env.DEV ? 12 * 60 : 60
const rawTimeoutMinutes = import.meta.env.VITE_INACTIVITY_TIMEOUT_MINUTES

let INACTIVITY_TIMEOUT: number | null

if (rawTimeoutMinutes !== undefined && rawTimeoutMinutes !== '') {
    const parsed = Number(rawTimeoutMinutes)
    if (Number.isFinite(parsed) && parsed > 0) {
        INACTIVITY_TIMEOUT = parsed * 60 * 1000
    } else if (parsed === 0) {
        // 0 menit = nonaktifkan auto-logout
        INACTIVITY_TIMEOUT = null
    } else {
        INACTIVITY_TIMEOUT = DEFAULT_TIMEOUT_MINUTES * 60 * 1000
    }
} else {
    INACTIVITY_TIMEOUT = DEFAULT_TIMEOUT_MINUTES * 60 * 1000
}

if (import.meta.env.DEV) {
    // Debug info untuk memastikan konfigurasi timeout benar terbaca
    // Akan muncul sekali saat app start di console browser devtools
    console.log(
        '[AuthStore] INACTIVITY_TIMEOUT (ms):',
        INACTIVITY_TIMEOUT,
        'raw env:',
        rawTimeoutMinutes,
        'default (minutes):',
        DEFAULT_TIMEOUT_MINUTES,
    )
}

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

        // Jika tidak ada user atau timeout dinonaktifkan, jangan set timer
        if (!user.value || INACTIVITY_TIMEOUT === null) {
            inactivityTimer = null
            return
        }

        if (user.value && INACTIVITY_TIMEOUT > 0) {
            if (import.meta.env.DEV) {
                console.log(
                    '[AuthStore] Scheduling inactivity logout in ms:',
                    INACTIVITY_TIMEOUT,
                )
            }
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

            if (import.meta.env.DEV) {
                console.log(
                    '[AuthStore] getSession:',
                    session ? 'FOUND' : 'NONE',
                    session?.user?.email || null,
                )
            }

            if (session?.user) {
                user.value = session.user
                await loadUserData()
                startSyncManager()
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
                        startSyncManager()
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
            // 1) Role: gunakan metadata dari auth.users untuk menghindari query user_roles
            const meta: any = user.value.user_metadata || {}
            role.value = meta.role || null

            // 2) Accessible stores: ambil dari Dexie melalui storeUserService (tanpa RPC get_user_stores)
            try {
                const { getUserStores: getUserStoresDexie } = await import('@/services/storeUserService')
                const stores = await getUserStoresDexie(user.value.id)
                accessibleStores.value = stores
            } catch (e) {
                console.warn('Error loading stores from Dexie:', e)
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

            if (data.user) {
                // Set user immediately so router guard can proceed
                user.value = data.user

                // Kick off background tasks without blocking the login flow
                loadUserData().catch((e) => {
                    console.warn('[AuthStore] loadUserData after signIn failed:', e)
                })
                startSyncManager()
            }

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
