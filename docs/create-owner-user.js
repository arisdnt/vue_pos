/**
 * Create Owner User Script
 * 
 * This script creates an owner user in Supabase
 * Run with: node create-owner-user.js
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dbkdpuaswlsajjrmwogi.supabase.co'
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY_HERE' // Get from Supabase Dashboard > Settings > API

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function createOwnerUser() {
    try {
        console.log('Creating owner user...')

        // 1. Create user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: 'admin@admin.com',
            password: 'admin123',
            email_confirm: true,
            user_metadata: {
                username: 'admin',
                first_name: 'Admin',
                last_name: 'Owner'
            }
        })

        if (authError) {
            console.error('Error creating auth user:', authError)
            return
        }

        console.log('✅ User created:', authData.user.id)

        // 2. Get owner role ID
        const { data: roleData, error: roleError } = await supabase
            .from('roles')
            .select('id')
            .eq('namespace', 'owner')
            .single()

        if (roleError) {
            console.error('Error fetching owner role:', roleError)
            return
        }

        console.log('✅ Owner role ID:', roleData.id)

        // 3. Assign owner role to user
        const { error: assignError } = await supabase
            .from('user_roles')
            .insert({
                user_id: authData.user.id,
                role_id: roleData.id
            })

        if (assignError) {
            console.error('Error assigning role:', assignError)
            return
        }

        console.log('✅ Owner role assigned successfully!')
        console.log('\n📧 Login credentials:')
        console.log('   Email: admin@admin.com')
        console.log('   Password: admin123')
        console.log('\n🎉 Owner user created successfully!')

    } catch (error) {
        console.error('Unexpected error:', error)
    }
}

createOwnerUser()
