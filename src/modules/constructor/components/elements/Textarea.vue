<template>
  <div>
    <div 
      ref="editableDiv"
      :contenteditable="true"
      @input="handleInput"
      @paste="handlePaste"
      @keydown="handleKeyDown"
      tabindex="0"
      class="editable-div mn-b-thin"
      :class="{
        't-main t-semi': prop.type === 'Link',
        'h3': prop.type === 'H2'
      }"
    />
    <div v-if="isTextSelected" class="formatting-bar">
      <button @click="applyFormat('bold')" title="Bold"><b>B</b></button>
      <button @click="applyFormat('italic')" title="Italic"><i>I</i></button>
      <button @click="applyFormat('underline')" title="Underline"><u>U</u></button>
      <button @click="applyFormat('strikeThrough')" title="Strikethrough"><s>S</s></button>
      <button @click="createLink" title="Insert Link">🔗</button>
      <button @click="applyFormat('unlink')" title="Remove Link">⛓️‍💥</button>
      <button @click="applyFormat('justifyLeft')" title="Align Left">↲</button>
      <button @click="applyFormat('justifyCenter')" title="Align Center">↔</button>
      <button @click="applyFormat('justifyRight')" title="Align Right">↳</button>
      <button @click="applyFormat('insertUnorderedList')" title="Bulleted List">•</button>
      <button @click="applyFormat('insertOrderedList')" title="Numbered List">1.</button>
      <button @click="clearFormatting" title="Clear Formatting">🧹</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onUpdated, onUnmounted, watch } from 'vue'
import DOMPurify from 'isomorphic-dompurify'

const sanitizeConfig = {
  ALLOWED_TAGS: ['b', 'i', 'u', 's', 'a', 'ul', 'ol', 'li', 'img', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table', 'thead','tr','th'],
  ALLOWED_ATTR: ['href', 'target', 'src', 'alt'],
  ALLOWED_STYLES: ['text-align']
}

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  prop: {
    type: Object,
    required: true
  },
  component: Object,
  placeholder: String,
  index: Number,
  setFocus: Boolean
})

const emit = defineEmits([
  'update:modelValue', 
  'deleteBlock', 
  'updateBlock', 
  'addBlock'
])

const editableDiv = ref(null)
const isTextSelected = ref(false)
const currentContent = ref('')

// Обновляем содержимое при монтировании
onMounted(() => {
  if (editableDiv.value) {
    if (props.modelValue) {
      editableDiv.value.innerHTML = props.modelValue
      currentContent.value = props.modelValue
    }
  }

  document.addEventListener('selectionchange', handleSelectionChange)
  
  if (props.setFocus) {
    nextTick(() => focus())
  }
})

// // Отслеживаем изменения в modelValue и обновляем DOM, если они есть
// watch(() => props.modelValue, (newValue) => {
//   if (editableDiv.value && newValue !== currentContent.value) {
//     editableDiv.value.innerHTML = newValue || ''
//     currentContent.value = newValue
//   }
// }, { immediate: true })

const handleInput = (event) => {
  const sanitizedContent = sanitizeHTML(event.target.innerHTML)
  currentContent.value = sanitizedContent
  emit('update:modelValue', sanitizedContent)
}
// Улучшенная функция для извлечения нужных элементов из DOM-структуры
const extractUsefulContent = (node) => {
  const result = [];
  
  // Функция для определения, содержит ли узел только один из нужных нам тегов
  const containsOnlySingleImportantTag = (node) => {
    const importantElements = node.querySelectorAll('p, h1, h2, h3, h4, h5, h6, img');
    
    // Если найден только один важный элемент и нет текста непосредственно в узле
    if (importantElements.length === 1 && !Array.from(node.childNodes).some(child => 
      child.nodeType === Node.TEXT_NODE && child.textContent.trim()
    )) {
      // Убедимся, что этот элемент не содержит других важных элементов
      return !importantElements[0].querySelector('p, h1, h2, h3, h4, h5, h6, img');
    }
    
    return false;
  };
  
  // Рекурсивно просматривает дерево и извлекает только нужные элементы
  const processNode = (node) => {
    // Если это текстовый узел с непустым содержимым
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent.trim()) {
        // Создаем p-элемент для текста без родителя
        const p = document.createElement('p');
        p.textContent = node.textContent;
        result.push(p);
      }
      return;
    }
    
    // Если это не элемент, пропускаем
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    
    // Проверяем, что это один из нужных тегов
    const tagName = node.nodeName.toLowerCase();
    
    if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img'].includes(tagName)) {
      // Если это нужный тег - добавляем в результат
      result.push(node.cloneNode(true));
    } else if (containsOnlySingleImportantTag(node)) {
      // Если div содержит только один важный элемент, добавляем этот элемент
      const importantElement = node.querySelector('p, h1, h2, h3, h4, h5, h6, img');
      result.push(importantElement.cloneNode(true));
    } else {
      // Если это div или другой контейнер - проходим по его дочерним узлам
      Array.from(node.childNodes).forEach(child => {
        processNode(child);
      });
    }
  };
  
  processNode(node);
  return result;
};

