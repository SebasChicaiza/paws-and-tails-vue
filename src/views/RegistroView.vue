<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/base/BaseButton.vue' // Asegúrate de la ruta correcta
import BaseInput from '../components/base/BaseInput.vue' // Asegúrate de la ruta correcta
import BaseSpinner from '@/components/base/BaseSpinner.vue' // Asegúrate de la ruta correcta

const router = useRouter()

// Refs para cada campo del formulario
const nombreUsuario = ref('')
const correo = ref('')
const password = ref('')
const nombreCliente = ref('')
const apellidoCliente = ref('')
const cedulaRuc = ref('')
const telefono = ref('')
const fechaNacimiento = ref('') // Considerar el formato YYYY-MM-DD
const direccion = ref('')

// Refs para mensajes de error de validación (frontend)
const errors = ref({
  nombreUsuario: null as string | null,
  correo: null as string | null,
  password: null as string | null,
  nombreCliente: null as string | null,
  apellidoCliente: null as string | null,
  cedulaRuc: null as string | null,
  telefono: null as string | null,
  fechaNacimiento: null as string | null,
  direccion: null as string | null,
  api: null as string | null, // Para errores generales de la API
})

const isLoading = ref(false)
const registrationSuccess = ref(false) // Para mostrar mensaje de éxito

// Función de validación del formulario
const validateForm = () => {
  let isValid = true
  // Resetear errores
  Object.keys(errors.value).forEach((key) => {
    errors.value[key as keyof typeof errors.value] = null
  })

  if (!nombreUsuario.value.trim()) {
    errors.value.nombreUsuario = 'El nombre de usuario es obligatorio.'
    isValid = false
  }
  if (!correo.value.trim()) {
    errors.value.correo = 'El correo electrónico es obligatorio.'
    isValid = false
  } else if (!/\S+@\S+\.\S+/.test(correo.value)) {
    errors.value.correo = 'Ingresa un correo electrónico válido.'
    isValid = false
  }
  if (!password.value.trim()) {
    errors.value.password = 'La contraseña es obligatoria.'
    isValid = false
  } else if (password.value.length < 6) {
    errors.value.password = 'La contraseña debe tener al menos 6 caracteres.'
    isValid = false
  }
  if (!nombreCliente.value.trim()) {
    errors.value.nombreCliente = 'El nombre es obligatorio.'
    isValid = false
  }
  if (!apellidoCliente.value.trim()) {
    errors.value.apellidoCliente = 'El apellido es obligatorio.'
    isValid = false
  }
  if (!cedulaRuc.value.trim()) {
    errors.value.cedulaRuc = 'La cédula o RUC es obligatorio.'
    isValid = false
  }
  if (!telefono.value.trim()) {
    errors.value.telefono = 'El teléfono es obligatorio.'
    isValid = false
  } else if (!/^\d+$/.test(telefono.value.trim())) {
    // Simple validación para solo dígitos
    errors.value.telefono = 'El teléfono solo debe contener números.'
    isValid = false
  }
  if (!fechaNacimiento.value.trim()) {
    errors.value.fechaNacimiento = 'La fecha de nacimiento es obligatoria.'
    isValid = false
  }
  if (!direccion.value.trim()) {
    errors.value.direccion = 'La dirección es obligatoria.'
    isValid = false
  }

  return isValid
}

// Manejador del submit del formulario
const handleRegister = async () => {
  if (!validateForm()) {
    return // Detener si la validación frontend falla
  }

  isLoading.value = true
  errors.value.api = null // Limpiar errores previos de la API
  registrationSuccess.value = false // Resetear estado de éxito

  try {
    const dataToSend = {
      nombreUsuario: nombreUsuario.value,
      correo: correo.value,
      password: password.value,
      nombreCliente: nombreCliente.value,
      apellidoCliente: apellidoCliente.value,
      cedulaRuc: cedulaRuc.value,
      telefono: telefono.value,
      fechaNacimiento: fechaNacimiento.value, // Asegurarse que el formato sea YYYY-MM-DD
      direccion: direccion.value,
    }
    console.log('Enviando datos:', dataToSend) // Para depuración

    const response = await fetch(
      'https://backendpawstails.runasp.net/api/gestion/usuario/registrar-cliente',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      },
    )

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Error desconocido al registrar.' }))
      // Algunos backends devuelven 'false' en éxito si no hay más data.
      // Si tu backend devuelve `false` explícitamente para errores de validación,
      // aquí deberías adaptar la lógica.
      if (typeof errorData === 'boolean' && !errorData) {
        throw new Error(
          'No se pudo registrar al usuario. Es posible que el correo o usuario ya estén registrados.',
        )
      } else {
        throw new Error(errorData.message || 'No se pudo registrar al usuario.')
      }
    }

    // Tu backend devuelve `true` para éxito, no un JSON con datos del usuario.
    // Si la respuesta es `ok` y es `true`, consideramos éxito.
    const result = await response.json().catch(() => true) // Si no hay JSON, asume true

    if (result === true) {
      registrationSuccess.value = true
      alert('Usuario registrado con éxito. Serás redirigido al inicio de sesión.')
      // Limpiar el formulario
      nombreUsuario.value = ''
      correo.value = ''
      password.value = ''
      nombreCliente.value = ''
      apellidoCliente.value = ''
      cedulaRuc.value = ''
      telefono.value = ''
      fechaNacimiento.value = ''
      direccion.value = ''

      // Redirigir al login después de un breve delay
      setTimeout(() => {
        router.push({ name: 'Login' })
      }, 2000) // 2 segundos de delay
    } else {
      // Si result no es true (ej. si el backend manda algo más o lanza un error diferente)
      throw new Error(result.message || 'Error inesperado al registrar.')
    }
  } catch (err: unknown) {
    console.error('Error al hacer registro', err)
    return {
      success: false,
      message: `Error de conexión: ${
        err instanceof Error ? err.message : 'No se pudo conectar con el servidor.'
      }`,
    }
  } finally {
    isLoading.value = false
  }
}

