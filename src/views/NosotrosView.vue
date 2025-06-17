<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import perroygato from '@/assets/images/nosotros/perroygato.png'
import varPets2 from '@/assets/images/nosotros/varPets2.png'
import varPets from '@/assets/images/nosotros/varPets.png'

const aboutImages: CarouselImage[] = [
  { src: perroygato, alt: 'Perro y Gato' },
  { src: varPets2, alt: 'Varias Mascotas 2' },
  { src: varPets, alt: 'Varias Mascotas 3' },
]

// --- Carrusel de Imágenes ---
interface CarouselImage {
  src: string
  alt: string
}

const currentImageIndex = ref(0)
let carouselInterval: number | undefined

const startCarousel = () => {
  stopCarousel() // Asegura que no haya intervalos duplicados
  carouselInterval = window.setInterval(() => {
    currentImageIndex.value = (currentImageIndex.value + 1) % aboutImages.length
  }, 4000) // Cambia cada 4 segundos
}

const stopCarousel = () => {
  if (carouselInterval) {
    clearInterval(carouselInterval)
    carouselInterval = undefined
  }
}

onMounted(() => {
  startCarousel()
})

onUnmounted(() => {
  stopCarousel()
})

// --- Reproductor de Video Personalizado ---
const videoElement = ref<HTMLVideoElement | null>(null)
const isPlaying = ref(false)
const isMuted = ref(false)
const seekBarValue = ref(0)
const videoDuration = ref(0)

// Watcher o método para actualizar la barra de progreso
const updateSeekBar = () => {
  if (videoElement.value) {
    seekBarValue.value = Math.floor(videoElement.value.currentTime)
  }
}

// Toggle Play/Pause
const togglePlayPause = () => {
  if (videoElement.value) {
    if (videoElement.value.paused) {
      videoElement.value.play()
      isPlaying.value = true
    } else {
      videoElement.value.pause()
      isPlaying.value = false
    }
  }
}

// Toggle Mute
const toggleMute = () => {
  if (videoElement.value) {
    videoElement.value.muted = !videoElement.value.muted
    isMuted.value = videoElement.value.muted
  }
}

// Fullscreen
const toggleFullscreen = () => {
  if (videoElement.value) {
    const el = videoElement.value as HTMLVideoElement & {
      webkitRequestFullscreen?: () => void
      msRequestFullscreen?: () => void
    }

    if (el.requestFullscreen) {
      el.requestFullscreen()
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen()
    } else if (el.msRequestFullscreen) {
      el.msRequestFullscreen()
    }
  }
}

// Seek Bar Input
const handleSeekBarInput = () => {
  if (videoElement.value) {
    videoElement.value.currentTime = seekBarValue.value
  }
}

onMounted(() => {
  // Configurar eventos para el reproductor de video después de que el DOM esté listo
  nextTick(() => {
    if (videoElement.value) {
      videoElement.value.onloadedmetadata = () => {
        videoDuration.value = Math.floor(videoElement.value!.duration)
      }
      videoElement.value.ontimeupdate = updateSeekBar
    }
  })
})
</script>

