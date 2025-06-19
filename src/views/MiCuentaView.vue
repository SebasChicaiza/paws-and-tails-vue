<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseSpinner from '@/components/base/BaseSpinner.vue' // Para mostrar estado de carga
// Importa las interfaces que definimos
import type { Factura, UserAccount } from '@/interfaces/factura'

const router = useRouter()

// Datos del usuario
const userAccount = ref<UserAccount | null>(null)
// Historial de facturas
const invoices = ref<Factura[]>([])
// Estado de carga y errores
const isLoading = ref(true)
const error = ref<string | null>(null)

// Función para cargar los datos del usuario y las facturas
const loadAccountData = async () => {
  isLoading.value = true
  error.value = null

  // 1. Cargar datos del usuario de localStorage
  const storedAccount = localStorage.getItem('cuenta')
  if (!storedAccount) {
    error.value = 'No se encontró información de usuario.'
    isLoading.value = false
    return
  }

  try {
    const parsedAccount: UserAccount = JSON.parse(storedAccount)
    userAccount.value = parsedAccount

    // 2. Cargar facturas desde la API usando la cédula del usuario
    if (!userAccount.value.Cedula) {
      error.value = 'No se encontró la cédula del usuario para cargar las facturas.'
      isLoading.value = false
      return
    }

    const response = await fetch(
      `https://backendpawstails.runasp.net/api/gestion/factura/cedula/${userAccount.value.Cedula}`,
    )

    if (!response.ok) {
      // Intenta leer el mensaje de error del backend si existe
      const errorText = await response.text()
      let errorMessage = `Error al cargar facturas: ${response.status}`
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.message || errorMessage
      } catch (e) {
        // Si no es JSON, usa el texto crudo
        errorMessage = errorText || errorMessage + e
      }
      throw new Error(errorMessage)
    }

    const data: Factura[] = await response.json()
    // Asegurarse de que 'data' sea un array. Si no hay facturas, puede ser un array vacío o null.
    invoices.value = Array.isArray(data) ? data : []

    if (invoices.value.length === 0) {
      error.value = 'Aún no has realizado compras.'
    }
  } catch (err: unknown) {
    console.error('Error al cargar los datos de la cuenta: ', err)
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

// Cargar los datos cuando el componente se monta
onMounted(() => {
  loadAccountData()
})

// Función para formatear fechas si es necesario (ej. si la API devuelve un formato diferente)
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).toLocaleDateString()
  } catch (e) {
    console.error('Error formatting date:', e)
    return dateString // Devuelve el string original si hay un error de formato
  }
}

// Función para calcular subtotal e IVA si la API solo da el total
const calculateSubtotalIva = (total: number) => {
  const subtotal = total / 1.12 // Asumiendo IVA del 12%
  const iva = total - subtotal
  return {
    subtotal: subtotal.toFixed(2),
    iva: iva.toFixed(2),
  }
}
</script>

<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-yellow-300 via-orange-300 to-purple-300 animate-gradient-move"
  >
    <div
      class="max-w-4xl w-full space-y-8 p-10 bg-white rounded-xl shadow-2xl z-10 border border-gray-200"
    >
      <div class="text-center">
        <h2 class="mt-6 text-4xl font-extrabold text-gray-900 drop-shadow-sm">👤 Mi Cuenta</h2>
      </div>

      <div v-if="isLoading" class="flex justify-center items-center h-48">
        <BaseSpinner text="Cargando datos de la cuenta..." />
      </div>

      <div v-else-if="error" class="text-center text-red-600 font-medium p-4 bg-red-100 rounded-md">
        <p>{{ error }}</p>
        <button
          v-if="error.includes('sesión')"
          @click="router.push({ name: 'Login' })"
          class="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
        >
          Ir a Iniciar Sesión
        </button>
      </div>

      <div v-else-if="userAccount" class="space-y-6">
        <div class="info-usuario bg-gray-50 p-6 rounded-lg shadow-sm">
          <h3 class="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
            Información de Perfil
          </h3>
          <p class="text-lg text-gray-700 mb-2">
            <strong>Nombre de Usuario:</strong> {{ userAccount.UsuarioNombre }}
          </p>
          <p class="text-lg text-gray-700 mb-2">
            <strong>Correo Electrónico:</strong> {{ userAccount.UsuarioCorreo }}
          </p>
          <p class="text-lg text-gray-700 mb-2">
            <strong>Cédula/RUC:</strong> {{ userAccount.Cedula }}
          </p>
        </div>

        <h3
          class="facturas-title text-2xl font-semibold text-gray-800 border-b-2 border-gray-300 pb-3 mt-8"
        >
          🧾 Historial de Compras
        </h3>

        <div class="facturas-container space-y-6">
          <div
            v-if="invoices.length === 0"
            class="text-center text-gray-600 p-4 bg-yellow-50 rounded-md"
          >
            <p>Aún no has realizado compras.</p>
          </div>

          <div v-else>
            <div
              v-for="factura in invoices"
              :key="factura.ID_FACTURA"
              class="factura-item p-6 bg-blue-50 border border-blue-200 rounded-lg shadow-md"
            >
              <h4 class="text-xl font-bold text-blue-800 mb-3">
                Factura #{{ factura.ID_FACTURA }} - {{ formatDate(factura.FAC_FECHAHORA) }}
              </h4>
              <ul class="list-disc pl-5 text-gray-700 mb-4">
                <li v-for="(producto, idx) in factura.DETALLE_FACTURA" :key="idx" class="mb-1">
                  {{ producto.DF_CANT }} × Producto ID {{ producto.ID_PRODUCTO }} - ${{
                    producto.DF_PRECIO_VENTA.toFixed(2)
                  }}
                </li>
              </ul>
              <div class="border-t border-blue-200 pt-3 mt-3 space-y-1">
                <p class="text-md text-gray-800">
                  <strong>Subtotal:</strong> ${{ calculateSubtotalIva(factura.FAC_TOTAL).subtotal }}
                </p>
                <p class="text-md text-gray-800">
                  <strong>IVA (12%):</strong> ${{ calculateSubtotalIva(factura.FAC_TOTAL).iva }}
                </p>
                <p class="text-lg font-bold text-gray-900">
                  <strong>Total:</strong> ${{ factura.FAC_TOTAL.toFixed(2) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Animación del fondo degradado (igual que en LoginView y RegisterView) */
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

/* El `wrapper`, `main-content` y `#footer-placeholder` se manejan mejor globalmente en `App.vue` */
/* Los estilos específicos de `cuenta-container`, `info-usuario`, `facturas-title`, `facturas-container`, `factura-item`
   se han migrado a clases de Tailwind CSS en el template. */
</style>
