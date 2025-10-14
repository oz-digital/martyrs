<template>
  <Block
    title="Recommended Products"
    placeholder="No recommended products added yet. Add products that are frequently bought together."
    :actions="[{
      label: '+',
      function: () => openRecommendedPopup()
    }]"
  >
    <div v-if="recommended?.length > 0" class="rows-1 gap-thin">
      <CardPosition 
        v-for="(product, index) in recommended" 
        :key="product._id" 
        :image="product.images?.[0] ? (FILE_SERVER_URL || '') + product.images[0] : ''"
        :name="product.name"
        :showThumbnail="true"
        :actions="[
          {
            component: IconDelete,
            class: 'bg-red',
            handler: () => {
              store.core.actions.delete(recommended, product, index);
            }
          }
        ]"
        class="bg-white pd-thin radius-medium w-100 mn-b-thin"
      />
    </div>
  </Block>

  <Popup 
    title="Add Recommended Product" 
    @close-popup="closeRecommendedPopup" 
    :isPopupOpen="isRecommendedPopupOpen"
    class="bg-white w-min-30r w-max-30r radius-medium pd-medium"
  >
    <div class="bg-light mn-b-thin h-min-20r h-max-20r o-scroll pd-medium radius-medium">
      <Feed
        :search="{
          class: 'bg-white mn-b-thin'
        }"
        :states="{
          empty: {
            title: 'No Products Found',
            description: 'Currently, there are no such products available.'
          }
        }"
        :store="{
          read: (options) => products.actions.read(options),
          state: null
        }"
        :options="{
          owner: route.params._id,
        }"
        v-slot="{ items }"
        class=""
      >
        <CardPosition
          v-for="(product, index) in items" :key="product._id"
          :image="product.images?.[0] ? (FILE_SERVER_URL || '') + product.images[0] : ''"
          :name="product.name"
          :showThumbnail="true"
          @click="store.core.actions.add(recommended, product); closeRecommendedPopup();"
          class="bg-white pd-thin radius-medium w-100 mn-b-thin cursor-pointer hover-scale-1"
        />
      </Feed>
    </div>
  </Popup>
</template>

<script setup>
import { ref, computed, onMounted, defineModel } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useGlobalMixins } from "@martyrs/src/modules/core/views/mixins/mixins.js"

// Импорт компонентов
import Block from '@martyrs/src/components/Block/Block.vue';
import Popup from '@martyrs/src/components/Popup/Popup.vue';
import Feed from '@martyrs/src/components/Feed/Feed.vue';

// Импорт модулей и глобальных хранилищ
import { useStore } from '@martyrs/src/modules/core/views/store/core.store.js';
import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';
import * as products from '@martyrs/src/modules/products/store/products.js';

// Импорт карточек
import CardPosition from '@martyrs/src/modules/products/components/blocks/CardPosition.vue';
import IconDelete from '@martyrs/src/modules/icons/navigation/IconDelete.vue';

// Получение route и router
const route = useRoute();
const router = useRouter();
const store = useStore();
const { returnCurrency } = useGlobalMixins();

// Используем defineModel для работы с v-model в родительском компоненте
const recommended = defineModel('recommended');

// Локальное состояние
const isRecommendedPopupOpen = ref(false);

// При монтировании компонента инициализируем recommended
onMounted(async () => {
  // Инициализируем recommended как пустой массив, если не определено или не массив
  if (!recommended.value || !Array.isArray(recommended.value)) {
    recommended.value = [];
  }
});

// Открытие попапа для добавления рекомендованного товара
function openRecommendedPopup() {
  isRecommendedPopupOpen.value = true;
}

// Закрытие попапа
function closeRecommendedPopup() {
  isRecommendedPopupOpen.value = false;
}
</script>