const handlePaste = (event) => {
  event.preventDefault();
  const clipboardData = event.clipboardData || window.clipboardData;
  let pastedData = clipboardData.getData('text/html') || clipboardData.getData('text/plain');
  
  console.log('Raw pasted data:', pastedData);
  
  // Предварительная очистка через функцию sanitizeHTML
  const sanitizedContent = sanitizeHTML(pastedData);
  
  console.log('Sanitized content:', sanitizedContent);
  
  // Парсим очищенный HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(sanitizedContent, 'text/html');
  
  // Извлекаем полезное содержимое
  const extractedElements = extractUsefulContent(doc.body);
  
  console.log('Extracted elements:', extractedElements.map(el => el.outerHTML));
  
  if (extractedElements.length > 0) {
    // Вставляем каждый элемент как отдельный блок
    extractedElements.forEach((element, idx) => {
      const tagName = element.nodeName.toLowerCase();
      
      // Определяем тип блока в зависимости от тега
      let blockType = 'Textarea';
      let blockContent = '';
      
      if (tagName === 'img') {
        blockType = 'ImageUpload';
        // Для изображений сохраняем только src атрибут
        blockContent = element.getAttribute('src');
      } else if (tagName.match(/h[1-6]/)) {
        blockType = 'H2'; // Используем H2 для всех заголовков, или можно настроить по-разному
        blockContent = element.innerHTML;
      } else {
        // Для p и других текстовых элементов
        blockContent = element.innerHTML;
      }
      
      if (idx === 0) {
        // Первый блок обновляем текущий
        document.execCommand('insertHTML', false, element.innerHTML);
        handleInput({ target: editableDiv.value });
      } else {
        // Остальные добавляем как новые блоки
        emit('addBlock', blockType, blockContent, props.index + idx);
      }
    });
  } else {
    // Если после очистки ничего не осталось, вставляем как обычный текст
    const plainText = clipboardData.getData('text/plain');
    if (plainText.trim()) {
      // document.execCommand('insertText', false, plainText);
      handleInput({ target: editableDiv.value });
    }
  }
};


// Обновленная функция для обработки вставки и создания блоков
const handleBlockCreation = (element, index) => {
  const tagName = element.nodeName.toLowerCase();
  
  let blockType = 'Textarea';
  let blockContent = '';
  
  if (tagName === 'img') {
    blockType = 'ImageUpload';
    blockContent = element.getAttribute('src');
  } else if (tagName.match(/h[1-6]/)) {
    blockType = tagName.toUpperCase(); // H2, H3, etc.
    blockContent = element.innerHTML;
  } else {
    blockContent = element.innerHTML;
  }
  
  if (index === 0) {
    // Первый блок обновляем текущий
    document.execCommand('insertHTML', false, element.outerHTML);
    handleInput({ target: editableDiv.value });
  } else {
    // Остальные добавляем как новые блоки
    emit('addBlock', blockType, blockContent, props.index + index);
  }
};

