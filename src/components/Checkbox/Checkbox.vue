<script setup>
  import { ref, watch, computed } from 'vue'

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

  <label class="flex-v-center flex-nowrap flex">
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
      class="transition-elastic cursor-pointer mn-l-thin pd-thin h-2r w-4r radius-extra"
      :class="{
        'bg-dark':!(Array.isArray(radio) ? radio.includes(value) : radio) && theme === 'dark',
        'bg-light':!(Array.isArray(radio) ? radio.includes(value) : radio) && theme === 'light',
        'bg-main':Array.isArray(radio) ? radio.includes(value) : radio,
      }"

    >
      <div 
        class="transition-linear w-1r h-1r radius-extra h-100 bg-white"
        :class="{
          'mn-r-auto':!(Array.isArray(radio) ? radio.includes(value) : radio),
          'mn-l-auto':Array.isArray(radio) ? radio.includes(value) : radio,
        }"
      >
      </div>
    </div>
  </label>

</template>