<template>
  <div class="flex flex-column pd-thin">
    <Block class="mn-b-thin">
      <header class="flex-v-center flex-nowrap flex">
        <h2 class="mn-r-auto">Create Order</h2>
        <Button 
          :submit="onSubmit"
          :callback="redirectTo"
          class="pd-small radius-big bg-main t-black uppercase t-medium"
        >
          Add Order 
        </Button>
      </header>
    </Block>

    <Tab 
      v-model:selected="tabOrderCreate"
      :tabs="[
        {name: 'Positions', value: 'positions'},
        {name: 'Customer', value: 'customer'},
        {name: 'Delivery', value: 'delivery'},
        {name: 'Payment', value: 'payment'}
      ]"
      class="t-medium radius-medium bg-light mn-b-small"
    />

    <Popup 
      @close-popup="closeProductsPopup" 
      :isPopupOpen="isOpenProductsPopup"
      class="bg-white flex flex-column radius-big pd-medium pos-relative"
    >

      <h3 class="mn-b-small">Add to order</h3>

      <div class="bg-light h-max-100 mn-b-thin o-scroll pd-medium radius-big">
        <Feed
          :showLoadMore="false"
          :search="{
            placeholder: 'Search products...',
            class: 'bg-white mn-b-thin'
          }"
          :states="{
            empty: {
              title: 'No Products Found',
              description: 'Currently, there are no such products available.'
            },
            skeleton: {
              hide: true
            }
          }"
          :store="{
            read: (options) => products.actions.read(options),
            state: null
          }"
          :options="{
            owner: route.params._id
          }"
          v-slot="{ 
            items 
          }"
          class=""
        >
          <CardOrderItem
            v-for="(product, index) in items" 
            :key="`${product._id}_${index}`"
            :editable="false" 
            :productId="product._id"
            :images="product.images"
            :name="product.name"
            @click="() => selectProduct(product)"
            class="bg-white pd-thin radius-medium w-100 mn-b-thin"
          />
        </Feed>
      </div>
    </Popup>

    <!-- Popup for selecting variant of the product -->
    <Popup 
      title="Select variant" 
      @close-popup="closeVariantsPopup" 
      :isPopupOpen="isVariantsPopupOpen"
      class="bg-white w-100 w-max-30r radius-medium pd-medium"
    >
      <Feed
        :store="variants"
        :options="{
          product: selectedProduct?._id,
        }"
        :skeleton="{
          structure: [
            { block: 'text', size: 'small' },
            { block: 'text', size: 'medium' },
            { block: 'text', size: 'small' }
          ]
        }"
        :states="{
          empty: {
            title: 'No variants',
            description: 'Create your first variant'
          }
        }"
         v-slot="{ items }"
      >
        <div class="gap-thin flex flex-column">
          <div 
            v-for="(variant, index) in items" 
            :key="index"
            @click="addVariantToOrder(variant)"
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
            <p class="mn-l-auto">{{ formatPrice(variant.price || variant.cost) }}</p>
          </div>
        </div>
      </Feed>
    </Popup>

    <Block
      v-if="tabOrderCreate === 'positions'"
      title="Positions"
      :actions="[{
        label: '+',
        function: () => openProductsPopup()
      }]"
      class="mn-b-small"
    >
      <span 
        v-if="orders.state.current.positions.length === 0" 
        class="w-100"
      >
        No positions added yet
      </span> 

      <CardOrderItem
        v-for="(product, index) in orders.state.current.positions" 
        :key="`${product._id}_${product.variant || 'no-variant'}_${index}`"
        :editable="true" 
        :productId="product._id"
        :variantId="product.variant"
        :images="product.images"
        :name="product.name"
        :quantity="product.quantity"
        :unit="product.unit"
        :dates="product.date"
        :listing="product.listing"
        :price="product.price"
        :increase="() => incrementOrderItemQuantity(product._id, product.variant)"
        :decrease="() => decrementOrderItemQuantity(product._id, product.variant)"
        :remove="() => removeOrderItem(product._id, product.variant)"
        @updateRentDates="(productId, variantId, dates) => updateOrderRentDates(productId, variantId, dates)"
        class="mn-b-thin pd-thin radius-medium bg-white"
      /> 
    </Block>

    <FormSelectCustomer
      v-if="tabOrderCreate === 'customer'"
      v-model:customer="orders.state.current.customer"
      class="mn-b-semi"
    />

    <FormDelivery  
      v-if="tabOrderCreate === 'delivery'" 
      :order="orders.state.current"
      :organization="orderOrganization[0]" 
    />

    <FormPayment  
      v-if="tabOrderCreate === 'payment'"
      :order="orders.state.current"  
      :organization="orderOrganization[0]" 
    />


    <Block
      class="mn-b-semi"
    >
      <div class="h3 flex">
        <span class="mn-r-auto t-transp">In total</span>
        <span>{{ cartTotalPrice }} {{returnCurrency()}} </span  >
      </div>
    </Block>
</div>


</template>

