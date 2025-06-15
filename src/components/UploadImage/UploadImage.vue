<template>
  <div 
    @click="onComponentClick"
    @drop="onDrop"
    @dragover.prevent
    class="image-upload-area flex-v-center flex-h-center flex">
      <img loading="lazy" 
        v-if="imageUrl || photo" 
        :src="(FILE_SERVER_URL || '') + (imageUrl || photo)"
        alt="Uploaded image" 
        class="w-100 h-100 object-fit-cover"
        />
      
      <div v-else class="flex-v-center flex-h-center flex w-100 h-100 bg-second" >
        <svg class="i-medium" width="104" height="104" viewBox="0 0 104 104" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path  fill="rgb(var(--white))" d="M21.2784 37.2973C18.8466 34.6628 18.8466 30.6098 21.2784 27.9753L47.2179 2.03584C48.6364 0.81993 50.2577 0.211974 51.8789 0.211974C53.5001 0.211974 55.1213 0.81993 56.5399 2.03584L82.4793 27.9753C84.9111 30.6098 84.9111 34.6628 82.4793 37.2973C79.8448 39.7291 75.7918 39.7291 73.1573 37.2973L58.3637 22.301V71.5454C58.3637 75.1932 55.5266 78.0303 51.8789 78.0303C48.2311 78.0303 45.394 75.1932 45.394 71.5454V22.301L30.6004 37.2973C27.966 39.7291 23.9129 39.7291 21.2784 37.2973ZM97.2729 71.5454C100.921 71.5454 103.758 74.3825 103.758 78.0303V97.4849C103.758 101.133 100.921 103.97 97.2729 103.97H6.48486C2.83713 103.97 0 101.133 0 97.4849V78.0303C0 74.3825 2.83713 71.5454 6.48486 71.5454H38.9092C38.9092 78.6382 44.7861 84.5151 51.8789 84.5151C58.9717 84.5151 64.8486 78.6382 64.8486 71.5454H97.2729ZM87.5456 92.6212C90.1801 92.6212 92.4092 90.392 92.4092 87.7576C92.4092 85.1231 90.1801 82.8939 87.5456 82.8939C84.9111 82.8939 82.682 85.1231 82.682 87.7576C82.682 90.392 84.9111 92.6212 87.5456 92.6212Z"/>
        </svg>
      </div>
      
      <input type="file" name="file" ref="fileInput" @change="onFileChange" style="display: none"/>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';

const imageUrl = ref(null);
const fileInput = ref(null);

const props = defineProps([
  'uploadPath', // only necessary prop
  'photo' // new prop for holding the image url
]);

const emit = defineEmits(['update:photo', 'error']);

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
  
  let formData = new FormData();
  formData.append("file", file);

  console.log("Sending file:", file.name); // Логируем имя файла перед отправкой

  try {
    const $axios = axios.create({ baseURL: process.env.API_URL, withCredentials: true }); 

    let response = await $axios.post(`/api/upload/multiple?folderName=${encodeURIComponent(props.uploadPath)}`, formData);
    console.log("Upload response:", response); // Логируем ответ сервера
    imageUrl.value = response.data[0].filepath;
    emit('update:photo', imageUrl.value);
  } catch (error) {
    emit('error', error);
    console.error("Upload error:", error); // Логируем ошибку
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
