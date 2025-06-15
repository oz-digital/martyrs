<template>
  <div class="w-100">
    <div class="flex">
      <h3 class="mn-b-regular">{{name}}</h3>
      
    </div>
     
   
    <ul  class="flex-column flex-wrap block">
      <span v-if="items.length < 1" class="w-100">Вы еще не добавили позиции</span> 

      <li v-for="(item, index) in items" :key="item._id" class="w-100">
        <div class="w-100 flex-center flex-nowrap flex">
          <span class="mn-r-regular w-100">{{ item.name }}</span>
          <a class="w-20 button" @click="deleteItem(item)">Удалить</a>
        </div>
        <hr v-if="!(index == items.length - 1)" class="mn-t-small mn-b-small w-100 ">
      </li>
    </ul>
  </div>
</template>


<script setup="props">
    // GLOBAL
  // import InputText    from '/components/elements/InputText.vue'
  // import InputSelect  from '/components/elements/InputSelect.vue'

	import { ref,computed,reactive,toRefs } from 'vue'
	import { useRouter,useRoute } from 'vue-router'

	const router = useRouter()
  const route = useRoute()


  const emits = defineEmits(['add', 'remove']);

	const props = defineProps({
	  name: Object,
    items: Array,
	});

  let data = reactive([])
  let reactiveData = toRefs(data)

  const techStack = ref(null)
  const techStack2 = ref(null)
  const techStack3 = ref(null)
  function test () {
     console.log(techStack)
  }

 
  const isProductValid = computed(() => { 
    if (techStack.value === null || techStack3.value === null || techStack3.value === '') {
      return true;
    } else {
      if (techStack.value.modifications.length > 0) {
        if (techStack2.value === null) {
          return true 
        } else {
          return false 
        }
      }
    }

    })
   //  if (techStack.value.modifications.length > 0) {
   //    if (techStack2.value !== null) {
   //      return true 
   //    } else {
   //      return false 
   //    }
   // } else {
   //     if (techStack.value !== null) {
   //      return true 
   //    } else {
   //      return false
   //    }
   // } })

  function addProductToLeftover () {
     
     if (techStack.value.modifications.length > 0) {
        techStack2.value.quantity = techStack3.value
     } else {
        techStack.value.quantity = techStack3.value
     } 
     store.dispatch('leftovers/addProductToLeftover', techStack.value.modifications.length > 0 ? techStack2.value : techStack.value)
     showAddNew.value = !showAddNew.value;
  }

  function deleteItem (item) {
     store.commit('leftovers/deleteItemFromLeftover', item)
  }


  function reserOrderList () {
    if (route.params._id) store.dispatch('leftovers/fetch', route.params._id).then(

      succes => { console.log(succes) },
      error => {  
        console.log('eror') 
      }
    ) 

    if (!route.params._id) store.commit('leftovers/reset')
      
  }

  function changeAdd () {
   showAddNew.value = !showAddNew.value;
  }

  function itemSizes (item) { 
    const itemData = store.state.items.all.find(p => p._id === item._id)
    var computedProduct = computed(() => store.getters['orders/getProductSizes'](itemData))
    return computedProduct.value
  }
  function itemColors (item) { 
    const itemData = store.state.items.all.find(p => p._id === item._id)
    var computedProduct = computed(() => store.getters['orders/getProductColors']({item, itemData}))
    return computedProduct.value
  }

</script>

<style lang="scss" >
  
.VueSelect {
  background: #f7f7f7;
  border-radius: 0.5rem;
  border: 0;
  height: 3rem;
    padding-left: 1rem;
   
    z-index: 4;
  .vue-input {
    input { 
       font-size: 1.125rem;
    font-weight: 300;
      background: #f7f7f7; }
  }
}
</style>