<script setup="props">
  import { computed, ref, defineProps, onMounted, reactive, toRefs, watch, getCurrentInstance } from 'vue'
  import { useRoute, useRouter } from 'vue-router'


  import Field from '@martyrs/src/components/Field/Field.vue'
  import Button from "@martyrs/src/components/Button/Button.vue";  
  import Tab from '@martyrs/src/components/Tab/Tab.vue'
  import Popup from '@martyrs/src/components/Popup/Popup.vue';
	import Block from '@martyrs/src/components/Block/Block.vue';
  import Feed from '@martyrs/src/components/Feed/Feed.vue'

  import CardOrderItem  from '@martyrs/src/modules/orders/components/blocks/CardOrderItem.vue'
  import CardPosition from '@martyrs/src/modules/products/components/blocks/CardPosition.vue';
  import CardUser from '@martyrs/src/modules/auth/views/components/blocks/CardUser.vue'

  import BlockSearch from '@martyrs/src/modules/globals/views/components/blocks/BlockSearch.vue'

  import FormSelectCustomer from '@martyrs/src/modules/orders/components/forms/FormSelectCustomer.vue'
  import FormDelivery from '@martyrs/src/modules/orders/components/sections/FormDelivery.vue'
  import FormPayment from '@martyrs/src/modules/orders/components/sections/FormPayment.vue'

  // Import your store
  import * as globals from '@martyrs/src/modules/globals/views/store/globals.js';
  import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';
  import * as orders from '@martyrs/src/modules/orders/store/orders.js';
  import * as organizations from '@martyrs/src/modules/organizations/store/organizations.js';
  import * as products from '@martyrs/src/modules/products/store/products.js';
  import variants from '@martyrs/src/modules/products/store/variants.store.js';

  import customers from '@martyrs/src/modules/orders/store/customers.store';
  
  import { useGlobalMixins } from '@martyrs/src/modules/globals/views/mixins/mixins.js';
	
  // Accessing router
  const route = useRoute()
  const router = useRouter()
  const { proxy } = getCurrentInstance()
  const { formatPrice, returnCurrency } = useGlobalMixins()

   orders.mutations.resetOrder(orders.state.current)

  let cartTotalPrice = computed(() => {
    return Number(orders.state.current.positions.reduce((total, product) => {
      if (product.listing === 'rent' && product.date?.start && product.date?.end) {
        const start = new Date(product.date.start);
        const end = new Date(product.date.end);
        const days = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;
        return total + product.price * product.quantity * days;
      } else {
        return total + product.price * product.quantity;
      }
    }, 0));
  })

  // Tab
  const tabOrderCreate = ref('positions')

  // Popup
  const isOpenProductsPopup = ref(false);
  const isVariantsPopupOpen = ref(false);
  const selectedProduct = ref(null);

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
      addVariantToOrder(product.variants[0]);
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

  async function addVariantToOrder(variant) {
    try {
      let selectedDates = null;
      
      // Если товар для аренды, сначала выбираем даты
      if (selectedProduct.value.listing === 'rent') {
        selectedDates = await proxy.$dateSelector(
          selectedProduct.value._id,
          variant._id,
          1,
          variant.price || selectedProduct.value.price
        );
        
        if (!selectedDates) {
          // Если отменили выбор дат, возвращаемся к выбору вариантов
          return;
        }
      }
      
      const position = {
        _id: selectedProduct.value._id,
        images: variant.images?.length > 0 ? variant.images : selectedProduct.value.images,
        name: formatProductName(selectedProduct.value, variant),
        listing: selectedProduct.value.listing,
        price: variant.price || selectedProduct.value.price,
        quantity: 1,
        unit: variant.unit || selectedProduct.value.unit,
        date: selectedDates,
        variant: variant._id,
        org_id: route.params._id
      };
      
      globals.actions.add(orders.state.current.positions, position);
      closeVariantsPopup();
    } catch (error) {
      console.error('Error adding variant to order:', error);
    }
  }


  // Функции управления позициями заказа
  function incrementOrderItemQuantity(productId, variantId) {
    const orderItem = orders.state.current.positions.find(item => 
      item._id === productId && item.variant === variantId
    );
    
    if (orderItem) {
      orderItem.quantity++;
    }
  }

  function decrementOrderItemQuantity(productId, variantId) {
    const orderItem = orders.state.current.positions.find(item => 
      item._id === productId && item.variant === variantId
    );
    
    if (orderItem) {
      orderItem.quantity--;
      
      if (orderItem.quantity < 1) {
        removeOrderItem(productId, variantId);
      }
    }
  }

  function removeOrderItem(productId, variantId) {
    const itemIndex = orders.state.current.positions.findIndex(item => 
      item._id === productId && item.variant === variantId
    );
    
    if (itemIndex > -1) {
      orders.state.current.positions.splice(itemIndex, 1);
    }
  }

  function updateOrderRentDates(productId, variantId, dates) {
    const orderItem = orders.state.current.positions.find(item => 
      item._id === productId && item.variant === variantId
    );
    
    if (orderItem) {
      orderItem.date = dates;
    }
  }

  // Data
  let order = ref(null)

  async function onSubmit() {

    orders.state.current.creator = {
      type: 'User',
      target: auth.state.user._id
    }

    orders.state.current.owner = {
      type: 'Organization',
      target: route.params._id,
    }

    orders.state.current.customer = {
      type: 'Customer',
      target: orders.state.current.customer._id || null,
    }

    order.value = await orders.actions.create(orders.state.current)
  }

  function redirectTo () {
    router.push({
      name: route.meta.context === 'backoffice' ? 'BackofficeOrderEdit' : 'OrganizationOrderEdit',
      params: { 
        order: order.value._id,
        _id: route.params._id
      } 
    })
  }

  const orderOrganization = ref({})



  onMounted(async() => {

    orderOrganization.value = await organizations.actions.read({
      _id: route.params._id,
      lookup: ['spots']
    })

    // await orders.actions.fetchOrder(route.params.id) // Implement this action in your store

    // order.value = orders.state.current
  })

</script>


<style lang="scss">

.vue-select {
  width: inherit;

  margin-right: 1rem;
}
.vue-select-header {
  height: 3rem;
}
</style>
