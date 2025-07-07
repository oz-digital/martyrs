<template>
	<div class="pd-big mn-regular order-customer-card col"> 
	  <p class="mn-regular flex-center flex-nowrap flex w-100">
				<!-- <img loading="lazy" v-if="order.status === 'Created'" 			class="mn-r-small" src="@/assets/icons/status/created.svg"/>
				<img loading="lazy" v-if="order.status === 'Confirmed'"	class="mn-r-small" src="@/assets/icons/status/confirmed.svg"/>
				<img loading="lazy" v-if="order.status === 'Awaiting shipment'" 			class="mn-r-small" src="@/assets/icons/status/paid.svg"/>
				<img loading="lazy" v-if="order.status === 'In delivery'" 		class="mn-r-small" src="@/assets/icons/status/finished.svg"/>
				<img loading="lazy" v-if="order.status === 'Finished'" 		class="mn-r-small" src="@/assets/icons/status/finished.svg"/> -->
	    <span class="w-100 t-medium p-semi">{{order.status}}</span>
	  </p>
	  
	  <div class="flex-nowrap flex">
	  	<div class="mn-r-bold pd-r-big br-right-dark w-66">
	  		<ul class="mn-semi">
	        <!-- <li v-for="(product, index) in orderProducts(order.items.slice(0,2))" :key="product.id" class="shop-cart-item">
	        	<img loading="lazy" v-if="product.images" :src="require( `@/assets/images/products/${product.images[0]}`)">
	          <img loading="lazy" v-if="!(product.images)" :src="require( `@/assets/icons/photo.svg`)">
	          
	          <div class="text-left">
	            <p class="name">{{ product.name }}</p>

	            <div class="flex">
	              <div class="small-underline variant">
	                <span v-if="!product.size && !product.color" class="">One-size</span>
	                <span v-if="product.size" class="">{{ product.size}}</span>
	                <span v-if="product.color && product.size" class="">, </span>
	                <span v-if="product.color" class="">{{ product.color}}</span>
	              </div>
	              
	              <p class="t-demi">$ {{product.quantity}} x {{product.price}}</p>
	            </div>

	          </div>

	    		</li> -->
	      </ul>
	      <p class="mn-small t-medium p-semi">
	      	Adress and delivery
	      </p>
	      <p class="mn-small">
	        {{order.delivery.adress}} 
	      </p>
	      <p v-if="order.delivery.type === 'Post'" class="w-">
	     		You have chosen delivery using the courier service CDEK. Estimated delivery date {{DateToFormattedString(order.createdAt)}}.
	      </p>

	      <p v-if="order.delivery.type === 'Courier'" class="w-">
	     		You have chosen delivery by courier. Estimated delivery date {{DateToFormattedString2(order.createdAt)}}.
	      </p>

	      <p v-if="order.delivery.type === 'Pickup'" class="w-">
	     		You have chosen to receive the order in the Moscow store.
	      </p>
	    </div>


	    <div class="w-40">
	    	<p class="mn-small w-100 t-medium p-semi">
	        <span class="t-transp">Order:</span> №{{order._id.slice(0,8)}} 
	      </p>
	       <p  v-if="order.delivery.type === 'Post'" class="mn-medium w-100">
	       	<span class="t-transp">Estimated shipping date:</span><br>{{DateToFormattedString(order.createdAt)}}
	      </p>
	      <p  v-if="order.delivery.type === 'Courier'" class="mn-medium w-100">
	       	<span class="t-transp">Shipping date:</span><br>{{DateToFormattedString2(order.createdAt)}}
	      </p>
	      <p  v-if="order.delivery.type === 'Pickup'" class="mn-medium w-100">
	       	<span class="t-transp">Type of delivery:</span><br>Pickup
	      </p>
	      <hr class="mn-medium">

	      <div :class="{'mn-semi': order.delivery.type == ''}" class="flex">
	        <p  class="t-transp">In total</p>
	        <p>$ {{ cartTotalPrice }}</p>
	      </div>
	      <div v-if="order.delivery.type !== ''" class="mn-semi flex">
	        <p  class="t-transp">Delivery</p>
	        <p v-if="order.delivery.type === 'Pickup'">Free</p>
	        <p v-if="order.delivery.type === 'Post'">$ 10</p>
	        <p v-if="order.delivery.type === 'Courier'">$ 20</p>
	      </div>
	      <div class="mn-semi intotal flex-bottom flex">
	        <p  class="t-transp">In total to pay</p>
	        <p v-if="order.delivery.type === ''" class="p-semi t-semi">$ {{ cartTotalPrice }}</p>
	        <p v-if="order.delivery.type === 'Pickup'" class="p-semi t-semi">$ {{ cartTotalPrice}} ₽</p>
	        <p v-if="order.delivery.type === 'Courier'" class="p-semi t-semi">$ {{ cartTotalPrice + 20 }}</p>
	        <p v-if="order.delivery.type === 'Post'" class="p-semi t-semi">$ {{ cartTotalPrice + 10 }}</p>
	      </div>
	      <hr  v-if="order.status === 'Confirmed'" class="mn-semi" >
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
	  </div>
	</div>		

</template>


<script setup="props">
	import { defineProps,computed } from 'vue'
	import { useRouter } from 'vue-router'

	const router = useRouter()

	const props = defineProps({
	  order: Object,
	});



	// await store.dispatch('payments/getStatus', props.order._id)

	// const payment = computed(() => store.state.payments.current)
	// const cartTotalPrice = computed(() => store.getters['orders/orderTotalPrice'])

	function requestPayment(order) {
		 // store.dispatch("payments/newPayment", order);
	}
	
	function DateToFormattedString(d) {         
    var fixedDate = new Date(d);                                                     
    var mm = (fixedDate.getMonth()+1).toString(); // getMonth() is zero-based         
    var dd  = (fixedDate.getDate() + 6).toString();            
                         
    return (dd[1]?dd:"0"+dd[0]) + '/' + (mm[1]?mm:"0"+mm[0]);
  }

  function DateToFormattedString2(d) {         
    var fixedDate = new Date(d);                                                     
    var mm = (fixedDate.getMonth() + 1).toString(); // getMonth() is zero-based         
    var dd  = (fixedDate.getDate() + 1).toString();            
                         
    return (dd[1]?dd:"0"+dd[0]) + '/' + (mm[1]?mm:"0"+mm[0]);
  }

	// function orderProducts (items) {
	//   return items.map(({ id, size, color, quantity }) => {
	//     const product = store.state.products.all.find(product => product.id === id)
	//     return {
	//       name: product.name,
	//       images: product.images[0],
	//       color,
	//       size,
	//       price: product.price,
	//       id: product.id,
	//       quantity
	//     }
	//   })
	// }

</script>

<style lang="scss" scoped>
.shop-cart-item {
	&:first-of-type { padding-top: 0;}
}

</style>