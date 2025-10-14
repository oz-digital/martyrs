<template>
  <Block
    title="Ingredients"
    placeholder="No ingredients added yet"
    :actions="[{
      label: '+',
      function: () => openIngredientPopup()
    }]"
  >
    <div v-if="ingredients.length > 0" class="rows-1 gap-thin">
      <CardPosition 
        v-for="(product, index) in ingredients" 
        :key="product._id" 
        :product="product"
        :array="ingredients"
        :products="Products"
        :showPrice="false"
        @add="(item) => {
          store.core.actions.add(ingredients, item);
          closeIngredientPopup();
        }"
        @update="(item) => {
          store.core.actions.update(ingredients, item, index);
          closeIngredientPopup();
        }"
        @delete="(item) => {
          store.core.actions.delete(ingredients, item, index);
          closeIngredientPopup();
        }"
      />
    </div>
  </Block>

  <Popup 
    title="Add ingredient" 
    @close-popup="closeIngredientPopup" 
    :isPopupOpen="isIngredientPopupOpen"
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
        <CardOrderItem
          v-for="(product, index) in items" 
          :key="`${product._id}_${product.variant || 'no-variant'}_${index}`"
          :editable="false" 
          :productId="product._id"
          :variantId="product.variant"
          :images="product.images"
          :name="product.name"
          :quantity="product.quantity || 1"
          :unit="product.unit"
          :dates="product.date"
          :listing="product.listing"
          :price="product.price"
          @click="() => {
            let p = { ...product };
            p.quantity = 1;
            p.type = 'pcs'
            store.core.actions.add(ingredients, p);
            closeIngredientPopup();
          }"
          class="bg-white pd-thin radius-medium w-100 mn-b-thin"
        />
      </Feed>
    </div>
  </Popup>
</template>

<script setup>
import { ref, computed, onMounted, defineModel } from 'vue';
import { useRoute, useRouter } from 'vue-router';

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
import CardOrderItem from '@martyrs/src/modules/orders/components/blocks/CardOrderItem.vue';

// Получение route и router
const route = useRoute();
const router = useRouter();
const store = useStore();

// Используем defineModel для работы с v-model в родительском компоненте
const ingredients = defineModel('ingredients');

// Локальное состояние
const isIngredientPopupOpen = ref(false);
const Products = ref([]);

// При монтировании компонента загружаем доступные продукты
onMounted(async () => {
  try {
    const productsResponse = await products.actions.read({
      organization: route.params._id,
      limit: 100
    });
    Products.value = productsResponse;
  } catch (error) {
    console.error('Error loading products for ingredients:', error);
  }
});

// Открытие попапа для добавления ингредиента
function openIngredientPopup() {
  isIngredientPopupOpen.value = true;
}

// Закрытие попапа
function closeIngredientPopup() {
  isIngredientPopupOpen.value = false;
}
</script>