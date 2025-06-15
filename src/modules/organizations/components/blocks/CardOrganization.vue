<template>
  <div 
    class="o-hidden pos-relative cursor-pointer bg-light "
    @click="$router.push({name: 'Organization', params: {_id: organization._id}})"
  >
    <div class="h-4r flex pos-relative">

      <img loading="lazy" 
        v-if="organization.profile.photo && organization.profile.photo.length > 0"
        :src="(FILE_SERVER_URL || '') + organization.profile.photo" 
        class="h-4r w-4r radius-extra bg-white" 
        style="flex: 0 1 auto"
      />

      <PlaceholderOrganizationPic
        v-else
        class="w-4r h-max radius-medium"
        style="flex: 0 1 auto"
      />
      
      <div class="pos-relative w-100 flex-h-center flex flex-column flex-child-1 flex-child mn-l-thin w-100">
        
        <!-- <Text :text="organization.profile.name ? organization.profile.name : ''" :maxLen="18" class="h3 d-block"/> -->
        <p class="h4 t-truncate w-100">{{organization.profile.name}}</p>
        <!-- RATING -->
        <!-- <div v-if="showRating && organization.rating" class="w-max star-container flex-v-center flex">
          <img loading="lazy" 
            v-for="i in 5"
            class="i-small mn-r-thin"
            :src="i <= organization.rating.median ? '/icons/star.svg' : '/icons/star-stroke.svg'"
          >

          <span class="p-small t-semi mn-r-thin">{{organization.rating.median}}</span>
          <span class="p-small">({{organization.rating.amount}})</span>
        </div> -->

        <div v-if="showFollowers ||  showTags" class="mn-t-micro gap-micro flex-nowrap flex">

          <Chips 
            v-if="showTags && organization.profile.tags?.length > 0" 
            :chips="organization.profile.tags.slice(0,3)"
            class="pos-relative t-trimmed p-medium"
          >
           <div v-if="showFollowers" class="t-truncate pos-relative p-medium mn-r-nano d-inline-block w-max pd-b-micro pd-t-micro pd-r-thin pd-l-thin radius-small t-medium bg-white">
            <p class="t-truncate">{{organization.numberOfSubscribers}} followers</p>

            <ButtonToggleMembership
              v-if="
                user?._id 
                && organization.owner !== user._id
              "
              :user="user._id"
              :type="'organization'" 
              :role="'subscriber'" 
              :target="organization._id" 
              :status="organization.isSubscriber" 
              :text="{create: '+', remove: '-'}"
              @updateMembership="event => emits('updateMembership', event, 'isSubscriber', 'numberOfSubscribers')"
              class="i-semi" 
            />
          </div>
        </Chips>
        </div>

      </div>

    </div>


    <div 
      v-if="showProducts && organization.products" 
      class="mn-b-small t-nowrap mn-t-small w-100 flex-nowrap flex flex-v-center pd-small bg-white radius-medium"
    >
      <IconTime class="i-medium t-transp mn-r-micro"/>
      <span class="mn-r-micro">
        {{
        organization.distance ? 
          organization.distance > 50 ? 
            '3-5 days' : 
            Math.ceil((5 + 5 + 3 * organization.distance) / 5) * 5 
            + '-' 
            + Math.ceil((15 + 5 + 3 * organization.distance) / 5) * 5 
            + ' MIN' : 'Unavailable' 
        }} 
      </span>

      <span v-if="organization.distance && organization.distance < 50" class="t-transp t-grey mn-r-micro">|</span>
      <span v-if="organization.distance && organization.distance < 50" class="mn-r-thin">{{organization.distance ? organization.distance.toFixed(1) + 'KM' : ''}}</span>
      <!-- <span class="mn-r-thin">{{organization.nearestSpotDistance}}</span> -->
      <!-- <IconPrice class="i-medium mn-r-micro"/> -->
      <!-- <span class="mn-r-thin">{{returnCurrency()}}500 </span> -->
      <IconShopcart class="i-medium t-transp mn-r-micro"/>
      <span class="mn-r-thin"> {{organization.products.length}} products</span>
    </div>

    <div v-if="showProducts && organization.products?.length > 0" class="w-100 o-scroll scroll-hide radius-medium">
      <div class="w-max flex-nowrap flex gap-thin">
        <CardOrderItem  
          @click.stop="$router.push({name: 'Organization_Product', params: {_id: organization._id, product: product._id}})" 
          v-for="product in organization.products.slice(0,5)" 
          :key="product._id" 
          :editable="false" 
          :product="product" 
          class="pd-thin w-15r radius-medium bg-white"
         
        />
        <button class="pd-thin w-15r radius-medium bg-main button">
          View menu
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import CardOrderItem from '@martyrs/src/modules/orders/components/blocks/CardOrderItem.vue';

  import Text     from '@martyrs/src/components/Text/Text.vue'
  import Chips  from '@martyrs/src/components/Chips/Chips.vue'

  import PlaceholderOrganizationPic from '@martyrs/src/modules/icons/placeholders/PlaceholderOrganizationPic.vue'

  import IconPrice from '@martyrs/src/modules/icons/entities/IconPrice.vue'
  import IconShopcart from '@martyrs/src/modules/icons/entities/IconShopcart.vue'
  import IconTime from '@martyrs/src/modules/icons/entities/IconTime.vue'

  import ButtonToggleMembership from '@martyrs/src/modules/organizations/components/elements/ButtonToggleMembership.vue'

  const props = defineProps({
    // Model
    user: String,
    organization: Object,
    // View
    showProducts: {
      type: Boolean,
      default: false
    },
    showFollowers: {
      type: Boolean,
      default: true
    },
    showRating: {
      type: Boolean,
      default: false
    },
    showFeatured: {
      type: Boolean,
      default: true
    },
    showTags: {
      type: Boolean,
      default: true
    },
  });

  const emits = defineEmits(['updateMembership'])

  const router = useRouter();
</script>