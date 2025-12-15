# VuePOS - 3-Layer Architecture Documentation

## 📐 Architecture Overview

VuePOS menggunakan **3-Layer Architecture** yang konsisten untuk memisahkan concerns dan meningkatkan maintainability, testability, dan reusability.

```
┌─────────────────────────────────────────┐
│         Pages (Orchestration)           │
│  - Max 200 LOC per file                │
│  - UI orchestration & presentation     │
│  - Modal/dialog management             │
│  - Event handling                      │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      Composables (Reactive State)       │
│  - Max 200 LOC per file                │
│  - Vue reactivity (ref, computed)      │
│  - UI state management                 │
│  - Filter & formatting logic           │
│  - Calls service layer                 │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│       Services (Pure API Layer)         │
│  - Max 200 LOC per file                │
│  - Pure TypeScript functions           │
│  - Supabase/API calls                  │
│  - No Vue dependencies                 │
│  - Reusable anywhere                   │
└─────────────────────────────────────────┘
```

---

## 🎯 Layer Responsibilities

### Layer 1: Services (Pure API Layer)

**Location:** `src/services/`

**Purpose:** Pure business logic dan API calls tanpa dependency ke Vue.

**Characteristics:**
- ✅ Pure TypeScript functions
- ✅ No Vue imports (`ref`, `computed`, etc.)
- ✅ Handles Supabase/API communication
- ✅ Error handling dengan throw Error
- ✅ Reusable di composables, Pinia stores, workers, dll
- ✅ Easy to unit test

**Example:**
```typescript
// src/services/storeService.ts
import { supabase } from '@/db/supabase'

export async function getAllStores() {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw new Error(`Failed to load stores: ${error.message}`)
  return data || []
}

export async function createStore(storeData, ownerId) {
  const { data, error } = await supabase
    .from('stores')
    .insert({ ...storeData, owner_id: ownerId })
    .select()
    .single()
  
  if (error) throw new Error(`Failed to create store: ${error.message}`)
  return data
}
```

**Naming Convention:**
- File: `{entity}Service.ts` (e.g., `storeService.ts`, `userService.ts`)
- Functions: `get{Entity}`, `getAll{Entities}`, `create{Entity}`, `update{Entity}`, `delete{Entity}`

---

### Layer 2: Composables (Reactive State)

**Location:** `src/composables/`

**Purpose:** Vue reactive state management dan UI logic.

**Characteristics:**
- ✅ Uses Vue reactivity (`ref`, `computed`, `reactive`)
- ✅ Manages loading, error states
- ✅ Calls service layer functions
- ✅ Implements filter/search logic for UI
- ✅ Returns reactive state + methods
- ✅ Only usable in Vue components

**Example:**
```typescript
// src/composables/useStores.ts
import { ref } from 'vue'
import * as storeService from '@/services/storeService'

export function useStores() {
  const stores = ref([])
  const loading = ref(false)
  const error = ref('')

  async function fetchStores() {
    loading.value = true
    error.value = ''
    try {
      stores.value = await storeService.getAllStores()
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function createStore(data) {
    const { data: { user } } = await supabase.auth.getUser()
    await storeService.createStore(data, user.id)
    await fetchStores()
  }

  function filterStores(searchQuery, filters) {
    // UI filtering logic
    return stores.value.filter(/* ... */)
  }

  return { stores, loading, error, fetchStores, createStore, filterStores }
}
```

**Naming Convention:**
- File: `use{Entity}.ts` (e.g., `useStores.ts`, `useUsers.ts`)
- Function: `use{Entity}` (singular for single item, plural for collections)

---

### Layer 3: Pages (Orchestration)

**Location:** `src/pages/`

**Purpose:** UI orchestration, presentation, dan user interaction.

**Characteristics:**
- ✅ Uses composables for state
- ✅ Manages modals/dialogs
- ✅ Handles user events
- ✅ Minimal business logic
- ✅ Delegates to child components
- ✅ Max 200 LOC

