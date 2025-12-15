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
                    id: number
                    name: string
                    description: string | null
                    address_line1: string | null
                    city: string | null
                    province: string | null
                    phone: string | null
                    email: string | null
                    active: boolean
                    owner_id: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: number
                    name: string
                    description?: string | null
                    address_line1?: string | null
                    city?: string | null
                    province?: string | null
                    phone?: string | null
                    email?: string | null
                    active?: boolean
                    owner_id: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: number
                    name?: string
                    description?: string | null
                    address_line1?: string | null
                    city?: string | null
                    province?: string | null
                    phone?: string | null
                    email?: string | null
                    active?: boolean
                    owner_id?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            // Add more tables as needed
            // This is a minimal example - generate full types from Supabase CLI
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
                Args: { user_id: string; store_id: number }
                Returns: boolean
            }
            has_permission: {
                Args: { user_id: string; permission_namespace: string }
                Returns: boolean
            }
            get_user_stores: {
                Args: { user_id: string }
                Returns: Array<{
                    id: number
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
