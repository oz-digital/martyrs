<template>
  <section class="cols-2 gap-thin">
    <div class="pos-relative flex flex-column flex-center h-100">
      <div class="mn-b-thin pd-big radius-medium">
        <img v-if="te('logo')" loading="lazy" class="mn-b-semi h-4r" :src="t('logo')">

        <h2 v-if="te('title')" class="mn-b-medium" v-html="t('title')"/>
        <p v-if="te('description')" class="mn-b-medium p-semi t-transp">{{ t('description') }}</p>  
        <p v-if="te('subdescription')" class="mn-b-semi p-medium t-transp">{{ t('subdescription')}}</p>

      <div class="gap-thin cols-2">
        <router-link :to="t('action_link')" class="flex t-center bg-white flex-center flex-column t-black pd-big radius-medium">
          <IconInfo class="mn-b-small i-extra" fill="rgb(var(--black)"/>
          <p class="uppercase t-semi">{{t('action')}}</p>
        </router-link>

        <router-link :to="t('action_sublink') " class="flex t-center flex-center flex-column bg-main t-black pd-big radius-medium">
          <IconEarn class="mn-b-small i-extra" fill="rgb(var(--black)"/>
          <p class="uppercase t-semi">{{t('subaction')}}</p>
        </router-link>
        
      </div>
      </div>

    </div>

    <div class="pos-relative pd-medium flex-column flex-center flex h-100 bg-main radius-medium o-hidden">
      <img v-if="te('image')" loading="lazy" :src="t('image')" class="mn-t-auto z-index-2 pos-relative w-75 mn-b-auto">
      <ConnectMetamask
        :tokenAddress="options.tokenAddress"
        :tokenSymbol="options.tokenSymbol"
        :tokenDecimals="options.tokenDecimals"
        :tokenImage="options.tokenImage"
        :targetChainId="options.targetChainId"
        :metamaskIcon="options.metamaskIcon"
        :content="{
          en: {
            'connectMetaMask': t('connectMetaMask'),
            'switchToPolygon': t('switchToPolygon'),
            'addToken': t('addToken')
          }
        }"
        class="z-index-3 pos-relative w-100"
      />
      <img :src="'/spiral.webp'" loading="lazy" alt="" class="mn-b-extra z-index-1 spiral"/>
    </div>
  </section>
</template>

<script setup>
import { computed,ref,onMounted, reactive } from 'vue'
import { useI18n } from 'vue-i18n';

import IconInfo from '@martyrs/src/modules/icons/entities/IconInfo.vue'
import IconEarn from '@martyrs/src/modules/icons/entities/IconEarn.vue'

import ConnectMetamask from '@martyrs/src/modules/wallet/views/components/elements/ConnectMetamask.vue'

const props = defineProps({
  content: {
    type: Object,
    required: true
  },
  options: {
    type: Object,
    default: () => ({
      tokenAddress: '0x64b4b0ade1f015d6a0c536e8cf041e181d872220',
      tokenSymbol: 'OZDT',
      tokenDecimals: 8,
      tokenImage: 'https://ozdao.dev/logo-token.png',
      targetChainId: '0x89',
      metamaskIcon: "/icons/metamask.svg"
    })
  }
})
const { t, te } = useI18n({
  messages: props.content
})
</script>

<style lang="scss" scoped>
  .spiral {
    object-fit: cover;
    width: 100rem;
    height: 100rem;
    position: absolute;
    opacity: 0.066;
    transform: translate(-50%, -50%) rotate(0deg);
    transform-origin: center center;
    animation: spin 5s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: translate(-50%, -50%) rotate(0deg);
    }
    100% {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }
</style>