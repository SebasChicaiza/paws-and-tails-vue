<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router' // Asume que tienes Vue Router instalado

// Importa tu componente BaseButton si lo vas a usar, lo recomiendo para el botón de logout
import BaseButton from '../components/base/BaseButton.vue' // Asegúrate de que la ruta sea correcta

const isMenuOpen = ref(false)
const isAuthenticated = ref(false) // Simula el estado de autenticación
const userName = ref('') // Para el mensaje de bienvenida

// Lógica para alternar el menú en móviles
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

// Enlaces de navegación
const navLinks = [
  { name: 'Inicio', path: '/' },
  { name: 'Sobre Nosotros', path: '/nosotros' },
  { name: 'Productos', path: '/productos' },
  { name: 'Carrito', path: '/carrito' },
  { name: 'Mi Cuenta', path: '/micuenta' },
]

// Lógica de usuario y admin (similar a tu JS original)
const showAdminButton = computed(() => {
  // Aquí iría tu lógica real para determinar si el usuario es admin.
  // Por ahora, lo simulamos.
  const user = localStorage.getItem('usuario') // O mejor, desde un store de Pinia/Vuex
  return user === 'admin' // Ejemplo: si el usuario es 'admin'
})

const handleLogout = () => {
  // Lógica para cerrar sesión
  localStorage.removeItem('usuario') // O tu lógica de desautenticación real
  isAuthenticated.value = false
  userName.value = ''
  // router.push('/') // O redirigir a la página de inicio de sesión
  console.log('Sesión cerrada')
}

onMounted(() => {
  const user = localStorage.getItem('usuario')
  if (user) {
    isAuthenticated.value = true
    userName.value = user // Asumiendo que el 'usuario' en localStorage es el nombre o email
  }
})
</script>

<template>
  <header class="bg-primary-dark text-white p-4 shadow-lg sticky top-0 z-50">
    <nav class="container mx-auto flex justify-between items-center flex-wrap">
      <div class="flex items-center space-x-3">
        <router-link
          to="/"
          class="flex items-center focus:outline-none focus:ring-2 focus:ring-accent rounded-md"
        >
          <img
            src="../assets/images/logoPawsTails-noFondo.png"
            alt="Logo Paws & Tails"
            class="h-10 w-auto"
          />
          <h1 class="font-bold text-2xl tracking-wide ml-2">Paws & Tails</h1>
        </router-link>

        <div v-if="isAuthenticated" class="hidden md:block text-sm text-primary-light">
          ¡Hola, <span class="font-semibold">{{ userName }}</span
          >!
        </div>
      </div>

      <div class="md:hidden">
        <button
          @click="toggleMenu"
          class="text-white focus:outline-none focus:ring-2 focus:ring-accent rounded-md p-2 transition-colors duration-200"
          :aria-expanded="isMenuOpen ? 'true' : 'false'"
          aria-controls="nav-links-mobile"
        >
          <svg
            v-if="!isMenuOpen"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
          <svg v-else class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>

      <ul class="hidden md:flex items-center space-x-6">
        <li v-for="link in navLinks" :key="link.name">
          <router-link
            :to="link.path"
            active-class="text-accent border-b-2 border-accent"
            class="block py-2 px-1 text-white hover:text-accent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent rounded-md"
          >
            {{ link.name }}
          </router-link>
        </li>
        <li v-if="showAdminButton">
          <router-link
            to="/admin"
            class="block py-2 px-1 text-white hover:text-accent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent rounded-md"
          >
            Gestión
          </router-link>
        </li>
        <li v-if="isAuthenticated">
          <BaseButton
            variant="ghost"
            size="sm"
            class="text-white bg-white/20 hover:bg-white/40 focus:ring-white"
            @click="handleLogout"
          >
            Cerrar sesión
          </BaseButton>
        </li>
      </ul>
    </nav>

    <transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="transform opacity-0 scale-y-0"
      enter-to-class="transform opacity-100 scale-y-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="transform opacity-100 scale-y-100"
      leave-to-class="transform opacity-0 scale-y-0"
    >
      <ul
        v-if="isMenuOpen"
        id="nav-links-mobile"
        class="md:hidden flex flex-col items-center mt-4 space-y-2 bg-primary-dark rounded-b-lg py-2 origin-top"
      >
        <li v-for="link in navLinks" :key="link.name" class="w-full text-center">
          <router-link
            :to="link.path"
            active-class="bg-primary text-accent"
            class="block py-2 px-4 text-white hover:bg-primary-light transition-colors duration-200 w-full focus:outline-none focus:ring-2 focus:ring-accent rounded-md"
            @click="isMenuOpen = false"
          >
            {{ link.name }}
          </router-link>
        </li>
        <li v-if="showAdminButton" class="w-full text-center">
          <router-link
            to="/admin"
            class="block py-2 px-4 text-white hover:bg-primary-light transition-colors duration-200 w-full focus:outline-none focus:ring-2 focus:ring-accent rounded-md"
            @click="isMenuOpen = false"
          >
            Gestión
          </router-link>
        </li>
        <li v-if="isAuthenticated" class="w-full text-center text-sm text-primary-light py-2">
          ¡Hola, <span class="font-semibold">{{ userName }}</span
          >!
        </li>
        <li v-if="isAuthenticated" class="w-full text-center mt-2 px-4">
          <BaseButton
            variant="ghost"
            size="md"
            class="w-full text-white bg-white/20 hover:bg-white/40 focus:ring-white"
            @click="(handleLogout(), (isMenuOpen = false))"
          >
            Cerrar sesión
          </BaseButton>
        </li>
      </ul>
    </transition>
  </header>
</template>

<style scoped>
/*
  No necesitamos estilos `scoped` directos si usamos Tailwind.
  Las transiciones de Vue se manejan con clases CSS utility de Tailwind.
*/
</style>
