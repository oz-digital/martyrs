<template>
  <div :class="[$attrs.class, { 'bg-fourth-nano': validation }]" class="flex-center flex-nowrap flex">
    <!-- Label -->
    <div v-if="label" class="t-transp mn-r-small">
      <span>{{label}}</span>
    </div>

    <div v-if="fileURL" class="flex-nowrap flex w-100  flex-v-center">
      <a :href="fileURL" class="w-100" target="_blank">{{ fileURL }}</a>

      <IconCross  
        @click="removeFile" 
        class="cursor-pointer  t-center flex-center flex radius-extra i-medium bg-red pd-micro"
      />

    </div>

    <div v-else class="w-100">
      <!-- Input / File -->
      <input 
        @change="onFileChange"
        type="file"
        class="w-100"
        :placeholder="placeholder"
        :multiple="multiple"
        id="photo"
        name="photo"
      >
    </div>
  </div>

  <!-- Validation -->
  <transition mode="out-in" name="fade">
    <div v-if="validation" class="mn-t-thin mn-b-thin invalid-feedback">
      * {{validation.message}}
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch} from 'vue'
import axios from 'axios';

import IconCross from '@martyrs/src/modules/icons/navigation/IconCross.vue';

const emit = defineEmits(['update:field', 'focus', 'blur', 'file-change']);

const props = defineProps({
  field: String,
  label: null,
  type: {
    type: String,
    default: 'file'
  },
  placeholder: 'Upload a file',
  validation: false,
  uploadPath: {
    type: String,
    default: '/files'
  },
  multiple: {
    type: Boolean,
    default: false
  }
});

const fileURL = ref(props.field);
const fileInput = ref(null);

watch(() => props.field, (newValue) => {
  fileURL.value = newValue;
});

// Handles file change event

async function onFileChange(e) {

  let file = e.target.files[0];
  let formData = new FormData();

  formData.append("file", file);

  try {
    const $axios = axios.create({baseURL: process.env.API_URL, withCredentials: true}) 

    let response = await $axios.post(`/api/upload/${props.type}?folderName=${encodeURIComponent(props.uploadPath)}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });

    fileURL.value = response.data[0].filepath;
    emit('file-change', fileURL.value);
  } catch (error) {
    console.error(error);
  }
}

const removeFile = () => {
  fileURL.value = null;
  emit('update:field', null); // Обновляем значение, связанное с v-model:field
  emit('file-change', null); // Посылаем событие об изменении файла
};
</script>

<style lang="scss" scoped>
  input, span {
    line-height: 1;
    color: inherit;
  }
</style>
