// src/composables/useAuth.ts
import { ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'

// Define la interfaz para el usuario que recibes del backend
export interface User {
  IdUsuario: string
  UsuarioNombre: string
  // Añade más propiedades del usuario si las necesitas (ej. correo, rol, etc.)
  correo?: string
  // ...
}

// Define el estado del usuario logeado
const user = ref<User | null>(null)
const isLoadingAuth = ref(false)
const authError = ref<string | null>(null)

// Router para redireccionar
const router = useRouter()

// Cargar usuario del localStorage al inicio
const loadUserFromLocalStorage = () => {
  try {
    const storedUser = localStorage.getItem('cuenta')
    if (storedUser) {
      user.value = JSON.parse(storedUser)
    }
  } catch (e) {
    console.error('Error al parsear usuario de localStorage:', e)
    localStorage.removeItem('cuenta') // Limpiar si hay un error de parseo
    user.value = null
  }
}

// Guardar usuario en localStorage cuando cambia
watch(
  user,
  (newUser) => {
    if (newUser) {
      localStorage.setItem('cuenta', JSON.stringify(newUser))
    } else {
      localStorage.removeItem('cuenta')
    }
  },
  { deep: true },
) // Usa deep: true si el objeto user puede cambiar internamente

// Función de login
const login = async (correo: string, password: string) => {
  isLoadingAuth.value = true
  authError.value = null
  try {
    const response = await fetch(
      'https://backendpawstails.runasp.net/api/gestion/usuario/autenticar',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo, password }),
      },
    )

    if (!response.ok) {
      // Intenta leer el mensaje de error del backend
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Credenciales incorrectas o error desconocido.' }))
      throw new Error(errorData.message || 'Credenciales incorrectas.')
    }

    const userData: User = await response.json()

    if (userData && userData.IdUsuario) {
      user.value = userData
      // No necesitamos guardar explícitamente aquí, el watcher ya lo hace
      alert('Inicio de sesión exitoso. Bienvenido ' + userData.UsuarioNombre)
      router.push({ name: 'products' }) // Redirige a la página de productos (asegúrate que el nombre de la ruta sea 'products')
      return { success: true, message: 'Inicio de sesión exitoso.' }
    } else {
      throw new Error('Respuesta de autenticación inválida.')
    }
  } catch (err: unknown) {
    console.error('Error de conexión al hacer login: ', err)
    return {
      success: false,
      message: `Error de conexión: ${
        err instanceof Error ? err.message : 'No se pudo conectar con el servidor.'
      }`,
    }
  } finally {
    isLoadingAuth.value = false
  }
}

// Función de logout
const logout = () => {
  user.value = null
  // El watcher se encargará de remover de localStorage
  alert('Sesión cerrada correctamente.')
  router.push({ name: 'login' }) // Redirige a la página de login (asegúrate que el nombre de la ruta sea 'login')
}

// Función para verificar si el usuario está logeado
const isAuthenticated = computed(() => !!user.value)

// Función para obtener el ID del usuario actual
const currentUserId = computed(() => user.value?.IdUsuario || null)

// Cargar el usuario al cargar el composable (una vez)
loadUserFromLocalStorage()

export function useAuth() {
  return {
    user,
    isLoadingAuth,
    authError,
    login,
    logout,
    isAuthenticated,
    currentUserId,
  }
}
