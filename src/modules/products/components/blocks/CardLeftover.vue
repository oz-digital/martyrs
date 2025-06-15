<template>
  <div class="flex-column pos-relative flex-wrap">

    <CardHeader 
      :entity="leftover"
      :entityType="'leftover'"
      :user="user"
      :owner="leftover.creator" 
      :creator="leftover.creator"
      :date="leftover.createdAt"
    />

    <router-link 
      :to="{
        name: 'LeftoverEdit', 
        params: {
          _id: leftover.organization,
          leftover: leftover._id
        }
      }" 
      class="
        cursor-pointer 
        pos-absolute pos-t-regular pos-r-regular
        radius-extra pd-thin bg-second
      "
    >
      <IconEdit
        class="i-regular"
        classes="fill-white"
      />
    </router-link>

    <div class="mn-t-small w-100 bg-white radius-small pd-small spoiler">
      <div @click="spoiler = !spoiler"  class="flex-v-center flex">
        <span 
          class="flex-child flex-child-shrink-0 capitalize w-max mn-r-thin t-medium radius-medium pd-b-nano pd-t-nano pd-r-thin pd-l-thin"
          :class="{
            'bg-green': leftover.type === 'stock-in',
            'bg-red': leftover.type === 'stock-out'
          }"
        >
          {{leftover.type}}
        </span>
        <span class="flex-child flex-child-shrink-0">Positions {{leftover.positions.length}}</span>
        <span v-if="leftover.order" class="mn-r-thin mn-l-thin t-transp">|</span>
        <span  class="flex-child flex-child-shrink-0" v-if="leftover.order">For order {{leftover.order}}</span>
        <span v-if="leftover.comment" class="mn-r-thin mn-l-thin t-transp">|</span>
        <p v-if="leftover.comment" class="t-truncate">Comment: {{leftover.comment}}</p>
        <!-- <img loading="lazy" :class="{ 'spoiler-active': spoiler }" class="button-icon" src="@/assets/icons/arrow-down-spoiler.svg"> -->
      </div>

      <transition name="fade">
        <div v-if="spoiler">
          <div  v-for="position in leftover.positions" class="mn-t-small w-100 mn-b-thin flex"> 
            <div class=" w-50 flex">
              <span>
                {{position.name}}
              </span>
              <span class="mn-r-thin mn-l-thin t-transp">|</span>

              <span class="w-50">
                {{position.price}}
                <span class="t-transp">{{returnCurrency()}}</span> 
              </span>

            </div>
            
            <div class="t-right w-50">
              {{position.quantity}}
              <span class="t-transp">{{position.type}}</span> 
            </div>
          </div> 
        </div>
      </transition>
    </div>
    

  </div>
</template>


<script setup="props">
	import { ref } from 'vue'
	import { useRouter } from 'vue-router'

  import CardHeader  from '@martyrs/src/modules/globals/views/components/blocks/CardHeader.vue'

  // Icons
  import IconEdit from '@martyrs/src/modules/icons/navigation/IconEdit.vue'
  import PlaceholderUserpic from '@martyrs/src/modules/icons/placeholders/PlaceholderUserpic.vue'

	const router = useRouter()

	const props = defineProps({
	  leftover: Object,
	});


	const spoiler = ref(true)

  function declOfNum(number, words) {  
    return words[(number % 100 > 4 && number % 100 < 20) ? 2 : [2, 0, 1, 1, 1, 2][(number % 10 < 5) ? number % 10 : 5]];
  }
	
</script>

<style lang="scss" scoped>
.shop-cart-item {
	&:first-of-type { padding-top: 0;}
}

.spoiler-active {
  transform: rotate(180deg);
}
</style>


