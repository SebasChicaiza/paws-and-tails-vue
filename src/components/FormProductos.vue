<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

interface Producto {
  idProducto?: number //Opcional porque solo existe en edición
  prodCategoria: string
  prodNombre: string
  prodDescripcion: string
  prodPrecio: number
  prodStock: number
  prodImg: string[]
}
const emit = defineEmits(['close'])

const goBack = () => {
  emit('close')
}
const isLoading = ref(false)

const props = defineProps<{
  producto?: Producto | null // Si se pasa, es edición
}>()

const isEdit = computed(() => !!props.producto)

const form = ref<Producto>({
  prodCategoria: props.producto?.prodCategoria || '',
  prodNombre: props.producto?.prodNombre || '',
  prodDescripcion: props.producto?.prodDescripcion || '',
  prodPrecio: props.producto?.prodPrecio || 0,
  prodStock: props.producto?.prodStock || 1,
  prodImg: props.producto?.prodImg ? [...props.producto.prodImg] : [],
})

const imagenesInput = ref(form.value.prodImg.join('\n'))

watch(imagenesInput, (val) => {
  form.value.prodImg = val
    .split('\n')
    .map((u) => u.trim())
    .filter(Boolean)
})

watch(
  () => form.value.prodImg,
  (imgs) => {
    imagenesInput.value = imgs.join('\n')
  },
)

const imagenes = computed(() => form.value.prodImg)

const mensaje = ref('')

const categorias = ref<string[]>([])

const fetchCategorias = async () => {
  try {
    const res = await fetch('https://backendpawstails.runasp.net/api/gestion/productos')
    if (!res.ok) throw new Error()
    const productos = (await res.json()) as Producto[]
    categorias.value = [...new Set(productos.map((p) => p.prodCategoria))]
  } catch {
    categorias.value = []
  }
}

onMounted(() => {
  fetchCategorias()
})

const validate = () => {
  if (!form.value.prodCategoria) {
    mensaje.value = '❌ Debes seleccionar una categoría.'
    return false
  }
  if (form.value.prodNombre.length < 3) {
    mensaje.value = '❌ El nombre debe tener al menos 3 caracteres.'
    return false
  }
  if (form.value.prodDescripcion.length < 10) {
    mensaje.value = '❌ La descripción debe tener al menos 10 caracteres.'
    return false
  }
  if (!form.value.prodPrecio || form.value.prodPrecio <= 0) {
    mensaje.value = '❌ El precio debe ser mayor a 0.'
    return false
  }
  if (!form.value.prodStock || form.value.prodStock < 1) {
    mensaje.value = '❌ El stock debe ser 1 o más.'
    return false
  }
  if (!form.value.prodImg.length) {
    mensaje.value = '❌ Debes ingresar al menos una URL de imagen.'
    return false
  }
  return true
}

