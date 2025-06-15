<template>
  <div 
    @click="onComponentClick"
    @drop="onDrop"
    @dragover.prevent
    @dragenter.prevent
    @dragleave.prevent
    class="w-100 radius-big bg-white image-upload-area flex-v-center flex-h-center flex t-black mn-b-small">
      <img loading="lazy" v-if="prop.content" :src="(FILE_SERVER_URL || '') + prop.content" alt="Uploaded image" class="w-100 h-30r object-fit-contain"/>
      <span v-else class="t-transp pd-extra" >Click or drag-and-drop your image</span>
      <input v-if="!prop.content" type="file" ref="fileInput" tabindex="-1" @change="onFileChange" style="display: none"/>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const imageUrl = ref(null);
const fileInput = ref(null);

const props = defineProps([
  'label',
  'value',
  'prop'
]);

const emit = defineEmits(['input', 'updateBlock']);

function onComponentClick() {
  fileInput.value.click();
}

function updateBlock(updatedBlock) {
  const index = post.value.content.findIndex(block => block === updatedBlock);
  if (index !== -1) {
    post.value.content.splice(index, 1, updatedBlock);
  }
}

async function onFileChange(e) {
  let file = e.target.files[0];

  console.log(file)
  let formData = new FormData();
  let uploadPath = 'unsorted'

  formData.append("file", file);
  console.log(formData.has("file"));
  try {
    const $axios = axios.create({baseURL: process.env.API_URL, withCredentials: true}) 

    let response = await $axios.post(`/api/upload/multiple?folderName=${encodeURIComponent(props.uploadPath || 'images')}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    imageUrl.value = response.data[0].filepath;
    console.log(imageUrl.value)
    emit('input', imageUrl.value);
    emit('updateBlock', props.prop, { content: imageUrl.value });
  } catch (error) {
    console.error(error);
  }
}

function onDrop(e) {
  e.preventDefault();

  if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
    onFileChange({
      target: {
        files: e.dataTransfer.files
      }
    });
  }
}
</script>
