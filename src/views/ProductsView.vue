<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import ProductCard from '../components/ProductCard.vue'
import BaseButton from '../components/base/BaseButton.vue'
import BaseSelect from '../components/base/BaseSelect.vue' // Nuevo componente para el select de categoría
import BaseSpinner from '../components/base/BaseSpinner.vue' // Nuevo componente para el loader
import { useProductsAndCart } from '../stores/useCart' // Importa el nuevo composable

// Usa el composable para obtener la lógica y el estado
const {
  products,
  categories,
  selectedCategory,
  isLoading,
  error,
  filteredProducts,
  fetchProducts,
  addToCart,
  startStockUpdatePolling,
  stopStockUpdatePolling,
} = useProductsAndCart()

const route = useRoute()

// Manejadores de eventos para ProductCard
const handleAddToCart = (productId: number, quantityToAddToCart: number) => {
  const product = products.value.find((p) => p.idProducto === productId)
  if (product) {
    // *** USA LA CANTIDAD RECIBIDA DEL ProductCard ***
    // const quantity = 1 // ELIMINA O COMENTA ESTA LÍNEA
    addToCart(product, quantityToAddToCart) // Pasa la cantidad recibida
  }
}

const handleViewDetails = (productId: number) => {
  console.log(`Navegar a detalles del producto ${productId}`)
  // Aquí usarías router.push(`/productos/${productId}`);
}

// Cargar productos al montar el componente
onMounted(async () => {
  await fetchProducts() // Carga inicial
  startStockUpdatePolling() // Inicia el polling de stock

  // Si hay un filtro de categoría en la URL, aplicarlo
  if (route.query.category && categories.value.includes(route.query.category as string)) {
    selectedCategory.value = route.query.category as string
  }
})

// Detener el polling al desmontar el componente
onUnmounted(() => {
  stopStockUpdatePolling()
})

// Refrescar productos (botón)
const refreshProducts = async () => {
  await fetchProducts(true) // Fuerza la actualización desde la API
  selectedCategory.value = 'todos' // Resetear el filtro al refrescar
}

// Observar cambios en `selectedCategory` para actualizar la vista
watch(selectedCategory, () => {
  // Vue se encargará de re-renderizar filteredProducts automáticamente
  console.log(`Filtro de categoría cambiado a: ${selectedCategory.value}`)
})
</script>

<template>
  <main class="bg-background text-text-base py-8 md:py-12">
    <div class="container mx-auto px-4">
      <h1
        class="text-4xl md:text-5xl font-extrabold text-center text-primary-dark mb-10 drop-shadow-sm"
      >
        Todos Nuestros Productos
      </h1>

      <div class="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <BaseButton
          @click="refreshProducts"
          variant="secondary"
          size="md"
          class="min-w-[180px] hover:scale-105 transition-transform duration-200"
          :disabled="isLoading"
        >
          <span v-if="!isLoading">Refrescar Productos 🔁</span>
          <BaseSpinner v-else text="Actualizando..." />
        </BaseButton>

        <div class="flex items-center gap-2">
          <label for="categoria-select" class="font-bold text-lg text-text-dark"
            >Filtrar por:</label
          >
          <BaseSelect
            id="categoria-select"
            v-model="selectedCategory"
            :options="
              categories.map((cat) => ({
                value: cat,
                label: cat === 'todos' ? 'Todas las Categorías' : cat,
              }))
            "
            class="min-w-[200px]"
          />
        </div>
      </div>

      <div v-if="isLoading" class="flex justify-center items-center h-48">
        <BaseSpinner text="Cargando productos..." />
      </div>
      <div
        v-else-if="error"
        class="text-center text-error text-xl p-8 rounded-lg bg-red-100 border border-error"
      >
        {{ error }}
      </div>
      <div
        v-else-if="filteredProducts.length === 0"
        class="text-center text-text-muted text-xl p-8 rounded-lg bg-surface"
      >
        No se encontraron productos para la categoría seleccionada.
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <ProductCard
          v-for="product in filteredProducts"
          :key="product.idProducto"
          :product="{
            // Mapea tu ApiProduct a la interfaz Product de ProductCard
            id: product.idProducto,
            name: product.prodNombre,
            image: product.prodImg[0] || '/images/default-placeholder.png',
            price: product.prodPrecio,
            oldPrice: product.prodPrecioAnterior,
            description: product.prodDescripcion,
            stock: product.prodStock,
          }"
          @add-to-cart="handleAddToCart"
          @view-details="handleViewDetails"
        />
      </div>
    </div>
  </main>
</template>
