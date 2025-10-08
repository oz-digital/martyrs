<template>
  <div class="w-100 pd-medium bg-white radius-medium pos-relative">
    <div class="flex flex-v-center gap-thin">
      <!-- Image section -->
      <div v-if="isEditing || modelValue.photo" class="w-5r">
        <UploadImage 
          v-if="isEditing"
          v-model:photo="modelValue.photo"
          :uploadPath="'/specials'"
          class="aspect-1x1 w-100 o-hidden radius-extra" 
        />
        <img 
          v-if="modelValue.photo && !isEditing"
          :src="modelValue.photo"
          class="aspect-1x1 w-100 o-hidden radius-extra object-cover"
          alt="Card image"
        />
      </div>
      <!-- Content section -->
      <div class="flex w-100 flex-column gap-thin">
        <template v-if="isEditing">
          <Field
            v-model:field="modelValue.title"
            placeholder="Title"
            class="w-100 bg-light radius-small pd-small"
          />  
          <Field
            v-model:field="modelValue.subtitle"
            type="textarea"
            placeholder="Description"
            class="w-100 bg-light radius-small pd-small"
          />
        </template>
        <template v-else>
          <h4 class="h4">{{ modelValue.title }}</h4>
          <p class="p-regular">{{ modelValue.subtitle }}</p>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Field from '@martyrs/src/components/Field/Field.vue'
import UploadImage from '@martyrs/src/components/UploadImage/UploadImage.vue';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      photo: '',
      title: '',
      subtitle: '',
    })
  },
  isEditing: {
    type: Boolean,
    default: true
  }
});

const isEditing = ref(props.isEditing);

</script>