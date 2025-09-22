<template>
	<div v-if="order && orderOrganization" class="pd-thin bg-white"> 

	  <div v-if="order" class="mn-b-thin pos-relative w-100 bg-main radius-medium pd-medium">
	  	<div class="mn-b-small flex-nowrap flex">
		  	<p class="t-medium p-medium">
		     	Order No: <span class="p-small t-transp">#{{order._id}}</span>
		    </p>
			</div>

	  	<div class="flex-nowrap flex gap-thin pos-relative ">
		    <div v-for="(status, index) in globals.state.options.orders.statuses" :key="index" class="w-20">
		      <div
		      	class="bg-white br-anim br-glow radius-extra h-1r w-100"
		        :class="
					    { 'br-glow-anim': isActiveStatus(index) },
					    { 't-transp': !isActiveStatus(index) },
					    { 'blink': order.status === status.value && getNextStatus(order.status) }
					  "
		      />
		      <div 
		      	:class="{ 't-transp': !isActiveStatus(index) }"
					  class="mn-t-thin p-small t-medium uppercase">{{ status.value }}</div>
		    	</div>
			  </div>
	  </div>

  	<Popup 
      title="Payment Status" 
      @close-popup="closePaymentPopup" 
      :isPopupOpen="isOpenPaymentPopup"
      class="bg-light w-min-25r w-max-25r radius-medium pd-big"
    >
    	<Select 
        v-model:select="selectedPayments.type"
        :property="'value'"
        label="Type"
        :options="[
          {name: 'Cash',  value: 'cash'}, 
          {name: 'Card', value: 'card'}, 
          {name: 'Bank Transfer', value: 'bank'},
        ]"
        placeholder="Select type of payment" 
        size="small"
        class="bg-white mn-b-thin pd-regular radius-small w-100"
      />

      <Select 
        v-model:select="selectedPayments.status"
        :property="'value'"
        label="Status"
        :options="[
          {name: 'Unpaid',  value: 'unpaid'}, 
          {name: 'Paid', value: 'paid'}, 
          {name: 'Refunded', value: 'refunded'},
        ]"
        placeholder="Select status of payment" 
        size="small"
        class="bg-white mn-b-small pd-regular radius-small w-100"
      />


      <Button :submit="changePaymentStatus"  class="t-white w-100 bg-second">
				<span>Change Status</span>
			</Button>
	 	</Popup>

	  <Popup 
      title="Change order status" 
      @close-popup="closeStatusPopup" 
      :isPopupOpen="isOpeStatusPopup"
      class="bg-light w-min-30r w-max-30r radius-medium pd-big"
    >

			<!-- Добавить выбор примерного времени -->

    	<ul class="flex gap-thin flex-column mn-b-thin">
  			<CardOrderItem
  				v-for="(product, index) in order.positions" 
  				:key="`${product._id}_${product.variant || 'no-variant'}_${index}`"
  				:editable="!order.status_history || order.status_history.length <= 1" 
  				:productId="product._id"
  				:variantId="product.variant"
  				:images="product.images"
  				:name="product.name"
  				:quantity="product.quantity"
  				:unit="product.unit"
  				:dates="product.date"
  				:listing="product.listing"
  				:price="product.price"
  				:increase="() => orders.mutations.incrementItemQuantity(order, product._id, product.variant)"
	        :decrease="() => orders.mutations.decrementItemQuantity(order, product._id, product.variant)"
	        :remove="() => orders.mutations.removeProduct(order, product._id, product.variant)"
	        @updateRentDates="(productId, variantId, dates) => shopcart.actions.updateRentDates({ positions: order.positions, productId, variantId, dates })"
  				class="bg-white radius-small pd-small"
  			/>
      </ul>
      
      <PriceTotal 
        :totalPrice="cartTotalPrice"
        :currency="returnCurrency()"
        :showFees="globals.state.options?.orders?.showFees"
        :feesRate="globals.state.options?.orders?.feesRate || 0"
        :showVat="globals.state.options?.orders?.showVat"
        :vatRate="globals.state.options?.orders?.vatRate || 0"
      />

    	<Button :submit="setNextStatus"  class="t-white w-100 bg-second">
				<span>{{'Confirm Changing to ' + (getNextStatus(order.status)).label}}</span>
			</Button>
	 	</Popup>


	  
	  <div v-if="order" class="gap-thin cols-2 mobile:cols-1">

	    <div class="w-100">


		    <CardOrganization 
		    	v-if="orderOrganization[0]"
		      :organization="orderOrganization[0]"
		      :showRating="true"
		      :showFollowers="false"
		      :showProducts="false"
		      class="bg-light mn-b-thin w-100 o-hidden radius-medium pd-small "
		    />


		    <div 
		    	class="mn-b-thin bg-light w-100 o-hidden radius-medium "
		    >
		    	<div class="pd-small flex-nowrap flex">
			    	<div class="mn-r-auto">
				    	<span class="d-block t-medium p-medium mn-b-thin">Order is</span>
					    <span class=" t-lh-075 h2 d-block mn-b-small">{{order.status}}</span>
					    <p class="pd-thin radius-extra bg-black t-white w-max">{{formatDate(order.updatedAt, {language: locale })}}</p>
					  </div>
					 <!--  <div class="t-right">
					  	Cancel order<br>
					  	Exchange item
					  	<hr class="mn-b-thin mn-t-thin">
					  	For Delivery Queries Contact Us
					  	
					  </div> -->
					</div>

					<div v-if="order.customer.target?.number" class="pd-small flex flex-nowrap flex-v-center br-t br-black-transp-10 br-solid">
			    	<p class="w-100 t-medium p-medium">
			      	Phone
			      </p>

			      <p class="w-100 t-right ">
			      	{{order.customer.target?.number || 'Not specified'}}
			      </p>
			    </div>

			    <div class="pd-small   flex flex-nowrap flex-v-center br-t br-black-transp-10 br-solid">
			    	<p class="t-medium p-medium">
			      	Address
			      </p>

			      <p class="w-100 t-right">
							{{order.delivery.address || (order.delivery.spot[0]?.profile.name + (order.delivery.spot[0]?.address ? ', ' + order.delivery.spot[0].address : '')) || 'Not specified'}}
			      </p>



			    </div>


			    <div v-if="order.comment" class="pos-relative radius-thin mn-t-zero mn-thin bg-fifth-transp-10 pd-small">
			      <p class="mn-b-thin t-transp uppercase p-small t-medium">Comment</p>
			      <p>{{order.comment}}</p>
			    </div>

			    <div class="pd-small  flex flex-nowrap flex-v-center br-t br-black-transp-10 br-solid">
			    	<p class="t-medium p-medium">
			      	Delivery
			      </p>

			      <p class="w-100 t-right ">
			        {{order.delivery.type ? order.delivery.type : 'Not specified'}} 
			      </p>
			    </div>

			     <div class="pd-small  flex flex-nowrap flex-v-center br-t br-black-transp-10 br-solid">
			    	<p class="mn-r-auto t-medium p-medium">
			      	Payment
			      </p>


			      <p class="w-max t-right">
			        {{order.payment.type ? order.payment.type : 'Not specified'}} 
			      </p>

			      <p @click="route.meta.context !== 'user' && route.meta.context !== 'root' ? openPaymentPopup() : console.log('Context:', route.meta.context)" class="w-max pd-thin radius-small bg-second t-white mn-l-thin cursor-pointer hover-bg-black t-right">
			        {{order.payment.status ? order.payment.status : 'Unpaid'}} 
			      </p>
			    </div>


				</div>

				<div v-if="route.meta.context !== 'user' && route.meta.context !== 'root'" class="o-y-scroll bg-light pd-thin mn-b-thin pd-thin radius-medium flex-nowrap flex">
		  		<div class="flex-child-default mn-r-small w-max flex-v-center gap-thin flex-nowrap flex pd-thin radius-small bg-light-transp-20">
		  			<IconTime class="i-semi t-transp" fill="rgb(var(--black)" />
		        <p class="t-medium mn-r-auto"><span class="p-small t-transp">Estimated Reaction</span><br>{{formatDate(order.deadline, { language: locale })}}</p>
			  	</div>
			  	<button v-if="getNextStatus(order.status)" @click="openStatusPopup" class="flex-child-default  mn-l-auto bg-black t-white button">  
				    Mark as {{ (getNextStatus(order.status)).label }}  
				  </button>
		  	</div>

			<div class="bg-light radius-medium pd-medium  mn-r-bold  w-100">
		    <h3 class="mn-b-small">Chat With Us</h3>

		    <ChatPage
		    	:username="['Order', 'UserOrder'].includes(route.name) ? (order.user?.name || 'User') : 'Support'"
		    	:user="auth.state.user._id"
		    	:chatID="route.params.order"
		    	class="radius-semi bs-black bg-light o-hidden"
		    />

	    </div>
	     	<!-- <StatusHistory 
	     		v-if="orders.state.current.status_history"
	     		:statuses="statuses"
	     		:statusHistory="orders.state.current.status_history"
	     		:statusCurrent="orders.state.current.status"
	     		:edit="route.name === 'Order Edit'"
	     	/> -->

	     <!-- 	<button 
	     	@click="requestPayment(order)"
	     	v-if="
	     		order.status === 'Подтвержден' 
	     		&& order.payment.type === 'Online'
	     		&& payment.Status !== 'CONFIRMED'
	     		&& payment.Status !== 'REFUNDED'
	     	" 
	     	class='w-100 button'>Оплатить заказ</button> -->
	     	<span class="t-transp" v-if="payment && payment.Status === 'CONFIRMED'">Paid</span> 
	    </div>  

	    <div class="bg-light radius-medium pd-medium   w-100">
	  		<h3 class="mn-b-small">Order Summary</h3>

	  		<ul class="flex gap-thin flex-column mn-b-thin">
	  			<CardOrderItem
	  				v-for="(product, index) in order.positions" 
	  				:key="`${product._id}_${product.variant || 'no-variant'}_${index}`"
	  				:editable="false" 
	  				:productId="product._id"
	  				:variantId="product.variant"
	  				:images="product.images"
	  				:name="product.name"
	  				:quantity="product.quantity"
	  				:unit="product.unit"
	  				:dates="product.date"
	  				:listing="product.listing"
	  				:price="product.price"
	  				class="bg-white radius-small pd-small"
	  			/>
	      </ul>
	      
	      <PriceTotal 
          :totalPrice="cartTotalPrice"
          :deliveryRate="deliveryCost"
          :currency="returnCurrency()"
          :showFees="globals.state.options?.orders?.showFees"
          :feesRate="globals.state.options?.orders?.feesRate || 0"
          :showVat="globals.state.options?.orders?.showVat"
          :vatRate="globals.state.options?.orders?.vatRate || 0"
				  :showDeliveryFee="globals.state.options?.orders.showDeliveryFee"

        />
     	</div>

	   
	  </div>
	</div>		