const handleSubmit = async () => {
  mensaje.value = ''
  if (!validate()) return

  isLoading.value = true
  try {
    const url = isEdit.value
      ? `https://backendpawstails.runasp.net/api/gestion/productos/${props.producto?.idProducto}`
      : 'https://backendpawstails.runasp.net/api/gestion/productos'
    const method = isEdit.value ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value),
    })
    if (!res.ok) throw new Error()
    mensaje.value = isEdit.value
      ? '✅ Producto actualizado con éxito'
      : '✅ Producto guardado con éxito'
    setTimeout(() => {
      emit('close')
    }, 1200)
  } catch {
    mensaje.value = '❌ Error al guardar el producto'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="modal-center">
    <div class="container">
      <h1 class="titulo">{{ isEdit ? '✏️ Editar Producto' : '📦 Crear Nuevo Producto' }}</h1>
      <form @submit.prevent="handleSubmit">
        <div class="row-flex">
          <div class="flex-item">
            <label for="categoria-select">Categoría:</label>
            <div class="select-wrapper">
              <select id="categoria-select" v-model="form.prodCategoria" required>
                <option value="" disabled>Selecciona una categoría</option>
                <option v-for="cat in categorias" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>
          </div>
          <div class="flex-item">
            <label for="nombre">Nombre del Producto:</label>
            <input
              type="text"
              id="nombre"
              v-model="form.prodNombre"
              required
              minlength="3"
              placeholder="Ej: Cama para perro"
            />
          </div>
        </div>

        <label for="descripcion">Descripción:</label>
        <textarea
          id="descripcion"
          rows="2"
          v-model="form.prodDescripcion"
          required
          minlength="10"
          placeholder="Mínimo 10 caracteres"
        ></textarea>

        <div class="row-flex">
          <div class="flex-item">
            <label for="precio">Precio ($):</label>
            <input
              type="number"
              step="0.01"
              id="precio"
              v-model.number="form.prodPrecio"
              required
              min="0.01"
              placeholder="Ej: 25.99"
            />
          </div>
          <div class="flex-item">
            <label for="stock">Stock disponible:</label>
            <input
              type="number"
              id="stock"
              v-model.number="form.prodStock"
              required
              min="1"
              step="1"
              placeholder="Ej: 10"
            />
          </div>
        </div>

        <label for="imagenes">URLs de las Imágenes:</label>
        <textarea
          id="imagenes"
          rows="3"
          v-model="imagenesInput"
          placeholder="Pega una URL por línea. No uses URLs muy largas."
          required
        ></textarea>
        <div id="preview-multiple">
          <img
            v-for="(img, i) in imagenes"
            :key="i"
            :src="img"
            class="preview-img"
            alt="Imagen del producto"
          />
        </div>

        <button type="submit" :disabled="isLoading">
          <span v-if="isLoading" class="loader"></span>
          <span v-if="isLoading">Guardando...</span>
          <span v-else>{{ isEdit ? 'Guardar Cambios' : 'Guardar Producto' }}</span>
        </button>
        <div class="success-msg">{{ mensaje }}</div>
      </form>
      <button id="btn-regresar" @click="goBack">Regresar</button>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500;700&display=swap');
.titulo{
  background-color: #a18cd1;
  padding: 1rem;
  border-radius: 2rem;
  color: white;
  font-family: 'Quicksand', sans-serif;
  font-weight: bold;
  font-size: 1.5rem;
}
.loader {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #5a2d82;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  animation: spin 1s linear infinite;
  display: inline-block;
  vertical-align: middle;
  margin-right: 8px;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.row-flex {
  display: flex;
  gap: 1rem;
}

.flex-item {
  flex: 1 1 0;
}
.modal-center {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent; /* o el fondo que desees */
}

.container {
  width: 100%;
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  font-family: 'Quicksand', sans-serif;
}

h1 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #5a2d82;
}

label {
  font-weight: bold;
  display: block;
  margin-top: 1rem;
}

input,
textarea {
  width: 100%;
  padding: 10px;
  margin-top: 0.3rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 1rem;
}

.preview-img {
  display: inline-block;
  max-width: 100px;
  max-height: 100px;
  margin: 0.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

button[type='submit'] {
  margin-top: 2rem;
  width: 100%;
  padding: 14px;
  background: linear-gradient(to right, #ff758c, #ff7eb3);
  color: white;
  font-size: 1.1rem;
  font-weight: bold;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: 0.3s ease;
}

button[type='submit']:hover {
  transform: scale(1.03);
  background: linear-gradient(to right, #ff7eb3, #ff758c);
}

.success-msg {
  color: green;
  text-align: center;
  margin-top: 1rem;
  font-weight: bold;
}

.select-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
}

.select-wrapper::after {
  content: '▼';
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  color: #888;
  pointer-events: none;
  font-size: 0.9rem;
}

select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  width: 100%;
  padding: 0.75rem 1rem;
  padding-right: 2.5rem;
  border: 2px solid #ccc;
  border-radius: 12px;
  background: linear-gradient(to right, #f8f8f8, #fff);
  font-size: 1rem;
  font-family: 'Quicksand', sans-serif;
  color: #333;
  transition:
    border-color 0.3s ease,
    box-shadow 0.3s ease;
  cursor: pointer;
}

select:focus {
  border-color: #a18cd1;
  box-shadow: 0 0 0 3px rgba(161, 140, 209, 0.3);
  outline: none;
}

#btn-regresar {
  background: #5a2d82;
  color: white;
  border: none;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  width: 20%;
  margin: 1.5rem auto 0 auto;
  display: block;
}
</style>
