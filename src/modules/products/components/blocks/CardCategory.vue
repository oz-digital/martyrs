<template>
  <div class="flex-v-center bg-light pd-small radius-small flex-column flex">
    <div class="w-100 flex-v-center flex-nowrap gap-thin flex">
      <img v-if="category.photo" class="i-big radius-small object-fit-contain bg-white" :src="(FILE_SERVER_URL || '') + category.photo"/>
      <h4 class="my-handle word-break t-truncate w-100 w-max-100 mn-r-auto">{{category.name}}</h4>

      <router-link
       :to="{
          name: 'Category Edit', 
          params: { 
            _id: route.params._id,
            category: category.url
          } 
        }"
        class="
          i-semi
          cursor-pointer 
          card-page-actions
          radius-extra pd-micro bg-second
          flex-child-default
        "
      >
        <IconEdit
          class="w-100 h-100" 
          classes="fill-white"
        />
      </router-link>

      <button
        @click="deleteCategory(category)"
        class="
          i-semi
          cursor-pointer 
          card-page-actions
          radius-extra pd-micro bg-second
          flex-child-default
        "
      >
        <IconDelete
          class="w-100 h-100"
          :fill="'white'"
        />
      </button>
    </div>

    <!-- <p v-if=" category.children.length > 0" class="w-100">Subcategories:</p> -->
   <!--  <CardCategory
      v-for="(subcategory,index) in category.children"
      :key="subcategory._id"
      :category="subcategory" 
      class="pd-l-small bg-white w-100"
    /> -->

   </div>
</template>


<script setup>
import { toRef, onMounted, defineEmits } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import CardCategory from './CardCategory.vue'

import IconEdit from '@martyrs/src/modules/icons/navigation/IconEdit.vue'
import IconAdd from '@martyrs/src/modules/icons/navigation/IconAdd.vue'
import IconDelete from '@martyrs/src/modules/icons/navigation/IconDelete.vue'


const props = defineProps({
  category: Object,
});

const emits = defineEmits(['delete']);

const route = useRoute();
const router = useRouter();

const deleteCategory = (category) => {
  emits('delete', category);
};

</script>



<style lang="scss">
.card-title {
  .card-page-actions {
    display: none;
  }

  &:hover {
    .card-page-actions {
      display: block;
    }
  }
}
</style>