</template>


<script setup="props">
	import { computed, ref, onMounted  } from 'vue'
	import { useRouter, useRoute } from 'vue-router'

	import Button from '@martyrs/src/components/Button/Button.vue'
	import Select from '@martyrs/src/components/Select/Select.vue'
	import Popup from "@martyrs/src/components/Popup/Popup.vue";

	import IconTime  from '@martyrs/src/modules/icons/entities/IconTime.vue'

	// Block
	import CardOrderItem  from '@martyrs/src/modules/orders/components/blocks/CardOrderItem.vue'
	import CardOrganization from '@martyrs/src/modules/organizations/components/blocks/CardOrganization.vue'

	import ChatPage from '@martyrs/src/modules/chats/components/pages/ChatPage.vue';

	import StatusHistory from '@martyrs/src/modules/orders/components/blocks/StatusHistory.vue'
	import PriceTotal from '@martyrs/src/modules/orders/components/elements/PriceTotal.vue';
	import FormPayment from '@martyrs/src/modules/orders/components/sections/FormPayment.vue'

	import * as globals 	from '@martyrs/src/modules/globals/views/store/globals.js'
	import * as auth from '@martyrs/src/modules/auth/views/store/auth.js'
	import * as orders 	from '@martyrs/src/modules/orders/store/orders.js'
	import * as products 	from '@martyrs/src/modules/products/store/products.js'
	import * as organizations 	from '@martyrs/src/modules/organizations/store/organizations.js'

	import { useI18n } from 'vue-i18n';
	import { useGlobalMixins } from '@martyrs/src/modules/globals/views/mixins/mixins.js';
	
	const { locale } = useI18n();
	const { returnCurrency } = useGlobalMixins();

	const router = useRouter()
	const route = useRoute()

	const order = ref(null)
	const productsOrganization = ref(null)
	const orderOrganization = ref(null)

	const statuses = globals.state.options.orders.statuses
	const statusLabels = ['Created', 'Confirmed', 'Preparing', 'In use', 'Finished'];

  if (route.meta.context === 'user' && 
      auth.state.user && 
      route.params._id !== auth.state.user?._id && 
      !auth.state.access?.roles?.includes('ROLE_MODERATOR') && 
      !auth.state.access?.roles?.includes('ROLE_ADMIN')) {
    router.push('/401');
  }

	const isOpeStatusPopup = ref(false);
	const selectedMember = ref(null);

	function openStatusPopup(member) {
	  isOpeStatusPopup.value = true;
	  if (typeof member === "number") selectedMember.value = member;
	}

	function closeStatusPopup() {
	  isOpeStatusPopup.value = false;
	  selectedMember.value = null;
	}

	const isOpenPaymentPopup = ref(false);

	const selectedPayments = ref({
		type: null,
		status: null
	});

	function openPaymentPopup() {
	  selectedPayments.value.type = order.value.payment.type
	  selectedPayments.value.status = order.value.payment.status

	  isOpenPaymentPopup.value = true;
	}

	function closePaymentPopup() {
	  isOpenPaymentPopup.value = false;
	}

	onMounted(async()=>{
		order.value = await orders.actions.read({_id: route.params.order})
		order.value = order.value[0]

	  orderOrganization.value = await organizations.actions.read({
	    _id: order.value?.owner.target._id,
	    location: globals.state.position?.location,
	    lookup: ['spots']
	  });

	})