const handleKeyDown = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    const selection = window.getSelection()
    const range = selection.getRangeAt(0)
    const newBlockContent = extractContentAfterCursor(range)
    
    const sanitizedContent = sanitizeHTML(editableDiv.value.innerHTML)
    currentContent.value = sanitizedContent
    
    emit('update:modelValue', sanitizedContent)
    emit('addBlock', 'Textarea', newBlockContent, props.index + 1)
  } else if (event.key === 'Backspace' && editableDiv.value.innerHTML.trim() === "") {
    event.preventDefault()
    emit('deleteBlock', props.prop, { setCaretToEnd: true })
  }
}

const extractContentAfterCursor = (range) => {
  const container = range.startContainer
  const cursorOffset = range.startOffset

  if (container.nodeType === Node.TEXT_NODE) {
    const textAfterCursor = container.textContent.slice(cursorOffset)
    container.textContent = container.textContent.slice(0, cursorOffset)
    return textAfterCursor
  } else if (container.nodeType === Node.ELEMENT_NODE) {
    const tempDiv = document.createElement('div')
    const childNodes = Array.from(container.childNodes)
    let foundCursor = false
    
    childNodes.forEach((node, index) => {
      if (index === cursorOffset) foundCursor = true
      if (foundCursor) tempDiv.appendChild(node.cloneNode(true))
    })
    
    while (container.childNodes[cursorOffset]) {
      container.removeChild(container.childNodes[cursorOffset])
    }
    
    return tempDiv.innerHTML
  }
  return ''
}

const handleSelectionChange = () => {
  if (document.activeElement === editableDiv.value) {
    const selection = window.getSelection()
    isTextSelected.value = selection.rangeCount > 0 && selection.toString().length > 0
  } else {
    isTextSelected.value = false
  }
}

const focus = (options = {}) => {
  nextTick(() => {
    editableDiv.value.focus()
    
    const shouldSetCaretToEnd = options.setCaretToEnd || (props.prop && props.prop.setCaretToEnd)
    if (props.setFocus === true && !shouldSetCaretToEnd) {
      const range = document.createRange()
      range.setStart(editableDiv.value, 0)
      range.collapse(true)
      const selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(range)
    } else {
      setCaretToEnd(editableDiv.value)
    }
    
    emit('updateBlock', props.prop, { setFocus: false, setCaretToEnd: false })
  })
}

const sanitizeHTML = (html) => {
  return DOMPurify.sanitize(html, sanitizeConfig)
}

const setCaretToEnd = (element) => {
  const range = document.createRange()
  const selection = window.getSelection()
  range.selectNodeContents(element)
  range.collapse(false)
  selection.removeAllRanges()
  selection.addRange(range)
}

const applyFormat = (format) => {
  document.execCommand(format, false, null)
  handleInput({ target: editableDiv.value })
}

const createLink = () => {
  const url = prompt('Enter the URL:')
  if (url) {
    document.execCommand('createLink', false, url)
    handleInput({ target: editableDiv.value })
  }
}

const clearFormatting = () => {
  const selection = window.getSelection()
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    const selectedContent = range.cloneContents()
    const div = document.createElement('div')
    div.appendChild(selectedContent)
    const plainText = div.innerText
    document.execCommand('insertText', false, plainText)
    handleInput({ target: editableDiv.value })
  }
}

onUpdated(() => {
  if (props.setFocus) {
    nextTick(() => focus())
  }
})

onUnmounted(() => {
  document.removeEventListener('selectionchange', handleSelectionChange)
})
</script>

<style lang="scss">
.editable-div {
  width: 100%;
  min-height: 1rem;
  background-color: transparent;
  outline: none;
  white-space: pre-wrap;
  word-wrap: break-word;
  
  &:empty::before {
    content: attr(placeholder);
    color: #999;
  }
  
  &:focus {
    border: 0;
  }
}

.formatting-bar {
  display: flex;
  gap: 5px;
  margin-top: 5px;
  padding: 5px;
  background-color: #f5f5f5;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  
  button {
    padding: 4px 8px;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 3px;
    cursor: pointer;
    font-size: 14px;
    min-width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
      background-color: #e0e0e0;
    }
    
    &:active {
      background-color: #d0d0d0;
    }
  }
}
</style>