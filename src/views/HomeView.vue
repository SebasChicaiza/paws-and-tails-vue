<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import BaseButton from '../components/base/BaseButton.vue'
import hero1 from '@/assets/images/hero/hero1.jpg'
import hero2 from '@/assets/images/hero/hero2.jpg'
import hero3 from '@/assets/images/hero/hero3.jpeg'

// --- Carrusel de Héroe ---
interface CarouselItem {
  id: number
  image: string
  alt: string
  title: string
  subtitle: string
  buttonText: string
  buttonLink: string
  variant: 'primary' | 'accent' // Para el estilo del botón
}

const carouselItems: CarouselItem[] = [
  {
    id: 1,
    image: hero1,
    alt: 'Perro feliz corriendo en un campo',
    title: 'La Felicidad de tu Mascota, Nuestra Prioridad',
    subtitle: 'Descubre los mejores productos para su bienestar y diversión.',
    buttonText: 'Explorar Tienda',
    buttonLink: '/productos',
    variant: 'accent',
  },
  {
    id: 2,
    image: hero2,
    alt: 'Gato jugando con un juguete',
    title: 'Juguetes que Estimulan, Alimentos que Nutren',
    subtitle: 'Desde el juego hasta la hora de comer, lo tenemos cubierto.',
    buttonText: 'Ver Juguetes',
    buttonLink: '/productos', // Ejemplo de filtro
    variant: 'primary',
  },
  {
    id: 3,
    image: hero3,
    alt: 'Humano acariciando a su perro',
    title: 'Un Vínculo Fuerte, Productos de Calidad',
    subtitle: 'Encuentra todo lo necesario para cuidar a tu mejor amigo.',
    buttonText: 'Conocer Más',
    buttonLink: '/nosotros',
    variant: 'accent',
  },
]

const currentSlide = ref(0)
let carouselInterval: number | undefined

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % carouselItems.length
}

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + carouselItems.length) % carouselItems.length
}

const goToSlide = (index: number) => {
  currentSlide.value = index
}

const startCarousel = () => {
  carouselInterval = window.setInterval(nextSlide, 5000) // Cambia cada 5 segundos
}

const stopCarousel = () => {
  if (carouselInterval) {
    clearInterval(carouselInterval)
  }
}

onMounted(() => {
  startCarousel()
})

onUnmounted(() => {
  stopCarousel()
})

/*
// --- Productos Destacados (simulados) ---
const featuredProducts = ref([
  {
    id: 1,
    name: 'Alimento Balanceado para Perros',
    image: '/images/products/alimento-perro.webp', // Rutas de ejemplo
    price: 35.99,
    oldPrice: 40.0,
    description: 'Fórmula premium con ingredientes naturales para una vida sana y feliz.',
    hasDiscount: true,
  },
  {
    id: 2,
    name: 'Rascador Interactivo para Gatos',
    image: '/images/products/rascador-gato.webp',
    price: 65.0,
    description: 'Múltiples niveles y juguetes para horas de diversión gatuna.',
    isNew: true,
  },
  {
    id: 3,
    name: 'Cama Ortopédica para Mascotas',
    image: '/images/products/cama-ortopedica.webp',
    price: 89.99,
    description: 'Soporte y comodidad para un descanso reparador de tu amigo peludo.',
  },
  {
    id: 4,
    name: 'Juego de Pelotas Duraderas',
    image: '/images/products/pelotas-juego.webp',
    price: 12.5,
    description: 'Set de 3 pelotas resistentes para juegos al aire libre.',
  },
])*/
</script>

<template>
  <main class="home-main bg-background">
    <section class="relative w-full h-[60vh] md:h-[70vh] lg:h-[80vh] overflow-hidden">
      <transition-group name="slide" tag="div" class="absolute inset-0 flex">
        <div
          v-for="(item, index) in carouselItems"
          :key="item.id"
          v-show="index === currentSlide"
          class="absolute inset-0 bg-cover bg-center flex items-center justify-center p-4"
          :style="{ backgroundImage: `url(${item.image})` }"
        >
          <div class="absolute inset-0 bg-primary-dark/40"></div>

          <div
            class="relative text-center text-white z-10 max-w-2xl mx-auto p-4 md:p-8 bg-black/30 rounded-xl backdrop-blur-sm shadow-lg"
          >
            <h2 class="text-3xl md:text-5xl font-extrabold mb-4 leading-tight drop-shadow-lg">
              {{ item.title }}
            </h2>
            <p class="text-lg md:text-xl mb-6 opacity-90 drop-shadow">
              {{ item.subtitle }}
            </p>
            <BaseButton
              :variant="item.variant"
              :to="item.buttonLink"
              size="lg"
              class="hover:scale-105 transition-transform duration-200"
            >
              {{ item.buttonText }}
            </BaseButton>
          </div>
        </div>
      </transition-group>

      <button
        @click="prevSlide"
        @mouseenter="stopCarousel"
        @mouseleave="startCarousel"
        class="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 text-white p-3 rounded-full hover:bg-black/50 focus:outline-none focus:ring-2 focus:ring-accent z-20 transition-all duration-200"
        aria-label="Diapositiva anterior"
      >
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          ></path>
        </svg>
      </button>
      <button
        @click="nextSlide"
        @mouseenter="stopCarousel"
        @mouseleave="startCarousel"
        class="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 text-white p-3 rounded-full hover:bg-black/50 focus:outline-none focus:ring-2 focus:ring-accent z-20 transition-all duration-200"
        aria-label="Siguiente diapositiva"
      >
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          ></path>
        </svg>
      </button>

      <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
        <button
          v-for="(item, index) in carouselItems"
          :key="item.id"
          @click="goToSlide(index)"
          @mouseenter="stopCarousel"
          @mouseleave="startCarousel"
          :class="[
            'w-3 h-3 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent',
            { 'bg-white': index === currentSlide, 'bg-white/50': index !== currentSlide },
          ]"
          :aria-label="`Ir a la diapositiva ${index + 1}`"
        ></button>
      </div>
    </section>

    <section class="relative w-full py-16 bg-primary-dark overflow-hidden">
      <div
        class="video-container relative w-full h-[300px] md:h-[450px] lg:h-[600px] overflow-hidden"
      >
        <video
          autoplay
          muted
          loop
          playsinline
          class="absolute inset-0 w-full h-full object-cover opacity-70"
        >
          <source src="../assets/videos/perroJugandoHD.mp4" type="video/mp4" />
          Tu navegador no soporta el video.
        </video>
        <div
          class="absolute inset-0 bg-primary-dark/60 flex items-center justify-center p-4 text-center"
        >
          <p
            class="text-white text-3xl md:text-5xl font-extrabold leading-tight max-w-3xl drop-shadow-lg"
          >
            Para demostrarles lo mucho que los <span class="text-accent">amas</span>
          </p>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
/*
  Transiciones para el carrusel de Vue
  Para `transition-group` y `name="slide"`
*/
.slide-enter-active,
.slide-leave-active {
  transition:
    transform 0.8s ease,
    opacity 0.8s ease;
  position: absolute; /* Importante para que las slides se superpongan */
  width: 100%;
  height: 100%;
}

.slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
/* Asegúrate de que las imágenes se superpongan bien durante la transición */
.slide-leave-active {
  z-index: 1; /* El elemento saliente se mantiene por encima del entrante durante la transición */
}
.slide-enter-active {
  z-index: 0; /* El elemento entrante está detrás inicialmente */
}
</style>
