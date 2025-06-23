// src/composables/useCart.ts
import { ref, computed } from 'vue'

// Interfaz para el producto que viene de la API
export interface ApiProduct {
  idProducto: number
  prodNombre: string
  prodDescripcion: string
  prodPrecio: number
  prodStock: number // Make sure this is always present
  prodCategoria: string
  prodImg: string[] // Array de URLs de imágenes
  prodPrecioAnterior?: number // Para descuentos
  esNuevo?: boolean // Para productos nuevos
}

// Interfaz para un ítem en el carrito
export interface CartItem {
  idProducto: number
  nombre: string
  precio: number
  cantidad: number
  imagen: string
  stockActual: number // Added to store the current stock of the item when it was added
}

const products = ref<ApiProduct[]>([])
const categories = ref<string[]>([])
const selectedCategory = ref<string>('todos')
const isLoading = ref(false)
const error = ref<string | null>(null)

// Carrito de compras
const cart = ref<CartItem[]>([])

// --- Funciones de Carga y Guardado del Carrito ---
const loadCartFromLocalStorage = () => {
  const storedCart = localStorage.getItem('carrito')
  if (storedCart) {
    try {
      const parsedCart: CartItem[] = JSON.parse(storedCart)
      // Asegurarse de que 'cantidad' y 'stockActual' sean números válidos al cargar
      cart.value = parsedCart.map((item) => ({
        ...item,
        cantidad: Math.max(1, typeof item.cantidad === 'number' ? item.cantidad : 1),
        stockActual: typeof item.stockActual === 'number' ? item.stockActual : 0, // Asegurar un valor numérico para stockActual
      }))
    } catch (e) {
      console.error('Error al parsear el carrito de localStorage:', e)
      cart.value = [] // Resetear el carrito si hay un error de parseo
    }
  }
}

const saveCartToLocalStorage = () => {
  localStorage.setItem('carrito', JSON.stringify(cart.value))
}

// --- Lógica de Productos (fetch, filtrado, polling) ---
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
        throw new Error(`Error HTTP! estado: ${response.status}`)
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

// Actualización de stock periódica
let stockUpdateInterval: number | undefined

