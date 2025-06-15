<template>
   <!-- Toolbar -->
  <section class="br-bot-dark bg-white pd-big">
    <header class="flex-nojustify flex-bottom flex-nowrap flex">
      <h1 class="mn-r-small">Быстрые заказы</h1>
    </header>
  </section>

 

  <section class="cols-1 bg-light pd-big">
    <!-- Empty State -->
    <p v-if="fastorders.length === 0">У вас еще нет запросов на быстрый заказ</p>
    <!-- Objects -->
    <div v-for="fastorder in fastorders" class="order-card pd-small bg-white col"> 
    
        <div class="flex-wrap flex ">
          <div>
            <p> Запрос от {{fastorder.phone ? fastorder.phone : fastorder.userid}} </p> 
            <p  class="t-transp">Добавлен в {{DateToFormattedString(fastorder.createdAt)}}</p>
            
          </div>

          <div>
            <p>Интересуемый товар</p>
            <p class="t-transp">
              <router-link v-if="fastorder.product" :to="{ name: 'Product', params: { _id: fastorder.product}}">
                Товар #{{fastorder.product.slice(0,8)}}
              </router-link>
              <span v-else>Товар не указан</span>
            </p>
         </div>

          <div class="t-right">
            <p v-if="fastorder.userid">{{fastorder.userid}}</p>
            <p>
              <a v-if="fastorder.status !== 'Обработан'" @click="store.dispatch('fastorders/update', {_id: fastorder._id, status: 'Обработан'})" class="t-main">Подтвердить</a>
              <a v-if="fastorder.status === 'Обработан'" @click="store.dispatch('fastorders/delete', fastorder._id)" class="t-main">Удалить</a>
            </p>

          </div>
        </div>

        <hr clas="mn-b-small mn-t-small">
        <div  v-if="fastorder.products.length > 0" class="w-100 spoiler">
          <div @click="spoiler = !spoiler"  class="mn-b-small flex">
            <!-- <span>Всего товаров {{leftover.positions.length}}</span> -->
            <img loading="lazy" :class="{ 'spoiler-active': spoiler }" class="button-icon" src="@/assets/icons/arrow-down-spoiler.svg">
          </div>

          <transition name="fade">
            <div v-if="spoiler">
              <div  v-for="position in fastorder.products" class="w-100 mn-b-thin flex"> 
                <div class=" w-50 flex">
                  <span>
                    <!-- <span class="t-transp">Название:</span>  -->
                    {{position.name}}
                  </span>
                </div>
                
                <div class="t-right w-50 flex">
                  <span class="w-100">
                    
                    {{position.quantity}}
                  </span>
                </div>
              </div> 
            </div>
          </transition>
        </div>


     
        
    </div>
  </section>
</template>


<script setup>


  import { computed, onMounted, reactive, toRefs,ref } from 'vue'
  
  import { useRoute,useRouter } from 'vue-router'
 
  const store = useStore()
  const route = useRoute()
  const router = useRouter()

  await store.dispatch('fastorders/fetchAll').then(
    succes => { console.log('sycces') },
    error => {  
      console.log('eror') 
    }
  )

  const spoiler = ref(false)

  const fastorders = computed(() => store.state.fastorders.all.reverse())

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

  &-tab {
    width: 2rem;
    height: 2rem;
  }
}



.order-card {
  border-radius: 0.25rem;
  overflow: hidden;
  box-shadow: 0 8px 8px -8px rgb(36 36 36 / 10%);
  .order-status {
    color: black;
    background: #EEF2F6; 
    width: 100%;
    padding: 0.75rem 1.5rem;
    margin: 0;
  }

  .new {
    color: white;
    background: #00ff88;
  }

  .block {
    border-radius: 0;
    border: 0;
  }
}

  
</style>
