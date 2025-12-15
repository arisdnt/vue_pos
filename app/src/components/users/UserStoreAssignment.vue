<template>
  <WinField label="Assign to Stores">
    <WinCheckboxList
      :items="checkboxItems"
      :model-value="modelValue"
      :loading="loading"
      loading-text="Memuat toko..."
      empty-text="Tidak ada toko tersedia"
      @update:model-value="emit('update:modelValue', $event)"
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
  </WinField>
</template>

<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import { WinCheckboxList, WinBadge, WinAlert, WinField } from '@/components/base'
import { useStoreUsers } from '@/composables/useStoreUsers'

const props = defineProps<{
  userId?: string
  modelValue: number[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number[]): void
}>()

const { assignments, loading, error, loadUserStoreAssignments } = useStoreUsers()

const checkboxItems = computed(() => 
  assignments.value.map(store => ({
    id: store.id,
    label: store.name
  }))
)

const selectedStores = computed(() => 
  assignments.value.filter(s => props.modelValue.includes(s.id))
)

function removeStore(storeId: number) {
  const newValue = props.modelValue.filter(id => id !== storeId)
  emit('update:modelValue', newValue)
}

watch(() => props.userId, async (newUserId) => {
  if (newUserId) {
    await loadUserStoreAssignments(newUserId)
  }
}, { immediate: true })

watch(() => props.modelValue, (newValue) => {
  if (Array.isArray(newValue)) {
    assignments.value.forEach(store => {
      store.assigned = newValue.includes(store.id)
    })
  }
}, { immediate: true })

onMounted(async () => {
  if (props.userId) {
    await loadUserStoreAssignments(props.userId)
  }
})
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
</style>
