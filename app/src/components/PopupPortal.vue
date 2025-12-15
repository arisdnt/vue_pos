<template>
  <Teleport to="body">
    <div v-for="popup in popups" :key="popup.hash" class="popup-overlay" @click.self="handleBackdropClick(popup)">
      <div class="popup-body" :class="`popup-${popup.config.size}`">
        <component :is="popup.component" v-bind="popup.props" @close="popup.close()" />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Popup } from '@/libraries/popup'
import type { PopupInstance } from '@/libraries/popup'

const popups = ref<PopupInstance[]>([])

const handleBackdropClick = (popup: PopupInstance) => {
  if (popup.config.closeOnBackdrop) {
    popup.close()
  }
}

let unsubscribe: (() => void) | null = null

onMounted(() => {
  unsubscribe = Popup.subscribe((updatedPopups) => {
    popups.value = updatedPopups
  })
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})
</script>
