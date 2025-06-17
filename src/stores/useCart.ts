// src/composables/useCart.ts
import { ref, computed } from 'vue'

// Interfaz para el producto que viene de la API
export interface ApiProduct {
  idProducto: number
  prodNombre: string
  prodDescripcion: string
  prodPrecio: number
  prodStock: number
  prodCategoria: string
  prodImg: string[] // Array de URLs de imágenes
  prodPrecioAnterior?: number // Para descuentos
  esNuevo?: boolean // Para productos nuevos
}

// Interfaz para el item en el carrito
export interface CartItem {
  idProducto: number
  nombre: string
  precio: number
  cantidad: number
  imagen: string
}

const products = ref<ApiProduct[]>([])
const categories = ref<string[]>([])
const selectedCategory = ref<string>('todos')
const isLoading = ref(false)
const error = ref<string | null>(null)

// Carrusel de imágenes dentro de la ProductCard
// Esta lógica ya no es global, se moverá a ProductCard.vue
// const carouselIndices: { [key: number]: number } = {};

const fetchProducts = async (forceRefresh: boolean = false) => {
  isLoading.value = true
  error.value = null
  const CACHE_KEY = 'productosPrecargados'

  try {
    const cachedProducts = sessionStorage.getItem(CACHE_KEY)

    if (!forceRefresh && cachedProducts) {
      products.value = JSON.parse(cachedProducts)
      console.log('Productos cargados desde sessionStorage')
    } else {
      console.log('Fetching products from API...')
      const response = await fetch('https://backendpawstails.runasp.net/api/gestion/productos')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: ApiProduct[] = await response.json()
      products.value = data
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(data))
      console.log('Productos cargados desde API y guardados en sessionStorage')
    }

    // Llenar categorías
    const uniqueCategories = new Set<string>()
    products.value.forEach((p) => uniqueCategories.add(p.prodCategoria))
    categories.value = ['todos', ...Array.from(uniqueCategories)]
  } catch (err) {
    console.error('Error al cargar productos:', err)
    error.value = 'Error al cargar productos. Intenta de nuevo más tarde.'
  } finally {
    isLoading.value = false
  }
}

const filteredProducts = computed(() => {
  if (selectedCategory.value === 'todos') {
    return products.value
  }
  return products.value.filter((p) => p.prodCategoria === selectedCategory.value)
})

// Lógica de carrito
const cart = ref<CartItem[]>([])

const loadCartFromLocalStorage = () => {
  const storedCart = localStorage.getItem('carrito')
  if (storedCart) {
    cart.value = JSON.parse(storedCart)
  }
}

const saveCartToLocalStorage = () => {
  localStorage.setItem('carrito', JSON.stringify(cart.value))
}

const addToCart = (productToAdd: ApiProduct, quantity: number) => {
  if (isNaN(quantity) || quantity < 1) {
    alert('Por favor ingresa una cantidad válida.')
    return
  }
  if (quantity > productToAdd.prodStock) {
    alert('No se pudo agregar al carrito. Cantidad seleccionada mayor al stock disponible.')
    return
  }

  const existingItemIndex = cart.value.findIndex(
    (item) => item.idProducto === productToAdd.idProducto,
  )

  if (existingItemIndex !== -1) {
    cart.value[existingItemIndex].cantidad += quantity
  } else {
    cart.value.push({
      idProducto: productToAdd.idProducto,
      nombre: productToAdd.prodNombre,
      precio: productToAdd.prodPrecio,
      cantidad: quantity,
      imagen: productToAdd.prodImg[0] || '/images/default-placeholder.png', // Usar primera imagen o placeholder
    })
  }
  saveCartToLocalStorage()
  alert(`"${productToAdd.prodNombre}" agregado al carrito (${quantity}).`)
}

const removeFromCart = (productId: number) => {
  cart.value = cart.value.filter((item) => item.idProducto !== productId)
  saveCartToLocalStorage()
  alert('Producto eliminado del carrito.')
  // Puedes emitir un evento o recargar la página del carrito si es necesario
}

// Actualización de stock periódica (directamente desde la API)
let stockUpdateInterval: number | undefined

const startStockUpdatePolling = () => {
  if (stockUpdateInterval) clearInterval(stockUpdateInterval) // Clear existing to prevent duplicates
  stockUpdateInterval = window.setInterval(async () => {
    try {
      const response = await fetch('https://backendpawstails.runasp.net/api/gestion/productos')
      if (!response.ok) throw new Error('Failed to fetch stock updates')
      const latestProducts: ApiProduct[] = await response.json()

      // Actualizar solo el stock en los productos existentes en `products.value`
      products.value = products.value.map((localProd) => {
        const updatedProd = latestProducts.find(
          (apiProd) => apiProd.idProducto === localProd.idProducto,
        )
        if (updatedProd && updatedProd.prodStock !== localProd.prodStock) {
          console.log(
            `Stock de ${localProd.prodNombre} actualizado: ${localProd.prodStock} -> ${updatedProd.prodStock}`,
          )
          return { ...localProd, prodStock: updatedProd.prodStock }
        }
        return localProd
      })
      // Opcional: Actualizar el cache si quieres que los cambios persistan en recargas
      sessionStorage.setItem('productosPrecargados', JSON.stringify(products.value))
    } catch (e) {
      console.warn('No se pudo actualizar el stock automáticamente:', e)
    }
  }, 10000) // Cada 10 segundos
}

const stopStockUpdatePolling = () => {
  if (stockUpdateInterval) {
    clearInterval(stockUpdateInterval)
    stockUpdateInterval = undefined
  }
}

// Define la interfaz según la estructura de tu payload
interface CompraPayload {
  // Ajusta los campos según lo que realmente envías
  productos: Array<{ id: number; cantidad: number }>
  usuarioId: number
  // ...otros campos necesarios
}

// Lógica para finalizar compra (ejemplo, esta podría estar en un composable de checkout)
const finalizarCompra = async (payload: CompraPayload) => {
  if (cart.value.length === 0) {
    alert('⚠️ Tu carrito está vacío.')
    return
  }

  try {
    const response = await fetch('/Carrito/CrearFacturaConDetalle', {
      // Ajusta esta URL si no es relativa
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()
    if (data.success) {
      alert('✅ Compra realizada con éxito')
      cart.value = [] // Vaciar carrito
      saveCartToLocalStorage()
      // router.push('/'); // Redirige a inicio o gracias
    } else {
      alert('❌ Error al procesar la compra: ' + data.error)
      console.error(data.error)
    }
  } catch (err) {
    console.error('Error en fetch de compra:', err)
    alert('❌ Error de conexión al finalizar la compra.')
  }
}

export function useProductsAndCart() {
  // Carga el carrito al inicializar el composable
  loadCartFromLocalStorage()

  return {
    products,
    categories,
    selectedCategory,
    isLoading,
    error,
    filteredProducts,
    fetchProducts,
    addToCart,
    removeFromCart,
    cart, // Exporta el carrito para que otros componentes puedan leerlo
    startStockUpdatePolling,
    stopStockUpdatePolling,
    finalizarCompra, // Si la lógica de compra se maneja aquí
  }
}
