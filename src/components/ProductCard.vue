<script setup lang="ts">
import { computed, ref } from 'vue' // Importar 'ref'
import BaseButton from '@/components/base/BaseButton.vue'

// Define la interfaz para las propiedades del producto
interface Product {
  id: number
  name: string
  image: string // URL de la imagen del producto
  price: number
  oldPrice?: number // Precio anterior opcional para descuentos
  description: string
  hasDiscount?: boolean // Booleano para indicar si hay descuento
  isNew?: boolean // Booleano para indicar si es un producto nuevo
  stock: number // **¡IMPORTANTE! Añadir la propiedad stock**
}

// Define las props que el componente ProductCard espera recibir
interface Props {
  product: Product
}

const props = defineProps<Props>()

// Emits para los eventos de interacción del usuario
const emit = defineEmits(['addToCart', 'viewDetails'])

// Cantidad seleccionada por el usuario, con valor inicial de 1
const quantity = ref(1)

// Propiedad computada para formatear el precio a moneda
const formattedPrice = computed(() => {
  return `$${props.product.price.toFixed(2)}`
})

// Propiedad computada para formatear el precio anterior (si existe)
const formattedOldPrice = computed(() => {
  return props.product.oldPrice ? `$${props.product.oldPrice.toFixed(2)}` : null
})

// Calcula el porcentaje de descuento si hay un precio anterior
const discountPercentage = computed(() => {
  if (
    props.product.hasDiscount &&
    props.product.oldPrice &&
    props.product.price < props.product.oldPrice
  ) {
    const discount = ((props.product.oldPrice - props.product.price) / props.product.oldPrice) * 100
    return `${Math.round(discount)}% OFF`
  }
  return null
})

// Manejadores de eventos
const handleAddToCart = () => {
  // Emitimos el ID del producto Y la cantidad seleccionada
  emit('addToCart', props.product.id, quantity.value)
  quantity.value = 1 // Resetear la cantidad a 1 después de añadir al carrito
}
</script>

<template>
  <div
    class="bg-surface rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
  >
    <img
      :src="product.image"
      :alt="product.name"
      class="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105"
    />
    <div class="absolute top-2 right-2 flex flex-col space-y-1">
      <span
        v-if="product.isNew"
        class="bg-accent text-white text-xs font-bold px-2 py-1 rounded-full shadow-md"
      >
        ¡Nuevo!
      </span>
      <span
        v-if="product.hasDiscount && discountPercentage"
        class="bg-error text-white text-xs font-bold px-2 py-1 rounded-full shadow-md"
      >
        {{ discountPercentage }}
      </span>
    </div>

    <div class="p-5 flex-grow flex flex-col">
      <h3
        class="text-xl font-bold text-text-dark hover:text-primary transition-colors duration-200 mb-2 leading-tight"
      >
        {{ product.name }}
      </h3>

      <p class="text-text-muted text-sm mb-4 line-clamp-3">
        {{ product.description }}
      </p>

      <div class="mt-auto flex flex-col items-start">
        <div class="flex items-baseline mb-2">
          <span class="text-3xl font-extrabold text-primary-dark mr-2">{{ formattedPrice }}</span>
          <span v-if="formattedOldPrice" class="text-text-muted text-lg line-through">{{
            formattedOldPrice
          }}</span>
        </div>

        <div class="flex items-center justify-between w-full mb-4">
          <div class="text-text-dark font-semibold text-sm">
            Stock:
            <span
              :class="{ 'text-error': product.stock <= 5, 'text-success': product.stock > 5 }"
              class="font-bold"
              >{{ product.stock }}</span
            >
          </div>
          <div class="flex items-center space-x-2">
            <label for="quantity" class="text-text-dark text-sm sr-only">Cantidad:</label>
            <input
              type="number"
              id="quantity"
              v-model.number="quantity"
              min="1"
              :max="product.stock"
              class="w-20 p-2 border border-primary-light rounded-md text-center bg-surface-light focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
              @change="quantity = Math.max(1, Math.min(quantity, product.stock))"
            />
          </div>
        </div>

        <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full">
          <BaseButton
            variant="primary"
            size="md"
            class="flex-grow"
            @click="handleAddToCart"
            :disabled="product.stock === 0 || quantity <= 0"
          >
            {{ product.stock === 0 ? 'Agotado' : 'Añadir al Carrito' }}
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilos para el input number */
input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  -moz-appearance: textfield; /* Firefox */
}
</style>
