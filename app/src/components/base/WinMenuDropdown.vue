<template>
  <Teleport to="body">
    <div 
      v-if="show"
      :class="['win-menu-dropdown']"
      :style="dropdownStyle"
      @click.stop
    >
      <slot></slot>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = withDefaults(defineProps<{
  show: boolean
  anchorEl?: HTMLElement | null
  minWidth?: number
}>(), {
  show: false,
  anchorEl: null,
  minWidth: 240
})

const dropdownStyle = ref({})

watch(() => props.show, (show) => {
  if (show && props.anchorEl) {
    updatePosition()
  }
})

function updatePosition() {
  if (!props.anchorEl) return
  
  const rect = props.anchorEl.getBoundingClientRect()
  dropdownStyle.value = {
    position: 'absolute',
    top: `${rect.bottom}px`,
    left: `${rect.left}px`,
    minWidth: `${props.minWidth}px`,
    maxWidth: '320px'
  }
}

onMounted(() => {
  if (props.show && props.anchorEl) {
    updatePosition()
  }
})
</script>

<style scoped>
.win-menu-dropdown {
  background-color: #ffffff;
  border: 1px solid #adadad;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  z-index: var(--z-dropdown);
  padding: 4px 0;
}
</style>
