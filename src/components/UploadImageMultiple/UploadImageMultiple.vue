<template>
  <div 
    @click="onComponentClick"
    @drop="onDrop"
    @dragover.prevent
    class="cursor-pointer t-black w-100 flex-v-center flex-h-center flex pos-relative"
  >
    <transition name="moveFromTop" mode="out-in">
      <div v-if="!loading" class="t-center">
        <IconUpload
          style="max-height: 4rem;"
          class="w-100 mn-b-thin h-100"
          fill="rgb(var(--main))"
        />
        <span v-if="options.showText || options.showTitle" class="mn-t-medium  mn-b-medium d-block h3 t-black">{{ text.title }}</span>
        <span v-if="options.showText" class="mn-b-small t-transp d-block ">{{ text.subtitle }}</span>
        <span  v-if="options.showText"class="mn-b-small uppercase p-small t-medium d-block">or</span>
        <button  v-if="options.showText" class="cursor-pointer mn-b-small br-2px br-main br-solid radius-extra pd-l-thin pd-r-thin  t-main">Browse Files</button>
        <span  v-if="options.showText" class="uppercase p-small t-medium d-block ">Maximum size: 2MB</span>
      </div>
      <Loader v-else class="pos-absolute"/>
    </transition>
    <input type="file" ref="fileInput" @change="onFileChange" multiple style="display: none"/>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';
import Loader from '@martyrs/src/components/Loader/Loader.vue';
import PlaceholderImage from '@martyrs/src/modules/icons/placeholders/PlaceholderImage.vue'
import IconUpload from '@martyrs/src/modules/icons/navigation/IconUpload.vue'
import * as globals from '@martyrs/src/modules/globals/views/store/globals.js';

const images = ref([]);
const loading = ref(false);
const fileInput = ref(null);

const props = defineProps({
  uploadPath: {
    type: Object,
    required: true
  },
  options: {
    type: Object,
    default: () => ({
      mimeType: ['jpg', 'png', 'gif'],
      maxSize: 10 * 1024 * 1024,
      showText: true,
      showTitle: true
    })
  },
  text: {
    type: Object,
    default: () => ({
      title: 'Drag & Drop Your Images Here',
      subtitle: 'Files supported: JPG, PNG, GIF'
    })
  }
});

const emit = defineEmits(['update:images']);

function onComponentClick() {
  fileInput.value.click();
}

async function onFileChange(e) {
  loading.value = true;
  let files = e.target.files;
  let formData = new FormData();
  
  for (const file of files) {
    formData.append("file", file);
  }
  
  try {
    const $axios = axios.create({ baseURL: process.env.API_URL, withCredentials: true }); 
    let response = await $axios.post(`/api/upload/multiple?folderName=${encodeURIComponent(props.uploadPath)}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    
    response.data.forEach(file => {
      images.value.push(file.filepath);
    });
    
    emit('update:images', images.value);
  } catch (error) {
    globals.setError(error);
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
</script>