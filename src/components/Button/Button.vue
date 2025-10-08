<script setup>
import { ref } from 'vue'

import Loader from '@martyrs/src/components/Loader/Loader.vue'

import IconCheckmark from '@martyrs/src/modules/icons/navigation/IconCheckmark.vue';
import IconCross from '@martyrs/src/modules/icons/navigation/IconCross.vue';

const props = defineProps({
  submit: {
    type: Function,
    default: async () => { console.log('Button click.') }
  },
  text: {
    type: Object,
    default: () => ({
      success: null,
      error: null
    })
  },
  counter: {
    type: Object
  },
  callback: {
    type: Function,
    default: async () => { console.log('Button callback.') }
  },
  callbackDelay: {
    type: Number,
    default: 750
  },
  showSucces: {
    type: Boolean,
    default: true
  },
  showLoader: {
    type: Boolean,
    default: true
  },
  validation: {
    type: Boolean,
    default: false
  },
})

const emits = defineEmits(['error'])

const button = ref(null)
const error = ref(null)
const loading = ref(false)
const finished = ref(false)

async function Submit() {
  console.log('click')
  
  button.value.style['pointer-events'] = 'none'
  error.value = null
  loading.value = true

  // Функция для сброса состояния кнопки
  const resetButton = () => {
    if (button.value) {
      button.value.style.pointerEvents = 'auto'
      loading.value = false
      finished.value = false
      error.value = null
    }
  }

  try {
    await props.submit()

    button.value.classList.replace('bg-main', 'bg-second')
    loading.value = false

    // Используем функцию сброса состояния кнопки здесь
    if (props.showSucces) { 
      finished.value = true
      setTimeout(() => {
        resetButton()
        button.value.classList.replace('bg-second', 'bg-main')
      }, 500)
    } else {
      resetButton()
      button.value.classList.replace('bg-second', 'bg-main')
    }

    // Если есть callback, мы также установим таймер для его вызова
    if (props.callback) setTimeout(() => props.callback(), props.callbackDelay)

  } catch (err) {
    emits('error', err)
    // Если возникла ошибка, мы изменяем стили и устанавливаем сообщение об ошибке
    button.value.classList.replace('bg-main', 'bg-fourth-nano')
    loading.value = false
    error.value = true
    
    // После задержки снова сбрасываем состояние кнопки
    setTimeout(() => {
      resetButton()
      // Так как класс кнопки был изменен, вернем его в исходное состояние
      button.value.classList.replace('bg-fourth-nano', 'bg-main')
    }, 1330)
  }
}
</script>

<template>
  <button 
    @click.stop="Submit"
    :disabled="validation"
    ref="button"
		class="button"
    :class="{ 'button--disabled': loading || validation }"
  >
    <Transition name="content" mode="out-in">
      <!-- Default slot content -->
      <span v-if="!loading && !error && !finished || !showLoader" class="button-content">
        <slot></slot>
      </span>
      <!-- Loading state -->
      <Loader v-else-if="loading && !error && showLoader"   class="icon button-content pos-relative pos-t-0 pos-l-0 loading"/>
      <!-- Success state -->
      <span v-else-if="finished && showSucces" class="button-content t-semi t-center w-100 loading t-black">
        <template v-if="text.success">
          {{ text.success }}
        </template>
        <IconCheckmark v-else class="icon" />
      </span>
      <!-- Error state -->
      <span v-else-if="error" class="button-content t-center w-100 error">
        <template v-if="text.error">
          {{ text.error }}
        </template>
        <IconCross v-else class="icon" />
      </span>
    </Transition>
    
    <!-- Counter -->
    <div v-if="counter" class="button-counter flex flex-center">
      <span>{{ counter }}</span>
    </div>
  </button>
</template>

<style lang="scss">
button[disabled] {
  opacity: 0.75 !important;
  pointer-events: none !important;
  cursor: default !important;
  color: rgba(var(--dark), 0.33) !important;
  background: rgba(var(--light), 1) !important;
}

a.button {
  text-box: trim-both cap alphabetic;
}

.button {
  display: flex;
  padding: var(--small);
  border-radius: var(--small);
  text-box: trim-both cap alphabetic;
  transform: scale(1);
  opacity: 1;
  align-items: center;
  justify-content: center;
  color: black;
  text-align: center;
  font-size: 1rem;
  letter-spacing: 5%;
  transition: all 0.33s ease;

  &:hover {
    cursor: pointer;
    opacity: 0.9;
  }

  &:active {
    transform: scale(0.95);
  }

  &-small {
    padding: 0.75rem;
    border-radius: 0.5rem;
    height: fit-content;
  }

  .button-counter {
    position: absolute;
    right: -8px;
    bottom: -8px;
    background: yellow;
    height: 16px;
    border-radius: 16px;
    width: 16px;
    font-weight: 500;
    text-align: center;
    line-height: 16px;
    font-size: 10px;
  }
}

.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.icon {
  width: 1rem;
  height: 1rem;
}

/* Vue Transitions */
.content-enter-active,
.content-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.content-enter-from {
  opacity: 0;
  transform: translateY(8px) scale(0.95);
}

.content-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

.content-enter-to,
.content-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
</style>