<template>
  <!-- Input Wrapper -->
  <div 
    @click.stop="toggleMenu"  
    v-click-outside="clickedOutside" 
    :class="$attrs.class" 
    class="cursor-pointer flex-v-center flex-nowrap flex pos-relative"
  >
    <!-- Label -->
    <span v-if="label" class="t-transp mn-r-small">{{label}}</span>
    
    <!-- Input -->
    <span>
      {{ optionsSelected ? (optionsSelected.name || optionsSelected[props.value] || optionsSelected) : placeholder  }}
    </span>

    <!-- Dropdown menu -->
    <transition mode="out-in" name="TransitionTranslateY">
      <ul 
        v-show="showMenu" 
        :class="$attrs.class"
        class="bs-black pos-absolute pos-t-100 pos-l-0 z-index-5 w-100 mn-t-thin"
        style="min-width: max-content;"
      >
        <li @click.stop="selectOption(option)" v-for="option in optionsListed" class="text-box-trim">
          <span v-if="option" class="w-100">

            {{ option.name || option[props.value] || option }}
          </span>
        </li>
      </ul>
    </transition>
  </div>

  <!-- Validation -->
  <transition mode="out-in" name="fade">
    <div v-if="validation" class="mn-t-thin invalid-feedback">
      * {{validation.message}}
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

import clickOutside from '../FieldPhone/click-outside.js';

let vClickOutside = clickOutside

const emit = defineEmits([
  'update:select', 
  'focus', 
  'blur'
])

const props = defineProps({
  label: String,
  placeholder: { type: String, default: 'Please select an item' },
  select: [String, Object],
  property: String,
  value: String,
  options: { type: Array, default: () => [] },
  validation: Boolean,
})

const showMenu = ref(false)

const optionsSelected = ref(
  props.property 
  ? findObjectByValue(props.select, props.property, props.options) 
  : props.select
)

const optionsListed = computed(() => {
  return props.select 
  ? props.options.filter(option => option !== props.select) 
  : props.options
})

watch(() => props.select, (newSelect) => {
  optionsSelected.value = 
  props.property 
  ? findObjectByValue(props.select, props.property, props.options) 
  : props.select;
});

const toggleMenu = () => {
  showMenu.value = !showMenu.value

  emit(showMenu.value ? 'focus' : 'blur')
}

function clickedOutside () {
  showMenu.value = false
}

const selectOption = option => {
  optionsSelected.value = option
  
  toggleMenu()

  if (props.property) {  
    emit('update:select', optionsSelected.value[props.property])
  } else {
    emit('update:select', optionsSelected.value)
  }
}

function findObjectByValue (value, property, objects) {
  for (const object of objects) {
    if (object[property] === value || object === value) {
      return object;
    }
  }
  return null;
}
</script>

<style lang="scss" scoped>
  li {
    list-style-type: none;
  }

  ul li {
    line-height: 2;
  }
</style>
