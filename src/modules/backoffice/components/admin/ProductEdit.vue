<template>
	<!-- ---------------------------------------------------------------- -->
	<!-- 01. Page Title  -->
	<!-- ---------------------------------------------------------------- -->
	<section class="pageheader section">
		<div class="mn-b-big title">
			<h1 v-if="route.params._id">Редактировать товар</h1>
			<h1 v-else>Добавить товар</h1>
		</div>
	</section>
	<!-- ---------------------------------------------------------------- -->
	<!-- 02. Page Tabs  -->
	<!-- ---------------------------------------------------------------- -->
	<div v-if="route.params._id" class="flex-nowrap flex product-tab-header">
    <button @click="changeTab('info')" :class="{'product-tab-active':data.currentTab === 'info'}" 
    class="br-right-dark product-tab section-panel section">
      Информация о товаре
    </button>

    <button @click="changeTab('images')" :class="{'product-tab-active':data.currentTab === 'images'}" 
    class="br-right-dark product-tab section-panel section">
      Изображения
    </button>
    <button @click="changeTab('modifications')" :class="{'product-tab-active':data.currentTab === 'modifications'}" 
    class="product-tab section-panel section">
      Модификации
    </button>
  </div>
	<!-- ---------------------------------------------------------------- -->
	<!-- 03. Page Content  -->
	<!-- ---------------------------------------------------------------- -->
	<section class=" bg-light br-bot-dark section-subsection section">

		<form onsubmit="return false">
			<!-- ---------------------------------------------------------------- -->
			<!-- Product Info -->
			<!-- ---------------------------------------------------------------- -->
			<div  v-if="data.currentTab === 'info'"> 
				<EditProductInfo :product="product"/>
				<EditCategories :product="product" :categories="categories" />
				<EditParameters :product="product"/>	
				<a @click="onSubmit()" class="button">Обновить информацию</a>
			</div>
			<!-- ---------------------------------------------------------------- -->
			<!-- Product Images -->
			<!-- ---------------------------------------------------------------- -->
			<EditProductImages  v-if="data.currentTab === 'images'" :product="product"/>
			<!-- ---------------------------------------------------------------- -->
			<!-- Product Modifications -->
			<!-- ---------------------------------------------------------------- -->
			<EditModifications v-if="data.currentTab === 'modifications'" :product="product"/>
			
		</form>
	</section> 
	<!-- ---------------------------------------------------------------- -->
	<!-- 03. Page Footer  -->
	<!-- ---------------------------------------------------------------- -->

</template>

<script setup>
	// Import libs
	import { reactive, computed, onMounted, toRefs } from 'vue'
	import { useRoute, useRouter } from 'vue-router'
	// Import components
	import EditProductInfo from '@/components/sections/product/EditProductInfo.vue';
  import EditCategories from '@/components/sections/product/EditCategories.vue';
  import EditParameters from '@/components/sections/product/EditParameters.vue';
  import EditProductImages from '@/components/sections/product/EditProductImages.vue';
  import EditModifications from '@/components/sections/product/EditModifications.vue';
  
	// Accessing router and store
	const route = useRoute()
	const router = useRouter()

  // Data prefetching
  await store.dispatch('categories/read')

  if (route.params._id) {
	  await store.dispatch('products/fetchProduct', route.params._id)
  } else {
  	await store.commit('products/clearProductState')
  }
  // Accessing state
 	const product = computed(() => store.state.products.current)
	const categories = computed(() => store.state.categories.all)
 	// Making tabs working
 	let data = reactive({currentTab: 'info'})
  let reactiveData = toRefs(data)
  function changeTab (tab) {data.currentTab = tab; console.log(data.currentTab) }

	function onSubmit() {
		if (route.params._id) {
			store.dispatch('products/updateProductInfo', route.params._id)
			// window.location.href = '/admin/products/';
		} else {
			store.dispatch('products/updateProductInfo').then(function (response, err) {
				router.push({name: 'ProductEdit', params: { _id: response._id } })
			})
			// window.location.href = '/admin/products/';
		}
	}
</script>

<style lang="scss">
	.main-photo {
		max-width: 50%;
		img { width: 100%; }
	}
</style>
