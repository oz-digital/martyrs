<template>
  <div class="bg-light pos-relative pd-medium radius-medium">
    <CardHeader 
      :entity="order"
      :entityType="'order'"
      :user="user"
      :owner="order.creator" 
      :creator="order.creator"
      :date="order.createdAt"
      class="mn-b-small"
    />

    <div class="mn-b-small pd-small bg-white radius-small flex-nowrap flex"> 
      <div class="w-100">
        <p class="t-truncate">{{order.delivery.address || 'Not specified'}}</p> 
      </div>

      <div class="w-100 t-right">
        <h3 class="mn-b-thin">{{currency}}{{getTotal(order.positions)}}</h3>
        <p>#{{order._id.slice(0, 4) + '...' + order._id.slice(-4)}}</p> 
      </div>
    </div>
 
    <div class="cols-1 pos-relative mn-b-small gap-thin pd-small bg-white radius-small">
		  <!-- Всегда отображаем первые две позиции -->
		  <template v-for="(position, index) in order.positions">
		  	<transition name="moveFromTop">
			    <div 
			      v-if="index < 2 || (spoiler && index >= 2)" 
			      :key="index" 
			      class="w-100 flex"
			    >
			      <p class="mn-r-auto">{{ position.name }}</p>
			      <p class="t-right">
			        {{ position.quantity }} {{ position.type }}
			        x
			        <span class="t-transp">{{ currency }} {{ position.price }}</span>
			      </p>
			    </div>
	      </transition>
		  </template>
		
		  <!-- Кнопка переключения для дополнительных позиций, видна только если есть больше двух позиций -->
		  <button
		    v-if="order.positions.length > 2"
		    @click.prevent="spoiler = !spoiler"
		    class="cursor-pointer radius-big bg-light-transp-50 pd-nano w-100 flex-center flex"
		  >
		    {{ !spoiler ? `+${order.positions.length - 2} more` : `Hide` }}
		  </button>
		</div>

    <div class="pd-small bg-white radius-small gap-micro flex-v-center flex-nowrap flex"> 
      <IconTime class="i-medium t-transp" fill="rgb(var(--black)" />
      <p class="t-medium mn-r-auto">{{formatDate(order.deadline)}}</p>

      <span 
        class="flex-child flex-child-shrink-0 capitalize w-max t-medium radius-big pd-thin bg-main"
      >
        {{order.status}}
      </span>

      <span 
        class="flex-child flex-child-shrink-0 capitalize w-max t-medium radius-big pd-thin t-white bg-red"
      >
        {{order.payment.status || 'Not defined'}}
      </span>
    </div>

    <div v-if="order.comment" class="pos-relative radius-small bg-fifth-transp-10 mn-t-thin pd-small">
      <p class="mn-b-thin t-transp uppercase p-small t-medium">Comment</p>
      <p>{{order.comment}}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import CardHeader from '@martyrs/src/modules/globals/views/components/blocks/CardHeader.vue';
import IconTime from '@martyrs/src/modules/icons/entities/IconTime.vue';

const props = defineProps({
  order: {
    type: Object,
    required: true
  },
  user: {
    type: Object,
    required: true
  },
  formatDate: {
    type: Function,
    required: true
  },
  getTotal: {
    type: Function,
    required: true
  },
  currency: {
    type: String,
    default: ''
  }
});

const spoiler = ref(false);
</script>