**Example:**
```vue
<!-- src/pages/settings/StoresPage.vue -->
<template>
  <WinPage>
    <WinPageHeader title="Toko">
      <template #actions>
        <WinButton @click="openCreateModal">+ Tambah</WinButton>
      </template>
    </WinPageHeader>

    <WinPageContent>
      <WinCard no-padding>
        <WinTable :data="filteredStores" :loading="loading" />
      </WinCard>
    </WinPageContent>

    <WinModal v-model="showModal">
      <StoreForm v-model="formData" @submit="handleSubmit" />
    </WinModal>
  </WinPage>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStores } from '@/composables/useStores'
import StoreForm from '@/components/stores/StoreForm.vue'

const { stores, loading, fetchStores, createStore } = useStores()
const showModal = ref(false)
const formData = ref({})

const filteredStores = computed(() => filterStores(searchQuery.value, filters.value))

async function handleSubmit() {
  await createStore(formData.value)
  showModal.value = false
}

onMounted(() => fetchStores())
</script>
```

---

## 📦 Complete File Structure

```
src/
├── services/              # Layer 1: Pure API
│   ├── storeService.ts       (91 LOC)
│   ├── userService.ts        (135 LOC)
│   ├── productService.ts
│   ├── customerService.ts
│   └── orderService.ts
│
├── composables/           # Layer 2: Reactive State
│   ├── useStores.ts          (77 LOC)
│   ├── useUsers.ts           (92 LOC)
│   ├── useProducts.ts
│   ├── useCustomers.ts
│   └── useOrders.ts
│
├── components/            # Reusable UI Components
│   ├── base/                 # Base components (< 200 LOC)
│   ├── stores/
│   │   ├── StoreForm.vue     (169 LOC)
│   │   └── StoreDetail.vue   (113 LOC)
│   └── users/
│       └── UserForm.vue      (106 LOC)
│
└── pages/                 # Layer 3: Orchestration
    └── settings/
        ├── StoresPage.vue    (197 LOC)
        └── UsersPage.vue     (196 LOC)
```

---

## 🔄 Data Flow

```
User Action (Click Button)
    ↓
Page Component (StoresPage.vue)
    ↓
Composable (useStores.ts)
    ↓
Service (storeService.ts)
    ↓
Supabase API
    ↓
Service returns data
    ↓
Composable updates reactive state
    ↓
Page auto-updates (Vue reactivity)
```

---

## ✅ Implementation Checklist

Untuk setiap entity baru (e.g., Products, Customers, Orders):

### 1. Create Service Layer
```typescript
// src/services/{entity}Service.ts
export async function getAll{Entities}() { /* ... */ }
export async function create{Entity}(data) { /* ... */ }
export async function update{Entity}(id, data) { /* ... */ }
export async function delete{Entity}(id) { /* ... */ }
```

### 2. Create Composable
```typescript
// src/composables/use{Entity}.ts
import * as {entity}Service from '@/services/{entity}Service'

export function use{Entity}() {
  const items = ref([])
  const loading = ref(false)
  const error = ref('')
  
  async function fetch{Entities}() {
    items.value = await {entity}Service.getAll{Entities}()
  }
  
  return { items, loading, error, fetch{Entities}, ... }
}
```

### 3. Create Form Component (if needed)
```vue
<!-- src/components/{entity}/{Entity}Form.vue -->
<template>
  <form @submit.prevent="emit('submit')">
    <!-- Form fields -->
  </form>
</template>
```

### 4. Create Page
```vue
<!-- src/pages/{module}/{Entity}Page.vue -->
<template>
  <WinPage>
    <WinTable :data="filteredItems" />
    <WinModal v-model="showModal">
      <{Entity}Form @submit="handleSubmit" />
    </WinModal>
  </WinPage>
</template>

<script setup>
import { use{Entity} } from '@/composables/use{Entity}'
const { items, loading, create{Entity} } = use{Entity}()
</script>
```

