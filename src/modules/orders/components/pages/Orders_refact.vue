<template>
	<div class="mn-b-big">
		 <!-- v-if="order.state.current._id === ''" -->
		<p class="mn-b-small t-semi p-big">История заказов</p>
		<!-- @click="store.commit('orders/resetOrder')" v-if="order.state.current._id !== ''"  -->
		<p class="mn-b-small t-semi p-big flex-nojustify flex-center flex link-inherit">
			<svg class="mn-r-small" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path fill="rgb(var(--black))" fill-rule="evenodd" clip-rule="evenodd" d="M5.34661 10.8333L10.5907 16.0774L9.41217 17.2559L2.15625 10L9.41217 2.74408L10.5907 3.92259L5.34661 9.16667H17.5014V10.8333H5.34661Z" />
			</svg>
			Назад ко всем заказам
		</p>
		<hr class="mn-b-semi">

		<!-- <transition  @before-enter="scrollTop" name="scale">	 -->
			<!-- <OrderCard v-if="order.state.current._id !== ''" :order="order.state.current" /> -->
		<!-- </transition> -->

		<transition  @before-enter="scrollTop" name="scale">	
			<div v-if="order.state.current._id === ''" >	
				
				<section  v-for="order in user.orders" class="pd-big mn-b-regular order-customer-card col"> 
		      <p class="mn-b-regular flex-center flex-nowrap flex w-100">
						<img loading="lazy" v-if="order.status === 'Создан'" 			class="mn-r-small" src="@/assets/icons/status/created.svg"/>
						<img loading="lazy" v-if="order.status === 'Подтвержден'"	class="mn-r-small" src="@/assets/icons/status/confirmed.svg"/>
						<img loading="lazy" v-if="order.status === 'Ожидает отправки'" 			class="mn-r-small" src="@/assets/icons/status/paid.svg"/>
						<img loading="lazy" v-if="order.status === 'Отправлен'" 		class="mn-r-small" src="@/assets/icons/status/finished.svg"/>
						<img loading="lazy" v-if="order.status === 'Выполнен'" 		class="mn-r-small" src="@/assets/icons/status/finished.svg"/>
		        <span class="w-100 t-medium p-big">{{order.status}}</span>
		      </p>
		      <ul class="mn-b-semi order-images-wrapper">
		        <li v-for="(product, index) in orderProducts(order.positions.slice(0,2))" :key="product._id" class="mn-r-small">
    	        <img loading="lazy" v-if="product.images" :src="`@/assets/images/products/${product.images.links[0]}`">
			        <img loading="lazy" v-if="!product.images" :src="require( `@/assets/icons/photo.svg`)">
		    		</li>
		    		<li v-if="order.positions.length >= 3" class="mn-r-small order-last-image">
		    			+{{order.positions.length - 2 }}
		  			</li>
		      </ul>
		      <div class="flex">
		      	<div>
				      <p class="w-100">
				        <span class="t-transp">Заказ:</span> #{{order._id}} 
				      </p>
				       <p  v-if="order.status !== 'Отправлен' && (order.info.delivery === 'Почтой' || order.info.delivery === 'Курьером')" class="w-100">
				       	<span class="t-transp">Предполагаемая дата отправки:</span>  {{DateToFormattedString(order.createdAt)}}
				      </p>

				       <p  v-if="order.status === 'Отправлен'"  class="w-100">
				       	<span  class="t-transp">Дата отправки:</span> {{DateToFormattedString(order.createdAt)}}
				      </p>
				    </div>
				    <div>
				     <button @click="store.commit('orders/setOrder', order)" class='button'>Смотреть заказ</button>
				    </div>  
			    </div>
			  </section>
	  	</div>
  	</transition>

	</div>

</template>

<script setup="props">
/////////////////////////////
// COMPONENT DEPENDENCIES
/////////////////////////////
// import OrderCard from '@/components/blocks/OrderCard.vue';

import { toRefs, computed } from 'vue';

/////////////////////////////
// HELPERS
/////////////////////////////

/////////////////////////////
// CREATED
/////////////////////////////
const props = defineProps({
  user: Object,
});

const store = useStore()

const { user } = toRefs(props);

const cartTotalPrice = computed(() => store.getters['shopcart/cartTotalPrice'])
	

function scrollTop(){
	document.getElementById('page-content').scrollIntoView({behavior: 'smooth', block: "start", inline: "start"});
}

function orderProducts (positions) {
  return positions.map(({ _id, size, color, quantity }) => {
    const product = store.state.products.all.find(product => product._id === _id)
    return {
      name: product.name,
      images: product.images[0],
      color,
      size,
      price: product.price,
      _id: product._id,
      quantity
    }
  })
}

/////////////////////////////
// MOUNTED
/////////////////////////////
</script>

<style lang="scss" scoped>
.order-customer-card {
	background: #FBFCFD;	
}
.order-images-wrapper {
	display: flex;

	img {
		width: 4.5rem;
    height: 5.5rem;
		object-fit: cover;
	}

	.order-last-image {
		height: 6rem;
		width: 5rem;

		text-align: center;
		line-height: 6rem;

		font-size: 1.5rem;

		background: #00ff88;
		color: white;

	}
}

</style>
