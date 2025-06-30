<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import IconShow from '@martyrs/src/modules/icons/actions/IconShow.vue';

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
const showPassword = ref(false);

function resize() {
  if (!textarea.value) {
    textarea.value.style.height = '';
    return;
  }
  const el = textarea.value;
  el.style.height = '';
  const scrollHeight = el.scrollHeight;
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

watch(() => props.field, () => {
  if (props.type === 'textarea') {
    nextTick(resize);
  }
});

watch(() => props.autofocus, (newVal) => {
  if (newVal) {
    nextTick(focus);
  }
});

onMounted(() => {
  nextTick(focus);
  nextTick(resize);
});

const text = ref(props.field);
</script>

<template>
  <div
    :class="[
      $attrs.class,
      { 'bg-fourth-nano': validation }
    ]"
    class="field-wrapper flex-center flex-nowrap flex"
  >
    <div
      v-if="label"
      class="t-transp mn-r-small"
    >
      <span class="t-nowrap">
        {{label}}
      </span>
    </div>
    <div class="w-100 pos-relative">
      <input
        v-if="type !== 'textarea'"
        ref="input"
        @input="event => text = emit('update:field', event.target.value)"
        @focus="event => emit('focus', event)"
        @blur="event => emit('blur', event)"
        :type="type === 'password' && !showPassword ? 'password' : type === 'password' ? 'text' : type"
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
    <IconShow
      v-if="type === 'password'"
      :show="!showPassword"
      @click="showPassword = !showPassword"
      class="i-medium cursor-pointer"
    />
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

<style>
input,
textarea,
span {
  line-height: 1;
  color: inherit;
}

textarea {
  resize: none;
  overflow: hidden; 
  line-height: 1rem;
  height: 1rem;
}

input[type="date"]::-webkit-calendar-picker-indicator,
input[type="time"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
  opacity: 1;
  color: inherit;
}

.field-wrapper {
  transition: border-width .2s, box-shadow .2s ease;
}

.field-wrapper:hover {
  box-shadow: 0 0 6px 2px rgba(var(--dark), 0.1);
}
.field-wrapper:focus-within {
  border: 1px solid rgba(var(--second), 1);
  box-shadow: 0 0 6px 2px rgba(var(--second), 0.1);
}
</style>