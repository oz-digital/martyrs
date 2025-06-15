<template>
  <div class="radius-big o-hidden cols-2-1_3">
    <Map :location="{lat: spot.location.coordinates[1] ,lng: spot.location.coordinates[0]}" class=""/>

    <div class="pd-medium w-100">
     <svg  @click="$router.push(`/app/organization/${props.organization._id}/spots/${spot._id}/edit`)" class="i-regular pos-absolute pos-r-0 pos-t-0 t-transp" width="652" height="652" viewBox="0 0 652 652" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M515.693 9.52082C510.095 3.91669 502.49 0.765625 494.563 0.765625C486.635 0.765625 479.036 3.91669 473.432 9.52082L48.7255 434.307C44.8244 438.214 42.0848 443.125 40.8088 448.496L0.939444 615.069C-1.47202 625.168 1.528 635.788 8.86652 643.132C16.2103 650.47 26.8305 653.47 36.9292 651.059L203.516 611.261H203.511C208.88 609.985 213.792 607.246 217.699 603.35L642.485 178.496C648.089 172.892 651.241 165.293 651.241 157.366C651.241 149.439 648.089 141.835 642.485 136.235L515.693 9.52082ZM113.76 453.708L388.307 179.161L472.828 263.682L198.281 538.229L113.76 453.708ZM87.1041 511.5L140.416 564.812L70.3014 581.614L87.1041 511.5ZM515.091 221.793L430.195 136.897L494.184 72.9075L579.08 157.429L515.091 221.793Z" fill="rgb(var(--black))"/>
      </svg>
      
      <h3 
        @click="$router.push(`/app/organization/${props.organization._id}/spots/${spot._id}`)"
        class="mn-b-small w-100"
        v-html="spot.profile.name"
      />

       <p 
        @click="$router.push(`/app/organization/${props.organization._id}/spots/${spot._id}`)"
        class="mn-b-small p-big w-100"
        v-html="spot.address"
      />

      
    
      <Spoiler 
        class="
          radius-small 
          o-hidden
          br-1px br-solid br-grey-transp-25 
          mn-b-thin
        "
        >
        <template #header>
          <div class="pd-small flex-v-center flex-nowrap flex">
            <h5 class="w-100" >Contacts </h5>
            <p class="mn-r-small">{{spot.members.length}}&nbsp;человек</p>
            <svg width="14" height="9" viewBox="0 0 14 9" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M12.4697 0.469727L13.5304 1.53039L7.00006 8.06072L0.469727 1.53039L1.53039 0.469727L7.00006 5.9394L12.4697 0.469727Z" fill="#8A8A8A"/>
            </svg>

          </div>
        </template>
        <template #content>
           <ul>
            <li v-if="spot.members.length < 1">В отделе еще нет участников</li>
            <User 
              class="br-b br-solid br-grey-transp-25" 
              v-for="(member, index) in spot.members" 
              :key="index" 
              :user="member.user" 
              :position="member.position" 
              @click="$router.push(`/app/profile/${member.user._id}`)" 
            />
          </ul>
        </template>
      </Spoiler>

      <Spoiler 
        class="
          radius-small 
          o-hidden
          br-1px br-solid br-grey-transp-25 
          mn-b-thin
        "
        >
        <template #header>
          <div class="pd-small flex-v-center flex-nowrap flex">
            <h5 class="w-100" >Working Hours </h5>
            <p class="mn-r-small">{{spot.subspots ? spot.subspots.length : 0}}&nbsp;отделов</p>
            <svg width="14" height="9" viewBox="0 0 14 9" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M12.4697 0.469727L13.5304 1.53039L7.00006 8.06072L0.469727 1.53039L1.53039 0.469727L7.00006 5.9394L12.4697 0.469727Z" fill="#8A8A8A"/>
            </svg>

          </div>
        </template>
        <template #content>
          <ul>
            <li v-if="spot.subspots.length < 1">В отделе еще нет подотделов</li>
            <SpotSub  v-for="(subspotsartment, index) in spot.subspots" @click="$router.push(`/app/organization/spots/${subspotsartment._id}`)" :key="index" class="br-b br-solid br-grey-transp-25" :spot="subspotsartment" />
          </ul>
        </template>
      </Spoiler>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

import Spoiler  from '@martyrs/src/components/Spoiler/Spoiler.vue';
import Map      from '@martyrs/src/components/Map/Map.vue';


import SpotSub from '@martyrs/src/modules/spots/components/blocks/SpotSub.vue';
import User from '@martyrs/src/modules/auth/views/components/blocks/CardUser.vue';

const props = defineProps({
  spot: Object,
  organization: Object
});
</script>
<style scoped>
.subspotsartment {
  border: 1px solid rgba(0, 0, 0, 0.1);
  margin-top: 1rem;
}
</style>