<template>
  <main class="bg-background text-text-base py-16">
    <div class="container mx-auto px-4 max-w-4xl">
      <section class="text-center mb-16">
        <h1
          class="text-5xl md:text-6xl font-extrabold text-primary-dark mb-6 leading-tight drop-shadow-sm"
        >
          ¿Quiénes Somos en <span class="text-accent">Paws & Tails</span>?
        </h1>
        <p class="text-lg md:text-xl text-text-dark max-w-2xl mx-auto">
          Somos una tienda de mascotas ubicada en
          <span class="font-semibold text-primary">Quito, sector La Floresta</span>.<br />
          <span class="font-bold text-accent">Amantes de los animales</span> y dedicados al
          bienestar de nuestros peluditos.
        </p>
      </section>

      <section
        class="relative w-full h-80 md:h-96 lg:h-[500px] mb-16 rounded-xl overflow-hidden shadow-xl"
        @mouseenter="stopCarousel"
        @mouseleave="startCarousel"
      >
        <transition-group name="fade-slide" tag="div" class="absolute inset-0 flex">
          <img
            v-for="(image, index) in aboutImages"
            :key="image.src"
            v-show="index === currentImageIndex"
            :src="image.src"
            :alt="image.alt"
            class="absolute inset-0 w-full h-full object-cover"
          />
        </transition-group>

        <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          <button
            v-for="(image, index) in aboutImages"
            :key="index"
            @click="currentImageIndex = index"
            :class="[
              'w-3 h-3 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
              {
                'bg-primary-dark': index === currentImageIndex,
                'bg-gray-400': index !== currentImageIndex,
              },
            ]"
            :aria-label="`Ver imagen ${index + 1}`"
          ></button>
        </div>
      </section>

      <section class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div
          class="bg-surface p-6 rounded-xl shadow-md text-center transform hover:scale-[1.02] transition-transform duration-200"
        >
          <h3 class="text-2xl font-bold text-primary-dark mb-3">Nuestra Misión</h3>
          <p class="text-text-base">
            Proveer productos de la más alta calidad y un servicio excepcional, asegurando la
            felicidad y salud de cada mascota.
          </p>
        </div>
        <div
          class="bg-surface p-6 rounded-xl shadow-md text-center transform hover:scale-[1.02] transition-transform duration-200"
        >
          <h3 class="text-2xl font-bold text-primary-dark mb-3">Nuestra Visión</h3>
          <p class="text-text-base">
            Ser la tienda de mascotas referente en Ecuador, reconocida por nuestra pasión, ética y
            compromiso con la comunidad animal.
          </p>
        </div>
        <div
          class="bg-surface p-6 rounded-xl shadow-md text-center transform hover:scale-[1.02] transition-transform duration-200"
        >
          <h3 class="text-2xl font-bold text-primary-dark mb-3">Nuestros Valores</h3>
          <ul class="list-disc list-inside text-text-base text-left mx-auto max-w-fit">
            <li>Amor por los animales</li>
            <li>Calidad y seguridad</li>
            <li>Integridad y transparencia</li>
            <li>Innovación constante</li>
            <li>Compromiso social</li>
          </ul>
        </div>
      </section>

      <section class="mb-16">
        <h2 class="text-4xl font-extrabold text-center text-primary-dark mb-8 drop-shadow-sm">
          Conoce Más Sobre Nosotros
        </h2>
        <div class="bg-black rounded-xl overflow-hidden shadow-2xl relative">
          <video
            ref="videoElement"
            src="../assets/videos/VideoFinPerros.mp4"
            poster="../assets/images/logoPawsTails-noFondo.png"
            class="w-full h-auto max-h-[60vh] object-contain cursor-pointer"
            @click="togglePlayPause"
          ></video>

          <div
            class="absolute bottom-0 left-0 right-0 p-4 bg-black/60 text-white flex items-center space-x-4 rounded-b-xl"
          >
            <button
              @click="togglePlayPause"
              class="p-2 rounded-full bg-primary hover:bg-primary-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent"
              :aria-label="isPlaying ? 'Pausar video' : 'Reproducir video'"
            >
              <svg
                v-if="isPlaying"
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
                  d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <svg
                v-else
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
                  d="M14.752 11.112l-3.328-3.328a1 1 0 00-1.414 0L7.594 9.688A1 1 0 007 10.408v3.184a1 1 0 00.594.72l2.416 2.416a1 1 0 001.414 0l3.328-3.328a1 1 0 000-1.414z"
                ></path>
              </svg>
            </button>

            <input
              type="range"
              v-model="seekBarValue"
              :max="videoDuration"
              @input="handleSeekBarInput"
              class="flex-grow h-2 bg-primary-light rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-accent [&::-moz-range-thumb]:rounded-full"
              aria-label="Barra de progreso del video"
            />

            <button
              @click="toggleMute"
              class="p-2 rounded-full bg-primary hover:bg-primary-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent"
              :aria-label="isMuted ? 'Desmutear' : 'Mutear'"
            >
              <svg
                v-if="isMuted"
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
                  d="M17.293 17.293a1 1 0 01-1.414 0L12 13.414l-3.879 3.879a1 1 0 01-1.414-1.414L10.586 12 6.707 8.121a1 1 0 011.414-1.414L12 10.586l3.879-3.879a1 1 0 011.414 1.414L13.414 12l3.879 3.879a1 1 0 010 1.414z"
                ></path>
              </svg>
              <svg
                v-else
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
                  d="M15.536 8.464A7.989 7.989 0 0118 12h-3v-1.586l1.293-1.293a1 1 0 011.414 0z"
                ></path>
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 8a3 3 0 00-3 3v2a3 3 0 003 3h3.586l3.536 3.536A1 1 0 0017 19.5V4.5a1 1 0 00-.707-.916l-3.536 3.536H8z"
                ></path>
              </svg>
            </button>

            <button
              @click="toggleFullscreen"
              class="p-2 rounded-full bg-primary hover:bg-primary-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label="Pantalla completa"
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
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 1v4m0 0h-4m4 0l-5-5"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </section>

      <section class="text-center bg-primary-light p-10 rounded-xl shadow-xl">
        <h2 class="text-4xl font-extrabold text-primary-dark mb-6">¿Tienes Preguntas?</h2>
        <p class="text-xl text-text-base mb-8">
          ¡Nos encantaría ayudarte! Contáctanos para cualquier consulta o visita nuestra tienda.
        </p>
        <BaseButton
          variant="accent"
          size="lg"
          to="/contacto"
          class="hover:scale-105 transition-transform duration-200"
        >
          Contactar Ahora
        </BaseButton>
      </section>
    </div>
  </main>
