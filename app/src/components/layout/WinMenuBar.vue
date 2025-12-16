<template>
  <div class="titlebar-menus" @click.stop>
    <div v-for="menu in menus" :key="menu.id" class="menu-item-wrapper" :ref="el => setMenuRef(menu.id, el)">
      <WinMenuItem
        :label="menu.label"
        :active="activeMenu === menu.id"
        @click="toggleMenu(menu.id)"
        @mouseenter="hoverMenu(menu.id)"
      />
      
      <WinMenuDropdown
        :show="activeMenu === menu.id"
        :anchor-el="menuRefs[menu.id]"
      >
        <WinMenuDropdownItem
          v-for="item in menu.items"
          :key="item.id"
          :label="item.label"
          :shortcut="item.shortcut"
          :disabled="item.disabled"
          :separator="item.separator"
          @click="handleAction(item)"
        />
      </WinMenuDropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { menus, type MenuItem } from '@/data/menuData'
import { WinMenuItem, WinMenuDropdown, WinMenuDropdownItem } from '@/components/base'

const emit = defineEmits<{
  (e: 'menu-action', item: MenuItem): void
}>()

const activeMenu = ref<string | null>(null)
const isMenuOpen = ref(false)
const menuRefs = ref<Record<string, HTMLElement | null>>({})

function setMenuRef(menuId: string, el: any) {
  if (el) {
    menuRefs.value[menuId] = el as HTMLElement
  }
}

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
</style>
