<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  textData: {
    type: Object,
    default: () => ({
      messages: {
        en: {
          title: 'Weeder Roadmap',
          milestones: [{
            title: 'MVP in Thailand',
            description: 'The Weeder platform was tested as a minimum viable product (MVP) in Thailand to validate its basic features and gather user feedback. This helped the company make improvements before launching on a larger scale.',
            date: '2023-02-01',
            finished: 'true'
          },{
            date: '2023-05-01',
            title: 'Weeder Platform Soft Launch',
            description: 'A soft version of the Weeder platform will be launched for users to explore and provide feedback. This allows the company to identify any issues and make improvements before the official release.',
          },{
            date: '2023-07-01',
            title: 'IDO',
            description: 'The Initial DEX Offering (IDO) will launch the Weeder token on a our decentralized platform. It allows the public to purchase Weeder tokens and get involved in the project at an early stage. It can also help establish the initial token price.',
          },{
            date: '2023-09-01',
            title: 'Weeder Platform Official Release',
            description: 'The Weeder platform will be officially released with dividend features, cashback, and full blockchain integration. This marks the full launch of the platform and allows users to access all its features.',
          },{
            date: '2023-11-01',
            title: 'Weeder Ecosystem Expansion',
            description: 'The Weeder ecosystem will be expanded by adding support for new countries and enhancing its functionalities. This helps to increase the platforms user base and improve its overall capabilities.',
          }]
        }
      }
    })
  }
});

const { t,tm } = useI18n(props.textData);
</script>

<template>
  <div class="o-hidden bg-black t-white t-left pd-big radius-medium">
    <h2 class="mn-b-big t-center w-100">{{ t('title') }}</h2>
    
    <div class="gap-thin flex-nowrap flex o-scrolled timeline custom-scroll">
      <div
        v-for="(milestone, index) in tm('milestones')"
        :key="index"
        class="timeline-item br-white-transp-10 br-1px br-solid pd-big radius-small"
      >
      
        <div class="mn-b-semi bg-white-transp-5 timeline-icon">
          <svg v-if="milestone.finished"  width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="24 / basic / check-mark">
            <path id="icon" fill-rule="evenodd" clip-rule="evenodd" d="M7.28033 10.7197L14.25 3.75L15.3107 4.81066L7.28033 12.841L3 8.56066L4.06066 7.5L7.28033 10.7197Z" fill="rgb(var(--main))"/>
            </g>
          </svg>
        </div>

        <div class="w-100 timeline-content">
          <h3 class="mn-b-small">{{ t(milestone.title) }}</h3>
          <p class="uppercase mn-b-semi t-main t-semi date">{{ milestone.date }}</p>
          <p class="t-transp w-100">{{ t(milestone.description) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .timeline {
    .timeline-item {
      min-width: 32rem;
    }

    .timeline-icon {
      border-radius: 100%;
      width: 3rem;
      height: 3rem;
      display: flex;
      align-items: center;
      justify-content: center;
    

      img {
        width: 1.5rem;
        height: 1.5rem;
      }
    }
  }

  .custom-scroll {
    overflow-x: scroll;
    scrollbar-width: none; /* Hide scrollbar for Firefox */
    -ms-overflow-style: none; /* Hide scrollbar for IE and Edge */
    display: -webkit-box; /* Fix for Safari */
    display: -webkit-flex; /* Fix for Safari */
    display: -ms-flexbox;
    display: flex;
  }

  .custom-scroll::-webkit-scrollbar {
    width: 0px; /* Hide scrollbar for Chrome and Safari */
    height: 0px;
  }
</style>