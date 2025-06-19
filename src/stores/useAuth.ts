import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

export interface User {
  IdUsuario: string
  UsuarioNombre: string
  UsuarioCorreo?: string
  // ...
}

const isLoadingAuth = ref(false)
const authError = ref<string | null>(null)

export function useAuth() {
  const router = useRouter()
  const userStore = useUserStore() // <-- ¡Ahora está dentro de la función!

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
        const errorData = await response
          .json()
          .catch(() => ({ message: 'Credenciales incorrectas o error desconocido.' }))
        throw new Error(errorData.message || 'Credenciales incorrectas.')
      }

      const userData: User = await response.json()

      if (userData && userData.IdUsuario) {
        userStore.login(userData.UsuarioNombre)
        localStorage.setItem('cuenta', JSON.stringify(userData))
        alert('Inicio de sesión exitoso. Bienvenido ' + userData.UsuarioNombre)
        router.push({ name: 'Productos' })
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
    userStore.logout()
    localStorage.removeItem('cuenta')
    alert('Sesión cerrada correctamente.')
    router.push({ name: 'Login' })
  }

  // Computed para saber si está autenticado y obtener el usuario
  const isAuthenticated = computed(() => userStore.isAuthenticated)
  const user = computed(() => userStore.userName)

  return {
    user,
    isLoadingAuth,
    authError,
    login,
    logout,
    isAuthenticated,
  }
}
