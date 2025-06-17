<script setup lang="ts">
interface Option {
  value: string
  label: string
}

interface Props {
  modelValue: string // Para v-model
  options: Option[]
  id?: string
  name?: string
  label?: string
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

const handleChange = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLSelectElement).value)
}
</script>

<template>
  <div class="relative">
    <label v-if="label" :for="id" class="sr-only">{{ label }}</label>
    <select
      :id="id"
      :name="name"
      :value="modelValue"
      @change="handleChange"
      class="block w-full p-2.5 bg-primary-light border border-primary text-text-dark font-semibold rounded-full shadow-sm appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 hover:bg-primary-lighter cursor-pointer"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
    <div
      class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-primary-dark"
    >
      <svg
        class="h-5 w-5"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clip-rule="evenodd"
        />
      </svg>
    </div>
  </div>
</template>

<style scoped>
/* Opcional: para quitar la flecha nativa en algunos navegadores si `appearance-none` no es suficiente */
select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}
</style>
