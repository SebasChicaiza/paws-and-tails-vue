<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Factura {
  ID_FACTURA: number
  FAC_FECHAHORA: string
  FAC_DIRECCION: string
  FAC_METODO_PAGO: string
  FAC_SUBTOTAL: number
  FAC_IVA: number
  FAC_TOTAL: number
  FAC_ESTADO: string
}

const facturas = ref<Factura[]>([])
const paginaActual = ref(1)
const porPagina = 10
const cedulaBusqueda = ref('')
const isLoading = ref(false)
const error = ref<string | null>(null)

const API_FACTURAS = 'https://backendpawstails.runasp.net/api/gestion/factura'

// Computed para paginación
const totalPaginas = computed(() => Math.ceil(facturas.value.length / porPagina))
const facturasPaginadas = computed(() => {
  const inicio = (paginaActual.value - 1) * porPagina
  return facturas.value.slice(inicio, inicio + porPagina)
})

// Cargar todas las facturas
const cargarFacturas = async () => {
  isLoading.value = true
  error.value = null
  try {
    const res = await fetch(API_FACTURAS)
    if (!res.ok) throw new Error('Error al cargar facturas')
    facturas.value = await res.json()
    paginaActual.value = 1
  } catch (e) {
    console.error(e)
    error.value = 'Error al cargar facturas ❌'
  } finally {
    isLoading.value = false
  }
}

// Buscar por cédula
const buscarPorCedula = async () => {
  if (cedulaBusqueda.value.trim().length === 10) {
    isLoading.value = true
    error.value = null
    try {
      const res = await fetch(`${API_FACTURAS}/cedula/${cedulaBusqueda.value.trim()}`)
      if (!res.ok) throw new Error()
      const result = await res.json()
      facturas.value = Array.isArray(result) ? result : [result]
      paginaActual.value = 1
    } catch {
      error.value = '❌ No se encontraron facturas para esa cédula'
      facturas.value = []
    } finally {
      isLoading.value = false
    }
  } else if (cedulaBusqueda.value.trim() === '') {
    cargarFacturas()
  }
}

// Cambiar estado de factura
const cambiarEstado = async (id: number, nuevoEstado: string) => {
  try {
    const res = await fetch(`${API_FACTURAS}/estado`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idFactura: id, nuevoEstado }),
    })
    if (!res.ok) throw new Error()
    alert(`Estado de factura #${id} actualizado a ${nuevoEstado}`)
    cargarFacturas()
  } catch {
    alert('Error al actualizar estado')
  }
}

onMounted(() => {
  cargarFacturas()
})
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-r from-pink-200 via-blue-200 pt-2 to-blue-300 font-quicksand"
  >
    <div class="container">
      <h2>📄 Panel de Administración de Facturas</h2>
      <input
        type="text"
        v-model="cedulaBusqueda"
        @input="buscarPorCedula"
        placeholder="Buscar por cédula..."
        maxlength="10"
      />
      <div v-if="error" class="error-msg">{{ error }}</div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Fecha</th>
            <th>Dirección</th>
            <th>Pago</th>
            <th>Subtotal</th>
            <th>IVA</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Cambiar</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="f in facturasPaginadas" :key="f.ID_FACTURA">
            <td>{{ f.ID_FACTURA }}</td>
            <td>{{ new Date(f.FAC_FECHAHORA).toLocaleString() }}</td>
            <td>{{ f.FAC_DIRECCION }}</td>
            <td>{{ f.FAC_METODO_PAGO }}</td>
            <td>${{ f.FAC_SUBTOTAL.toFixed(2) }}</td>
            <td>${{ f.FAC_IVA.toFixed(2) }}</td>
            <td>${{ f.FAC_TOTAL.toFixed(2) }}</td>
            <td>{{ f.FAC_ESTADO }}</td>
            <td>
              <select
                :value="f.FAC_ESTADO"
                @change="cambiarEstado(f.ID_FACTURA, $event.target.value)"
              >
                <option value="CREADO">CREADO</option>
                <option value="PAGADO">PAGADO</option>
                <option value="CANCELADO">CANCELADO</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
      <!-- Paginación -->
      <div class="paginacion" v-if="totalPaginas > 1">
        <button
          v-for="i in totalPaginas"
          :key="i"
          :style="{ background: i === paginaActual ? '#a6c1ee' : '' }"
          @click="paginaActual = i"
        >
          {{ i }}
        </button>
      </div>
      <button id="btn-regresar" @click="$router.push('/admin')">Regresar</button>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500;700&display=swap');
.font-quicksand {
  font-family: 'Quicksand', sans-serif;
}
.container {
  max-width: 1200px;
  margin: 2rem auto;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}
input[type='text'] {
  padding: 0.5rem;
  width: 300px;
  border-radius: 8px;
  border: 1px solid #ccc;
  margin-bottom: 1rem;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  padding: 0.75rem;
  border-bottom: 1px solid #ccc;
}
select {
  padding: 0.3rem;
  border-radius: 6px;
}
.paginacion {
  text-align: center;
  margin-top: 1rem;
}
.paginacion button {
  padding: 0.5rem 1rem;
  margin: 0 0.2rem;
  border: none;
  background: #5a2d82;
  color: white;
  border-radius: 6px;
  cursor: pointer;
}
.error-msg {
  color: #e53935;
  font-weight: bold;
  margin-bottom: 1rem;
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
