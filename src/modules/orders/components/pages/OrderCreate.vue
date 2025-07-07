<template>

<section class="bg-white pd-thin">

	<!-- Ask to login  -->
	<AskToLogin class="mn-b-thin" v-if="auth.state.access.status === false" /> 

	<!-- Empty State   -->
	<EmptyState  
		v-if="shopcart.state.positions < 1" 
	/>	
	<Succes 
		v-if="order.status === true && shopcart.state.positions.length > 0" 
		:order="order" 
	/>
	<!-- Уведомления о минимальной сумме заказа и времени работы -->
	<div v-if="shopcart.state.positions.length > 0" class="w-100 gap-thin cols-1 mn-b-thin">
		<div v-if="!isOpen" class="bg-fifth-nano pd-small radius-medium t-center">
			<p class="t-fourth">⚠️ This spot is currently closed. You can place an order, but it will be processed when the spot opens.</p>
		</div>
		<div v-if="cartTotalPrice < minOrderAmount" class="bg-fourth-nano pd-small radius-medium t-center">
			<p class="t-fourth">⚠️ Minimum order amount is {{ formatPrice(minOrderAmount) }}. Your current total is {{ formatPrice(cartTotalPrice) }}.</p>
		</div>
	</div>
	<!-- Order form -->
	<div class="gap-small mn-b-thin cols-2">
		<!-- Order Form -->
		<div
			v-if="orders.state.current.status !== true && shopcart.state.positions.length > 0" 
			class="rows-1 gap-thin"
		>
			<FormCustomerDetails
				:customer="orders.state.current.customer"
			/>
			<FormPayment 	
				v-if="orders.state.current.status !== true && shopcart.state.positions.length > 0"
				:order="orders.state.current"  
				:organization="orderOrganization[0]" 
			/>
			<FormDelivery 	
				v-if="orders.state.current.status !== true && shopcart.state.positions.length > 0"
				:order="orders.state.current" 
				:organization="orderOrganization[0]" 
			/>
			
		</div>

		<!-- Order positions -->
		<div 
			v-if="shopcart.state.positions.length > 0" 
			class="bg-white br-solid br-light br-1px pd-medium radius-medium"
		>
			<h4 class="font-second mn-b-thin">Your Order</h4>

			<ul class="flex gap-thin flex-wrap mn-b-thin">
				<CardOrderItem 
					v-for="(product, index) in shopcart.state.positions" 
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
	        :increase="() => shopcart.actions.incrementItemQuantity(product._id, product.variant)"
	        :decrease="() => shopcart.actions.decrementItemQuantity(product._id, product.variant)"
	        :remove="() => shopcart.actions.removeProduct(product._id, product.variant)"
					@updateRentDates="(productId, variantId, dates) => shopcart.actions.updateRentDates({ productId, variantId, dates })"
	        class="w-100 bg-white "
	      />
			</ul>

				<div 
				class="mn-b-thin"
			>	
				<PriceTotal 
          :totalPrice="cartTotalPrice"
          :deliveryRate="deliveryCost"
          :currency="returnCurrency()"
          :showFees="globals.state.options?.orders.showFees"
          :feesRate="globals.state.options?.orders.feesRate || 0"
          :showVat="globals.state.options?.orders.showVat"
          :vatRate="globals.state.options?.orders.vatRate || 0"
          :showDeliveryFee="globals.state.options?.orders.showDeliveryFee"
        />
			</div>
			<!-- Send order -->
		   <Button
       v-if="orders.state.current.status !== true && shopcart.state.positions.length > 0"
        :submit="() => handleCreate()"
        class="bg-main mn-b-small pd-small radius-big w-100 button"
        :disabled="
		      errorName 
		      || errorPhoneOrMessenger 
		      || errorCity 
		      || errorAddress 
		      || errorDelivery 
		      || errorPayment
		      || isLocationLoading
		      || cartTotalPrice < minOrderAmount
		    "
      >
        <span>Place an Order</span>
      </Button>

		  <p class='mn-b-thin'>
				I agree that placing the order places me under an obligation to make a payment in accordance with <a class="t-semi font-second t-second" href="/legal/terms-of-use" target="_blank">Terms of Use.</a>
			</p>
			<p >
				
			</p>
		</div>

	</div>

	
	
</section>

</template>


<script setup>
///////////////////////////////////////////////////////////////////////////////////////////////////
// Import components
///////////////////////////////////////////////////////////////////////////////////////////////////
import Button from '@martyrs/src/components/Button/Button.vue'
// Block
import CardOrderItem from '@martyrs/src/modules/orders/components/blocks/CardOrderItem.vue'
// Sections
import AskToLogin from '@martyrs/src/modules/orders/components/sections/AskToLogin.vue'
import Succes from '@martyrs/src/modules/orders/components/sections/Succes.vue'
import EmptyState from '@martyrs/src/modules/orders/components/sections/EmptyState.vue'

