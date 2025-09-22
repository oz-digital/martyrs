<template>
	<section class="z-index-5 flex flex-column  transition-ease-in-out bg-white shop-cart" :class="{'shop-cart-active':shopcart.state.currentState === true}">
    <!-- ---------------------------------------------------------------- -->
    <!-- 01. Popup Header  -->
    <!-- ---------------------------------------------------------------- -->
    <div class="pd-big mobile:pd-medium pd-b-zero mobile:pd-b-zero flex-nowrap flex">
      <div class="mn-b-medium w-100">
        <h4 class="mn-b-thin p-semi">{{t('title')}}</h4>
        <p class="t-transp p-small">{{t('subtitle')}} {{ t('positions', { count: StoreCartAmount }) }}</p>
      </div>
      <IconCross @click="shopcart.actions.toggleShopcart" class="cursor-pointer i-medium button-icon"/>
    </div>
    <!-- ---------------------------------------------------------------- -->
    <!-- 02. Popup Content  -->
    <!-- ---------------------------------------------------------------- -->
    <div class="pd-big pd-t-zero mobile:pd-t-zero mobile:pd-medium h-70 flex flex-column w-100 pos-relative o-x-hidden o-y-scroll gap-small shopcart-content">
      <!-- Empty State -->
      <p v-if="!(shopcart.state.positions.length > 0)" class="mn-t-medium"><i>{{t('emptystate')}}</i></p>
      <!-- Shopcart positions -->
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
      />
    </div>
    <!-- ---------------------------------------------------------------- -->
    <!-- 03. Footer  -->
    <!-- ---------------------------------------------------------------- -->
    <div  class="h-30 transition-ease-in-out pd-b-medium pd-t-medium pd-big transition-cubic bg-light t-black">
      <div v-if="shopcart.state.positions.length > 0" class="mn-b-small total-price">
       <PriceTotal 
          :totalPrice="cartTotalPrice"
          :currency="returnCurrency()"
          :showFees="globals.state.options?.orders.showFees"
          :feesRate="globals.state.options?.orders.feesRate"
          :showVat="globals.state.options?.orders.showVat"
          :vatRate="globals.state.options?.orders.vatRate"
        />
      </div>
      <button v-if="shopcart.state.positions.length > 0" @click="openOrder()" class="bg-main t-black w-100 button">{{ t('fastorder') }}</button>
    </div>  

      <!-- ---------------------------------------------------------------- -->
      <!-- 04. Color Overlay  -->
      <!-- ---------------------------------------------------------------- -->
      <transition name="fade">
      <teleport to="#app-wrapper" v-if="shopcart.state.currentState">

        <div 
           v-if="shopcart.state.currentState"
          @click="() => shopcart.state.currentState = false"
          class="color-overlay z-index-3"
          :class="{'active':shopcart.state.currentState === true}"
        >
        </div>
      </teleport>
      </transition>
  </section>
</template>


<script setup>
  /////////////////////////////
  // COMPONENT DEPENDENCIES
  /////////////////////////////
	import { computed,onMounted } from 'vue'
  // Route
  import { useRouter,useRoute } from 'vue-router'
  // i18n
  import { useI18n } from 'vue-i18n'
  // Components
  import CardOrderItem from '@martyrs/src/modules/orders/components/blocks/CardOrderItem.vue';
  import PriceTotal from '@martyrs/src/modules/orders/components/elements/PriceTotal.vue';

  import IconCross from '@martyrs/src/modules/icons/navigation/IconCross.vue';

  import * as globals from '@martyrs/src/modules/globals/views/store/globals.js';
  import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';
  import * as shopcart from '@martyrs/src/modules/orders/store/shopcart.js';
  import { useGlobalMixins } from '@martyrs/src/modules/globals/views/mixins/mixins.js';
  /////////////////////////////
  // CREATED
  /////////////////////////////
  const route = useRoute()
  const router = useRouter()
  const { returnCurrency } = useGlobalMixins()
  // Accessing state
  const cartTotalPrice = shopcart.getters.cartTotalPrice
  const StoreCartAmount = shopcart.getters.cartTotalAmount
  // 
  // router.beforeEach((to, from, next) => {
  //   if (shopcart.state.currentState === true) {
  //     shopcart.actions.toggleShopcart();
  //   }
  //   next(); // Убедитесь, что вызываете next() для продолжения перехода по роуту
  // });

  /////////////////////////////
  // LOCALIZATION
  /////////////////////////////
  const text = {
    messages: {
      en: {
        title: 'Your order',
        subtitle: 'You have',
        positions: 'no products in shop cart | 1 product in shop cart | {count} products in shop card',
        emptystate: "You don't have any positions in your shop cart yet. Maybe something needs to be added?",
        intotal: 'In total',
        fastorder: 'Checkout'
      },
      ru: {
        title: 'Ваш заказ',
        subtitle: 'У вас',
        positions: 'нет товаров в корзине | 1 товар в корзине | {count} товаров в корзине',
        emptystate: "У вас еще нет товаров в корзине. Может стоит что-нибудь добавить?",
        intotal: 'Итого',
        fastorder: 'Подтвердить заказ'
      }
    }
  }

  const { t } = useI18n(text)
  /////////////////////////////
  // MOUNTED
  /////////////////////////////
  function openOrder() {
    // store.dispatch("shopcart/toggleShopCart");
    // store.dispatch("shopcart/setSearch");
    !globals.state.options.orders.allowUnauthenticatedOrders && !auth.state.user._id ?  router.push({name: 'Sign In', query: { returnUrl: '/orders/form'}}) :   router.push({name: 'CreateOrder'}) 
    shopcart.actions.toggleShopcart();
  }
</script>

<style lang="scss">
.shop-cart {
  display: block;
  position: fixed;

  right: -33%;
  top: 0;

  height: 100%;
  width: 33%;

  overflow-y: scroll; 
}

.shop-cart-active {
  right: 0;

}

@media screen and (max-width: 1025px) {
  .shop-cart {
    width: 100%;
    right: -100%;

    .shopcart-footer {
      width: 100%;
      right: -100%;
    }

    &-active {
      right: 0;

      .shopcart-footer {
        right: 0;
      }
    }
  }
}
</style>


