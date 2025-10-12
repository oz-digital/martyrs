<template>
  <article v-if="event" class="pd-thin bg-white">
    <!-- Header -->
    <header class="mn-b-medium flex-v-center flex-nowrap flex">
      <h2>Tickets</h2>
      <button
        @click="openTicketsPopup()"
        class="mn-l-auto radius-small button t-white bg-second"
        v-html="'+ Add'"
      />
      <ButtonCheck @qrcodecheck="fetchTickets = !fetchTickets" class="mn-l-micro radius-small button t-white bg-second" />
    </header>

    <!-- Statistics Cards -->
    <Block v-if="stats" title="Statistics" class="mn-b-thin">
      <div class="cols-4 mobile:cols-2 gap-thin">
        <div class="bg-white radius-medium pd-medium">
          <p class="p-small t-medium t-transp uppercase mn-b-thin">Total Tickets</p>
          <h2 class="h2">{{ stats.total }}</h2>
        </div>
        <div class="bg-white radius-medium pd-medium">
          <p class="p-small t-medium t-transp uppercase mn-b-thin">Sold</p>
          <h2 class="h2 t-main">{{ stats.sold }}</h2>
        </div>
        <div class="bg-white radius-medium pd-medium">
          <p class="p-small t-medium t-transp uppercase mn-b-thin">Free</p>
          <h2 class="h2 t-second">{{ stats.free }}</h2>
        </div>
        <div class="bg-white radius-medium pd-medium">
          <p class="p-small t-medium t-transp uppercase mn-b-thin">Refunds</p>
          <h2 class="h2 t-red">{{ stats.refunded }}</h2>
        </div>
      </div>
    </Block>

    <!-- Attendance Graph -->
    <div v-if="attendance" class="bg-light radius-medium pd-medium mn-b-thin">
      <h4 class="mn-b-small t-medium">Attendance Graph</h4>

      <!-- General Stats -->
      <div class="flex-nowrap flex gap-thin mn-b-medium">
        <div class="bg-white radius-small pd-small">
          <span class="p-micro t-transp uppercase d-block mn-b-thin">Total</span>
          <p class="p-medium t-medium">{{ attendance.total }}</p>
        </div>
        <div class="bg-white radius-small pd-small">
          <span class="p-micro t-transp uppercase d-block mn-b-thin">Expected</span>
          <p class="p-medium t-medium">{{ attendance.expected }}</p>
        </div>
        <div class="bg-white radius-small pd-small">
          <span class="p-micro t-transp uppercase d-block mn-b-thin">Arrived</span>
          <p class="p-medium t-medium t-main">{{ attendance.arrived }}</p>
        </div>
      </div>

      <!-- Timeline Graph -->
      <div v-if="attendance.timeline && attendance.timeline.length" class="flex-nowrap flex flex-justify-around gap-micro o-y-hidden o-x-scroll mn-t-big">
        <div
          v-for="slot in attendance.timeline"
          :key="slot.time"
          class="flex-column flex-v-center flex gap-micro flex-child-shrink-0"
        >
          <div
            v-if="maxCount > 0"
            class="bg-second radius-micro w-2r"
            :style="{ height: `${Math.max((slot.count / maxCount) * 10, 0.5)}rem` }"
          ></div>
          <div
            v-else
            class="bg-light radius-micro w-2r h-thin"
          ></div>
          <p class="p-nano t-medium t-nowrap">{{ slot.time }}</p>
        </div>
      </div>
    </div>

    <!-- Add Tickets Popup -->
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
              :fill="'rgb(var(--white))'"
            />
          </div>
          <div v-else @click="() => newTickets.splice(index, 1)"  class="radius-small h-100 i-big flex-center flex aspect-1x1 bg-red">
            <IconDelete
              class="i-medium"
              :fill="'rgb(var(--white))'"
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

    <!-- Tickets List -->
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
      v-slot="{ items }"
    >
      <div
        v-for="(ticket, index) in items"
        :key="index"
        class="radius-medium bg-light gap-thin pd-medium flex-v-center flex-nowrap flex pos-relative mn-b-thin mobile:flex-v-start"
      >
        <!-- QR Code - clickable PDF -->
        <a :href="ticket.image" target="_blank" class="flex-child-shrink-0">
          <img loading="lazy" :src="ticket.qrcode" class="radius-small h-5r w-5r">
        </a>

        <!-- Ticket Info -->
        <div class="w-100 o-hidden">
          <h4 class="mn-b-thin flex-nowrap flex gap-thin">
            <span>{{ ticket.client_refactor?.name || 'No name' }}</span><span v-if="ticket.seat" class="pd-thin radius-micro p-small bg-second t-white"> {{ ticket.seat }}</span>
          </h4>
          <p class="p-small t-transp mn-b-thin">
            {{ ticket.client_refactor?.email || 'No email' }}
          </p>
          <span
            class="pd-thin radius-extra t-white t-medium d-block w-max uppercase p-nano"
            :class="{
              'bg-main': ticket.status === 'unused',
              'bg-grey': ticket.status === 'used',
              'bg-red': ticket.status === 'deactivated'
            }"
          >
            {{ ticket.status }}
          </span>
        </div>

        <!-- Actions -->
        <Dropdown
          :label="{ component: IconEllipsis, class: 't-transp i-regular' }"
          :align="'right'"
          class="cursor-pointer radius-small pd-small bg-white flex-child-shrink-0"
        >
          <section class="bg-black flex-column flex gap-thin pd-thin radius-small">
            <button
              @click="sendTicketEmail(ticket._id)"
              class="w-100 bg-black br-solid br-1px br-white-transp-20 t-white button-small button"
            >
              Send Email
            </button>

            <button
              @click="copyTicketLink(ticket._id)"
              class="w-100 bg-black br-solid br-1px br-white-transp-20 t-white button-small button"
            >
              Copy Link
            </button>

            <button
              v-if="ticket.status !== 'deactivated'"
              @click="changeStatus(ticket, 'deactivated')"
              class="w-100 bg-black br-solid br-1px br-white-transp-20 t-white button-small button"
            >
              Deactivate
            </button>

            <button
              v-if="ticket.status === 'deactivated' || ticket.status === 'used'"
              @click="changeStatus(ticket, 'unused')"
              class="w-100 bg-black br-solid br-1px br-white-transp-20 t-white button-small button"
            >
              Activate
            </button>
          </section>
        </Dropdown>
      </div>
    </Feed>
  </article>