// Puedes eliminar la lógica de guardar/cargar en localStorage al escribir,
// ya que v-model maneja esto internamente en Vue y la persistencia de formulario
// completo en registro no es tan crítica como en edición de perfil.
// Si lo necesitas, podemos añadir un watcher.
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-yellow-300 via-orange-300 to-purple-300 animate-gradient-move"
  >
    <div
      class="max-w-4xl w-full space-y-8 p-10 bg-white rounded-xl shadow-2xl z-10 border border-gray-200"
    >
      <div class="text-center">
        <h2 class="mt-6 text-4xl font-extrabold text-gray-900 drop-shadow-sm">
          Registro de Usuario <span class="text-primary-dark">🐾🐶</span>
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          ¿Ya tienes cuenta?
          <router-link
            :to="{ name: 'Login' }"
            class="font-medium text-primary hover:text-primary-dark transition-colors duration-200"
          >
            Inicia sesión aquí
          </router-link>
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BaseInput
            label="Nombre de Usuario"
            type="text"
            id="nombreUsuario"
            placeholder="Tu nombre de usuario"
            v-model="nombreUsuario"
            :error="errors.nombreUsuario"
            required
          />
          <BaseInput
            label="Correo Electrónico"
            type="email"
            id="correo"
            placeholder="ejemplo@correo.com"
            v-model="correo"
            :error="errors.correo"
            required
          />
        </div>
        <BaseInput
          label="Contraseña"
          type="password"
          id="password"
          placeholder="••••••••"
          v-model="password"
          :error="errors.password"
          required
        />

        <hr class="my-6 border-gray-200" />

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <BaseInput
            label="Nombre"
            type="text"
            id="nombreCliente"
            placeholder="Tu nombre"
            v-model="nombreCliente"
            :error="errors.nombreCliente"
            required
          />
          <BaseInput
            label="Apellido"
            type="text"
            id="apellidoCliente"
            placeholder="Tu apellido"
            v-model="apellidoCliente"
            :error="errors.apellidoCliente"
            required
          />
          <BaseInput
            label="Cédula o RUC"
            type="text"
            id="cedulaRuc"
            placeholder="Tu cédula o RUC"
            v-model="cedulaRuc"
            :error="errors.cedulaRuc"
            required
          />
          <BaseInput
            label="Teléfono"
            type="tel"
            id="telefono"
            placeholder="0987654321"
            v-model="telefono"
            :error="errors.telefono"
            required
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <BaseInput
            label="Fecha de Nacimiento"
            type="date"
            id="fechaNacimiento"
            v-model="fechaNacimiento"
            :error="errors.fechaNacimiento"
            required
          />
          <BaseInput
            label="Dirección"
            type="text"
            id="direccion"
            placeholder="Tu dirección completa"
            v-model="direccion"
            :error="errors.direccion"
            required
          />
        </div>

        <div
          v-if="errors.api"
          class="text-center text-red-600 font-medium p-3 bg-red-100 rounded-md"
        >
          {{ errors.api }}
        </div>
        <div
          v-if="registrationSuccess"
          class="text-center text-green-600 font-medium p-3 bg-green-100 rounded-md"
        >
          ¡Registro exitoso! Redirigiendo al login...
        </div>

        <div>
          <BaseButton
            type="submit"
            variant="primary"
            size="lg"
            class="w-full flex justify-center py-3 px-4"
            :disabled="isLoading"
          >
            <BaseSpinner v-if="isLoading" text="Registrando..." class="text-white" />
            <span v-else>Registrarme 🐕</span>
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Animación del fondo degradado (igual que en LoginView) */
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