import PriceTotal from '@martyrs/src/modules/orders/components/elements/PriceTotal.vue';

import FormCustomerDetails from '@martyrs/src/modules/orders/components/sections/FormCustomerDetails.vue'
import FormDelivery from '@martyrs/src/modules/orders/components/sections/FormDelivery.vue'
import FormPayment from '@martyrs/src/modules/orders/components/sections/FormPayment.vue'
///////////////////////////////////////////////////////////////////////////////////////////////////
// Import libs
///////////////////////////////////////////////////////////////////////////////////////////////////
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute,useRouter } from 'vue-router'
import { useGlobalMixins } from "@martyrs/src/modules/globals/views/mixins/mixins.js"

// Store
import * as globals from '@martyrs/src/modules/globals/views/store/globals.js';
import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';
import * as shopcart from '@martyrs/src/modules/orders/store/shopcart.js';
import * as organizations from '@martyrs/src/modules/organizations/store/organizations.js';
import * as orders from '@martyrs/src/modules/orders/store/orders.js';
import * as users from '@martyrs/src/modules/auth/views/store/users.js';

const emits = defineEmits(['page-loading', 'page-loaded']);

///////////////////////////////////////////////////////////////////////////////////////////////////
// Variables and computed
//////////////////////////////////////////////////////////////////////////////////////////////////
const isLocationLoading = ref(false)
// Accessing router and store
const route = useRoute()
const router = useRouter()
const { returnCurrency, formatPrice } = useGlobalMixins()
// COMPUTED
const order = computed(() => orders.state.current)
const user = computed(() => users.state.current)

const cartTotalPrice = shopcart.getters.cartTotalPrice

const deliveryCost = computed(() => {
  const type = orders.state.current.delivery.type
  const distance = orderOrganization.value[0]?.distance || 0
  const config = globals.state.options?.orders?.delivery_formula || {}

  return orders.getters.getDeliveryPrice(type, distance, config)
})

// Organization
const orderOrganization = ref({})
const spotOrganization = ref({})
const isOpen = ref(true)

// Новые переменные для проверки минимальной суммы заказа и времени работы
const minOrderAmount = ref(0)

function checkIsOpenNow(worktime) {
  try {
    console.log('[checkIsOpenNow] worktime:', worktime);

    if (
      !worktime ||
      typeof worktime !== 'object' ||
      Array.isArray(worktime) ||
      !worktime.regular
    ) {
      console.log('[checkIsOpenNow] invalid, returning true');
      return true;
    }

    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    console.log('[checkIsOpenNow] currentDay:', currentDay);
    console.log('[checkIsOpenNow] currentTime:', currentTime);

    const specialDay = worktime.special?.find(s => {
      const d = new Date(s.date);
      return (
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate()
      );
    });

    if (specialDay) {
      console.log('[checkIsOpenNow] specialDay:', specialDay);
      if (!specialDay.isOpen) return false;
      return specialDay.periods?.some(p => p.open <= currentTime && p.close > currentTime);
    }

    const regularDay = worktime.regular.find(d => d.dayOfWeek === currentDay);
    if (!regularDay || !regularDay.isOpen) return false;

    return regularDay.periods?.some(p => p.open <= currentTime && p.close > currentTime);
  } catch (err) {
    console.error('[checkIsOpenNow] error:', err);
    return true;
  }
}


if (!globals.state.options.orders.allowUnauthenticatedOrders && !auth.state.user._id) { 
	router.push({name: 'Sign In'})	
}


orders.mutations.resetOrder()

