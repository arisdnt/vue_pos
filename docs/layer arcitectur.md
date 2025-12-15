┌─────────────────────────────────────────┐
│         Pages (Orchestration)           │
│  StoresPage.vue (197 LOC)              │
│  UsersPage.vue (196 LOC)               │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      Composables (Reactive State)       │
│  useStores.ts (77 LOC)                 │
│  useUsers.ts (92 LOC)                  │
│  - ref, computed, reactive             │
│  - UI state management                 │
│  - Filter logic                        │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│       Services (Pure API Layer)         │
│  storeService.ts (91 LOC) ✅ NEW       │
│  userService.ts (135 LOC) ✅ EXISTING  │
│  - Supabase calls                      │
│  - No Vue dependencies                 │
│  - Reusable anywhere                   │
└─────────────────────────────────────────┘