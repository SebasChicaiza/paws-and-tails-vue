<script setup lang="ts">
import { computed, useAttrs } from 'vue'

// Define las props que este componente aceptará
interface Props {
  modelValue: string | number // Valor enlazado con v-model
  label?: string // Etiqueta opcional para el input
  type?: string // Tipo de input (text, email, password, number, etc.)
  placeholder?: string // Texto de marcador de posición
  error?: string | null // Mensaje de error a mostrar
  id?: string // ID para el input (útil para accesibilidad con label)
  name?: string // Atributo 'name' para el input
  disabled?: boolean // Deshabilitar el input
  required?: boolean // Marcar como requerido
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text', // Por defecto, el tipo es texto
  label: '',
  placeholder: '',
  error: null,
  id: '',
  name: '',
  disabled: false,
  required: false,
})

// Define los eventos que este componente puede emitir
const emit = defineEmits(['update:modelValue'])

// Usamos useAttrs para pasar atributos no declarados directamente al input nativo.
// Esto permite que atributos como 'autocomplete', 'min', 'max', etc.,
// pasados al BaseInput sean aplicados al <input> real.
const attrs = useAttrs()

// Propiedad computada para manejar el v-model
const value = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  },
})

// Clases dinámicas para el input basadas en el estado de error
const inputClasses = computed(() => [
  'block',
  'w-full',
  'px-4',
  'py-2',
  'rounded-md',
  'border',
  'text-gray-900',
  'placeholder-gray-400',
  'focus:outline-none',
  'focus:ring-2',
  'transition-all',
  'duration-200',
  {
    'border-gray-300 focus:border-primary focus:ring-primary-light': !props.error, // Estilo normal
    'border-red-500 focus:border-red-500 focus:ring-red-200': props.error, // Estilo de error
    'bg-gray-100 cursor-not-allowed': props.disabled, // Estilo deshabilitado
  },
])

// ID para el input, si no se proporciona, genera uno para accesibilidad
const inputId = computed(
  () => props.id || `base-input-${Math.random().toString(36).substring(2, 9)}`,
)
</script>

<template>
  <div>
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <input
      :id="inputId"
      :type="type"
      :name="name"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      v-model="value"
      v-bind="attrs"
      :class="inputClasses"
    />
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
  </div>
</template>

<style scoped>
/* Opcional: Eliminar flechas de incremento/decremento en inputs tipo number */
input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  -moz-appearance: textfield; /* Firefox */
}
</style>