onMounted(async()=> {
	emits('page-loading');

	isLocationLoading.value = true

	if (auth.state.user._id) {
		let data = await users.actions.read({ _id:auth.state.user._id, user: auth.state.user._id });

		orders.state.current.customer.profile.name = users.state.current.profile.name
		orders.state.current.customer.phone = users.state.current.phone
		orders.state.current.customer.phone = users.state.current.phone
	}
	
	orderOrganization.value = await organizations.actions.read({
	  _id: shopcart.state.organization,
	  location: globals.state.position?.location,
	  lookup: ['spots']
	})
	
	// Получаем информацию о минимальной сумме заказа и времени работы из spot
	if (orderOrganization.value && orderOrganization.value[0]?.spots?.length > 0) {
	  spotOrganization.value = orderOrganization.value[0].spots[0];
		isOpen.value = checkIsOpenNow(spotOrganization.value.worktime);
	  console.log(spotOrganization.value)
	  minOrderAmount.value = spotOrganization.value.minorder || 0;
	}


	
 	isLocationLoading.value = false
  emits('page-loaded');

  if (typeof gtag === 'function') {
    gtag('event', 'begin_checkout', {
      currency: returnCurrency(), // Замените на вашу валюту
      value: cartTotalPrice || 0,
      items: shopcart.state.positions.map(item => ({
        item_id: item.product?._id,
        item_name: item.product?.name,
        price: item.price || 0,
        quantity: item.quantity || 1,
        item_category: item.product?.category || '',
        item_brand: orderOrganization.value.profile?.name || ''
      })),
      organization: orderOrganization.value.profile?.name || '',
      location: globals.state.position?.location || 'unknown'
    });
  }
})


watch(
  () => orders.state.current.delivery,
  async (newVal) => {
    if (newVal?.location) {
    	isLocationLoading.value = true

      orderOrganization.value = await organizations.actions.read({
        _id: shopcart.state.organization,
        location: newVal.location,
        lookup: ['spots']
      })
      
      isLocationLoading.value = false
    }
  },
  { deep: true }
)


/////////////////////////////
// Store Verification
/////////////////////////////
const errorName = computed(() => {
  if (orders.state.current.customer.name?.length < 2) { return true } else { return false }
});

const errorPhoneOrMessenger = computed(() => {
  const hasMessengerType = orders.state.current.customer.messenger?.type;
  const hasMessengerValue = orders.state.current.customer.messenger?.value?.length >	 2;
  const hasPhone = orders.state.current.customer.number?.length > 0;
  // Ошибка, если нет ни номера телефона, ни корректного типа и значения мессенджера
  return !hasPhone && !(hasMessengerType && hasMessengerValue);
});

const errorAddress = computed(() => {
  const type = orders.state.current.delivery.type;
  if (type === "pickup") {
    return !orders.state.current.delivery.spot;
  } else if (type === "courier" || type === "mail") {
    const address = orders.state.current.delivery.address;
    return !address || typeof address !== 'string' || address.length < 2;
  }
  return false;
});

const errorDelivery = computed(() => {
  if (orders.state.current.delivery.type) {return false } else {return true } 
})

const errorPayment = computed(() => {
  if (orders.state.current.payment.type) { return false } else {return true } 
})
/////////////////////////////
// Methods
/////////////////////////////
async function handleCreate() {

	orders.state.current.status = 'created';

	orders.state.current.owner = {
		target: orderOrganization.value[0]._id,
		type: 'organization'
	}

	if (auth.state.user._id) {
		orders.state.current.creator = {
			target: auth.state.user._id,
			type: 'user'
		}
	}

	if (auth.state.user._id) {
		orders.state.current.customer = {
			target: auth.state.user._id,
			type: 'user'
		}
	}

	orders.state.current.positions = shopcart.state.positions

 	const referralCode = localStorage.getItem('referalCode');
  
  if (referralCode) {
    orders.state.current.referralCode = referralCode;
  }

  let order = await orders.actions.create(orders.state.current);

   if (order) {
	  if (typeof gtag === 'function') {
	    gtag('event', 'purchase', {
	      transaction_id: order._id,
	      value: cartTotalPrice || 0,
	      currency: returnCurrency(), // Замените на вашу валюту
	      tax: 0, // Если есть данные о налоге
	      shipping: deliveryCost.value, // Если есть данные о доставке
	      items: shopcart.state.positions.map(item => ({
	        item_id: item.product?._id,
	        item_name: item.product?.name ,
	        price: item.price || 0,
	        quantity: item.quantity || 1,
	        item_category: item.product?.category || ''
	      })),
	      organization: orderOrganization.value?.profile?.name,
	      location: globals.state.position?.location || 'unknown',
	      referral_code: referralCode || null,
	      user_id: auth.state.user._id || 'anonymous'
	    });
	  }
	}

  if (order) {
  	await router.push({
  		name: 'Order',
  		params: {
  			order: order._id
  		}
  	})
  		
  	shopcart.actions.resetShopcart()

  } else {
  	alert('something wrong')
  }
}
</script>

<style lang="scss">

.round-wrapper {
	position: relative;

	.round {
		margin: 0;
		margin-right: 1rem;
	}

	input:checked {
		background: #00ff88;
	}

	.round-checkmark {
		position: absolute;
		width: 0.5rem;
		height: 0.5rem;
		background: white;

		left: 0.5rem;
		top:  0.5rem;

		opacity: 1;
	}
}
</style>