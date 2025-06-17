<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router' // Importa RouterLink para integración con Vue Router

// Define los tipos de variantes de estilo y tamaños disponibles para el botón
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

// Define las propiedades (props) que el componente puede aceptar
interface Props {
  variant?: ButtonVariant // Estilo del botón (ej. primary, accent)
  size?: ButtonSize // Tamaño del botón (ej. sm, md, lg)
  disabled?: boolean // Si el botón está deshabilitado
  to?: string // Ruta para Vue Router (si el botón actúa como router-link)
  href?: string // URL para enlace externo (si el botón actúa como <a>)
  type?: 'button' | 'submit' | 'reset' // Tipo HTML para botones de formulario
}

// Establece valores por defecto para las props
const props = withDefaults(defineProps<Props>(), {
  variant: 'primary', // Por defecto, es un botón primario
  size: 'md', // Por defecto, tamaño mediano
  disabled: false, // Por defecto, habilitado
  type: 'button', // Por defecto, tipo "button"
})

// Define los eventos que el componente puede emitir
const emit = defineEmits(['click'])

// Clases base que se aplican a todos los botones para estilos comunes
const baseClasses =
  'font-medium rounded-lg transition ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'

// Propiedad computada para determinar las clases de estilo según la variante
const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      // Usando tus colores de la paleta
      return 'bg-primary text-white hover:bg-primary-dark focus:ring-primary'
    case 'secondary':
      return 'bg-primary-light text-primary-dark hover:bg-primary-light/80 focus:ring-primary-light'
    case 'accent':
      return 'bg-accent text-white hover:bg-accent-light focus:ring-accent'
    case 'outline':
      return 'border border-primary text-primary hover:bg-primary/5 focus:ring-primary'
    case 'ghost':
      // Un botón transparente, ideal para acciones secundarias o textuales
      return 'text-primary hover:bg-primary-light/20 focus:ring-primary'
    case 'danger':
      // Para acciones destructivas (ej. eliminar)
      return 'bg-error text-white hover:bg-error/80 focus:ring-error'
    default:
      return ''
  }
})

// Propiedad computada para determinar las clases de tamaño
const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-3 py-1.5 text-sm' // Pequeño
    case 'md':
      return 'px-4 py-2 text-base' // Mediano (base)
    case 'lg':
      return 'px-6 py-3 text-lg' // Grande
    default:
      return ''
  }
})

// Propiedad computada para las clases de estado deshabilitado
const disabledClasses = computed(() => {
  return props.disabled ? 'opacity-50 cursor-not-allowed' : ''
})

// Manejador de clic que emite el evento solo si el botón no está deshabilitado
const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event)
  }
}

// Determina qué etiqueta HTML usar para el componente (button, a, o router-link)
const Tag = computed(() => {
  if (props.to) return RouterLink // Si tiene 'to' prop, es un router-link
  if (props.href) return 'a' // Si tiene 'href' prop, es un enlace <a>
  return 'button' // Por defecto, es un botón <button>
})
</script>

<template>
  <component
    :is="Tag"
    :to="to"
    :href="href"
    :type="Tag === 'button' ? type : undefined"
    :class="[baseClasses, variantClasses, sizeClasses, disabledClasses]"
    :disabled="disabled"
    @click="handleClick"
  >
    <slot></slot>
  </component>
</template>

<style scoped>
/* No se necesitan estilos con `scoped` aquí ya que Tailwind CSS maneja la mayoría de los estilos.
   Las transiciones de hover/focus son manejadas por las clases de Tailwind. */
</style>
