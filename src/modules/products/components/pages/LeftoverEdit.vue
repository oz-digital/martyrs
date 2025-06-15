<template>
  <div class="pd-medium mobile:pd-thin">
    <header class="mn-b-medium gap-small flex-v-center flex-nowrap flex">
      <h2 class="">{{route.params.leftover ? 'Edit ' : 'Add ' }} Inventory</h2>
    </header>
    
    <Popup 
      title="Add position" 
      @close-popup="closeProductsPopup" 
      :isPopupOpen="isOpenProductsPopup"
      class="bg-white w-100 w-max-30r  radius-medium pd-medium"
    >
      <Feed
        :search="{
          class: 'bg-light radius-small'
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
        v-slot="{ 
          items 
        }"
        class="flex-column flex gap-thin h-max-20r o-scroll"
      >
        <CardOrderItem
          v-for="(product, index) in items" :key="product._id"
          :editable="false" 
          :product="product" 
          @click="() => selectProduct(product)"
          class="bg-light pd-small radius-small w-100"
        />
      </Feed>
    </Popup>
    
    <!-- Popup for selecting variant of the product -->
    <Popup 
      title="Select variant" 
      @close-popup="closeVariantsPopup" 
      :isPopupOpen="isVariantsPopupOpen"
      class="bg-white w-100 w-max-30r  radius-medium pd-medium"
    >
      <div class="gap-thin flex flex-column">
        <div 
          v-for="(variant, index) in selectedProduct.variants" 
          :key="index"
          @click="addVariantToInventory(variant)"
          class="w-100 cursor-pointer hover-scale-1 bg-light pd-small radius-small flex-v-center flex-nowrap flex gap-thin"
        >
          <div v-if="variant.images && variant.images.length" class="aspect-1x1 h-3r radius-small o-hidden">
            <img 
              :src="(FILE_SERVER_URL || '') + variant.images[0]" 
              class="w-100 h-100 object-fit-cover"
            />
          </div>
          <div>
            <p class="t-medium">{{ variant.name || 'Default variant' }}</p>
            <p v-if="variant.attributes && variant.attributes.length" class="t-small t-transp">
              {{ variant.attributes.map(attr => `${attr.name}: ${attr.value}`).join(', ') }}
            </p>
          </div>
          <p class="mn-l-auto">{{ formatPrice(variant.cost) }}</p>
        </div>
      </div>
    </Popup>

    <Block
      class="mn-b-thin"
    >
       <Field
        v-model:field="leftovers.state.current.comment"
        placeholder="Describe details of the leftover"
        type="textarea"
        class="w-100 bg-white radius-small pd-medium"
      />  
      <div class="t-medium mn-t-thin">Select Storage:</div>
      <Feed
        :states="{
          empty: {
            title: 'No Spots Found',
            description: 'Currently, there are no spots available.'
          }
        }"
        :store="{
          read: (options) => spots.actions.read(options),
          state: leftovers.state.state
        }"
        :options="{
          user: auth.state.user._id,
          organization: route.params._id,
          limit: 3
        }"
        v-slot="{ 
          items 
        }"
        class="flex-nowrap flex-column gap-thin flex"
      >
        <CardSpot
          v-for="(spot, index) in items"
          :key="index"
          :spot="spot"
          :organization="route.params._id"
          :selected="leftovers.state.current.storage === spot._id"
          @click="() => leftovers.state.current.storage = leftovers.state.current.storage === spot._id ? null : spot._id"
          class="radius-medium bg-white"
        />
      </Feed>


    </Block>

    <Block
      title="Positions"
      :actions="[{
        label: '+',
        function: () => openProductsPopup()
      }]"
      placeholder="No positions added yet"
      class="h-100 flex-column flex gap-thin mn-b-thin"
    >
      <CardPosition
        v-for="(position, index) in leftovers.state.current.positions" 
        :key="position._id || index" 
        :image="position.image"
        :name="position.name"
        :title="formatPrice(position.cost * position.quantity)"
        :title_class="[position.cost * position.quantity < 0 ? 't-red' : 't-second']"
        :subtitle="`${formatPrice(position.cost)} × ${Math.abs(position.quantity)}${position.unit} `"
      >
        <template v-slot:actions>
          <QuantitySelector v-model="position.quantity"/>
         
          <!-- <Dropdown
            :label="{ component: IconEllipsis, class: 't-transp i-medium' }"
            class="cursor-pointer aspect-1x1 pd-nano radius-small hover-bg-light"
            align="right"
          >
            <div class="bg-white radius-small">
              <button @click="leftovers.state.current.positions.splice(index, 1)" class="cursor-pointer t-left t-nowrap w-100 pd-small">
                Delete
              </button>
            </div>
          </Dropdown> -->

        </template>
      </CardPosition>
  
    </Block>

     <!--  :actions="[{
          component: IconEdit,
          handler: () => globals.actions.add(leftovers.state.current.positions, position),
          class: 'bg-light'
        },{
          component: IconDelete,
          handler: () => leftovers.state.current.positions.splice(index, 1),
          class: 'bg-red'
        }]" -->

    <Block class="">
      <section class="gap-thin flex-v-center flex-nojustify flex">
        <span class="h3 mn-r-auto">
          In total: {{formatPrice(totalPrice)}}
        </span>

         <!-- Save -->
        <Button
          :submit="onSubmit"
          class="bg-main w-min-5r  button"
        >
          <span>Save</span>
        </Button>

        <!-- Reset -->
        <Button
          :submit="onReset"
          class="t-white w-min-5r bg-second button"
        >
          <span>Reset</span>
        </Button>

        <!-- Delete -->
        <Button
          v-if="route.params.leftover"
          :submit="onDelete"
          class="t-white w-min-5r bg-red button"
        >
          <span>Delete</span>
        </Button>
      </section>
    </Block>
  </div>