const startStockUpdatePolling = () => {
  if (stockUpdateInterval) clearInterval(stockUpdateInterval) // Limpiar si ya existe para evitar duplicados
  stockUpdateInterval = window.setInterval(async () => {
    try {
      const response = await fetch('https://backendpawstails.runasp.net/api/gestion/productos')
      if (!response.ok) throw new Error('Fallo al obtener actualizaciones de stock.')
      const latestProducts: ApiProduct[] = await response.json()

      // Actualizar solo el stock en los productos existentes en `products.value`
      // y también actualizar el stock en los ítems del carrito si es necesario
      products.value = products.value.map((localProd) => {
        const updatedProd = latestProducts.find(
          (apiProd) => apiProd.idProducto === localProd.idProducto,
        )
        if (updatedProd && updatedProd.prodStock !== localProd.prodStock) {
          console.log(
            `Stock de ${localProd.prodNombre} actualizado: ${localProd.prodStock} -> ${updatedProd.prodStock}`,
          )
          // Actualizar también el stockActual en el carrito si el producto está en él
          const cartItem = cart.value.find((item) => item.idProducto === localProd.idProducto)
          if (cartItem) {
            cartItem.stockActual = updatedProd.prodStock // Actualizar el stock disponible para el item del carrito
          }
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

// --- Lógica del Carrito ---
const addToCart = (productToAdd: ApiProduct, quantity: number) => {
  // AÑADIDO: Consolog para depuración
  console.log(
    `[addToCart] Intentando añadir: ${productToAdd.prodNombre}, Cantidad solicitada: ${quantity}, Stock API: ${productToAdd.prodStock}`,
  )

  if (isNaN(quantity) || quantity < 1) {
    alert('Por favor, ingresa una cantidad válida.')
    return
  }

  const existingItemIndex = cart.value.findIndex(
    (item) => item.idProducto === productToAdd.idProducto,
  )

  let currentQuantityInCart = 0
  if (existingItemIndex !== -1) {
    currentQuantityInCart = cart.value[existingItemIndex].cantidad
    console.log(
      `[addToCart] Producto ya en carrito. Cantidad actual en carrito: ${currentQuantityInCart}`,
    )
  }

  // Verificar si la nueva cantidad total excede el stock disponible del producto
  // ESTA VALIDACIÓN PERMANECE COMO LA TENÍAS. SI LA QUIERES QUITAR, DIME.
  if (currentQuantityInCart + quantity > productToAdd.prodStock) {
    alert(
      `No se pudo agregar al carrito. La cantidad seleccionada (${quantity}) más la cantidad ya en el carrito (${currentQuantityInCart}) excede el stock disponible (${productToAdd.prodStock}).`,
    )
    console.log(
      `[addToCart] Falla por stock. Cantidad total deseada: ${currentQuantityInCart + quantity}, Stock: ${productToAdd.prodStock}`,
    )
    return
  }

  if (existingItemIndex !== -1) {
    cart.value[existingItemIndex].cantidad += quantity
    console.log(
      `[addToCart] Cantidad de ${productToAdd.prodNombre} actualizada a: ${cart.value[existingItemIndex].cantidad}`,
    )
  } else {
    cart.value.push({
      idProducto: productToAdd.idProducto,
      nombre: productToAdd.prodNombre,
      precio: productToAdd.prodPrecio,
      cantidad: quantity, // <-- Esto usa directamente la 'quantity' que se le pasó
      imagen: productToAdd.prodImg[0] || '/images/default-placeholder.png',
      stockActual: productToAdd.prodStock, // Guardar el stock actual al añadirlo al carrito
    })
    console.log(
      `[addToCart] Nuevo ítem ${productToAdd.prodNombre} añadido con cantidad: ${quantity}`,
    )
  }
  saveCartToLocalStorage()
  alert(`"${productToAdd.prodNombre}" agregado al carrito (${quantity}).`)
}

const removeFromCart = (productId: number) => {
  cart.value = cart.value.filter((item) => item.idProducto !== productId)
  saveCartToLocalStorage()
  alert('Producto eliminado del carrito.') // Mantener el alert para feedback inmediato
}

// --- updateCartItemQuantity: NO VERIFICA stockActual ---
const updateCartItemQuantity = (
  productId: number,
  newQuantityInput: number | string | null | undefined,
) => {
  console.log(
    `[useCart] Intentando actualizar idProducto: ${productId}, con newQuantityInput (original): ${newQuantityInput}`,
  )

  const itemIndex = cart.value.findIndex((item) => item.idProducto === productId)
  if (itemIndex !== -1) {
    const item = cart.value[itemIndex]

    // Normalizar la entrada a un string seguro para parseInt
    const stringValue = String(newQuantityInput || '').trim()

    // Parsear a entero. Si falla (vacío, texto), parseInt dará NaN
    const parsedQuantity = parseInt(stringValue, 10)

    let finalQuantity: number

    // Lógica robusta: Si es NaN o menor que 1, forzar a 1. De lo contrario, usar el valor parseado.
    if (isNaN(parsedQuantity) || parsedQuantity < 1) {
      finalQuantity = 1
      console.warn(
        `[useCart] Valor inválido o menor que 1 (${newQuantityInput}) detectado para ${item.nombre}. Ajustando a ${finalQuantity}.`,
      )
    } else {
      // ** Aquí es donde se eliminó la verificación de stockActual **
      // finalQuantity = Math.min(parsedQuantity, item.stockActual); // ANTERIORMENTE
      finalQuantity = parsedQuantity // NUEVO: No se limita por stockActual
    }

    console.log(
      `[useCart] Producto: ${item.nombre}, Parsed: ${parsedQuantity}, Final: ${finalQuantity}`,
    )

    // Solo actualizar si la cantidad REALMENTE cambia para evitar triggers innecesarios
    if (item.cantidad !== finalQuantity) {
      item.cantidad = finalQuantity
      saveCartToLocalStorage()
      console.log(`[useCart] Cantidad de ${item.nombre} actualizada a: ${item.cantidad}`)
    } else {
      console.log(
        `[useCart] Cantidad de ${item.nombre} no cambió (ya era ${item.cantidad} o se ajustó al mismo valor).`,
      )
    }
  } else {
    console.warn(
      `[useCart] No se encontró el producto con idProducto: ${productId} para actualizar la cantidad.`,
    )
  }
}

// --- Cálculos del Carrito ---
const subtotal = computed(() => {
  return cart.value.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
})

const iva = computed(() => {
  // Redondear a 2 decimales para evitar problemas de coma flotante
  return Math.round(subtotal.value * 0.15 * 100) / 100
})

const total = computed(() => {
  // Redondear a 2 decimales
  return Math.round((subtotal.value + iva.value) * 100) / 100
})

// --- Interfaz y Lógica de Finalizar Compra ---
export interface CompraPayload {
  Carrito: {
    productos: Array<{ idProducto: number; cantidad: number }>
  }
  Direccion: string
  MetodoPago: string
  IdUsuario: number // Asumiendo que el IdUsuario es string (UUID o similar)
  cuenta: number
}


const finalizarCompra = async (payload: CompraPayload) => {
  if (cart.value.length === 0) {
    // Ya validado en CartView, pero es una buena capa de seguridad
    return { success: false, message: 'Tu carrito está vacío.' }
  }
  const adaptedPayload = {
  Carrito: {
    "<productos>k__BackingField": payload.Carrito.productos.map(p => ({
      "<idProducto>k__BackingField": p.idProducto,
      "<cantidad>k__BackingField": p.cantidad,
    })),
  },
  Direccion: payload.Direccion,
  MetodoPago: payload.MetodoPago,
  IdUsuario: payload.IdUsuario,
  cuenta: payload.cuenta,
}
  console.log('Finalizando compra con payload:', payload)
  try {
    const response = await fetch('https://backendpawstails.runasp.net/api/gestion/compra', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adaptedPayload),
    })

    if (response.ok) {
      // Verifica si la respuesta HTTP fue exitosa (código 2xx)
      const result = await response.json()
      // Asumiendo que el backend devuelve `true` o un objeto con `success: true`
      if (result === true || result.success === true) {
        cart.value = [] // Vaciar carrito solo si la compra fue exitosa
        saveCartToLocalStorage()
        return { success: true, message: '¡Compra realizada con éxito!' }
      } else {
        // Si el backend responde con un JSON indicando error (e.g., { success: false, message: "Error" })
        return { success: false, message: result.message || 'No se pudo completar la compra.' }
      }
    } else {
      // Manejar errores HTTP (400, 500, etc.)
      const errorText = await response.text() // Leer el cuerpo de la respuesta para más detalles
      console.error('Error al realizar la compra (HTTP):', response.status, errorText)
      return {
        success: false,
        message: `Error del servidor: ${response.status} - ${errorText || 'Error desconocido'}`,
      }
    }
  } catch (err: unknown) {
    console.error('Error de conexión al finalizar la compra:', err)
    return {
      success: false,
      message: `Error de conexión: ${
        err instanceof Error ? err.message : 'No se pudo conectar con el servidor.'
      }`,
    }
  }
}

// --- Hook Principal del Composable ---
export function useCart() {
  // Carga el carrito al inicializar el composable
  loadCartFromLocalStorage()

  return {
    // Productos y Categorías (para la vista de productos)
    products,
    categories,
    selectedCategory,
    isLoading,
    error,
    filteredProducts,
    fetchProducts,
    startStockUpdatePolling,
    stopStockUpdatePolling,

    // Carrito de Compras
    cart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity, // Nueva función para actualizar la cantidad de un ítem
    subtotal,
    iva,
    total,
    finalizarCompra, // Función de compra
  }
}

// Si necesitas un hook separado para productos y carrito, aquí está
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
