<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user' // Ajusta la ruta si es necesario
import BaseButton from '../components/base/BaseButton.vue'

const isMenuOpen = ref(false)
const router = useRouter()
const userStore = useUserStore()

onMounted(() => {
  userStore.loadFromLocalStorage()
})

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const navLinks = [
  { name: 'Inicio', path: '/' },
  { name: 'Sobre Nosotros', path: '/nosotros' },
  { name: 'Productos', path: '/productos' },
  { name: 'Carrito', path: '/carrito' },
  { name: 'Mi Cuenta', path: '/micuenta' },
]

// Ejemplo: si el usuario es admin (ajusta según tu lógica real)
const showAdminButton = computed(() => {
  // Si guardas el rol en el store, usa userStore.userRole === 'admin'
  // Aquí solo es un ejemplo usando el nombre
  return userStore.userName === 'admin'
})

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
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

        <div v-if="userStore.isAuthenticated" class="hidden md:block text-sm text-primary-light">
          ¡Hola, <span class="font-semibold">{{ userStore.userName }}</span
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
        <li v-if="userStore.isAuthenticated">
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
        <li
          v-if="userStore.isAuthenticated"
          class="w-full text-center text-sm text-primary-light py-2"
        >
          ¡Hola, <span class="font-semibold">{{ userStore.userName }}</span
          >!
        </li>
        <li v-if="userStore.isAuthenticated" class="w-full text-center mt-2 px-4">
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
