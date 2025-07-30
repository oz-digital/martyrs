<template>
  <article v-if="event" class="h-100 pd-thin">
    <header 
      class="mn-b-medium flex-v-center flex-nowrap flex"
    >
      <h2 class="mn-r-medium">Tickets</h2>
      <button 
        @click="openTicketsPopup()" 
        class="radius-extra uppercase button-small  flex-child flex-child-shrink-0 hover-scale-1 cursor-pointer t-white bg-second">
          Add Tickets
      </button>
      <ButtonCheck @qrcodecheck="fetchTickets = !fetchTickets " class="w-100 pd-medium mn-auto" />
    </header>
    
    <Popup 
      @close-popup="closeTicketsPopup" 
      :isPopupOpen="isOpenTicketsPopup"
      class="w-max-40r"
    >
      <Block
        title="Add tickets"
        placeholder="No parameters added yet"
        class="cols-1 mn-b-thin gap-thin"
      >
        <div 
          class="gap-thin flex-nowrap flex" 
          v-for="(item, index) in newTickets" 
          :key="index"
        > 
          <Field
            v-model:field="item.name"
            placeholder="Name"
            class="w-50 bg-white radius-small pd-medium"
          />  
          <Field
            v-model:field="item.seat"
            placeholder="Seat"
            class="w-50 bg-white radius-small pd-medium"
          />
          <Field
            v-model:field="item.email"
            placeholder="Email"
            class="w-100 bg-white radius-small pd-medium"
          />
       
          <Field
            v-model:field="item.quantity"
            placeholder="Quantity"
            type="number"
            class="w-25 bg-white radius-small pd-medium"
          />
         
          <div v-if="index < 1" @click="() => newTickets.push({name: '', value: '', target: event._id, type: 'event', quantity: 1})"  class="radius-small h-100 i-big flex-center flex aspect-1x1 bg-green">
            <IconAdd 
              class="i-medium"
              :fill="'rgb(var(--white)'"
            />
          </div>
          <div v-else @click="() => newTickets.splice(index, 1)"  class="radius-small h-100 i-big flex-center flex aspect-1x1 bg-red">
            <IconDelete 
              class="i-medium"
              :fill="'rgb(var(--white)'"
            />
          </div>
        </div>

         <Button 
            :submit="onSubmit" 
            :callback="closeTicketsPopup" 
            class="w-100 bg-black t-white"
          >
            Create Tickets
          </Button>
      </Block>
    </Popup>

    <Feed
      :search="true"
      :states="{
        empty: {
          title: 'No Tickets Found',
          description: 'Currently, there are no tickets.'
        }
      }"
      :store="{
        read: (options) => tickets.actions.read(options),
        state: null
      }"
      :options="{
        target: event._id
      }"
      :external="fetchTickets"
      v-slot="{ 
        items 
      }"
    >
      <div
        v-for="(ticket, index) in items" 
        class="radius-big bg-light gap-small pd-medium flex-v-center flex-nowrap flex pos-relative mn-b-thin"
      >
        <a :href="ticket.image" target="_blank"><img loading="lazy" :src="ticket.qrcode" class="radius-small h-5r w-5r"></a>

        <div class="mn-r-auto ">
           <p class="h4">
            {{ticket.client_refactor?.name || 'No name'}}, {{ticket.seat}}
           </p>
          <p class="h5 t-transp mn-b-thin">
            {{ticket.client_refactor?.email || 'No email'}}
          </p>

           <span class="pd-thin ]bg-second radius-extra t-white t-medium d-block w-max uppercase">
            {{ticket.status}}
          </span>
        </div>

        <Button 
          v-if="ticket.status !== 'deactivated'"
          :submit="() => changeStatus(ticket, 'deactivated')" 
          :callback="redirectTo" 
          class="w-min h-min pd-small bg-black t-white"
        >
          Deactivate
        </Button>

        <Button 
          v-if="ticket.status === 'deactivated' || ticket.status === 'used' "
          :submit="() => changeStatus(ticket, 'unused')" 
          :callback="redirectTo" 
          class="w-min h-min pd-small bg-green t-white"
        >
          Activate
        </Button>
      
      </div>
    </Feed>
    
  </article>
</template>

<script setup>
import Feed from '@martyrs/src/components/Feed/Feed.vue';
import Block from '@martyrs/src/components/Block/Block.vue';
import Popup from "@martyrs/src/components/Popup/Popup.vue";
import Field         from '@martyrs/src/components/Field/Field.vue'
import Button from '@martyrs/src/components/Button/Button.vue';   

import ButtonCheck from '@martyrs/src/modules/events/components/elements/ButtonCheck.vue'

import IconDelete from '@martyrs/src/modules/icons/navigation/IconDelete.vue';
import IconAdd from '@martyrs/src/modules/icons/navigation/IconAdd.vue';

import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import * as events from '@martyrs/src/modules/events/store/events.js';
import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';
import * as organizations from '@martyrs/src/modules/organizations/store/organizations.js';

import * as tickets from '@martyrs/src/modules/events/store/tickets.js';

import { useGlobalMixins } from "@martyrs/src/modules/globals/views/mixins/mixins.js"

const { hasAccess } = useGlobalMixins()

const route = useRoute();
const router = useRouter();

let event = ref(null);

const newTickets = ref([{
  name: '',
  email: '',
  target: event.value?._id, 
  type: 'event',
  seat: '',
  quantity: 1,
}])

const isOpenTicketsPopup = ref(false);

function openTicketsPopup(department) {
  isOpenTicketsPopup.value = true;
  
  newTickets.value = [{
    name: '',
    email: '',
    target: event.value?._id, 
    type: 'event',
    seat: '',
    quantity: 1,
  }]
}

function closeTicketsPopup() {
  isOpenTicketsPopup.value = false;
}

const fetchTickets = ref(false)


onMounted(async () =>{
  const data = await events.read({ user: auth.state.user._id, url: route.params.url });

  event.value = data.pop();

  if (!event.value) {
   router.push({name: 'notfound'})
  }

  if (event.value.owner.type === 'organization') {
    // Если пост принадлежит организации, проверяем права на редактирование через `hasAccess`
    const isAccess = hasAccess(event.value.owner.target._id, 'events', 'edit', auth.state.accesses, auth.state.access.roles);

    if (!isAccess) {
      router.push({name: 'unauthorized'})
    }
  } else {
    // Если пост не принадлежит организации, проверяем авторство
    if (event.value.creator.target._id !== userId) {
      router.push({name: 'unauthorized'})
    }
  }
})

async function onSubmit() {
  try {
    const response = await tickets.actions.create(newTickets.value);
    fetchTickets.value = !fetchTickets.value
  } catch (error) {
    console.log(error);
  }
}

async function changeStatus(ticket, status) {
  if (confirm('Are you sure you want to deactivate this event?')) {
    try {
      const response = await tickets.actions.update({ ...ticket, status: status});
      fetchTickets.value = !fetchTickets.value
    } catch (error) {
      console.error(error);
    }
  }
}

</script>

<style lang="scss">
  .dp__input {
    border: 0;
    padding: var(--medium);
    padding-left: 3rem;
    background: rgb(var(--grey))
  }
</style>