-- =====================================================
-- CREATE OWNER USER SCRIPT
-- =====================================================
-- This script assigns the Owner role to a user
-- 
-- PREREQUISITES:
-- 1. Create user via Supabase Dashboard first:
--    - Go to Authentication > Users
--    - Click "Add User"
--    - Email: admin@admin.com
--    - Password: admin123
--    - Email Confirm: Yes (or send confirmation email)
--
-- 2. Copy the user's UUID from the dashboard
--
-- 3. Run this script, replacing <USER_UUID> with actual UUID

-- =====================================================
-- STEP 1: Assign Owner Role to User
-- =====================================================
-- Replace <USER_UUID> with the actual UUID from Supabase Dashboard

INSERT INTO public.user_roles (user_id, role_id)
SELECT 
    '<USER_UUID>'::uuid,  -- Replace this with actual user UUID
    id
FROM public.roles
WHERE namespace = 'owner'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- =====================================================
-- STEP 2: Verify the assignment
-- =====================================================
SELECT 
    p.username,
    p.first_name,
    p.last_name,
    r.name as role_name,
    r.namespace as role_namespace,
    r.is_store_bound
FROM public.profiles p
JOIN public.user_roles ur ON ur.user_id = p.id
JOIN public.roles r ON r.id = ur.role_id
WHERE p.id = '<USER_UUID>'::uuid;  -- Replace with actual UUID

-- =====================================================
-- ALTERNATIVE: Create user via SQL (Advanced)
-- =====================================================
-- If you have access to create auth users directly:
/*
-- This requires admin privileges and may not work in all Supabase setups
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@admin.com',
    crypt('admin123', gen_salt('bf')),  -- Requires pgcrypto extension
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"username":"admin"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
) RETURNING id;

-- Then assign owner role using the returned ID
*/

-- =====================================================
-- QUICK CHECK: View all roles
-- =====================================================
SELECT id, name, namespace, is_store_bound, locked 
FROM public.roles 
ORDER BY id;

-- Owner role should have:
-- - id: 1
-- - namespace: 'owner'
-- - is_store_bound: false
