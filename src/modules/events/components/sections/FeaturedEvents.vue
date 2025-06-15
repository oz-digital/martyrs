<template>
  <div class="columns-wrapper scroll-hide gap-thin">
    <div class="column flex flex-column flex-child-default">
      <h3
        class="mn-b-small"
      >
        Planned
      </h3>
      <List
        :user="auth.state.user._id"
        class="bg-light o-hidden h-100    pd-thin radius-medium"
        :phase="'planned'"
      />
    </div>

    <div class="column flex flex-column flex-child-default">
      <h3
        class="mn-b-small"
      >
        Finished 
      </h3>
      <List
        :user="auth.state.user._id"
        class="bg-light o-hidden h-100  pd-thin radius-medium"
        :phase="'finished'"
      />
    </div>
  </div>
</template>

<script setup="props">
  import { computed, onMounted, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  import List from '@martyrs/src/modules/events/components/sections/List.vue';   
  // Import state
  import * as events from '@martyrs/src/modules/events/store/events.js'; 
  import * as auth from '@martyrs/src/modules/auth/views/store/auth.js'

  // State
  const route = useRoute();
  const router = useRouter();
</script>

<style lang="scss" scoped>
.columns-container {
  width: 100%;
  overflow: hidden;
}

.columns-wrapper {
  display: flex;
  width: 100%;
  
  @media (min-width: 768px) {
    /* Десктоп: 2 колонки рядом */
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  
  @media (max-width: 767px) {
    /* Мобильные устройства: горизонтальный скролл */
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
  }
}

.column {
  @media (max-width: 767px) {
    /* Настройки для мобильных устройств */
    max-width: 90%;
    flex: 0 0 auto;
    scroll-snap-align: start;
    
    &:last-child {
      margin-right: 0;
    }
  }
}
</style> 