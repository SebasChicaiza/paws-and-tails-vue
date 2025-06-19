<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue' // Asume que tienes este componente
import BaseSpinner from '@/components/base/BaseSpinner.vue' // Asume que tienes este componente
import { useAuth } from '@/stores/useAuth'
import { useRouter } from 'vue-router'
import BaseInput from '../components/base/BaseInput.vue' // Asume que tienes este componente

const { login, isAuthenticated, isLoadingAuth, authError } = useAuth()
const router = useRouter()

const email = ref('')
const password = ref('')

// Mensajes de error específicos para los campos (validación básica del frontend)
const emailError = ref<string | null>(null)
const passwordError = ref<string | null>(null)

// Redireccionar si ya está autenticado (como en tu jQuery)
if (isAuthenticated.value) {
  router.replace({ name: 'products' }) // O a la ruta que sea tu "micuenta.html"
}

const validateForm = () => {
  let isValid = true
  emailError.value = null
  passwordError.value = null

  if (!email.value) {
    emailError.value = 'El correo electrónico es obligatorio.'
    isValid = false
  } else if (!/\S+@\S+\.\S+/.test(email.value)) {
    emailError.value = 'Ingresa un correo electrónico válido.'
    isValid = false
  }

  if (!password.value) {
    passwordError.value = 'La contraseña es obligatoria.'
    isValid = false
  }

  return isValid
}

const handleLogin = async () => {
  if (!validateForm()) {
    return // Detiene el proceso si la validación falla en el frontend
  }

  const result = await login(email.value, password.value)
  if (result.success) {
    // La redirección y el alert ya se manejan en useAuth
    // Puedes limpiar los campos si lo deseas, pero la redirección lo hará innecesario.
    email.value = ''
    password.value = ''
  }
  // Si result.success es false, el error ya se ha establecido en authError.value
}
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-yellow-300 via-orange-300 to-purple-300 animate-gradient-move"
  >
    <div
      class="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-2xl z-10 border border-gray-200"
    >
      <div class="text-center">
        <h2 class="mt-6 text-4xl font-extrabold text-gray-900 drop-shadow-sm">
          Iniciar Sesión <span class="text-primary-dark">🐾</span>
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          ¿No tienes cuenta?
          <router-link
            :to="{ name: 'Registro' }"
            class="font-medium text-primary hover:text-primary-dark transition-colors duration-200"
          >
            Regístrate aquí
          </router-link>
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div class="mb-4">
            <label for="email-address" class="sr-only">Correo electrónico</label>
            <BaseInput
              id="email-address"
              name="email"
              type="email"
              autocomplete="email"
              required
              placeholder="ejemplo@correo.com"
              v-model="email"
              :error="emailError"
            />
            <p v-if="emailError" class="mt-1 text-sm text-red-600">{{ emailError }}</p>
          </div>
          <div class="mb-4">
            <label for="password" class="sr-only">Contraseña</label>
            <BaseInput
              id="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              placeholder="••••••••"
              v-model="password"
              :error="passwordError"
            />
            <p v-if="passwordError" class="mt-1 text-sm text-red-600">{{ passwordError }}</p>
          </div>
        </div>

        <div
          v-if="authError"
          class="text-center text-red-600 font-medium mb-4 p-3 bg-red-100 rounded-md"
        >
          {{ authError }}
        </div>

        <div>
          <BaseButton
            type="submit"
            variant="primary"
            size="lg"
            class="w-full flex justify-center py-3 px-4"
            :disabled="isLoadingAuth"
          >
            <BaseSpinner v-if="isLoadingAuth" text="Ingresando..." class="text-white" />
            <span v-else>Ingresar</span>
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Animación del fondo degradado */
@keyframes gradient-move {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.animate-gradient-move {
  background-size: 400% 400%; /* Ajusta el tamaño del gradiente para que se vea la animación */
  animation: gradient-move 15s ease infinite;
}
</style>
