<template>
  <section class="bg-white"> 
    <div class="gap-regular pos-t-0 pos-sticky z-index-3 radius-medium ">
      <DatePicker
        @update:date="handleDatePickerChange"
        :locale="$i18n.locale"
        :options="{
          dateStart: 0,
          dateEnd: 30
        }"
        class="bs-black-small br-b br-solid br-black-transp-10 o-hidden bg-white  pd-l-zero pd-r-zero pd-thin"
      />
    </div>

   <section class="pd-medium mobile:pd-thin radius-tr-medium radius-tl-medium bg-white"> 

    <div class="gap-regular radius-medium mn-b-semi">
      <h2
        class="mn-b-small"
      >
        Events in <p @click="openCitySelectionPopup" class="d-inline-block hover-bg-second hover-t-white  cursor-pointer transition-elastic transition-timing-1 h2 pd-micro pd-t-thin pd-r-small pd-l-small br-solid br-1px br-black-transp-10 radius-extra">Phuket</p>
      </h2>

      <Popup  
        @close-popup="closeCitySelectionPopup" 
        :isPopupOpen="isCitySelectionPopup"
        class="w-m-33r t-left pd-medium bg-white radius-semi"

      >
        <CitySelection/>
      </Popup>

     <EventsHot 
      :options="{
      }"
    />
    </div>


    <FeaturedEvents class="mn-b-semi"/>
    <SelectDate 
      class="mn-b-semi"
      @date-selected="handleDateSelection" 
    />

    <div class="gap-regular  mn-b-semi">

      <h3
        class="mn-b-small"
      >
         Most Happening Organizers
      </h3>
      <Feed
        :showLoadMore="false"
        :LoadMore="false"
        :states="{
          empty: {
            title: 'No Organization Found',
            description: 'Currently, there are no organization available.'
          }
        }"
        :store="{
          read: (options) => organizations.actions.read(options),
          state: organizations.state
        }"
        :options="{
            user: auth.state.user._id,
            sort: 'numberOfMemberships',
            contain: ['blogposts'],
            lookup: ['blogposts'],
            limit: 6
        }"
        v-slot="{ 
          items 
        }"
        class="cols-2 gap-thin"
      >
        <CardOrganization 
          v-for="organization in items"
          :key="organization._id" 
          :organization="organization"
          :user="auth.state.user"
          :showProducts="false"
          :showRating="false"
          :showFeatured="false"
          :showFollowers="false"
          @updateMembership="handleMembershipUpdate"
          class="pd-small w-100 pd-0 bg-light p-regular radius-medium o-hidden"
        />
      </Feed>

    </div>
    
    <div class="gap-regular radius-medium">

      <h3
        class="mn-b-small"
      >
        All Events
      </h3>

      <Feed
        :search="true"
         :showLoadMore="false"
        :states="{
          empty: {
            title: 'No Events Today',
            description: 'Currently, there are no events available.'
          }
        }"
        :store="{
          read: (options) => events.read(options),
          state: events.state
        }"
        :options="{
            user: auth.state.user._id,
            limit: 9
        }"
        v-slot="{ 
          items 
        }"
        class="cols-3 mobile:cols-1 gap-thin o-x-hidden"
      >
         <CardEvent 
          @click="$router.push({name: 'Event', params: {url: event.url}})" 
          v-for="(event,index) in items" 
          :key="event._id" 
          :event="event" 
          :user="auth.state.user._id" 
          :type="'normal'"
          class="w-100 o-hidden bg-light radius-medium"
        >
        </CardEvent>
      </Feed>

    </div>

    </section>
  </section>
</template>

<script setup="props">
  import { computed, onMounted, watch, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  import Breadcrumbs from '@martyrs/src/components/Breadcrumbs/Breadcrumbs.vue';
  import Feed from '@martyrs/src/components/Feed/Feed.vue'
  import Popup from '@martyrs/src/components/Popup/Popup.vue'
  import DatePicker from '@martyrs/src/components/DatePicker/DatePicker.vue'

  import CitySelection from '@martyrs/src/modules/core/views/components/partials/CitySelection.vue';

  import FeaturedEvents from '@martyrs/src/modules/events/components/sections/FeaturedEvents.vue';   
  import SelectDate from '@martyrs/src/modules/events/components/sections/SelectDate.vue';   

  import EventsHot from '@martyrs/src/modules/events/components/sections/EventsHot.vue';   
  import CardEvent from '@martyrs/src/modules/events/components/blocks/CardEvent.vue';
  import CardOrganization from '@martyrs/src/modules/organizations/components/blocks/CardOrganization.vue'

  // Import state
  import * as auth from '@martyrs/src/modules/auth/views/store/auth.js'
  import * as organizations from '@martyrs/src/modules/organizations/store/organizations.js'
  import membershipsStore from '@martyrs/src/modules/organizations/store/memberships.store.js'


  import * as events from '@martyrs/src/modules/events/store/events.js'; 

  const handleMembershipUpdate = ({ membership, status, target }, statusName, statusNumber) => {
    membershipsStore.handleMembershipUpdate(organizations.state.current, membership, status, target, statusName, statusNumber)
  };
  // State
  const route = useRoute();
  const router = useRouter();

  // let baseDate = new Date();
  // const formattedDate = formatDateForRouter(baseDate);
  
  // function formatDateForRouter(date) {
  //   return `${date.getDate().toString().padStart(2, '0')}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getFullYear()}`;
  // }

  // if (route.query) {
  //   const query = route.query;
    
  //   const newFilterValue = {
  //     tags: query.tags ? query.tags.split(',') : null,
  //     date: query.date ? query.date : null,
  //   };

  //   events.state.filter = newFilterValue;  // <-- Modified
  // } else {
  //   const newFilterValue = {
  //     date: formattedDate,
  //   };

  //   events.state.filter = newFilterValue;
  // }

  // watch(() => events.state.filter, (newFilterValue, oldFilterValue) => {  // <-- Modified
  //   const query = { ...route.query };

  //   Object.keys(oldFilterValue).forEach(key => {
  //     if (query[key]) {
  //       delete query[key];
  //     }
  //   });

  //   const newQueryValues = Object.fromEntries(
  //     Object.entries(newFilterValue)
  //       .filter(([key, value]) => (Array.isArray(value) && value.length > 0) || (typeof value === 'string' && value))
  //       .map(([key, value]) => [key, Array.isArray(value) ? value.join(',') : value])
  //   );
  //   Object.assign(query, newQueryValues);

  //   router.push({ query });
  // }, { deep: true })

  const isCitySelectionPopup = ref(false)

  function openCitySelectionPopup() {
    isCitySelectionPopup.value = true;
  }
  function closeCitySelectionPopup() {
    isCitySelectionPopup.value = false;
  }
 
  const handleDatePickerChange = (date) => {
    if (date) {
      // Убедимся, что у нас действительно объект даты
      const selectedDate = new Date(date);
      
      // Создаем начало дня в локальной временной зоне
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      // Создаем конец дня в локальной временной зоне
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      router.push({
        name: 'Events Search',
        query: {
          period: 'day',
          periodStart: startOfDay.toISOString(),
          periodEnd: endOfDay.toISOString()
        }
      });
    }
  };

  // Update the existing handleDateSelection method
  const handleDateSelection = (dateData) => {
    console.log('Selected date data:', dateData);
    router.push({
      name: 'Events Search',
      query: {
        periodStart: dateData.startDate.toISOString(),
        periodEnd: dateData.endDate.toISOString()
      }
    });
  };
</script>

<style lang="scss">
  
</style>
