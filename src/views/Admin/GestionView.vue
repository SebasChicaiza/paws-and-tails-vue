<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-r from-pink-200 via-blue-200 to-blue-300 animate-bgmove">

    <main class="flex-1">
      <div class="flex flex-col items-center justify-center" style="height: 30dvh;">
        <BaseButton
          class="mb-4 w-64"
          @click="goTo('GestionProductos')"
        >
          Gestión Productos
        </BaseButton>
        <BaseButton
          class="w-64"
          @click="goTo('GestionFacturas')"
        >
          Gestión Facturas
        </BaseButton>
      </div>
      <div class="w-4/5 mx-auto bg-blue-200 p-12 rounded-3xl mb-8 shadow-lg">
        <h2 class="font-bold text-2xl mb-6">Top 5 Productos Más Vendidos</h2>
        <canvas ref="chartRef" height="90" class="bg-white rounded-xl"></canvas>
      </div>
    </main>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Chart from 'chart.js/auto'
import BaseButton from '@/components/base/BaseButton.vue'

const router = useRouter()
const chartRef = ref<HTMLCanvasElement | null>(null)

const goTo = (routeName: string) => {
  router.push({ name: routeName })
}

onMounted(() => {
  // Permisos de administrador
  const cuenta = JSON.parse(localStorage.getItem('cuenta') || '{}')
  if (cuenta.Rol !== 'Administrador') {
    alert('No tiene permisos para acceder a esta página...')
    router.push('/')
    return
  }

  // Chart.js
  if (chartRef.value) {
    new Chart(chartRef.value, {
      type: 'bar',
      data: {
        labels: [
          'Cama Suave y Acolchada',
          'Alimento Balanceado',
          'Snacks Dentales',
          'Rascador de Cartón',
          'Arena Aglomerante',
        ],
        datasets: [
          {
            label: 'Total Vendido',
            data: [604, 494, 438, 406, 403],
            backgroundColor: [
              'rgba(75, 192, 192, 0.6)',
              'rgba(255, 159, 64, 0.6)',
              'rgba(153, 102, 255, 0.6)',
              'rgba(255, 205, 86, 0.6)',
              'rgba(54, 162, 235, 0.6)',
            ],
            borderColor: [
              'rgba(75, 192, 192, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 205, 86, 1)',
              'rgba(54, 162, 235, 1)',
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Unidades Vendidas',
            },
          },
        },
        plugins: {
          title: {
            display: true,
            text: 'Top 5 Productos Más Vendidos',
          },
          legend: {
            display: false,
          },
        },
      },
    })
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;700&display=swap');

.animate-bgmove {
  background-size: 400% 400%;
  animation: bgmove 20s ease infinite;
  font-family: 'Quicksand', sans-serif;
}

@keyframes bgmove {
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
</style>
