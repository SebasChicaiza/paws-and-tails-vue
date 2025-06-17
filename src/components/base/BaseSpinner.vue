<script setup lang="ts">
interface Props {
  text?: string
}
defineProps<Props>()
</script>

<template>
  <div class="flex items-center justify-center space-x-2 text-primary-dark">
    <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
    <span v-if="text" class="text-lg font-medium">{{ text }}</span>
  </div>
</template>

<style scoped>
/* Tailwind CSS 'animate-spin' ya hace el trabajo, no se necesita CSS adicional aquí. */
</style>