</template>

<script setup>
import Feed from '@martyrs/src/components/Feed/Feed.vue';
import Block from '@martyrs/src/components/Block/Block.vue';
import Popup from "@martyrs/src/components/Popup/Popup.vue";
import Field from '@martyrs/src/components/Field/Field.vue';
import Button from '@martyrs/src/components/Button/Button.vue';
import Dropdown from '@martyrs/src/components/Dropdown/Dropdown.vue';

import ButtonCheck from '@martyrs/src/modules/events/components/elements/ButtonCheck.vue';

import IconDelete from '@martyrs/src/modules/icons/navigation/IconDelete.vue';
import IconAdd from '@martyrs/src/modules/icons/navigation/IconAdd.vue';
import IconFile from '@martyrs/src/modules/icons/entities/IconFile.vue';
import IconEmail from '@martyrs/src/modules/icons/entities/IconEmail.vue';
import IconAttach from '@martyrs/src/modules/icons/navigation/IconAttach.vue';
import IconDuplicate from '@martyrs/src/modules/icons/actions/IconDuplicate.vue';
import IconEllipsis from '@martyrs/src/modules/icons/navigation/IconEllipsis.vue';

import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import * as events from '@martyrs/src/modules/events/store/events.js';
import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';
import * as tickets from '@martyrs/src/modules/events/store/tickets.js';
import { setSnack } from '@martyrs/src/modules/core/views/store/core.store.js';

import { useGlobalMixins } from "@martyrs/src/modules/core/views/mixins/mixins.js";

const { hasAccess } = useGlobalMixins();

const route = useRoute();
const router = useRouter();

let event = ref(null);
const stats = ref(null);
const attendance = ref(null);

const newTickets = ref([{
  name: '',
  email: '',
  target: null,
  type: 'event',
  seat: '',
  quantity: 1,
}]);

const isOpenTicketsPopup = ref(false);

function openTicketsPopup() {
  isOpenTicketsPopup.value = true;

  newTickets.value = [{
    name: '',
    email: '',
    target: event.value?._id,
    type: 'event',
    seat: '',
    quantity: 1,
  }];
}

function closeTicketsPopup() {
  isOpenTicketsPopup.value = false;
}

const fetchTickets = ref(false);

// Computed for max count in timeline
const maxCount = computed(() => {
  if (!attendance.value?.timeline) return 0;
  return Math.max(...attendance.value.timeline.map(slot => slot.count), 1);
});

onMounted(async () => {
  const data = await events.read({ user: auth.state.user._id, url: route.params.url });

  event.value = data.pop();

  if (!event.value) {
    router.push({name: 'notfound'});
  }

  if (event.value.owner.type === 'organization') {
    const isAccess = hasAccess(event.value.owner.target._id, 'events', 'edit', auth.state.accesses, auth.state.access.roles);

    if (!isAccess) {
      router.push({name: 'unauthorized'});
    }
  } else {
    if (event.value.creator.target._id !== auth.state.user._id) {
      router.push({name: 'unauthorized'});
    }
  }

  // Load statistics
  try {
    stats.value = await tickets.actions.getStats(event.value._id);
    attendance.value = await tickets.actions.getAttendance(event.value._id);
  } catch (error) {
    console.error('Error loading stats:', error);
  }
});

async function onSubmit() {
  try {
    const response = await tickets.actions.create(newTickets.value);
    fetchTickets.value = !fetchTickets.value;

    // Refresh stats
    stats.value = await tickets.actions.getStats(event.value._id);
    attendance.value = await tickets.actions.getAttendance(event.value._id);
  } catch (error) {
    console.log(error);
  }
}

async function changeStatus(ticket, status) {
  if (confirm('Are you sure you want to change ticket status?')) {
    try {
      const response = await tickets.actions.update({ ...ticket, status: status });
      fetchTickets.value = !fetchTickets.value;

      // Refresh stats
      stats.value = await tickets.actions.getStats(event.value._id);
      attendance.value = await tickets.actions.getAttendance(event.value._id);
    } catch (error) {
      console.error(error);
    }
  }
}

function viewPdf(ticket) {
  if (ticket.image) {
    window.open(ticket.image, '_blank');
  } else {
    alert('PDF not available for this ticket');
  }
}

async function sendTicketEmail(ticketId) {
  try {
    await tickets.actions.sendEmail(ticketId);
    alert('Ticket sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
    alert('Failed to send ticket');
  }
}

function copyTicketLink(ticketId) {
  const link = `${window.location.origin}/tickets/${ticketId}`;
  navigator.clipboard.writeText(link);
  setSnack('Link copied to clipboard');
}

function redirectTo() {
  // Placeholder callback
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
