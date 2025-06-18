<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch } from 'vue' // Importar 'watch' y 'nextTick'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseSpinner from '@/components/base/BaseSpinner.vue'
import { useCart } from '@/stores/useCart' // Corregido: asumimos que useCart es un composable
import { useAuth } from '@/stores/useAuth' // Corregido: asumimos que useAuth es un composable
import type { CartItem } from '@/stores/useCart' // Corregido: el tipo viene del composable

const router = useRouter()

const { cart, removeFromCart, updateCartItemQuantity, subtotal, iva, total, finalizarCompra } =
  useCart()

const { validarSesionAntesDePagar } = useAuth()

const direccion = ref<string>('')
const metodoPago = ref<string>('Transferencia')
const numeroCuenta = ref<string>('')
const isLoadingPurchase = ref(false)

// --- Nuevo: Estado local temporal para las cantidades de los inputs ---
// Permite que el usuario escriba libremente sin validación inmediata en el v-model
const tempQuantities = ref<{ [key: number]: number | string }>({})

// Inicializar tempQuantities al montar el componente o cuando cambia el carrito
onMounted(() => {
  cart.value.forEach((item) => {
    tempQuantities.value[item.idProducto] = item.cantidad
  })
})

// Watch para mantener tempQuantities sincronizado si el carrito cambia de forma externa
watch(
  cart,
  (newCart) => {
    const newTempQuantities: { [key: number]: number | string } = {}
    newCart.forEach((item) => {
      // Si ya existe una entrada en tempQuantities, la mantenemos para no sobrescribir la entrada del usuario
      // Si no existe, la inicializamos con la cantidad del carrito
      newTempQuantities[item.idProducto] =
        tempQuantities.value[item.idProducto] !== undefined
          ? tempQuantities.value[item.idProducto]
          : item.cantidad
    })
    tempQuantities.value = newTempQuantities
  },
  { deep: true },
) // 'deep' es útil si las propiedades de los ítems del carrito pueden cambiar

// --- handleQuantityChange ahora solo actualiza el estado temporal ---
const handleQuantityChange = (item: CartItem, event: Event) => {
  const inputElement = event.target as HTMLInputElement
  const newQuantityValue = inputElement.value

  // Almacenar el valor en la referencia temporal. Puede ser un string vacío o parcial.
  tempQuantities.value[item.idProducto] = newQuantityValue

  // No realizamos ninguna validación o actualización del carrito aquí.
  // Permitimos al usuario escribir libremente.
}

// --- handleInputBlur: Se dispara cuando el input pierde el foco o se presiona Enter ---
// Aquí es donde se realiza la validación y se actualiza el carrito
const handleInputBlur = (item: CartItem) => {
  let quantityToUpdate = tempQuantities.value[item.idProducto]

  // Si el campo está vacío o no es un número válido, lo forzamos a 1
  if (quantityToUpdate === '' || isNaN(parseInt(String(quantityToUpdate), 10))) {
    quantityToUpdate = 1
  } else {
    // Aseguramos que sea un entero válido
    quantityToUpdate = parseInt(String(quantityToUpdate), 10)
  }

  // Llamar a la función del composable para actualizar el carrito con el valor validado
  updateCartItemQuantity(item.idProducto, quantityToUpdate)

  // nextTick para asegurar que la interfaz de usuario se actualice después de que el carrito
  // haya sido modificado y Vue haya reaccionado a esos cambios. Esto sincroniza el input
  // con el valor "clampado" (validado) que está en el carrito.
  nextTick(() => {
    tempQuantities.value[item.idProducto] = item.cantidad
  })
}

// --- handleDeleteItem con confirmación ---
const handleDeleteItem = (productId: number, productName: string) => {
  if (confirm(`¿Estás seguro de que quieres eliminar "${productName}" del carrito?`)) {
    removeFromCart(productId)
    // También eliminamos del estado temporal para evitar inconsistencias
    delete tempQuantities.value[productId]
  }
}

const processPurchase = async () => {
  // Client-side validation
  if (cart.value.length === 0) {
    alert('⚠️ Tu carrito está vacío. Por favor, añade productos antes de proceder.')
    return
  }
  if (!direccion.value.trim()) {
    alert('Por favor, ingresa una dirección de envío.')
    return
  }
  if (!numeroCuenta.value.trim()) {
    alert('Por favor, ingresa el número de cuenta para la transferencia.')
    return
  }
  const parsedNumeroCuenta = parseInt(numeroCuenta.value, 10)
  if (isNaN(parsedNumeroCuenta)) {
    alert('Por favor, ingresa un número de cuenta válido.')
    return
  }

  // Validate session before proceeding
  const account = JSON.parse(localStorage.getItem('cuenta') || '{}')
  if (!account || !account.IdUsuario) {
    validarSesionAntesDePagar() // Redirects to login if not logged in
    return
  }

  isLoadingPurchase.value = true

  const payload = {
    Carrito: {
      productos: cart.value.map((item) => ({
        idProducto: item.idProducto,
        cantidad: item.cantidad,
      })),
    },
    Direccion: direccion.value,
    MetodoPago: metodoPago.value,
    IdUsuario: account.IdUsuario,
    cuenta: parsedNumeroCuenta,
  }

  try {
    const result = await finalizarCompra(payload)
    if (result.success) {
      alert(result.message)
      router.push('/productos')
    } else {
      alert(`❌ Compra fallida: ${result.message}`)
    }
  } catch (err) {
    console.error('Error durante la compra:', err)
    alert('Un error ocurrió al procesar tu compra. Por favor, intenta nuevamente más tarde.')
  } finally {
    isLoadingPurchase.value = false
  }
}
</script>