</template>


<script setup>
  import Block from '@martyrs/src/components/Block/Block.vue';
  import Button from "@martyrs/src/components/Button/Button.vue";
  import Field from '@martyrs/src/components/Field/Field.vue';
  import Feed from '@martyrs/src/components/Feed/Feed.vue';
  import Select from '@martyrs/src/components/Select/Select.vue';
  import Dropdown from '@martyrs/src/components/Dropdown/Dropdown.vue'
  import Popup from '@martyrs/src/components/Popup/Popup.vue';

  import CardOrderItem from '@martyrs/src/modules/orders/components/blocks/CardOrderItem.vue';
  import CardSpot from '@martyrs/src/modules/spots/components/blocks/CardSpot.vue'; 

  import CardPosition from '../blocks/CardPosition.vue';
  import QuantitySelector from '../elements/QuantitySelector.vue';

  import { computed, onMounted, ref, reactive } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useGlobalMixins } from '@martyrs/src/modules/globals/views/mixins/mixins.js';
 
  import * as globals from '@martyrs/src/modules/globals/views/store/globals.js';
  import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';
  import * as leftovers from '@martyrs/src/modules/products/store/leftovers.js';
  import * as products from '@martyrs/src/modules/products/store/products.js';
  import * as spots from '@martyrs/src/modules/spots/store/spots.js';

  import IconEdit from '@martyrs/src/modules/icons/navigation/IconEdit.vue';
  import IconDelete from '@martyrs/src/modules/icons/navigation/IconDelete.vue';
  import IconEllipsis from '@martyrs/src/modules/icons/navigation/IconEllipsis.vue'

  const route = useRoute();
  const router = useRouter();
  const { formatPrice } = useGlobalMixins();
  
  const isOpenProductsPopup = ref(false);
  const isVariantsPopupOpen = ref(false);
  const selectedProduct = ref(null);

  const totalPrice = computed(() => {
    return leftovers.state.current.positions.reduce((sum, position) => {
      return Number(sum) + Number(position.cost || 0) * Number(position.quantity || 1);
    }, 0);
  });

  function openProductsPopup() {
    isOpenProductsPopup.value = true;
  }

  function closeProductsPopup() {
    isOpenProductsPopup.value = false;
  }
  
  function closeVariantsPopup() {
    isVariantsPopupOpen.value = false;
    selectedProduct.value = null;
  }
  
  function selectProduct(product) {
    selectedProduct.value = product;
    closeProductsPopup();
    
    // If product has only one variant, add it directly without showing popup
    if (product.variants && product.variants.length === 1) {
      addVariantToInventory(product.variants[0]);
      return;
    }
    
    // If product has multiple variants or no variants defined, show popup
    isVariantsPopupOpen.value = true;
  }

  function formatProductName(product, variant) {
    if (!variant || product.variants?.length === 1 && !(variant.attributes?.length))
      return product.name;

    const attrs = variant.attributes?.map(a => a.value).filter(Boolean);
    return attrs?.length
      ? `${product.name} / ${attrs.join(' / ')}`
      : `${product.name} / ${variant.name}`;
  }

  
  function addVariantToInventory(variant) {
    // Create a position object that includes variant information
    console.log('variant',variant)
    const position = {
      _id: variant._id,
      product: selectedProduct.value._id, 
      name: formatProductName(selectedProduct.value, variant),
      image: variant.images?.[0] || selectedProduct.value?.images?.[0] || null,
      cost: variant.cost || variant.price || 0,
      unit: variant.unit || 'pcs',
      quantity: 1,
      variant: {
        _id: variant._id,
        name: variant.name,
        attributes: variant.attributes || []
      }
    };
    // Add position to leftover state
    globals.actions.add(leftovers.state.current.positions, position);
    closeVariantsPopup();
  }

  onMounted(async () => {
    if (route.params.leftover) {
      try {
        await leftovers.actions.fetch(route.params.leftover);
      } catch (error) {
        console.error('Error fetching leftover:', error);
      }
    } else {
      leftovers.state.current = { type: "stock-in", positions: [] };
    }
  });

  async function onReset() {
    if (route.params.leftover) {
      await leftovers.actions.fetch(route.params.leftover);
    } else {
      leftovers.state.current = { type: "stock-in", positions: [] };
    }
    return true
  }

  function onSubmit() {
    leftovers.state.current.organization = route.params._id;

    if (route.params.leftover) {
      leftovers.actions.update(leftovers.state.current).then(
        () => router.push({ name: 'Leftovers', params: {_id: route.params._id} }),
        (error) => console.error('Error updating leftover:', error)
      );
    } else {
      leftovers.state.current.creator = {
        type: 'user',
        target: auth.state.user._id
      }
      leftovers.state.current.owner = {
        type: 'organization',
        target: route.params._id
      }

      leftovers.actions.create(leftovers.state.current).then(
        () => router.push({ name: 'Leftovers', params: {_id: route.params._id} }),
        (error) => console.error('Error creating leftover:', error)
      );
    }
  }

  function onDelete() {
    leftovers.actions.delete(route.params.leftover).then(
      () => router.push({ name: 'Leftovers', params: {_id: route.params._id} }),
      (error) => console.error('Error deleting leftover:', error)
    );
  }
</script>