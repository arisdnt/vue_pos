# Creating Owner User in Supabase

There are 3 ways to create the owner user:

## Option 1: Via Supabase Dashboard (Easiest) ✅

1. Go to your Supabase project: https://supabase.com/dashboard/project/dbkdpuaswlsajjrmwogi
2. Navigate to **Authentication** > **Users**
3. Click **"Add User"** button
4. Fill in:
   - **Email:** `admin@admin.com`
   - **Password:** `admin123`
   - **Auto Confirm User:** ✅ (check this box)
5. Click **"Create User"**
6. Copy the **User UUID** from the users list
7. Go to **SQL Editor** and run:

```sql
-- Replace <USER_UUID> with the copied UUID
INSERT INTO public.user_roles (user_id, role_id)
SELECT 
    '<USER_UUID>'::uuid,
    id
FROM public.roles
WHERE namespace = 'owner';
```

8. Done! You can now login with `admin@admin.com` / `admin123`

---

## Option 2: Via Node.js Script

1. Get your **Service Role Key**:
   - Go to **Settings** > **API**
   - Copy the `service_role` key (secret)

2. Edit `create-owner-user.js`:
   - Replace `YOUR_SERVICE_ROLE_KEY_HERE` with your service role key

3. Run the script:
```bash
cd c:\vue_pos\docs
node create-owner-user.js
```

---

## Option 3: Via SQL (Advanced)

Run this in Supabase SQL Editor:

```sql
-- This requires service role privileges
-- May not work in all Supabase configurations

-- 1. Create auth user (requires pgcrypto extension)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

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
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@admin.com',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"username":"admin"}'::jsonb,
    NOW(),
    NOW()
) RETURNING id;

-- 2. Copy the returned UUID and assign owner role
INSERT INTO public.user_roles (user_id, role_id)
SELECT 
    '<RETURNED_UUID>'::uuid,
    id
FROM public.roles
WHERE namespace = 'owner';
```

---

## Verification

After creating the user, verify it works:

1. Open http://localhost:5173
2. Login with:
   - Email: `admin@admin.com`
   - Password: `admin123`
3. You should be redirected to the dashboard
4. Check that role shows as "owner"

---

## Recommended: Option 1 (Supabase Dashboard)

The easiest and most reliable method is **Option 1** via the Supabase Dashboard.