<template>
  <div class="relative min-h-screen flex flex-col bg-background text-text-base">
    <div
      v-if="isLoadingPurchase"
      class="fixed inset-0 bg-white bg-opacity-70 z-[9999] flex flex-col justify-center items-center text-primary-dark space-y-4"
    >
      <BaseSpinner text="Procesando compra. Espere un momento por favor..." />
    </div>

    <main
      class="main-content flex-grow py-8 md:py-12 px-4 container mx-auto"
      :class="{ 'blur pointer-events-none': isLoadingPurchase }"
    >
      <h1
        class="text-4xl md:text-5xl font-extrabold text-center text-primary-dark mb-10 drop-shadow-sm"
      >
        🛒 Mi Carrito
      </h1>

      <div
        v-if="cart.length === 0"
        class="text-center text-text-muted text-xl p-8 rounded-lg bg-surface shadow-md"
      >
        Tu carrito está vacío. ¡Empieza a añadir productos!
        <BaseButton variant="primary" size="md" class="mt-6" @click="router.push('/productos')">
          Ir a Productos
        </BaseButton>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 bg-surface rounded-xl shadow-lg p-6">
          <h2 class="text-2xl font-bold text-primary-dark mb-6">Productos en tu Carrito</h2>
          <TransitionGroup name="list" tag="div" class="space-y-4">
            <div
              v-for="item in cart"
              :key="item.idProducto"
              class="flex items-center bg-surface-light rounded-lg p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01]"
            >
              <img
                :src="item.imagen || '/images/default-placeholder.png'"
                :alt="item.nombre"
                class="w-24 h-24 object-cover rounded-md mr-4 flex-shrink-0"
              />
              <div class="flex-grow">
                <h3 class="text-lg font-semibold text-text-dark">{{ item.nombre }}</h3>
                <p class="text-text-muted text-sm mb-2">${{ item.precio.toFixed(2) }} c/u</p>
                <div class="flex items-center space-x-2">
                  <label :for="`qty-${item.idProducto}`" class="text-text-dark text-sm font-medium"
                    >Cantidad:</label
                  >
                  <input
                    :id="`qty-${item.idProducto}`"
                    type="number"
                    v-model="tempQuantities[item.idProducto]"
                    @input="handleQuantityChange(item, $event)"
                    @blur="handleInputBlur(item)"
                    @keyup.enter="handleInputBlur(item)"
                    min="1"
                    class="w-20 p-1.5 border border-primary-light rounded-md text-center bg-white focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>
              <div class="text-xl font-bold text-primary-dark ml-4 flex-shrink-0">
                ${{ (item.precio * item.cantidad).toFixed(2) }}
              </div>
              <BaseButton
                variant="danger"
                size="sm"
                class="ml-4 flex-shrink-0"
                @click="handleDeleteItem(item.idProducto, item.nombre)"
              >
                ❌
              </BaseButton>
            </div>
          </TransitionGroup>
        </div>

        <div class="lg:col-span-1 bg-surface rounded-xl shadow-lg p-6">
          <h2 class="text-2xl font-bold text-primary-dark mb-6">Resumen del Pedido</h2>
          <div class="space-y-3 text-lg text-text-dark">
            <div class="flex justify-between">
              <span>Subtotal:</span>
              <span class="font-semibold">${{ subtotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span>IVA (15%):</span>
              <span class="font-semibold">${{ iva.toFixed(2) }}</span>
            </div>
            <div
              class="border-t border-primary-light pt-4 mt-4 flex justify-between font-bold text-xl text-primary-dark"
            >
              <span>Total:</span>
              <span>${{ total.toFixed(2) }}</span>
            </div>
          </div>

          <form @submit.prevent="processPurchase" class="mt-8 space-y-4">
            <div>
              <label for="direccion" class="block text-text-dark text-sm font-medium mb-1"
                >Dirección de Envío</label
              >
              <input
                type="text"
                id="direccion"
                v-model="direccion"
                placeholder="Ej: Calle Principal 123, Ciudad"
                required
                class="w-full p-3 border border-primary-light rounded-lg bg-surface-light focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label for="numeroCuenta" class="block text-text-dark text-sm font-medium mb-1"
                >Número de Cuenta</label
              >
              <input
                type="text"
                id="numeroCuenta"
                v-model="numeroCuenta"
                placeholder="Ej: 001234567890 (para transferencia)"
                required
                class="w-full p-3 border border-primary-light rounded-lg bg-surface-light focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
              />
            </div>
            <input type="hidden" v-model="metodoPago" />

            <BaseButton
              type="submit"
              variant="primary"
              size="lg"
              class="w-full mt-6"
              :disabled="isLoadingPurchase || cart.length === 0"
            >
              Finalizar Compra
            </BaseButton>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Optional: Custom styles for number input arrows */
input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  appearance: textfield;
  -moz-appearance: textfield; /* Firefox */
}

/* Vue Transition Group styles for items removal */
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
/* Ensure removed items are not in the layout flow during animation */
.list-leave-active {
  position: absolute;
}
</style>
