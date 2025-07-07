<template>
  <div class="pd-thin">
    <header class="mn-b-medium gap-small flex-v-center flex-nowrap flex">
      <h2>{{ route.params._id ? 'Edit' : 'Add' }} Rent</h2>
    </header>

    <Popup 
      title="Add Product to Rent" 
      @close-popup="closeProductsPopup" 
      :isPopupOpen="isOpenProductsPopup"
      class="bg-white w-min-30r w-max-30r radius-big pd-medium"
    >
      <div class="bg-light mn-b-thin h-min-20r h-max-20r o-scroll pd-medium radius-big">
        <Feed
          :search="true"
          :states="{ empty: { title: 'No Products Found', description: 'No products available for rent.' } }"
          :store="{ read: (options) => products.actions.read(options) }"
          :options="{ organization: route.params._id, listing: 'rent' }"
          v-slot="{ items }"
        >
          <CardOrderItem
            v-for="product in items" 
            :key="product._id"
            :editable="false" 
            :product="product" 
            @click="addProduct(product)"
            class="bg-white pd-thin radius-medium w-100 mn-b-thin"
          />
        </Feed>
      </div>
    </Popup>

    <Block title="Rent Period" class="mn-b-semi">
      <div class="flex gap-small">
        <Field v-model:field="rents.state.current.startDate" label="Start Date" type="date" class="w-100 bg-white radius-small pd-medium" />
        <Field v-model:field="rents.state.current.endDate" label="End Date" type="date" class="w-100 bg-white radius-small pd-medium" />
      </div>
    </Block>

    <Block
      title="Rented Products"
      :actions="[{ label: '+', function: openProductsPopup }]"
      placeholder="No products added yet"
      class="mn-b-semi"
    >
      <CardOrderItem
        v-if="rents.state.current.product"
        :key="rents.state.current.product._id" 
        :productId="rents.state.current.product._id"
        :variantId="rents.state.current.product.variant"
        :images="rents.state.current.product.images"
        :name="rents.state.current.product.name"
        :quantity="rents.state.current.product.quantity || 1"
        :unit="rents.state.current.product.unit"
        :dates="rents.state.current.product.date"
        :listing="rents.state.current.product.listing"
        :price="rents.state.current.product.price"
        :editable="false" 
        @click="() => rents.state.current.product = null"
        class="mn-b-small radius-medium bg-white pd-small"
      />
    </Block>

    <Block title="Comment" class="mn-b-semi">
      <Field v-model:field="rents.state.current.comment" label="Comment" type="textarea" class="w-100 bg-white radius-small pd-medium" />  
    </Block>

    <Block>
      <section class="gap-thin flex-v-center flex-nojustify flex">
        <h3 class="mn-r-auto">Total Days: {{ totalDays }}</h3>
        <a @click="onSubmit" class="bg-main button">Save</a> 
        <a @click="onReset" class="t-white bg-second button">Reset</a>
        <a v-if="route.params._id" @click="onDelete" class="t-white bg-red button">Delete</a>
      </section>
    </Block>
  </div>
</template>

<script setup>
import Block from '@martyrs/src/components/Block/Block.vue';
import Field from '@martyrs/src/components/Field/Field.vue';
import Feed from '@martyrs/src/components/Feed/Feed.vue';
import Popup from '@martyrs/src/components/Popup/Popup.vue';
import CardPosition from '@martyrs/src/modules/products/components/blocks/CardPosition.vue';
import CardOrderItem from '@martyrs/src/modules/orders/components/blocks/CardOrderItem.vue';

import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';
import * as rents from '@martyrs/src/modules/rents/views/store/rents.store';
import * as products from '@martyrs/src/modules/products/store/products.js';

const route = useRoute();
const router = useRouter();

const Products = ref(products.state.all);
const isOpenProductsPopup = ref(false);

const totalDays = computed(() => {
  const start = new Date(rents.state.current.startDate);
  const end = new Date(rents.state.current.endDate);
  if (!start || !end) return 0;
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

function openProductsPopup() { isOpenProductsPopup.value = true; }
function closeProductsPopup() { isOpenProductsPopup.value = false; }

function addProduct(product) {
  rents.state.current.product = product
  closeProductsPopup();
}

function updateItem(index, updatedItem) {
  rents.state.current.items[index] = { product: updatedItem.product._id || updatedItem.product, quantity: updatedItem.quantity || 1 };
}

function deleteItem(index) {
  try {
    rents.state.current.items.splice(index, 1);
  } catch (error) {
    console.error('Ошибка при удалении элемента:', error);
  }
}

onMounted(async () => {
  try {
    if (route.params.rent) {
      await rents.actions.read({ _id: route.params.rent });
    } else {
      rents.mutations.clean();
    }

    await products.actions.read({ organization: route.params._id, listing: 'rent', limit: 100 });
    Products.value = products.state.all;
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
  }
});

async function onSubmit() {
  try {
    if (route.params.rent) {
      let newProduct = rents.state.current
      newProduct.product = rents.state.current.product._id
      newProduct.startDate = new Date(rents.state.current.startDate);
      newProduct.endDate = new Date(rents.state.current.endDate);
      await rents.actions.update(newProduct);
    } else {
      rents.state.current.creator = { type: 'user', target: auth.state.user._id };
      rents.state.current.owner = { type: 'organization', target: route.params._id };
      rents.state.current.owner = { type: 'organization', target: route.params._id };
      let newProduct = rents.state.current
      newProduct.product = rents.state.current.product._id
      newProduct.startDate = new Date(rents.state.current.startDate);
      newProduct.endDate = new Date(rents.state.current.endDate);
      await rents.actions.create(newProduct);
    }
    // router.push({ name: 'Rents', params: { _id: route.params._id } });
  } catch (error) {
    console.error('Ошибка при отправке данных:', error);
  }
}

async function onReset() {
  try {
    if (route.params._id) {
      await rents.actions.read({ _id: route.params._id });
    } else {
      rents.mutations.clean();
    }
  } catch (error) {
    console.error('Ошибка при сбросе данных:', error);
  }
}

async function onDelete() {
  try {
    await rents.actions.delete(route.params._id);
    router.push({ name: 'Rents', params: { _id: route.params._id } });
  } catch (error) {
    console.error('Ошибка при удалении:', error);
  }
}

</script>

<style lang="scss">
.round-stat {
  padding: 1rem;
  border-radius: 5rem;
  width: 3rem;
  height: 3rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid rgba(0,0,0,0.1);
}
</style>