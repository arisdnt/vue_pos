<template>
  <WinField label="Assign to Store">
    <WinCheckboxList
      :items="checkboxItems"
      :model-value="modelValue"
      :loading="loading"
      loading-text="Memuat toko..."
      empty-text="Tidak ada toko tersedia"
      @update:model-value="handleListChange"
    />

    <div v-if="selectedStores.length > 0" class="selected-section">
      <div class="section-label">Toko Terpilih:</div>
      <div class="badge-group">
        <WinBadge 
          v-for="store in selectedStores" 
          :key="store.id"
          variant="primary"
        >
          {{ store.name }}
          <button 
            type="button"
            class="badge-remove"
            @click="removeStore(store.id)"
          >
            ✕
          </button>
        </WinBadge>
      </div>
    </div>

    <WinAlert v-if="error" type="error" :closeable="true" @close="error = ''">
      {{ error }}
    </WinAlert>

    <p class="helper-text">
      Manager dan Kasir hanya dapat terhubung ke <strong>satu toko</strong>.
    </p>
  </WinField>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { WinCheckboxList, WinBadge, WinAlert, WinField } from '@/components/base'
import { useStoreUsers } from '@/composables/useStoreUsers'

const props = defineProps<{
  userId?: string
  modelValue: string[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

const { assignments, loading, error, loadUserStoreAssignments } = useStoreUsers()

// Dummy UUID used to load store list when userId is not yet available (create user mode)
const DUMMY_USER_ID = '00000000-0000-0000-0000-000000000000'

const checkboxItems = computed(() =>
  assignments.value.map(store => ({
    id: store.id,
    label: store.name,
  })),
)

const selectedStores = computed(() =>
  assignments.value.filter(s => props.modelValue.includes(s.id)),
)

function removeStore(storeId: string) {
  const newValue = props.modelValue.filter(id => id !== storeId)
  emit('update:modelValue', newValue)
}

function handleListChange(newRaw: (string | number)[]) {
  const newIds = newRaw.map(String)
  const prevIds = props.modelValue

  const prevSet = new Set(prevIds)
  const added = newIds.filter(id => !prevSet.has(id))

  let final: string[]

  if (added.length > 0) {
    // Jika ada pilihan baru, pakai hanya pilihan terbaru
    final = [added[added.length - 1]]
  } else {
    // Jika tidak ada yang baru (user menghapus centang),
    // biarkan sisa pilihan (0 atau 1) apa adanya.
    final = newIds.slice(0, 1)
  }

  emit('update:modelValue', final)
}

watch(
  () => props.userId,
  async (newUserId) => {
    const effectiveUserId = newUserId || DUMMY_USER_ID
    await loadUserStoreAssignments(effectiveUserId)
  },
  { immediate: true },
)

watch(() => props.modelValue, (newValue) => {
  if (Array.isArray(newValue)) {
    assignments.value.forEach(store => {
      store.assigned = newValue.includes(store.id)
    })
  }
}, { immediate: true })
</script>

<style scoped>
.selected-section {
  margin-top: 12px;
}

.section-label {
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--win-text-secondary, #666);
}

.badge-group {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.badge-remove {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  margin-left: 4px;
  padding: 0;
  font-size: 14px;
  opacity: 0.7;
  transition: opacity 0.15s;
}

.badge-remove:hover {
  opacity: 1;
}

.helper-text {
  margin-top: 8px;
  font-size: 12px;
  color: var(--win-text-secondary, #666);
}
</style>
