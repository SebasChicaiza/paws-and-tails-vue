<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import BaseButton from '../components/base/BaseButton.vue'

const isMenuOpen = ref(false)
const router = useRouter()
const userStore = useUserStore()

const windowWidth = ref(window.innerWidth)
const MOBILE_BREAKPOINT = 1050

const isMobile = computed(() => windowWidth.value < MOBILE_BREAKPOINT)

const handleResize = () => {
  windowWidth.value = window.innerWidth
}
const usuarioNombre = computed(() => userStore.userName || localStorage.getItem('usuario'))

onMounted(() => {
  userStore.loadFromLocalStorage()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
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

const showAdminButton = computed(() => {
  return userStore.userRole === 'Administrador'
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
            class="h-10 w-auto md:h-10 h-8"
          />
          <h1 class="font-bold text-2xl tracking-wide ml-2 md:text-2xl text-lg">Paws & Tails</h1>
        </router-link>

        <div v-if="userStore.isAuthenticated && !isMobile" class="hidden md:block text-sm text-primary-light">
          ¡Hola, <span class="font-semibold">{{ usuarioNombre}}</span>!
        </div>
      </div>

      <!-- Botón hamburguesa solo si es móvil -->
      <div v-if="isMobile" class="">
        <button
          @click="toggleMenu"
          class="text-white focus:outline-none focus:ring-2 focus:ring-accent rounded-md p-4 transition-colors duration-200"
          :aria-expanded="isMenuOpen ? 'true' : 'false'"
          aria-controls="nav-links-mobile"
        >
          <svg
            v-if="!isMenuOpen"
            class="h-8 w-8"
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
          <svg v-else class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>

      <!-- Menú normal solo si NO es móvil -->
      <ul v-if="!isMobile" class="flex items-center space-x-6">
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
            to="/gestion"
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

    <!-- Menú móvil -->
    <transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="transform opacity-0 scale-y-0"
      enter-to-class="transform opacity-100 scale-y-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="transform opacity-100 scale-y-100"
      leave-to-class="transform opacity-0 scale-y-0"
    >
      <ul
        v-if="isMenuOpen && isMobile"
        id="nav-links-mobile"
        class="fixed left-0 top-16 w-full flex flex-col items-center mt-0 space-y-2 bg-primary-dark shadow-2xl rounded-b-lg py-4 origin-top z-50"
      >
        <li v-for="link in navLinks" :key="link.name" class="w-full text-center">
          <router-link
            :to="link.path"
            active-class="bg-primary text-accent"
            class="block py-3 px-4 text-white hover:bg-primary-light transition-colors duration-200 w-full focus:outline-none focus:ring-2 focus:ring-accent rounded-md"
            @click="isMenuOpen = false"
          >
            {{ link.name }}
          </router-link>
        </li>
        <li v-if="showAdminButton" class="w-full text-center">
          <router-link
            to="/gestion"
            class="block py-3 px-4 text-white hover:bg-primary-light transition-colors duration-200 w-full focus:outline-none focus:ring-2 focus:ring-accent rounded-md"
            @click="isMenuOpen = false"
          >
            Gestión
          </router-link>
        </li>
        <li
          v-if="userStore.isAuthenticated"
          class="w-full text-center text-sm text-primary-light py-2"
        >
          ¡Hola, <span class="font-semibold">{{ userStore.userName }}</span>!
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
