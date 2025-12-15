<template>
  <div class="win-search-select" :class="{ open: isOpen, disabled }">
    <div class="search-select-input" @click="toggleDropdown">
      <input
        ref="searchInput"
        v-model="searchQuery"
        type="text"
        :placeholder="placeholder"
        :disabled="disabled"
        class="input-field"
        @focus="openDropdown"
        @input="handleSearch"
        @keydown.down.prevent="navigateDown"
        @keydown.up.prevent="navigateUp"
        @keydown.enter.prevent="selectHighlighted"
        @keydown.esc="closeDropdown"
      />
      <span class="dropdown-arrow" :class="{ rotated: isOpen }">▼</span>
    </div>

    <div v-if="isOpen" class="search-select-dropdown">
      <div v-if="filteredOptions.length === 0" class="no-results">
        {{ noResultsText }}
      </div>
      <div
        v-else
        v-for="(option, index) in filteredOptions"
        :key="getOptionValue(option)"
        class="dropdown-item"
        :class="{ 
          highlighted: index === highlightedIndex,
          selected: isSelected(option)
        }"
        @click="selectOption(option)"
        @mouseenter="highlightedIndex = index"
      >
        {{ getOptionLabel(option) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

interface Option {
  value: any
  label: string
}

const props = withDefaults(defineProps<{
  modelValue?: any
  options: (Option | any)[]
  placeholder?: string
  disabled?: boolean
  noResultsText?: string
  valueKey?: string
  labelKey?: string
}>(), {
  placeholder: 'Pilih...',
  disabled: false,
  noResultsText: 'Tidak ada hasil',
  valueKey: 'value',
  labelKey: 'label'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

const searchQuery = ref('')
const isOpen = ref(false)
const highlightedIndex = ref(0)
const searchInput = ref<HTMLInputElement>()

const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options
  
  const query = searchQuery.value.toLowerCase()
  return props.options.filter(option => {
    const label = getOptionLabel(option).toLowerCase()
    return label.includes(query)
  })
})

function getOptionValue(option: any): any {
  if (typeof option === 'object' && option !== null) {
    return option[props.valueKey]
  }
  return option
}

function getOptionLabel(option: any): string {
  if (typeof option === 'object' && option !== null) {
    return option[props.labelKey] || String(option[props.valueKey])
  }
  return String(option)
}

function isSelected(option: any): boolean {
  return getOptionValue(option) === props.modelValue
}

function openDropdown() {
  if (!props.disabled) {
    isOpen.value = true
    highlightedIndex.value = 0
  }
}

function closeDropdown() {
  isOpen.value = false
  searchQuery.value = ''
}

function toggleDropdown() {
  if (isOpen.value) {
    closeDropdown()
  } else {
    openDropdown()
    searchInput.value?.focus()
  }
}

function selectOption(option: any) {
  emit('update:modelValue', getOptionValue(option))
  closeDropdown()
}

function navigateDown() {
  if (highlightedIndex.value < filteredOptions.value.length - 1) {
    highlightedIndex.value++
  }
}

function navigateUp() {
  if (highlightedIndex.value > 0) {
    highlightedIndex.value--
  }
}

function selectHighlighted() {
  if (filteredOptions.value[highlightedIndex.value]) {
    selectOption(filteredOptions.value[highlightedIndex.value])
  }
}

function handleSearch() {
  highlightedIndex.value = 0
  if (!isOpen.value) {
    openDropdown()
  }
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.win-search-select')) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

watch(() => props.modelValue, () => {
  searchQuery.value = ''
})
</script>

<style scoped>
.win-search-select {
  position: relative;
  width: 100%;
}

.win-search-select.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.search-select-input {
  display: flex;
  align-items: center;
  border: 1px solid var(--win-border);
  background: white;
  cursor: pointer;
}

.search-select-input:hover {
  border-color: var(--win-border-dark);
}

.win-search-select.open .search-select-input {
  border-color: var(--win-accent);
}

.input-field {
  flex: 1;
  border: none;
  padding: 6px 12px;
  font-size: 14px;
  outline: none;
  background: transparent;
}

.input-field::placeholder {
  color: var(--win-text-secondary);
}

.dropdown-arrow {
  padding: 0 8px;
  color: var(--win-text-secondary);
  font-size: 10px;
  transition: transform 0.2s;
  user-select: none;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

.search-select-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 250px;
  overflow-y: auto;
  background: white;
  border: 1px solid var(--win-border);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  margin-top: 2px;
}

.dropdown-item {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.1s;
}

.dropdown-item.highlighted {
  background: #f0f0f0;
}

.dropdown-item.selected {
  background: var(--win-accent-light);
  font-weight: 600;
}

.dropdown-item:hover {
  background: var(--win-accent);
  color: white;
}

.no-results {
  padding: 16px;
  text-align: center;
  color: var(--win-text-secondary);
  font-size: 13px;
}
</style>
