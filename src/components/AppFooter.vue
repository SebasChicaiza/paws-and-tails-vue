<script setup lang="ts">
import { ref } from 'vue'

const currentYear = ref(new Date().getFullYear())
</script>

<template>
  <footer class="bg-primary-dark text-white py-6 mt-auto">
    <div class="container mx-auto text-center px-4">
      <p class="text-sm">
        &copy; <span class="font-semibold">{{ currentYear }}</span> Paws & Tails - Todos los
        derechos reservados.
      </p>
      <p class="text-xs text-text-muted mt-2">
        Diseñado con <span class="text-red-500">&hearts;</span> para amantes de las mascotas.
      </p>
    </div>
  </footer>
</template>

<style scoped>
/*
  No hay estilos `scoped` necesarios ya que todo está manejado por Tailwind CSS.
  Esto mantiene el componente limpio y coherente con el resto de tu UI.
*/
</style>
