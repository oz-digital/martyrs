<template>
  <!-- Content -->
  <section>
    <Draggable 
      :list="post.content" 
      @update:list="updateContent" 
      @start="handleDragStart" 
      @end="handleDragEnd" 
      disabledClass="no-drag"
    >
      <div
        v-for="(block, index) in post.content"
        :key="block.id" 
        :data-index="index"
        draggable="true"
        class="draggable-item pos-relative"
      >
        <div 
          @mouseover="showControls = index, showMenu = false"
          class="pos-relative w-full h-full"
        >
          <component
            v-model="block.content"
            :is="ComponentMap[block.type]"
            :index="index"
            :component="block"
            :prop="block"
            :placeholder="block.placeholder"
            :class="block.class"
            :setFocus="block.setFocus"
            @deleteBlock="handleDeleteBlock"
            @addBlock="handleAddBlock"
            @updateBlock="handleUpdateBlock"
          />
        </div>

        <transition name="fade">
          <div 
            v-if="showControls === index" 
            class="pos-absolute z-index-4 i-medium" 
            style="right: calc(100% + 0.5rem); top: calc(50% - 1.125rem);"
          >
            <button 
              @click="showMenu = !showMenu" 
              class="mn-b-small cursor-pointer w-100 i-medium bg-white radius-thin"
            >
              {{ block.content ? '⋯' : '+' }}
            </button>
            
            <div 
              v-if="showMenu" 
              class="z-index-5 radius-thin pd-thin bg-white w-max mn-b-small flex-nowrap flex-column flex"
            >
              <span 
                v-if="index !== 0"
                @click="handleDeleteBlock(block)" 
                class="mn-b-thin w-max t-red bg-white button-small button"
              >
                Remove
              </span>
              <span 
                @click="handleAddBlock('ImageUpload', '', index)" 
                class="mn-b-thin w-max t-black bg-white button-small button"
              >
                Add Image
              </span>
              <span 
                @click="handleAddBlock('H2', '', index)"
                class="w-max button-small t-black bg-white button"
              >
                Add Title
              </span>
              <span 
                @click="handleAddBlock('Card', { photo: '', title: '', subtitle: '', }, index)"
                class="w-max button-small t-black bg-white button"
              >
                Add Card
              </span>
              <span 
                @click="handleAddBlock('Embed', '', index)"
                class="w-max button-small t-black bg-white button"
              >
                Add Embed
              </span>
              <span 
                @click="handleAddBlock('Audio', '', index)"
                class="w-max button-small t-black bg-white button"
              >
                Add Audio
              </span>
              <span 
                @click="handleAddBlock('Video', '', index)"
                class="w-max button-small t-black bg-white button"
              >
                Add Video
              </span>
            </div>
          </div>
        </transition>
      </div>
    </Draggable>
  </section>
</template>


<script setup>
import Textarea     from '../elements/Textarea.vue';
import ImageUpload  from '../elements/ImageUpload.vue';
import Embed        from '../elements/Embed.vue';
import Card        from '../elements/Card.vue';
import Audio        from '../elements/Audio.vue';
import Video        from '../elements/Video.vue';

import Draggable        from '@martyrs/src/components/Draggable/Draggable.vue';

import { ref, onMounted, watchEffect, computed } from 'vue';
import { v4 as uuidv4 } from 'uuid'

const props = defineProps({
  content: {
    type: Array
  },
  notitle: {
    type: Boolean
  }
});

const emits = defineEmits(['update'])

let publics = ref(null);
let post = ref(null); 

const showControls = ref(null)
const showMenu = ref(false)

const ComponentMap = {
  'Textarea': Textarea,
  'H2': Textarea,
  'Card': Card,
  'ImageUpload': ImageUpload,
  'Embed': Embed,
  'Audio': Audio,
  'Video': Video,
};

post.value = { content: props.content }; 

onMounted(() => {
  if (post.value && post.value.content.length === 0) {
    handleAddBlock('Textarea', '', 0, null, 'h2', 'Enter title');
  }
})

const updateContent = (newContent) => {
  post.value.content = newContent;
};

const handleDragStart = (startIndex) => {
  console.log('Drag started from index:', startIndex);
};

const handleDragEnd = (startIndex, endIndex) => {
  console.log('Drag ended. Start index:', startIndex, 'End index:', endIndex);
};

function handleAddBlock(type = 'Textarea', content = '', index, data, classBlock = '', placeholder = '', id = uuidv4()) {
  let blockNew = {
    id: id,
    type: type,
    style: '',
    class: classBlock,
    placeholder: placeholder,
    content: content,
    blocks: [],
    setFocus: true,
  };
  
  if (index !== undefined) {
    post.value.content.splice(index + 1, 0, blockNew);
  } else {
    post.value.content.push(blockNew);
  }
  
  showControls.value = null
  emits('update', post.value.content);
}

function handleUpdateBlock(block, update) {
  const index = post.value.content.findIndex(item => item === block);

  if (index !== -1) {
    post.value.content[index] = { ...post.value.content[index], ...update };
  }
  emits('update', post.value.content);
}

function handleDeleteBlock(blockToDelete, options = {}) {
  const index = post.value.content.findIndex(block => block.id === blockToDelete.id)

  if (index !== -1 && index !== 0) {
    post.value.content.splice(index, 1)
    
    if (index > 0) {
      const previousBlock = post.value.content[index - 1]
      previousBlock.setFocus = true
      previousBlock.setCaretToEnd = true
    }
  }
  
  emits('update', post.value.content)
}
</script>


<style lang="scss">

</style>
