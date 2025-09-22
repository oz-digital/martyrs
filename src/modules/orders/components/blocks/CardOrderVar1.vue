<router-link 
        v-for="order in orders.state.all" 
        :to="{ 
          name: 'Order Edit', 
          params: { 
            order: order._id 

          }
        }" 
         class="bg-light pd-medium radius-big"
      >
        <CardHeader 
          :entity="order"
          :entityType="'order'"
          :user="auth.state.user"
          :owner="order.creator" 
          :creator="order.creator"
          :date="order.createdAt"
          class="mn-b-thin"
        />


          <div class="mn-b-thin w-100 bg-white radius-small pd-small spoiler">
            <div @click="spoiler = !spoiler"  class="flex-v-center flex">
              
              Order: #{{order._id}}

              <span 
                class="flex-child flex-child-shrink-0 capitalize w-max mn-r-thin t-medium radius-big pd-thin bg-main"
              >
                {{order.status}}
              </span>
             
            </div>


          </div>


       
          <div class="mn-b-thin w-100 bg-white radius-small pd-small spoiler">
            <div @click="spoiler = !spoiler"  class="flex-v-center flex">
              
              customer: {{order.customer.target}}

            </div>


          </div>

            <div class="w-100 bg-white radius-small pd-small">

              <span class="flex-child flex-child-shrink-0">
                Positions {{order.positions.length}} <a class="t-main mn-r-auto">Check Leftover</a>
              </span>
              <!-- <img loading="lazy" :class="{ 'spoiler-active': spoiler }" class="button-icon" src="@/assets/icons/arrow-down-spoiler.svg"> -->
            

              <transition name="fade">
                <div v-if="spoiler">
                  <div  v-for="position in order.positions" class="mn-t-small w-100 mn-b-thin flex"> 
                    <div class=" w-50 flex">
                      <span>
                        {{position.name}}
                      </span>
                      <span class="mn-r-thin mn-l-thin t-transp">|</span>

                      <span class="w-50">
                        {{position.quantity}}
                        x
                        {{position.price}}
                        <span class="t-transp">{{returnCurrency()}}</span> 
                      </span>

                    </div>
                    
                    <div class="t-right w-50">
                    
                      <span class="t-transp">{{position.type}}</span> 
                    </div>
                  </div> 
                </div>
              </transition>

            </div>

             <div class="mn-b-thin w-100 bg-white radius-small pd-small">

              <span class="flex-child flex-child-shrink-0">
                 <span class="h4">Amount: 4 500</span>
              </span>
            </div>

            <div v-if="order.comment"  class="bg-fifth-transp-10 pd-thin">
              <p class="t-truncate">Comment: {{order.comment}}</p>
            </div>
      </router-link>
</template>

<script setup>
import { useGlobalMixins } from '@martyrs/src/modules/globals/views/mixins/mixins.js'

const { returnCurrency } = useGlobalMixins()

defineProps({
  order: Object
})
</script>