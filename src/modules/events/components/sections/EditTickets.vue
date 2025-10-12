<template>
  <Block
    title="Tickets"
    placeholder="No tickets added yet"
    :actions="[{
      label: '+',
      function: () => openTicketPopup()
    }]"
    class="cols-1 mn-b-thin t-black gap-thin"
  >
    <div
      v-for="(ticket, index) in tickets"
      :key="index"
      class="bg-white radius-small pd-small flex-nowrap flex-v-center flex gap-thin mn-b-thin"
    >
      <div class="aspect-1x1 h-3r flex-child-default radius-small o-hidden">
        <img
          v-if="ticket.photo"
          :src="(FILE_SERVER_URL || '') + ticket.photo"
          alt="Ticket image"
          class="w-100 h-100 object-fit-cover"
        />
        <PlaceholderImage v-else class="w-100 bg-main-transp-10 radius-small h-100" />
      </div>

      <div class="w-100">
        <p class="p-regular mn-b-thin t-medium d-block">{{ ticket.name || 'Unnamed ticket' }}</p>
        <p class="t-medium t-transp">{{ returnCurrency() }}{{ ticket.price }}</p>
      </div>

      <div class="flex gap-thin">
        <Button
          :showSuccess="false"
          :showLoader="false"
          class="radius-small pd-small flex-center flex aspect-1x1 bg-light cursor-pointer hover-scale-1"
          :submit="() => openTicketPopup(ticket, index)"
        >
          <IconEdit class="i-regular" />
        </Button>
        <Button
          :showSuccess="false"
          :showLoader="false"
          class="radius-small pd-small flex-center flex aspect-1x1 bg-red cursor-pointer hover-scale-1"
          :submit="() => deleteTicket(index)"
        >
          <IconDelete class="i-regular" />
        </Button>
      </div>
    </div>

    <Popup
      :title="editingIndex !== null ? 'Edit Ticket' : 'Create Ticket'"
      @close-popup="closeTicketPopup"
      :isPopupOpen="isTicketPopupOpen"
      align="center right"
      class="bg-white h-min-100 mobile:w-100 w-30r mobile:w-100 pd-medium"
    >
      <div class="cols-1 gap-thin o-y-scroll">
        <div class="mn-b-thin radius-small w-100 h-10r bg-light flex-center flex-column flex">
          <UploadImage
            v-model:photo="currentTicket.photo"
            :uploadPath="'tickets'"
            class="h-4r w-4r aspect-1x1 o-hidden mn-b-thin radius-extra"
          />
          <h4>Upload Ticket Image</h4>
        </div>

        <Field
          v-model:field="currentTicket.name"
          label="Name"
          placeholder="Ticket name"
          class="w-100 bg-light radius-small pd-small"
        />

        <Field
          v-model:field="currentTicket.description"
          placeholder="Enter ticket description"
          class="w-100 bg-light radius-small pd-small"
          style="resize: vertical"
          type="textarea"
        />

        <Field
          v-model:field="currentTicket.price"
          label="Price"
          type="number"
          placeholder="Price"
          class="w-100 bg-light radius-small pd-small"
        />

        <div class="t-medium mn-t-small ">Validity Period</div>
        <Checkbox
          v-model:radio="currentTicket.validity.always"
          label="Valid Always"
          mode="switch"
          class="w-100 bg-light radius-small pd-small mn-b-thin"
        />

        <div v-if="!currentTicket.validity.always" class="flex gap-thin">
          <FieldDate
            v-model="currentTicket.validity.start"
            :allowRange="false"
            :enableTime="true"
            :showSelected="true"
            label="Start"
            placeholder="Validity start"
            class="w-100 bg-light radius-small pd-small"
          />
          <FieldDate
            v-model="currentTicket.validity.end"
            :allowRange="false"
            :enableTime="true"
            :showSelected="true"
            label="End"
            placeholder="Validity end"
            class="w-100 bg-light radius-small pd-small"
          />
        </div>

        <div class="flex gap-thin mn-t-medium">
          <Button
            :showSuccess="false"
            :showLoader="false"
            class="bg-red t-white w-100"
            :submit="closeTicketPopup"
          >
            Cancel
          </Button>
          <Button
            class="bg-main w-100"
            :submit="saveTicket"
          >
            {{ editingIndex !== null ? 'Update' : 'Add' }}
          </Button>
        </div>
      </div>
    </Popup>

  </Block>

 
</template>

<script setup>
import { ref, reactive } from 'vue';

// Components
import Block from '@martyrs/src/components/Block/Block.vue';
import Field from '@martyrs/src/components/Field/Field.vue';
import Button from '@martyrs/src/components/Button/Button.vue';
import Popup from '@martyrs/src/components/Popup/Popup.vue';
import UploadImage from '@martyrs/src/components/UploadImage/UploadImage.vue';
import FieldDate from '@martyrs/src/components/FieldDate/FieldDate.vue';
import Checkbox from '@martyrs/src/components/Checkbox/Checkbox.vue';

// Icons
import PlaceholderImage from '@martyrs/src/modules/icons/placeholders/PlaceholderImage.vue';
import IconEdit from '@martyrs/src/modules/icons/navigation/IconEdit.vue';
import IconDelete from '@martyrs/src/modules/icons/navigation/IconDelete.vue';

import { useGlobalMixins } from '@martyrs/src/modules/core/views/mixins/mixins.js';

const { returnCurrency } = useGlobalMixins();

const props = defineProps({
  tickets: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:tickets']);

const isTicketPopupOpen = ref(false);
const editingIndex = ref(null);

const currentTicket = reactive({
  name: '',
  description: '',
  price: 0,
  photo: null,
  validity: {
    always: true,
    start: null,
    end: null
  }
});

function openTicketPopup(ticket = null, index = null) {
  editingIndex.value = index;

  if (ticket) {
    currentTicket.name = ticket.name || '';
    currentTicket.description = ticket.description || '';
    currentTicket.price = ticket.price || 0;
    currentTicket.photo = ticket.photo || null;
    currentTicket.validity = {
      always: ticket.validity?.always !== undefined ? ticket.validity.always : true,
      start: ticket.validity?.start || null,
      end: ticket.validity?.end || null
    };
  } else {
    currentTicket.name = '';
    currentTicket.description = '';
    currentTicket.price = 0;
    currentTicket.photo = null;
    currentTicket.validity = {
      always: true,
      start: null,
      end: null
    };
  }

  isTicketPopupOpen.value = true;
}

function closeTicketPopup() {
  isTicketPopupOpen.value = false;
  editingIndex.value = null;

  currentTicket.name = '';
  currentTicket.description = '';
  currentTicket.price = 0;
  currentTicket.photo = null;
  currentTicket.validity = {
    always: true,
    start: null,
    end: null
  };
}

function saveTicket() {
  const ticketToSave = {
    name: currentTicket.name,
    description: currentTicket.description,
    price: parseFloat(currentTicket.price) || 0,
    photo: currentTicket.photo,
    validity: {
      always: currentTicket.validity.always,
      start: currentTicket.validity.start,
      end: currentTicket.validity.end
    }
  };

  const updatedTickets = [...props.tickets];

  if (editingIndex.value !== null) {
    updatedTickets[editingIndex.value] = ticketToSave;
  } else {
    updatedTickets.push(ticketToSave);
  }

  emit('update:tickets', updatedTickets);
  closeTicketPopup();
}

function deleteTicket(index) {
  if (confirm('Are you sure you want to delete this ticket?')) {
    const updatedTickets = [...props.tickets];
    updatedTickets.splice(index, 1);
    emit('update:tickets', updatedTickets);
  }
}
</script>
