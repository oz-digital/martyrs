<template>
  <div class="upload-image-wrapper flex-v-center flex-nowrap flex gap-small" :class="{'with-text': text}">
    <div 
      @click="onComponentClick"
      @drop="onDrop"
      @dragover.prevent
      class="pos-relative radius-small br-solid br-1px br-black-transp-10 h-100 aspect-1x1 flex-v-center flex-h-center flex cursor-pointer"
    >
      <img loading="lazy" 
        v-if="imageUrl || photo || previewUrl" 
        :src="previewUrl || (FILE_SERVER_URL || '') + (imageUrl || photo)"
        alt="Uploaded image" 
        class="pos-absolute  radius-small o-hidden z-index-1 w-100 h-100 object-fit-cover"
      />
      
      <div v-else class="flex-v-center pos-relative z-index-2 flex-h-center flex w-100 h-100 radius-small  bg-second" >
        <IconUpload class="i-medium upload-icon" fill="rgb(var(--white))" />
      </div>
      
      <!-- Hover controls -->
      <div class="z-index-2 pos-relative  hover-controls pos-absolute w-100 h-100 flex-v-center flex-h-center flex">
        <div v-if="!imageUrl && !photo && !previewUrl" class="hover-upload-icon">
          <IconUpload class="i-medium" fill="rgb(var(--white))" />
        </div>
        <div v-else class="hover-buttons flex gap-small">
          <button @click.stop="onComponentClick" class="hover-button radius-small pd-thin bg-main t-white br-none cursor-pointer">
            <IconUpload class="i-semi" fill="rgb(var(--white))" />
          </button>
          <button @click.stop="deleteImage" class="hover-button radius-small pd-thin bg-danger t-white br-none cursor-pointer">
            <IconDelete class="i-semi" fill="rgb(var(--white))" />
          </button>
        </div>
      </div>
      
      <!-- Loading overlay -->
      <div v-if="loading" class="z-index-2 loading-overlay pos-absolute w-100 h-100 flex-v-center flex-h-center flex">
        <Loader :centered="false" />
      </div>
      
      <input type="file" name="file" ref="fileInput" @change="onFileChange" style="display: none"/>
    </div>
    
    <!-- Text block -->
    <div v-if="text" class="upload-text-block  flex flex-column">
      <span class="mn-b-small t-medium">{{ textConfig.title }}</span>
      <span class="mn-b-medium t-transp">{{ textConfig.subtitle }}</span>
      <div v-if="!imageUrl && !photo && !previewUrl">
        <button @click="onComponentClick" class="button button-small w-max bg-main t-black cursor-pointer">
          {{ textConfig.buttonText }}
        </button>
      </div>
      <div v-else class="flex gap-thin">
        <button @click="onComponentClick" class="button button-small w-max bg-second t-white cursor-pointer">
          Upload 
        </button>
        <button @click="deleteImage" class="button button-small w-max bg-red t-white cursor-pointer">
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import axios from 'axios';
import Loader from '@martyrs/src/components/Loader/Loader.vue';
import IconUpload from '@martyrs/src/modules/icons/navigation/IconUpload.vue';
import IconDelete from '@martyrs/src/modules/icons/navigation/IconDelete.vue';

const imageUrl = ref(null);
const fileInput = ref(null);
const previewUrl = ref(null);
const loading = ref(false);

const props = defineProps({
  uploadPath: {
    type: String,
    required: true
  },
  photo: {
    type: String,
    default: null
  },
  text: {
    type: [Object, Boolean],
    default: null
  }
});

const emit = defineEmits(['update:photo', 'error']);

// Text configuration with defaults
const textConfig = computed(() => {
  const defaults = {
    title: 'Upload Image',
    subtitle: 'Drag & drop your image here or click button. Supported: JPG, PNG, GIF. Max size: 2MB',
    buttonText: 'Choose Image'
  };
  
  if (props.text === true) {
    return defaults;
  } else if (typeof props.text === 'object' && props.text !== null) {
    return {
      title: props.text.title || defaults.title,
      subtitle: props.text.subtitle || defaults.subtitle,
      buttonText: props.text.buttonText || defaults.buttonText
    };
  }
  
  return defaults;
});

watch(props, ({photo}) => {
  if(photo) imageUrl.value = photo;
});

function onComponentClick() {
  fileInput.value.click();
}

async function onFileChange(e) {
  let file = e.target.files[0];
  if (!file) {
    console.error("No file selected");
    return;
  }
  
  // Create preview from file
  const reader = new FileReader();
  reader.onload = (e) => {
    previewUrl.value = e.target.result;
  };
  reader.readAsDataURL(file);
  
  let formData = new FormData();
  formData.append("file", file);

  console.log("Sending file:", file.name); // Логируем имя файла перед отправкой
  
  loading.value = true;

  try {
    const $axios = axios.create({ baseURL: process.env.API_URL, withCredentials: true }); 

    let response = await $axios.post(`/api/upload/multiple?folderName=${encodeURIComponent(props.uploadPath)}`, formData);
    console.log("Upload response:", response); // Логируем ответ сервера
    imageUrl.value = response.data[0].filepath;
    previewUrl.value = null; // Clear preview after successful upload
    emit('update:photo', imageUrl.value);
  } catch (error) {
    emit('error', error);
    console.error("Upload error:", error); // Логируем ошибку
    previewUrl.value = null; // Clear preview on error
  } finally {
    loading.value = false;
  }
}


function onDrop(e) {
  e.preventDefault();
  onFileChange({
    target: {
      files: e.dataTransfer.files
    }
  });
}

function deleteImage() {
  imageUrl.value = null;
  previewUrl.value = null;
  emit('update:photo', null);
  // Reset file input
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}
</script>

<style scoped>
.image-upload-area {
  overflow: hidden;
  transition: all 0.3s ease;
}

.image-upload-area:hover {
  opacity: 0.95;
}

/* Hover controls */
.hover-controls {
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.7);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.image-upload-area:hover .hover-controls {
  opacity: 1;
  pointer-events: all;
}

.hover-upload-icon {
  animation: pulse 1.5s infinite;
}

.hover-button {
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.hover-button:hover {
  transform: scale(1.1);
}

.hover-button:active {
  transform: scale(0.95);
}

/* Loading overlay */
.loading-overlay {
  top: 0;
  left: 0;
  background: rgba(255, 255, 255, 0.9);
  z-index: 10;
}

/* Animations */
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Upload icon in empty state */
.upload-icon {
  transition: transform 0.3s ease;
}

.image-upload-area:hover .upload-icon {
  transform: scale(1.1);
}
</style>
