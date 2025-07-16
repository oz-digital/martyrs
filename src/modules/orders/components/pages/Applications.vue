<template>
  <div class="mobile:pd-thin pd-medium"> 
    <SectionPageTitle
      v-if="!MOBILE_APP"
      title="Applications"
      :actions="[
        { method: () => openCreatePopup(), label: 'Create Application' }
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
          <h3>{{totalApplications}}</h3>
        </div>
        <div class="w-100 bg-white radius-small pd-small">
          <p class="mn-b-thin">In Progress</p>
          <h3>{{inProgressApplications}}</h3>
        </div>
        <div class="w-100 bg-white radius-small pd-small">
          <p class="mn-b-thin">New This Month</p>
          <h3>{{newApplicationsThisMonth}}</h3>
        </div>
      </div>
    </Block>
    <Feed
      v-model:items="currentApplications"
      :search="true"
      :states="{
        empty: {
          title: 'No Applications Found',
          description: 'Currently, there are no applications.'
        }
      }"
      :store="applications"
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
        v-for="application in items" 
        :key="application._id"
        @click="openViewPopup(application)"
        class="cursor-pointer"
      >
        <CardApplication 
          :application="application"
          :formatDate="formatDate"
        />
      </div>
    </Feed>

    <!-- View Application Popup -->
    <Popup 
      :isPopupOpen="showViewPopup"
      @close-popup="closeViewPopup"
      title="Application Details"
      align="center right"
      class="bg-white h-min-100 w-max-50r pd-medium"
    >
      <ApplicationDetails
        v-if="selectedApplication"
        :application="selectedApplication"
        @edit="enableEdit"
        @delete="deleteApplication"
      />
    </Popup>

    <!-- Create/Edit Application Popup -->
    <Popup 
      :isPopupOpen="showFormPopup"
      @close-popup="closeFormPopup"
      :title="isCreateMode ? 'Create Application' : 'Edit Application'"
      align="center right"
      class="bg-white h-min-100 w-max-50r pd-medium"
    >
      <FormApplicationDetails 
        v-model:application="formApplication"
        @save="saveApplication"
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
  import applications from '@martyrs/src/modules/orders/store/applications.js';
  import SectionPageTitle from '@martyrs/src/modules/globals/views/components/sections/SectionPageTitle.vue'
  import Feed from '@martyrs/src/components/Feed/Feed.vue'
  import CardApplication from '@martyrs/src/modules/orders/components/blocks/CardApplication.vue'
  import FormApplicationDetails from '@martyrs/src/modules/orders/components/forms/FormApplicationDetails.vue'
  import ApplicationDetails from '@martyrs/src/modules/orders/components/sections/ApplicationDetails.vue'
  import applicationInitState from '@martyrs/src/modules/orders/store/models/application.js';
  import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';

  const route = useRoute();
  const router = useRouter();

  const statusFilter = ref('all')

  // Popup states
  const showViewPopup = ref(false)
  const showFormPopup = ref(false)
  const selectedApplication = ref(null)
  const formApplication = ref({ ...applicationInitState })
  const isCreateMode = ref(false)
  const currentApplications = ref([])

  const totalApplications = computed(() => {
    return applications.state.items?.length || 0
  });

  const inProgressApplications = computed(() => {
    return applications.state.items?.filter(application => application.status === 'in_progress').length || 0
  });

  const newApplicationsThisMonth = computed(() => {
    if (!applications.state.items) return 0;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return applications.state.items.filter(application => 
      new Date(application.createdAt) >= startOfMonth
    ).length
  });

  // Popup methods
  const openCreatePopup = () => {
    formApplication.value = { ...applicationInitState };
    // Ownership будет установлен в saveApplication
    isCreateMode.value = true;
    showFormPopup.value = true;
  };

  const openViewPopup = (application) => {
    selectedApplication.value = application;
    showViewPopup.value = true;
  };

  const closeViewPopup = () => {
    showViewPopup.value = false;
    selectedApplication.value = null;
  };

  const closeFormPopup = () => {
    showFormPopup.value = false;
    formApplication.value = { ...applicationInitState };
    isCreateMode.value = false;
  };

  const enableEdit = () => {
    formApplication.value = { ...selectedApplication.value };
    isCreateMode.value = false;
    showViewPopup.value = false;
    showFormPopup.value = true;
  };

  const saveApplication = async () => {
    try {
      // Remove empty fields but preserve required ownership structure
      const cleanData = { ...formApplication.value };
      if (!cleanData.contacts?.email) delete cleanData.contacts?.email;
      if (!cleanData.contacts?.phone) delete cleanData.contacts?.phone;
      if (!cleanData.contacts?.name) delete cleanData.contacts?.name;
      if (!cleanData.text) delete cleanData.text;
      if (!cleanData.chat) delete cleanData.chat;
      
      // Remove _id to let MongoDB auto-generate it (Mongoose bug when _id is null)
      if (isCreateMode.value) {
        delete cleanData._id;
      }
      
      // Set owner based on context
      if (route.meta.context === 'organization') {
        // В контексте организации - owner это организация
        cleanData.owner = {
          type: 'Organization',
          target: route.params._id || cleanData.owner?.target
        };
      } else {
        // В контексте бекофиса - owner это Platform
        cleanData.owner = {
          type: 'platform',
          target: '000000000000000000000000' // заглушка для отдела платформы
        };
      }
      
      // Set creator (who created the application)
      cleanData.creator = {
        type: 'User',
        target: auth.state.user._id || cleanData.creator?.target
      };
      
      if (isCreateMode.value) {
        const response = await applications.create(cleanData);
        applications.addItem(response, currentApplications.value);
      } else {
        const response = await applications.update(cleanData);
        applications.updateItem(response, currentApplications.value);
        selectedApplication.value = { ...response };
      }
      closeFormPopup();
    } catch (error) {
      console.error('Error saving application:', error);
    }
  };

  const deleteApplication = async () => {
    if (confirm('Are you sure you want to delete this application?')) {
      try {
        await applications.delete({ _id: selectedApplication.value._id });
        applications.removeItem(selectedApplication.value, currentApplications.value);
        closeViewPopup();
      } catch (error) {
        console.error('Error deleting application:', error);
      }
    }
  };

  onMounted(async () => {
   
  });
</script>