</template>

<style scoped>
/* Transiciones para el carrusel de imágenes */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 1s ease,
    transform 1s ease;
  position: absolute;
  width: 100%;
  height: 100%;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: scale(1.05); /* Ligeramente más grande al entrar */
}
.fade-slide-leave-to {
  opacity: 0;
  transform: scale(0.95); /* Ligeramente más pequeño al salir */
}

/* Asegura que el elemento saliente se desvanezca por encima del entrante */
.fade-slide-leave-active {
  z-index: 1;
}

/* Estilos personalizados para la barra de progreso del video */
/* Webkit (Chrome, Safari, Edge) */
input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  border: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-accent); /* Usando tu variable CSS mapeada por @theme */
  cursor: pointer;
  margin-top: -6px; /* Ajusta la posición vertical del thumb */
  box-shadow: 0 0 0 4px rgba(var(--color-accent-rgb), 0.3); /* Ring de enfoque */
  transition:
    background 0.2s ease,
    box-shadow 0.2s ease;
}

input[type='range']::-webkit-slider-thumb:hover {
  background: var(--color-accent-light);
}
input[type='range']::-webkit-slider-thumb:active {
  box-shadow: 0 0 0 6px rgba(var(--color-accent-rgb), 0.5);
}

/* Firefox */
input[type='range']::-moz-range-thumb {
  border: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-accent);
  cursor: pointer;
  box-shadow: 0 0 0 4px rgba(var(--color-accent-rgb), 0.3);
  transition:
    background 0.2s ease,
    box-shadow 0.2s ease;
}

input[type='range']::-moz-range-thumb:hover {
  background: var(--color-accent-light);
}
input[type='range']::-moz-range-thumb:active {
  box-shadow: 0 0 0 6px rgba(var(--color-accent-rgb), 0.5);
}

/* IE */
input[type='range']::-ms-thumb {
  border: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-accent);
  cursor: pointer;
  box-shadow: 0 0 0 4px rgba(var(--color-accent-rgb), 0.3);
  transition:
    background 0.2s ease,
    box-shadow 0.2s ease;
}

input[type='range']::-ms-thumb:hover {
  background: var(--color-accent-light);
}
input[type='range']::-ms-thumb:active {
  box-shadow: 0 0 0 6px rgba(var(--color-accent-rgb), 0.5);
}

/* Track styles */
input[type='range']::-webkit-slider-runnable-track {
  width: 100%;
  height: 8px;
  background: var(--color-primary-light);
  border-radius: 5px;
}
input[type='range']::-moz-range-track {
  width: 100%;
  height: 8px;
  background: var(--color-primary-light);
  border-radius: 5px;
}
input[type='range']::-ms-track {
  width: 100%;
  height: 8px;
  background: transparent; /* Must be transparent for IE to work */
  border-color: transparent;
  color: transparent;
}
input[type='range']::-ms-fill-lower {
  background: var(--color-accent); /* Color for filled part in IE */
  border-radius: 5px;
}
input[type='range']::-ms-fill-upper {
  background: var(--color-primary-light);
  border-radius: 5px;
}

/* Necesitas definir tus variables RGB en src/styles.css para los ring-shadows */
/* Por ejemplo:
:root {
  --color-accent: #FF8360;
  --color-accent-rgb: 255, 131, 96; // Añade esta línea
}
*/
</style>
