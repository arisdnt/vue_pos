// This file is auto-generated from Supabase
// Run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    username: string
                    first_name: string | null
                    last_name: string | null
                    phone: string | null
                    avatar_url: string | null
                    active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    username: string
                    first_name?: string | null
                    last_name?: string | null
                    phone?: string | null
                    avatar_url?: string | null
                    active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    username?: string
                    first_name?: string | null
                    last_name?: string | null
                    phone?: string | null
                    avatar_url?: string | null
                    active?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            stores: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    address_line1: string | null
                    address_line2: string | null
                    city: string | null
                    province: string | null
                    postal_code: string | null
                    phone: string | null
                    email: string | null
                    active: boolean
                    owner_id: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    address_line1?: string | null
                    address_line2?: string | null
                    city?: string | null
                    province?: string | null
                    postal_code?: string | null
                    phone?: string | null
                    email?: string | null
                    active?: boolean
                    owner_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    address_line1?: string | null
                    address_line2?: string | null
                    city?: string | null
                    province?: string | null
                    postal_code?: string | null
                    phone?: string | null
                    email?: string | null
                    active?: boolean
                    owner_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            roles: {
                Row: {
                    id: string
                    name: string
                    namespace: string
                    description: string | null
                    is_store_bound: boolean
                    locked: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    namespace: string
                    description?: string | null
                    is_store_bound?: boolean
                    locked?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    namespace?: string
                    description?: string | null
                    is_store_bound?: boolean
                    locked?: boolean
                    created_at?: string
                }
            }
            permissions: {
                Row: {
                    id: string
                    name: string
                    namespace: string
                    description: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    namespace: string
                    description?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    namespace?: string
                    description?: string | null
                    created_at?: string
                }
            }
            user_roles: {
                Row: {
                    id: string
                    user_id: string | null
                    role_id: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    role_id?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    role_id?: string | null
                    created_at?: string
                }
            }
            store_users: {
                Row: {
                    id: string
                    store_id: string | null
                    user_id: string | null
                    role_id: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    store_id?: string | null
                    user_id?: string | null
                    role_id?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    store_id?: string | null
                    user_id?: string | null
                    role_id?: string | null
                    created_at?: string
                }
            }
            unit_groups: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    created_at?: string
                }
            }
            units: {
                Row: {
                    id: string
                    group_id: string | null
                    name: string
                    identifier: string
                    description: string | null
                    value: number
                    base_unit: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    group_id?: string | null
                    name: string
                    identifier: string
                    description?: string | null
                    value?: number
                    base_unit?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    group_id?: string | null
                    name?: string
                    identifier?: string
                    description?: string | null
                    value?: number
                    base_unit?: boolean
                    created_at?: string
                }
            }
            payment_types: {
                Row: {
                    id: string
                    label: string
                    identifier: string
                    description: string | null
                    priority: number
                    active: boolean
                    readonly: boolean
                    icon: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    label: string
                    identifier: string
                    description?: string | null
                    priority?: number
                    active?: boolean
                    readonly?: boolean
                    icon?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    label?: string
                    identifier?: string
                    description?: string | null
                    priority?: number
                    active?: boolean
                    readonly?: boolean
                    icon?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            product_categories: {
                Row: {
                    id: string
                    store_id: string | null
                    name: string
                    description: string | null
                    parent_id: string | null
                    display_order: number
                    displays_on_pos: boolean
                    total_items: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    store_id?: string | null
                    name: string
                    description?: string | null
                    parent_id?: string | null
                    display_order?: number
                    displays_on_pos?: boolean
                    total_items?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    store_id?: string | null
                    name?: string
                    description?: string | null
                    parent_id?: string | null
                    display_order?: number
                    displays_on_pos?: boolean
                    total_items?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            products: {
                Row: {
                    id: string
                    store_id: string | null
                    category_id: string | null
                    unit_group_id: string | null
                    tax_group_id: string | null
                    name: string
                    sku: string
                    barcode: string | null
                    product_type: string | null
                    type: string | null
                    status: string | null
                    stock_management: string | null
                    description: string | null
                    tax_type: string | null
                    tax_value: number
                    auto_cogs: boolean
                    accurate_tracking: boolean
                    expires: boolean
                    on_expiration: string | null
                    searchable: boolean
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    store_id?: string | null
                    category_id?: string | null
                    unit_group_id?: string | null
                    tax_group_id?: string | null
                    name: string
                    sku: string
                    barcode?: string | null
                    product_type?: string | null
                    type?: string | null
                    status?: string | null
                    stock_management?: string | null
                    description?: string | null
                    tax_type?: string | null
                    tax_value?: number
                    auto_cogs?: boolean
                    accurate_tracking?: boolean
                    expires?: boolean
                    on_expiration?: string | null
                    searchable?: boolean
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    store_id?: string | null
                    category_id?: string | null
                    unit_group_id?: string | null
                    tax_group_id?: string | null
                    name?: string
                    sku?: string
                    barcode?: string | null
                    product_type?: string | null
                    type?: string | null
                    status?: string | null
                    stock_management?: string | null
                    description?: string | null
                    tax_type?: string | null
                    tax_value?: number
                    auto_cogs?: boolean
                    accurate_tracking?: boolean
                    expires?: boolean
                    on_expiration?: string | null
                    searchable?: boolean
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            role_permissions: {
                Row: {
                    role_id: string
                    permission_id: string
                }
                Insert: {
                    role_id: string
                    permission_id: string
                }
                Update: {
                    role_id?: string
                    permission_id?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            is_owner: {
                Args: { user_id: string }
                Returns: boolean
            }
            has_store_access: {
                Args: { user_id: string; store_id: string }
                Returns: boolean
            }
            has_permission: {
                Args: { user_id: string; permission_namespace: string }
                Returns: boolean
            }
            get_user_stores: {
                Args: { user_id: string }
                Returns: Array<{
                    id: string
                    name: string
                    description: string | null
                    city: string | null
                }>
            }
        }
        Enums: {
            [_ in never]: never
        }
    }
}
