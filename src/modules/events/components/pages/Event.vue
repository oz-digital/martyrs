<template>
  <section id="eventPage">
    <TransitionGroup tag="ul" name="fade" class="bg-light">
      <SkeletonEvent
        v-if="isLoading"
        v-for="i in 3" :key="i"
      />

      <HeroEvent
        v-if="!isLoading && event &&event.cover"
        :content="{
          title: event.name,
          ticketLinkStripe: event.ticketLinkStripe,
          cover: event.cover,
          subtitle: event.subtitle,
        }"
        :options="{
          date: event.date.start,
        }"
        class="o-hidden"
      />

      <div class="cols-2-2_1 gap-small bg-white t-black pd-t-zero mobile:pd-small pd-extra" v-if="!isLoading && event"> 
        
        <div class="bg-light mobile:pd-medium pd-big radius-big">

          <h1 class="z-index-1  mn-b-semi">
            {{event?.name}}
          </h1>

          <div class="flex flex-wrap gap-micro t-medium p-big mn-b-semi justify-start align-center">
            <span v-if="event.date?.start" class="mn-r-nano d-inline-block w-max pd-b-micro pd-t-micro pd-r-thin pd-l-thin radius-small t-medium bg-white">
              <IconDate :fill="'rgb(var(--black))'" class="w-1r h-auto"/>
              {{formatDate(event.date.start)}}
            </span>


            <span
              v-for="(chip, index) in event.tags"
              :key="index"
              class="d-inline-flex pd-b-micro   pd-t-micro pd-r-thin pd-l-thin radius-small bg-main"
            >
              {{ chip }}
            </span>
          </div>

          <p class="z-index-1  p-big mn-b-semi">
            {{event?.description}}
          </p>

          <hr v-if="event?.content?.length > 0" class="bg-black-transp-10 mn-b-semi mn-t-semi d-block">

          <Viewer
            v-if="event && event.content"
            :content="event.content"
            :notitle="true"
          />

        </div>

        <div class="">
         
          <div class="radius-semi pd-medium bg-light mn-b-thin">

            <div class="mn-b-small flex-nowrap flex-v-center flex pos-relative">
              <h4 class="mn-r-auto">Tickets</h4>
              <PhotoStack
                :number="event.numberOfTickets"
                :photos="event.participantsPhotos" 
              />
            </div>
            <div v-if="event?.ticketsTypes?.length > 0" v-for="ticketType in event.ticketsTypes" class="pd-medium w-100 radius-medium bg-white mn-b-small">
              <div class="flex-nowrap mn-b-small p-big flex">
                  <span class="mn-r-auto">{{ticketType.name}}</span>
                  <span class="t-medium">{{ticketType.price}} {{returnCurrency()}}</span>
              </div>
              <a :href="ticketType.link"  class="d-block t-center pd-l-medium pd-r-medium pd-t-small pd-b-small radius-extra uppercase t-medium t-white w-100 bg-second  ">
                Buy Now
              </a>
            </div>

            <ButtonJoin 
              v-if="auth.state.user._id && !event?.ticketsTypes?.length > 0"
              :type="'event'" 
              :hasTicket="event.hasTicket" 
              :targetId="event._id" 
              :userId="auth.state.user._id"
              class=" w-100 pd-medium mn-auto"
              @updateTicket="handleTicketUpdate"
            />

            <p v-if="event?.ticketsTypes.length > 0" class="z-index-1 t-transp p-small mn-t-small ">Buy ticket online with special price:</p>
            <Countdown 
              v-if="event?.date?.start && event?.ticketsTypes?.length > 0"
              class="mn-t-thin radius-medium bg-white w-100"
              :date="event?.date?.start"
            />
          </div>


        </div>

        <Comments 
          v-if="!isLoading && event" 
          :type="'event'" 
          :target="event._id" 
          :owner="auth.state.user._id"
        />

      </div>
      
  </TransitionGroup>  

  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';

import Loader from '@martyrs/src/components/Loader/Loader.vue';
import Chips from '@martyrs/src/components/Chips/Chips.vue';
import EmptyState from '@martyrs/src/components/EmptyState/EmptyState.vue';

import Viewer from '@martyrs/src/modules/constructor/components/sections/Viewer.vue';

import Countdown from "@martyrs/src/components/Countdown/Countdown.vue";

import HeroEvent from '@martyrs/src/modules/events/components/sections/HeroEvent.vue';

import PhotoStack from "@martyrs/src/modules/globals/views/components/elements/PhotoStack.vue";

import { SkeletonEvent, IconDate } from '@martyrs/src/modules/icons/icons.client.js';

import ButtonJoin from '@martyrs/src/modules/events/components/elements/ButtonJoin.vue';
import Comments from '@martyrs/src/modules/community/components/sections/Comments.vue';

import Image from '@martyrs/src/modules/constructor/components/elements/Image.vue';
import User from '@martyrs/src/modules/auth/views/components/blocks/CardUser.vue';

import * as events from '@martyrs/src/modules/events/store/events.js';
import * as tickets from '@martyrs/src/modules/events/store/tickets.js';
import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';

import { useRoute } from 'vue-router';

const route = useRoute();
const qrcode = ref(null);

const handleTicketUpdate = ({ ticket, hasTicket, targetId }) => {
  tickets.mutations.handleTicketUpdate(event.value, ticket, hasTicket, targetId);
  console.log('HANDLE TICKET UPDATE', ticket, event.value);
  qrcode.value = ticket.qrcode;
};

function clickBuyTicket() {
   gtag('event', 'buy_ticket', {
      'event_category': 'conversion',
      'event_label': 'Buy Ticket'
   });
}

const event = ref(null);
const isLoading = ref(true);

onMounted(async () => {
   isLoading.value = true;

   const data = await events.read({
      user: auth.state.user._id,
      url: route.params.url
   });

   event.value = data[0];
   isLoading.value = false;
});
</script>


<style>
  #eventPage {
    display: block;
  }
</style>