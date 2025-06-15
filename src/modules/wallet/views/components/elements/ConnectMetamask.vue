<template>
  <div>
    <!-- Connect Metamask -->
    <button 
      v-if="!isMetaMaskInstalled"
      @click="connectMetaMask" 
      class="transition-ease-in-out cursor-pointer bg-black radius-big flex-v-center flex-nowrap flex t-left uppercase w-100 pd-small t-white"
    >
      <img loading="lazy" :src="metamaskIcon" class="mn-r-small i-big">
      <span class="h4 uppercase w-100">{{ t('connectMetaMask') }}</span>
      <IconAdd class="t-transp" fill="rgb(var(--white))"/>
    </button>
    <template v-else>
      <!-- Switch to Polygon -->
      <button 
        v-if="!isPolygon"
        @click="switchToPolygon" 
        class="transition-ease-in-out cursor-pointer hover-bg-white hover-t-black bg-black t-white radius-big flex-v-center flex-nowrap flex t-left uppercase w-100 pd-small"
      >
        <img loading="lazy" :src="metamaskIcon" class="mn-r-small i-big">
        <span class="h4 uppercase w-100">{{ t('switchToPolygon') }}</span>
        <IconAdd class="t-transp" fill="rgb(var(--white))"/>
      </button>
      <!-- Add Token to metamask -->
      <button 
        v-if="isPolygon"
        @click="addToken" 
        class="transition-ease-in-out cursor-pointer hover-bg-white hover-t-black bg-black radius-big flex-v-center flex-nowrap flex t-left uppercase w-100 pd-small t-white"
      >
        <img loading="lazy" :src="metamaskIcon" class="mn-r-small i-big">
        <span class="h4 uppercase w-100">{{ t('addToken') }}</span>
        <IconAdd class="hover-fill-black fill-white t-transp"/>
      </button>
    </template>
    <p class="mn-t-small" v-if="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';

import IconAdd from '@martyrs/src/modules/icons/navigation/IconAdd.vue';

const props = defineProps({
  // Token configuration
  tokenAddress: {
    type: String,
    required: true
  },
  tokenSymbol: {
    type: String,
    required: true
  },
  tokenImage: {
    type: String,
    required: true
  },
  tokenDecimals: {
    type: Number,
    default: 18
  },
  // Chain configuration
  targetChainId: {
    type: String,
    default: '0x89' // Polygon Mainnet by default
  },
  // UI configuration
  metamaskIcon: {
    type: String,
    default: '/icons/metamask.svg'
  },
  content: {
    type: Object,
    default: () => ({
      en: {
        "connectMetaMask": "Connect MetaMask",
        "switchToPolygon": "Switch to Polygon",
        "addToken": `Add token to MetaMask`,
      }
    })
  }
});

const isMetaMaskInstalled = ref(false);
const isPolygon = ref(false);
const loading = ref(false);
const error = ref(null);
const buttonStyle = ref({});

const connectMetaMask = async () => {
  if (typeof window.ethereum !== 'undefined') {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      checkMetaMask();
    } catch (err) {
      error.value = err.message;
      console.error('Error connecting to MetaMask:', err);
    }
  } else {
    window.open('https://metamask.io/', '_blank');
  }
};

const checkMetaMask = async () => {
  if (typeof window.ethereum !== 'undefined') {
    isMetaMaskInstalled.value = true;
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    isPolygon.value = chainId === props.targetChainId;
  } else {
    isMetaMaskInstalled.value = false;
  }
};

const switchToPolygon = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: props.targetChainId }],
    });
    checkMetaMask();
  } catch (err) {
    error.value = err.message;
    console.error('Error switching to Polygon:', err);
  }
};

const addToken = async () => {
  buttonStyle.value['pointer-events'] = 'none';
  error.value = null;
  loading.value = true;
  
  try {
    await ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: props.tokenAddress,
          symbol: props.tokenSymbol,
          decimals: props.tokenDecimals,
          image: props.tokenImage,
        },
      },
    });
    buttonStyle.value['background-color'] = '#009911';
    loading.value = false;
  } catch (err) {
    error.value = err.message;
    loading.value = false;
  }
};

const { t } = useI18n({
  messages: props.content
});

onMounted(() => {
  checkMetaMask();
});
</script>