---

## 🎯 Best Practices

### DO ✅

1. **Service Layer:**
   - Pure functions only
   - Throw errors, don't return them
   - Use TypeScript types
   - No Vue imports

2. **Composable Layer:**
   - Always return reactive state
   - Handle loading/error states
   - Call service functions
   - Implement UI-specific logic (filtering, formatting)

3. **Page Layer:**
   - Keep under 200 LOC
   - Delegate to child components
   - Use composables for state
   - Handle user interactions only

### DON'T ❌

1. **Service Layer:**
   - ❌ Don't use `ref`, `computed`, or Vue reactivity
   - ❌ Don't import Vue
   - ❌ Don't handle UI state

2. **Composable Layer:**
   - ❌ Don't make direct Supabase calls (use service)
   - ❌ Don't handle UI rendering
   - ❌ Don't exceed 200 LOC

3. **Page Layer:**
   - ❌ Don't make direct API calls
   - ❌ Don't duplicate logic (use composables)
   - ❌ Don't create monolithic files

---

## 🧪 Testing Strategy

### Service Layer
```typescript
// Easy to unit test - no Vue dependencies
import { getAllStores } from '@/services/storeService'

test('getAllStores returns data', async () => {
  const stores = await getAllStores()
  expect(stores).toBeArray()
})
```

### Composable Layer
```typescript
// Mock service layer
vi.mock('@/services/storeService')

test('useStores fetches data', async () => {
  const { stores, fetchStores } = useStores()
  await fetchStores()
  expect(stores.value).toHaveLength(2)
})
```

### Page Layer
```typescript
// Integration test with mocked composable
test('StoresPage displays stores', async () => {
  const wrapper = mount(StoresPage)
  expect(wrapper.find('table').exists()).toBe(true)
})
```

---

## 📚 Examples

### Complete CRUD Implementation

**1. Service (`storeService.ts`):**
```typescript
export async function getAllStores() { /* ... */ }
export async function createStore(data, ownerId) { /* ... */ }
export async function updateStore(id, data) { /* ... */ }
export async function deleteStore(id) { /* ... */ }
```

**2. Composable (`useStores.ts`):**
```typescript
export function useStores() {
  const stores = ref([])
  const loading = ref(false)
  
  async function fetchStores() { /* calls storeService */ }
  async function createStore(data) { /* calls storeService */ }
  
  return { stores, loading, fetchStores, createStore }
}
```

**3. Page (`StoresPage.vue`):**
```vue
<script setup>
const { stores, loading, createStore } = useStores()
</script>
```

---

## 🔍 Migration Guide

### Migrating Existing Code

**Before (Monolithic):**
```vue
<!-- 500+ LOC in one file -->
<script setup>
const stores = ref([])

async function fetchStores() {
  const { data } = await supabase.from('stores').select('*')
  stores.value = data
}
</script>
```

**After (3-Layer):**
```typescript
// storeService.ts (91 LOC)
export async function getAllStores() { /* ... */ }

// useStores.ts (77 LOC)
export function useStores() { /* ... */ }

// StoresPage.vue (197 LOC)
const { stores, fetchStores } = useStores()
```

---

## 📊 Benefits

1. **Maintainability:** Each layer has clear responsibility
2. **Testability:** Easy to test each layer independently
3. **Reusability:** Services can be used anywhere
4. **Scalability:** Add new features without breaking existing code
5. **Consistency:** All pages follow same pattern
6. **Readability:** Max 200 LOC per file

---

## 🚀 Quick Start

1. Create service: `src/services/{entity}Service.ts`
2. Create composable: `src/composables/use{Entity}.ts`
3. Create form: `src/components/{entity}/{Entity}Form.vue`
4. Create page: `src/pages/{module}/{Entity}Page.vue`
5. Follow max 200 LOC rule for each file

---

**Last Updated:** 2025-12-16  
**Version:** 1.0
