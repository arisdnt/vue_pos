import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Check .env file.')
}

/**
 * Supabase client for database operations
 * - Automatically handles authentication
 * - Row Level Security (RLS) policies apply
 * - Realtime subscriptions available
 * 
 * Session Configuration:
 * - persistSession: true - Keep session in localStorage
 * - autoRefreshToken: true - Automatically refresh before expiry
 * - detectSessionInUrl: true - Handle auth callbacks
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // Storage key for session
        storageKey: 'vue-pos-auth',
        // Use localStorage for persistence
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
    realtime: {
        params: {
            eventsPerSecond: 10,
        },
    },
    // Global error handling
    global: {
        headers: {
            'x-app-version': '1.0.0',
        },
    },
})

/**
 * Supabase Admin client for privileged operations
 * IMPORTANT: Only use in Tauri desktop app context
 * DO NOT use in web apps - service_role bypasses RLS
 */
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

export const supabaseAdmin = supabaseServiceKey
    ? createClient<Database>(supabaseUrl, supabaseServiceKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        }
    })
    : null

/**
 * Helper to check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
    const { data } = await supabase.auth.getSession()
    return !!data.session
}

/**
 * Helper to get current user
 */
export const getCurrentUser = async () => {
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error
    return data.user
}

/**
 * Helper to get user role
 */
export const getUserRole = async () => {
    const user = await getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
        .from('user_roles')
        .select('roles(namespace)')
        .eq('user_id', user.id)
        .single()

    if (error) throw error
    return (data as any)?.roles?.namespace || null
}

/**
 * Helper to check if user is owner
 */
export const isOwner = async (): Promise<boolean> => {
    const { data } = await supabase.rpc('is_owner', {
        user_id: (await getCurrentUser()).id
    })
    return data || false
}

/**
 * Helper to get user's accessible stores
 */
export const getUserStores = async () => {
    const { data, error } = await supabase.rpc('get_user_stores', {
        user_id: (await getCurrentUser()).id
    })
    if (error) throw error
    return data || []
}
