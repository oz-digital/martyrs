<template>
	<div class="flex-nowrap flex gap-small">
    <VueDraggableNext v-if="localImages.length > 0"  class="gap-small flex dragArea list-group w-full" v-model="localImages" @change="emitChanges">
			<div v-for="(image, index) in localImages" class="pos-relative">
				<img loading="lazy" class="i-extra object-fit-contain bg-black-transp-5 pd-nano radius-small o-hidden" :src="(FILE_SERVER_URL || '') + image" />
				
        <IconCross  
          @click="deleteImage(index)" 
          class="cursor-pointer pos-absolute t-center flex-center flex radius-extra i-medium bg-red  pos-t-10-negative pos-r-10-negative pd-micro"
        />
			</div>
		</VueDraggableNext>
    <div
      v-if="localImages.length > 0" 
      class="i-extra uppercase flex-center flex radius-small o-hidden br-solid br-main br-2px pd-small"
      >
       <UploadImageMultiple   
        @update:images="onImagesUpdate"
        text="Add"
        :options="{
          showText: false
        }"
        :uploadPath="'photos'"
        class="radius-big"
      />
    </div>


		<UploadImageMultiple 	
      v-if="localImages.length < 1" 
      @update:images="onImagesUpdate"
      :uploadPath="props.uploadPath"
      :text="props.text"
      :options="props.options"
      class="w-100 pd-medium"
    />
	</div>	
</template>

<script setup>
import { ref, defineProps, watchEffect } from 'vue';
import { VueDraggableNext } from 'vue-draggable-next'
import UploadImageMultiple from "@martyrs/src/components/UploadImageMultiple/UploadImageMultiple.vue";
import IconCross from '@martyrs/src/modules/icons/navigation/IconCross.vue';

const props = defineProps({
  images: Array,
  text: Object,
  options: Object,
  uploadPath: {
    type: Object,
    default: 'unsorted'
  }
});

const emit = defineEmits(['update:images'])

const localImages = ref([...props.images])

watchEffect(() => {
  localImages.value = [...props.images]; // Обновление localImages при изменении props.images
});

const emitChanges = () => {
  emit('update:images', localImages.value)
}

const onImagesUpdate = (newImages) => {
  localImages.value = [...localImages.value, ...newImages]
  emitChanges()
}

const deleteImage = (index) => {
  localImages.value.splice(index, 1)
  emitChanges()
}
</script>

<style lang="scss">
// Your styles here
</style>
