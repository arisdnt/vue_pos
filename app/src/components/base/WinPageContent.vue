<template>
  <div class="win-page-content">
    <slot></slot>
  </div>
</template>

<style scoped>
.win-page-content {
  flex: 1;
  padding: 12px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
