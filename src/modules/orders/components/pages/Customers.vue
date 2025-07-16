<template>
  <div class="mobile:pd-thin pd-medium"> 
    <SectionPageTitle
      v-if="!MOBILE_APP"
      title="Customers"
      :actions="[
        { method: () => openCreatePopup(), label: 'Create Customer' }
      ]"
      class="mn-b-small"
    />

    <Block
      v-if="route.meta.context !== 'user'"
      title="Statistics"
      class="mn-b-small"
    >
      <div class="gap-micro flex-nowrap flex">
        <div class="w-100 bg-white radius-small pd-small">
          <p class="mn-b-thin">Total</p>
          <h3>{{totalCustomers}}</h3>
        </div>
        <div class="w-100 bg-white radius-small pd-small">
          <p class="mn-b-thin">Active</p>
          <h3>{{activeCustomers}}</h3>
        </div>
        <div class="w-100 bg-white radius-small pd-small">
          <p class="mn-b-thin">New This Month</p>
          <h3>{{newCustomersThisMonth}}</h3>
        </div>
      </div>
    </Block>

    <Feed
      v-model="currentCustomers"
      :search="true"
      :states="{
        empty: {
          title: 'No Customers Found',
          description: 'Currently, there are no customers.'
        }
      }"
      :store="customers"
      :options="{
        limit: 15,
        ...(route.meta.context === 'organization' && { owner: route.params._id }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      }"
      v-slot="{ 
        items 
      }"
      class="gap-thin cols-3 mobile:cols-1"
    >
      <div 
        v-for="customer in items" 
        :key="customer._id"
        @click="openViewPopup(customer)"
        class="cursor-pointer"
      >
        <CardCustomer 
          :customer="customer"
          :formatDate="formatDate"
        />
      </div>
    </Feed>

    <!-- View Customer Popup -->
    <Popup 
      :isPopupOpen="showViewPopup"
      @close-popup="closeViewPopup"
      title="Customer Details"
      align="center right"
      class="bg-white h-min-100 w-max-50r pd-medium"
    >
      <CustomerDetails
        v-if="selectedCustomer"
        :customer="selectedCustomer"
        @edit="enableEdit"
        @delete="deleteCustomer"
      />
    </Popup>

    <!-- Create/Edit Customer Popup -->
    <Popup 
      :isPopupOpen="showFormPopup"
      @close-popup="closeFormPopup"
      :title="isCreateMode ? 'Create Customer' : 'Edit Customer'"
      align="center right"
      class="bg-white h-min-100 w-max-50r pd-medium"
    >
      <FormCustomerDetails 
        v-model:customer="formCustomer"
        @save="saveCustomer"
        @cancel="closeFormPopup"
        :create-mode="isCreateMode"
      />
    </Popup>
  </div>
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  import Block from '@martyrs/src/components/Block/Block.vue';
  import Popup from '@martyrs/src/components/Popup/Popup.vue';
  import customers from '@martyrs/src/modules/orders/store/customers.store.js';
  import SectionPageTitle from '@martyrs/src/modules/globals/views/components/sections/SectionPageTitle.vue'
  import Feed from '@martyrs/src/components/Feed/Feed.vue'
  import CardCustomer from '@martyrs/src/modules/orders/components/blocks/CardCustomer.vue'
  import FormCustomerDetails from '@martyrs/src/modules/orders/components/forms/FormCustomerDetails.vue'
  import CustomerDetails from '@martyrs/src/modules/orders/components/sections/CustomerDetails.vue'
  import customerInitState from '@martyrs/src/modules/orders/store/models/customer.js';
  import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';

  const route = useRoute();
  const router = useRouter();

  const statusFilter = ref('all')

  // Popup states
  const showViewPopup = ref(false)
  const showFormPopup = ref(false)
  const selectedCustomer = ref(null)
  const formCustomer = ref({ ...customerInitState })
  const isCreateMode = ref(false)
  const currentCustomers = ref([])

  const totalCustomers = computed(() => {
    return customers.state.items?.length || 0
  });

  const activeCustomers = computed(() => {
    return customers.state.items?.filter(customer => customer.status === 'active').length || 0
  });

  const newCustomersThisMonth = computed(() => {
    if (!customers.state.items) return 0;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return customers.state.items.filter(customer => 
      new Date(customer.createdAt) >= startOfMonth
    ).length
  });

  // Popup methods
  const openCreatePopup = () => {
    formCustomer.value = { ...customerInitState };
    // Set owner and creator
    if (route.params._id) {
      formCustomer.value.owner = {
        type: 'Organization',
        target: route.params._id
      };
    }
    formCustomer.value.creator = {
      type: 'User',
      target: auth.state.user._id
    };
    isCreateMode.value = true;
    showFormPopup.value = true;
  };

  const openViewPopup = (customer) => {
    selectedCustomer.value = customer;
    showViewPopup.value = true;
  };

  const closeViewPopup = () => {
    showViewPopup.value = false;
    selectedCustomer.value = null;
  };

  const closeFormPopup = () => {
    showFormPopup.value = false;
    formCustomer.value = { ...customerInitState };
    isCreateMode.value = false;
  };

  const enableEdit = () => {
    formCustomer.value = { ...selectedCustomer.value };
    isCreateMode.value = false;
    showViewPopup.value = false;
    showFormPopup.value = true;
  };

  const saveCustomer = async () => {
    try {
      // Remove empty fields but preserve required ownership structure
      const cleanData = { ...formCustomer.value };
      if (!cleanData.email) delete cleanData.email;
      if (!cleanData.phone) delete cleanData.phone;
      if (!cleanData.notes) delete cleanData.notes;
      if (!cleanData.referral?.code) {
        if (cleanData.referral) delete cleanData.referral.code;
      }
      
      // Always ensure owner and creator have proper structure
      cleanData.owner = {
        type: 'Organization',
        target: route.params._id || cleanData.owner?.target
      };
      
      cleanData.creator = {
        type: 'User',
        target: auth.state.user._id || cleanData.creator?.target
      };
      
      console.log('Sending customer data:', cleanData);
      
      if (isCreateMode.value) {
        const created = await customers.create(cleanData);
        customers.addItem(created, currentCustomers.value);
      } else {
        const updated = await customers.update(cleanData);
        customers.updateItem(updated, currentCustomers.value);
        selectedCustomer.value = { ...updated };
      }
      closeFormPopup();
    } catch (error) {
      console.error('Error saving customer:', error);
    }
  };

  const deleteCustomer = async () => {
    if (confirm('Are you sure you want to delete this customer?')) {
      try {
        await customers.delete({ _id: selectedCustomer.value._id });
        customers.removeItem(selectedCustomer.value, currentCustomers.value);
        closeViewPopup();
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    }
  };

  onMounted(async () => {
   
  });
</script>