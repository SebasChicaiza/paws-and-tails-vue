// src/composables/useAuth.ts
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router' // Para la redirección

interface Account {
  IdUsuario: string
  Rol: string
  // Añade otras propiedades de la cuenta si las hay
}

export function useAuth() {
  const router = useRouter()
  const isAdmin = ref(false)
  const isLoggedIn = ref(false)

  // Controlar visibilidad de botones de sesión
  const controlarBotonesDeSesion = () => {
    const cuentaString = localStorage.getItem('cuenta')
    if (cuentaString) {
      try {
        const cuenta: Account = JSON.parse(cuentaString)
        isLoggedIn.value = true
        isAdmin.value = cuenta.Rol === 'Administrador'
      } catch (e) {
        console.error('Error parsing account from localStorage', e)
        isLoggedIn.value = false
        isAdmin.value = false
      }
    } else {
      isLoggedIn.value = false
      isAdmin.value = false
    }
  }

  // Asignar cierre de sesión
  const asignarCierreSesion = () => {
    localStorage.removeItem('cuenta')
    alert('Gracias por usar la aplicación. ¡Hasta luego!')
    router.push('/login') // Redirige a la página de login de Vue Router
  }

  // Validar sesión antes de pagar (ejemplo de uso)
  const validarSesionAntesDePagar = (): boolean => {
    const cuentaString = localStorage.getItem('cuenta')
    if (!cuentaString) {
      alert('Debes iniciar sesión para finalizar la compra.')
      router.push('/login')
      return false
    }
    try {
      const cuenta: Account = JSON.parse(cuentaString)
      if (!cuenta.IdUsuario) {
        alert('Debes iniciar sesión para finalizar la compra.')
        router.push('/login')
        return false
      }
    } catch (e) {
      console.error('Error parsing account from localStorage', e)
      alert('Error en los datos de sesión. Por favor, inicia sesión de nuevo.')
      router.push('/login')
      return false
    }
    return true
  }

  // Se ejecuta al montar el componente que usa este composable
  onMounted(() => {
    controlarBotonesDeSesion() // Inicializa el estado al cargar
    // Puedes añadir un listener para storage si quieres que se actualice en tiempo real entre pestañas
    window.addEventListener('storage', controlarBotonesDeSesion)
  })

  onUnmounted(() => {
    window.removeEventListener('storage', controlarBotonesDeSesion)
  })

  return {
    isAdmin,
    isLoggedIn,
    controlarBotonesDeSesion,
    asignarCierreSesion,
    validarSesionAntesDePagar,
  }
}
