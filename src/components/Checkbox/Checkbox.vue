<script setup>
  import { ref, watch, computed } from 'vue'

  import IconCheckmark from '@martyrs/src/modules/icons/navigation/IconCheckmark.vue';

  const props = defineProps({
    label: String,
    name: String,
    value: String,
    radio: {
      type: [Array, Boolean, Object],
      default: () => []
    },
    theme: {
      type: String,
      default: "light"
    },
    mode: {
      type: String,
      default: "switch",
      validator: (v) => ["switch", "checkbox"].includes(v)
    }
  })
  const emit = defineEmits(['update:radio'])
  const updateInputText = (event) => {
    if (Array.isArray(props.radio)) {
      let newRadio = [...props.radio];  // создаем копию массива для иммутабельности
      if (event.target.checked) {
        newRadio.push(props.value);
      } else {
        const index = newRadio.indexOf(props.value);
        if (index !== -1) {
          newRadio.splice(index, 1);
        }
      }
      emit('update:radio', newRadio);
    } else if (typeof props.radio === 'boolean') {
      emit('update:radio', event.target.checked);
    }
  }
</script>
<template>
  <label class="flex-v-center cursor-pointer flex-nowrap flex">
    <div v-if="label" class="mn-r-auto t-transp mn-r-small">
      <span>{{label}}</span>
    </div>
    <input 
      @change="updateInputText"
      class="round radiobutton" 
      type="checkbox" 
      :name="name" 
      :value="value"
      :checked="Array.isArray(radio) ? radio.includes(value) : radio"
    > 
    <div 
      class="cursor-pointer mn-l-thin flex-center field-wrapper"
      :class="{
        'transition-elastic pd-thin h-2r w-4r radius-extra': mode === 'switch',
        'w-2r h-2r radius-small': mode === 'checkbox',
        'bg-dark': !(Array.isArray(radio) ? radio.includes(value) : radio) && theme === 'dark' && mode === 'switch',
        'br-dark': theme === 'dark' && mode === 'checkbox',
        'bg-light': !(Array.isArray(radio) ? radio.includes(value) : radio) && theme === 'light' && mode === 'switch',
        'bg-light': !(Array.isArray(radio) ? radio.includes(value) : radio) && theme === 'light' && mode === 'checkbox','bg-main': (Array.isArray(radio) ? radio.includes(value) : radio) && mode === 'switch',
        'bg-main br-main': (Array.isArray(radio) ? radio.includes(value) : radio) && mode === 'checkbox',
      }"
    >
      <!-- Switch toggle circle -->
      <div 
        v-if="mode === 'switch'"
        class="transition-linear w-1r h-1r radius-extra bg-white"
        :class="{
          'mn-r-auto': !(Array.isArray(radio) ? radio.includes(value) : radio),
          'mn-l-auto': Array.isArray(radio) ? radio.includes(value) : radio,
        }"
      />
      <!-- Checkbox checkmark -->
      <span 
        v-else-if="mode === 'checkbox' && (Array.isArray(radio) ? radio.includes(value) : radio)"
        class="t-white w-100 h-100 flex flex-center"
      >
        <IconCheckmark class="i-medium" fill="rgb(var(--white))" />
      </span>
    </div>
  </label>
</template>