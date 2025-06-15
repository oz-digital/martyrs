<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
const emit = defineEmits(['update:field', 'focus', 'blur']);
const props = defineProps({
  label: null,
  symbol: null,
  type: 'text',
  placeholder: 'Enter something here',
  field: null,
  value: null,
  validation: false,
  disabled: null,
  tabindex: -1,
  autofocus: false
});
if (props.value) {
  emit('update:field', props.value)
}
const textarea = ref(null);
const input = ref(null);

function resize() {
  if (!textarea.value) {
    textarea.value.style.height = '';
    return;
  }
  
  const el = textarea.value;
  
  // Сначала сбрасываем высоту для правильного расчета scrollHeight
  el.style.height = '';
  
  const scrollHeight = el.scrollHeight;
  
  // Теперь устанавливаем высоту на основе scrollHeight
  if (scrollHeight > 33) {
    el.style.height = scrollHeight + 'px';
  } else {
    el.style.height = '';
  }
}


function focus() {
  if (props.autofocus) {
    if (props.type === 'textarea' && textarea.value) {
      textarea.value.focus();
    } else if (input.value) {
      input.value.focus();
    }
  }
}

// Следим за изменениями поля
watch(() => props.field, () => {
  if (props.type === 'textarea') {
    nextTick(resize);
  }
});

// Autofocus
watch(() => props.autofocus, (newVal) => {
  if (newVal) {
    nextTick(focus);
  }
});

onMounted(() => {
  nextTick(focus);
});

const text = ref(props.field);
</script>
<template>
  <div 
    :class="[
      $attrs.class, 
      { 
        'bg-fourth-nano': validation 
      }
    ]" 
    class="flex-center flex-nowrap flex"
  >
    <div 
      v-if="label" 
      class="t-transp mn-r-small"
    >
      <span class="t-nowrap">
        {{label}}
      </span>
    </div>
    <div class="w-100">
      <input 
        v-if="type !== 'textarea'"
        ref="input"
        @input="event => text = emit('update:field', event.target.value)"
        @focus="event => emit('focus', event)"
        @blur="event => emit('blur', event)"
        :type="type"
        class="w-100"
        :value="field"
        :placeholder="placeholder"
        :tabindex="tabindex"
        :disabled="disabled"
        :autofocus="autofocus"
      />
      <textarea 
        v-else
        ref="textarea"
        @input="event => text = emit('update:field', event.target.value)"
        @focus="event => emit('focus', event)"
        @blur="event => emit('blur', event)"
        class="w-100"
        :value="field"
        :placeholder="placeholder"
        :tabindex="tabindex"
        :disabled="disabled"
      />
    </div> 
    <slot></slot>
    <div 
      v-if="symbol" 
      class="t-transp mn-l-small"
    >
      <span>
        {{symbol}}
      </span>
    </div>
  </div>
  <!-- Validation -->
  <transition name="fade">
    <div v-if="validation" class="mn-t-thin mn-b-thin mn-b-thin invalid-feedback">
      * {{validation.message}}
    </div>
  </transition>
</template>
<style scoped>
input, textarea, span {
  line-height: 1;
  color: inherit;
}
textarea {
  resize: none;
  overflow: hidden;
  height: 1rem; 
  line-height: 1rem;
}
input[type="date"]::-webkit-calendar-picker-indicator,
input[type="time"]::-webkit-calendar-picker-indicator {
  filter: invert(1); /* Это инвертирует иконку, подходит при светлом фоне */
  opacity: 1;
  color: inherit;
}
</style>