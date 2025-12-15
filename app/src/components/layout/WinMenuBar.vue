<template>
  <div class="titlebar-menus" @click.stop>
    <div v-for="menu in menus" :key="menu.id" class="menu-item-wrapper">
      <button 
        class="menu-item"
        :class="{ active: activeMenu === menu.id }"
        @click="toggleMenu(menu.id)"
        @mouseenter="hoverMenu(menu.id)"
      >
        {{ menu.label }}
      </button>
      
      <!-- Dropdown -->
      <div v-if="activeMenu === menu.id" class="menu-dropdown">
        <template v-for="item in menu.items" :key="item.id">
          <div v-if="item.separator" class="menu-separator"></div>
          <button 
            v-else
            class="menu-dropdown-item"
            :class="{ disabled: item.disabled }"
            :disabled="item.disabled"
            @click="handleAction(item)"
          >
            <span class="item-label">{{ item.label }}</span>
            <span v-if="item.shortcut" class="item-shortcut">{{ item.shortcut }}</span>
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { menus, type MenuItem } from '@/data/menuData'

const emit = defineEmits<{
  (e: 'menu-action', item: MenuItem): void
}>()

const activeMenu = ref<string | null>(null)
const isMenuOpen = ref(false)

function toggleMenu(menuId: string) {
  if (activeMenu.value === menuId) {
    activeMenu.value = null
    isMenuOpen.value = false
  } else {
    activeMenu.value = menuId
    isMenuOpen.value = true
  }
}

function hoverMenu(menuId: string) {
  if (isMenuOpen.value && activeMenu.value !== menuId) {
    activeMenu.value = menuId
  }
}

function handleAction(item: MenuItem) {
  activeMenu.value = null
  isMenuOpen.value = false
  emit('menu-action', item)
}

function closeMenu(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.menu-item-wrapper')) {
    activeMenu.value = null
    isMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeMenu)
})
</script>

<style scoped>
.titlebar-menus {
  display: flex;
  align-items: stretch;
  -webkit-app-region: no-drag;
}

.menu-item-wrapper {
  position: relative;
}

.menu-item {
  height: 100%;
  padding: 0 12px;
  background: transparent;
  border: none;
  font-size: 12px;
  font-family: inherit;
  color: var(--win-text);
  cursor: pointer;
  display: flex;
  align-items: center;
}

.menu-item:hover,
.menu-item.active {
  background-color: rgba(0, 0, 0, 0.05);
}

.menu-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 240px;
  max-width: 320px;
  background-color: #ffffff;
  border: 1px solid #adadad;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  z-index: var(--z-dropdown);
  padding: 4px 0;
}

.menu-dropdown-item {
  width: 100%;
  padding: 6px 16px 6px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  background: transparent;
  border: none;
  font-size: 12px;
  font-family: inherit;
  color: var(--win-text);
  cursor: pointer;
  text-align: left;
  white-space: nowrap;
}

.menu-dropdown-item:hover:not(.disabled) {
  background-color: var(--win-accent);
  color: white;
}

.menu-dropdown-item.disabled {
  color: var(--win-text-disabled);
  cursor: not-allowed;
}

.item-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-shortcut {
  flex-shrink: 0;
  color: var(--win-text-secondary);
  font-size: 11px;
  white-space: nowrap;
}

.menu-dropdown-item:hover:not(.disabled) .item-shortcut {
  color: rgba(255, 255, 255, 0.7);
}

.menu-separator {
  height: 1px;
  background-color: var(--win-border);
  margin: 4px 0;
}
</style>