const deliveryCost = computed(() => {
  const type = orders.state.current.delivery.type
  const distance = orderOrganization.value[0]?.distance || 0
  const config = globals.state.options?.orders?.delivery_formula || {}

  return orders.getters.getDeliveryPrice(type, distance, config)
})

	let cartTotalPrice = computed(() => {
     return Number(order.value?.positions.reduce((total, product) => {
      // Проверяем тип листинга
      if (product.listing === 'rent') {
        const start = new Date(product.date.start)
        const end = new Date(product.date.end)
        const diffTime = Math.abs(end - start)
        return total + product.price * (Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
      } else {
        // Для обычных товаров умножаем на количество
        return total + product.price * (product.quantity || 1);
      }
    }, 0));
  })


  let cartTotalAmount = computed(() => {
    return Number(order.value?.positions.reduce((total, product) => {
      return total + product.quantity;
    }, 0));
  })

  // Функция установки нового статуса
	async function setStatus (newStatus) {
	  orders.state.current.status = newStatus

	  await orders.actions.update(orders.state.current)
	} 


	function getNextStatus(currentStatus) {
	  const currentIndex = globals.state.options.orders.statuses.findIndex(status => status.value === currentStatus);

	  if (currentIndex !== -1 && currentIndex + 1 < statuses.length) {
	    return globals.state.options.orders.statuses[currentIndex + 1];
	  }
	  return null; // If next status doesn't exist
	}

	const isActiveStatus = (index) => {
	  return globals.state.options.orders.statuses.slice(index).some(status => status.value === order.value.status);
	};

  async function changePaymentStatus() {
    if (selectedPayments.value.status && selectedPayments.value.type) {
      orders.state.current.payment = selectedPayments.value;

      await orders.actions.update(orders.state.current)
    } else {
      console.error('Payment status is void. Must handle somehow.');
    }

		closePaymentPopup()
  }

  async function setNextStatus() {
    const nextStatus = getNextStatus(orders.state.current.status);

    if (nextStatus) {
      orders.state.current.status = nextStatus.value;
      
      // Обновляем позиции заказа из текущего состояния
      orders.state.current.positions = order.value.positions;

      await orders.actions.update(orders.state.current)
    } else {
      console.error('Next status is void. Must handle somehow.');
    }

		closeStatusPopup()
  }

  async function cancelOrder() {
  	alert()

    orders.state.current.status = 'canceled';

    await orders.actions.update(orders.state.current)
}


  async function confirmOrder() {
  	alert()

    orders.state.current.status = 'confirmed';

    await orders.actions.update(orders.state.current)
	}

	function calculateDeliveryTime(distance, date) {
	  if (!distance) {
	    return null;
	  }

	  const basePreparationTime = 10 * 60 * 1000; // Convert to milliseconds
	  const travelTime = Math.ceil((15 + 5 + 3 * distance) / 5) * 5 * 60 * 1000;

	  // Преобразование даты начала в миллисекунды и добавление времени подготовки и доставки
	  const startTime = new Date(date).getTime();
	  const estimatedDeliveryTime = new Date(startTime + basePreparationTime + travelTime);

	  return estimatedDeliveryTime;
	}


</script>

<style lang="scss" scoped>
	.blink {
	  animation: blink-animation 1s ease infinite;
	}

	@keyframes blink-animation {
	  0%, 100% {
	    opacity: 1;
	  }
	  50% {
	    opacity: 0.8;
	  }
	}
</style>