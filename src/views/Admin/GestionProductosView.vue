<script setup lang="ts">
import { ref, onMounted } from 'vue'
import FormProductos from '@/components/FormProductos.vue'

interface Producto {
  idProducto: number
  prodNombre: string
  prodCategoria: string
  prodDescripcion: string
  prodPrecio: number
  prodStock: number
  prodProveedor?: string
  prodImg?: string[]
}
const props = defineProps<{
  producto?: Producto | null
}>()

const productos = ref<Producto[]>([])
const imagenesModal = ref<string[]>([])
const showModal = ref(false)
const productoAEditar = ref<Producto | null>(null)

const fetchProductos = async () => {
  try {
    const res = await fetch('https://backendpawstails.runasp.net/api/gestion/productos')
    if (!res.ok) throw new Error('Error al cargar los productos')
    productos.value = await res.json()
  } catch (e) {
    alert('❌ Error al cargar los productos' + e)
  }
}

const eliminarProducto = async (idProducto: number) => {
  if (
    !confirm(
      `¿Seguro que deseas eliminar el producto #${idProducto}? Esta acción no se puede deshacer.`,
    )
  )
    return
  try {
    const res = await fetch(
      `https://backendpawstails.runasp.net/api/gestion/productos/${idProducto}`,
      {
        method: 'DELETE',
      },
    )
    if (!res.ok) throw new Error()
    alert('✅ Producto eliminado correctamente')
    await fetchProductos()
  } catch (e) {
    console.error('Error al eliminar el producto:', e)
    alert('❌ Error al eliminar el producto')
  }
}

const verImagenes = (p: Producto) => {
  if (p.prodImg && p.prodImg.length) {
    imagenesModal.value = p.prodImg
  } else {
    alert('No hay imágenes disponibles')
  }
}

onMounted(() => {
  fetchProductos()
})

function abrirCrearProducto() {
  productoAEditar.value = null
  showModal.value = true
}

function abrirEditarProducto(producto: Producto) {
  productoAEditar.value = producto
  showModal.value = true
}

function cerrarModal() {
  showModal.value = false
}
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-r from-pink-200 via-blue-200 to-blue-300 font-quicksand pb-2"
  >
    <!-- Header (usa tu componente si tienes) -->
    <!-- <AppNavbar /> -->

    <div class="header">
      <h1>Gestión de Productos</h1>
      <button @click="abrirCrearProducto">➕ Crear Producto</button>
    </div>

    <div class="container">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Descripción</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Proveedor</th>
            <th>Imágenes</th>
            <th>Editar</th>
            <th>Eliminar</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in productos" :key="p.idProducto">
            <td>{{ p.idProducto }}</td>
            <td>{{ p.prodNombre }}</td>
            <td>{{ p.prodCategoria }}</td>
            <td>{{ p.prodDescripcion }}</td>
            <td>${{ p.prodPrecio }}</td>
            <td>{{ p.prodStock }}</td>
            <td>{{ p.prodProveedor || '' }}</td>
            <td>
              <button @click="verImagenes(p)">🖼️</button>
            </td>
            <td>
              <!-- En la tabla -->
              <button class="edit-btn" @click="abrirEditarProducto(p)">✏️ Editar</button>
            </td>
            <td>
              <button class="delete-btn" @click="eliminarProducto(p.idProducto)">
                🗑️ Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal para mostrar imágenes -->
    <div
      v-if="imagenesModal.length"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-xl p-6 max-w-lg w-full relative">
        <button class="absolute top-2 right-2 text-xl" @click="imagenesModal = []">✖️</button>
        <h2 class="font-bold mb-4">Imágenes del producto</h2>
        <div class="flex flex-wrap gap-4 justify-center">
          <img
            v-for="(img, i) in imagenesModal"
            :key="i"
            :src="img"
            class="w-32 h-32 object-contain rounded shadow"
          />
        </div>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-lg max-w-2xl w-auto relative text-sm">
        <button class="absolute top-2 right-2 text-xl" @click="cerrarModal">✖️</button>
        <FormProductos :producto="productoAEditar" @close="cerrarModal" />
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500;700&display=swap');

.font-quicksand {
  font-family: 'Quicksand', sans-serif;
}
/* Puedes poner esto en tu style global o scoped */
.bg-white.rounded-xl {
  width: 100%;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.header h1 {
  margin: 0;
  color: #5a2d82;
}

.header button {
  background: #5a2d82;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

.container {
  max-width: 1000px;
  margin: 2rem auto;
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th,
td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f3f3f3;
}

.edit-btn {
  background-color: #2196f3;
  color: white;
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.edit-btn:hover {
  background-color: #1976d2;
}

.delete-btn {
  background-color: #e53935;
  color: white;
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.delete-btn:hover {
  background-color: #b71c1c;
}
</style>
