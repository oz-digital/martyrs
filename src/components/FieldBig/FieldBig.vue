<template>
  <Field
    v-model:field="inputField"
    @update:field="updateInput"
    :placeholder="typing ? '' : placeholder"
    @input="handleInput"
    @focus="handleFocus"
    @blur="checkInput"
    :name="fieldName"
    :id="fieldId"
    :validation="validation"
    class="radius-medium flex-nowrap flex  w-100 p-regular t-regular uppercase pd-thin"
  >
    <slot></slot>
    <Button
      :submit="handleAction"
      :showSucces="showSuccess"
      :showLoader="showLoader"
      :callback="callback"
      :callbackDelay="callbackDelay"
      class="t-nowrap t-medium radius-small uppercase cursor-pointer flex flex-v-center pd-thin w-max hover-bg-fifth t-semi transition-linear transition-timing-1 t-black bg-main"
    >
      <span v-if="action" class="desktop-only mn-r-thin">{{action}}</span>
      <IconArrow class="i-medium"/>
    </Button>
</Field>
</template>

<script setup="props">
  import { ref, watchEffect, onMounted } from 'vue'
  import Field from '@martyrs/src/components/Field/Field.vue'
  import Button from '@martyrs/src/components/Button/Button.vue'
  import IconArrow from '@martyrs/src/modules/icons/navigation/IconArrow.vue'
  import { useI18n } from 'vue-i18n'

  // Генерируем уникальный ID для каждого экземпляра
  const uniqueId = Math.random().toString(36).substr(2, 9)

  const props = defineProps({
    input: String,
    placeholder: {
      type: String
    },
    action: {
      type: String
    },
    placeholderTexts: {
      type: Object,
      default: () => ({
        en: [
          'Lowest THC, please!',
          'Something with banana flavors?',
          "I'm in the mood for trippy vibes."
        ],
        ru: [
          'Я хочу самый низкий THC',
          'Я хочу чего-нибудь бананового',
          'Я хочу курнуть хейза'
        ],
      })
    },
    typingSpeed: {
      type: Number,
      default: 200
    },
    loopTyping: {
      type: Boolean,
      default: false
    },
    enableTyping: {
      type: Boolean,
      default: false
    },
    showLoader: {
      type: Boolean,
      default: true
    },
    showSuccess: {
      type: Boolean,
      default: true
    },
    callback: {
      type: Function,
      default: null
    },
    callbackDelay: {
      type: Number,
      default: 750
    },
    name: {
      type: String,
      default: null
    },
    id: {
      type: String,
      default: null
    },
    validation: {
      type: [Object, Boolean],
      default: false
    }
  });

  // Уникальные имена для полей
  const fieldName = props.name || `field-big-${uniqueId}`
  const fieldId = props.id || `field-big-${uniqueId}`

  const { t, locale } = useI18n()

  let placeholderIndex = ref(0)

  let inputField = ref(props.input)
  let inputPlaceholder = ref(props.placeholder)
  let typing = ref(props.enableTyping)
  let typeInterval = ref(null)
  let userText = ref('') // Stores user input
  let cursorVisible = ref(true)
  let cursorInterval = null

  const emit = defineEmits(['update:input',  'action']);

  function emitAction() {
    emit('action')
  }

  async function handleAction() {
    const result = emit('action')
    // Если обработчик вернул промис, ждем его
    if (result && typeof result.then === 'function') {
      return result
    }
    // Иначе возвращаем resolved промис
    return Promise.resolve(result)
  }
  
  function updateInput(event) {
     emit('update:input', event)
     userText.value = event // Stores user input
  }

  function handleInput() {
    placeholderIndex.value = (placeholderIndex.value + 1) % props.placeholderTexts[locale.value].length
  }

  function handleFocus() {
    typing.value = false

    clearInterval(typeInterval.value)

    inputPlaceholder.value = props.placeholder

    if (!userText.value) {
      inputField.value = ''
    }
  }

  function checkInput() {
    if (!userText.value && props.enableTyping) {
      typing.value = true
      inputPlaceholder.value = ''
      startTyping()
    }
  }

  function startTyping() {
    let placeholderText = props.placeholderTexts[locale.value][placeholderIndex.value]
    let i = 0
    let typingBackwards = false
  
    // Start the cursor blinking
    cursorInterval = setInterval(() => {
      cursorVisible.value = !cursorVisible.value
    }, 200)

    typeInterval.value = setInterval(() => {
      if (typing.value) {
        if (!typingBackwards) {
          inputField.value = placeholderText.substring(0, i) + (cursorVisible.value && i % 2 ? '|' : '')
          i++
        } else {
          inputField.value = inputField.value.slice(0, -1)
          inputField.value = placeholderText.substring(0, i) + (cursorVisible.value && i % 2 ? '|' : '')
          i--
        }

        if (i > placeholderText.length && props.loopTyping) {
          setTimeout(() => {
            typingBackwards = true
            inputField.value = placeholderText.substring(0, i)
          }, 333)
        }

        if (i === 0 && typingBackwards) {
          typingBackwards = false
          handleInput()
          placeholderText = props.placeholderTexts[locale.value][placeholderIndex.value]
        }
      }
    }, props.typingSpeed)
  }


  onMounted(() => {
    if (props.enableTyping) startTyping()
  })

  watchEffect(() => {
    if (!typing.value) {
      clearInterval(typeInterval.value)
      clearInterval(cursorInterval)
    }
  })
</script>

<style lang="scss">
</style>