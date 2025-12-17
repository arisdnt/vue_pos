import { supabase, supabaseAdmin } from '@/db/supabase'

export interface UserData {
    email: string
    password?: string
    role: 'owner' | 'manager' | 'cashier'
    storeId?: string
    isActive: boolean
}

export interface UserProfile extends UserData {
    id: string
    created_at: string
}

/**
 * Create a new user in Supabase Auth
 * Note: Requires service_role key (supabaseAdmin)
 */
export async function createUser(data: UserData) {
    if (!supabaseAdmin) {
        throw new Error('Admin client not configured. Add VITE_SUPABASE_SERVICE_ROLE_KEY to .env')
    }

    if (!data.password) {
        throw new Error('Password is required for new users')
    }

    // Create user in Supabase Auth with metadata
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: {
            role: data.role,
            store_id: data.storeId,
            is_active: data.isActive
        }
    })

    if (authError) {
        throw new Error(`Failed to create user: ${authError.message}`)
    }

    return authData.user
}

/**
 * Get all users from Supabase Auth
 */
export async function getAllUsers(): Promise<UserProfile[]> {
    if (!supabaseAdmin) {
        throw new Error('Admin client not configured')
    }

    const { data, error } = await supabaseAdmin.auth.admin.listUsers()

    if (error) {
        throw new Error(`Failed to load users: ${error.message}`)
    }

    return (data.users || []).map((user: any) => ({
        id: user.id,
        email: user.email || '',
        role: user.user_metadata?.role || 'cashier',
        storeId: user.user_metadata?.store_id,
        isActive: user.user_metadata?.is_active !== false,
        created_at: user.created_at,
        password: ''
    }))
}

/**
 * Update user metadata
 */
export async function updateUser(userId: string, data: Partial<UserData>) {
    if (!supabaseAdmin) {
        throw new Error('Admin client not configured')
    }

    const updateData: any = {}

    if (data.role !== undefined) updateData.role = data.role
    if (data.storeId !== undefined) updateData.store_id = data.storeId
    if (data.isActive !== undefined) updateData.is_active = data.isActive

    const { data: authData, error } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        {
            user_metadata: updateData
        }
    )

    if (error) {
        throw new Error(`Failed to update user: ${error.message}`)
    }

    return authData.user
}

/**
 * Delete user
 */
export async function deleteUser(userId: string) {
    if (!supabaseAdmin) {
        throw new Error('Admin client not configured')
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (error) {
        throw new Error(`Failed to delete user: ${error.message}`)
    }

    return true
}

/**
 * Get stores for dropdown
 */
export async function getStores() {
    const { data, error } = await supabase
        .from('stores')
        .select('id, name')
        .eq('active', true)
        .order('name')

    if (error) {
        console.error('Error loading stores:', error)
        return []
    }

    return data || []
}
