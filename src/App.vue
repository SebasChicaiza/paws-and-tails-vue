<script setup lang="ts">
import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'
</script>

<template>
  <div id="app" class="flex flex-col min-h-screen">
    <AppNavbar />
    <main class="flex-grow">
      <router-view />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped></style>
