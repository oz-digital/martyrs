<template>
  <div class="pd-thin">
    <section class="bg-black t-white mn-b-thin radius-big pd-big">
      <h1 class="mn-b-medium">{{ t('wallet.title') }}</h1>

      <p class="mn-b-semi t-transp p-medium">
        {{ t('wallet.subtitle') }}
      </p>

      <div 
        v-if="state.account"
        class="gap-thin mn-b-thin flex-nowrap bg-black radius-extra t-white br-solid br-white-transp-10 br-1px flex-v-center flex pd-medium"
      >
        <div class="flex-v-center flex-nowrap flex mn-r-auto">
          <!-- <img loading="lazy" src="/logo/wdt.svg" class="mn-r-thin i-big"> -->
          <h2>{{state.tokenBalance}} {{ t('wallet.token') }}</h2>
        </div>

        <button @click="openGetMorePopup" class="t-nowrap w-max bg-main t-medium button">Get More</button>


        <Button 
          :submit="actions.collectRewards" 
          class="w-max bg-white t-black t-medium button"
        >
          Withdraw
        </Button>
      </div>

      <ConnectMetamask class="mn-b-thin radius-extra br-solid br-white-transp-10 br-1px w-100" />

      <div
        v-if="state.account"
        class="w-100 mn-b-semi flex-column flex pd-big radius-big bg-main t-black"
      >
        <p class="t-transp t-medium mn-b-thin">You own:</p>
        <p class="h1 mn-b-small">{{state.share}}%</p>
        <p class="t-white p-medium t-medium mn-b-semi">of all shares</p>

          <div
            class="flex-v-center mn-b-small flex-nowrap flex pd-small bg-black-transp-5 radius-extra"
          >
              <!-- <img loading="lazy" src="@/assets/icons/metamask.svg" class="mn-r-small i-big" > -->
            
            <p v-if="state.account" class="t-transp t-medium ">
               <span class="uppercase p-small t-medium t-transp">Connected Metamask</span><br>
               <span>{{state.account}}</span>
            </p>

            <button
              v-if="state.account"
              @click="actions.disconnectWallet"
              class="mn-l-auto bg-red button"
            >
              Disconnect Wallet
            </button>
          </div>
      </div>

    </section>

    <div v-if="!state.account" class="mn-b-semi cols-2 gap-thin">
      <div
        class="w-100 pd-medium radius-medium t-center bg-light"
      >
        <h3 class="mn-b-small">Make first order and start earning Weeder Token</h3>
        <button class="mn-l-auto mn-r-auto bg-main button">Explore marketplace</button>
      </div>

      <div
        class="w-100 pd-medium flex-center flex flex-column radius-medium t-center bg-light"
      >
        <h3 
          v-if="!state.account"
          class="mn-b-small"
        >
          Connect Metamask to withdrawal your earnings.
        </h3>

        <button
          v-if="!state.account"
          @click="actions.connectWallet"
          class="br-solid br-2px br-black-transp-10 t-black button"
        >
          Connect Wallet
        </button>
      </div>
    </div>

    <h2 class="mn-b-small" v-if="state.rewards.length > 0">Latest Rewards </h2>

    <section class="cols-3 mobile:cols-1 gap-thin">
      <div 
        class="radius-medium bg-light"
        v-for="income in state.rewards"
      > 
        <div class="flex-nowrap br-b br-black-transp-10 br-solid flex pd-medium">
          <!-- <img loading="lazy" src="/logo/wdt-plus.svg" class="mn-r-thin i-medium"> -->
          <p class="t-semi mn-r-auto">{{income.amount}} WDT</p>
          
          <span class="pd-t-nano pd-b-nano pd-l-thin pd-r-thin bg-main flex flex-center radius-extra t-semi p-small">{{income.type === 'blogpost' ? 'Community Reward' : income.type}}</span>
        </div>

        <div class="pd-medium">
          <h4 class="t-regular mn-b-thin">{{income.name}}</h4>
          <!-- <p class="p-small">{{income.content[0].content}}</p> -->
        </div>

      </div>


    </section>

    <h2 class="mn-b-small" v-if="state.rewards.length > 0">Activity</h2>

    <section class="cols-3 mobile:cols-1 gap-thin">
      <div 
        class="radius-medium bg-grey"
        v-for="income in state.rewards"
      > 
        <div class="flex-nowrap br-b br-black-transp-10 br-solid flex pd-medium">
          <!-- <img loading="lazy" src="/logo/wdt-plus.svg" class="mn-r-thin i-medium"> -->
          <p class="t-semi mn-r-auto">{{income.amount}} WDT</p>
          
          <span class="pd-t-nano pd-b-nano pd-l-thin pd-r-thin bg-main flex flex-center radius-extra t-semi p-small">{{income.type === 'blogpost' ? 'Community Reward' : income.type}}</span>
        </div>

        <div class="pd-medium">
          <h4 class="t-regular mn-b-thin">{{income.name}}</h4>
          <!-- <p class="p-small">{{income.content[0].content}}</p> -->
        </div>
      </div>
    </section>

    <Popup 
      @close-popup="closeGetMorePopup" 
      :isPopupOpen="isGetMorePopup"
      class="w-m-50r t-left pd-big bg-white radius-big"
    >
      <div
        v-if="currentMenuPopup === 0"
      >
        <h2 class="mn-b-small t-center t-bold">Choose the way of deposit</h2>

        <button
          class="w-100 bg-white t-black pd-thin radius-medium h3 t-center br-solid br-2px br-black-transp-10 mn-t-small"
          @click="switchGetMoreMenu(1)"
        >
          CASH
        </button>

        <button
          class="w-100 bg-white t-black pd-thin radius-medium h3 t-center br-solid br-2px br-black-transp-10 mn-t-small"
          @click="switchGetMoreMenu(2)"
        >
          CARD
        </button>

        <button
          class="w-100 bg-white t-black pd-thin radius-medium h3 t-center br-solid br-2px br-black-transp-10 mn-t-small"
          @click="switchGetMoreMenu(4)"
        >
          CRYPTO
        </button>
      </div>

      <CashDepositMenu
        v-if="currentMenuPopup === 1"
        @back-selection="switchGetMoreMenu(0)"
      />

      <CardDepositMenu
        v-if="currentMenuPopup === 2"
        @back-selection="switchGetMoreMenu(0)"
        @switch-menu="switchGetMoreMenu"
      />

      <CardBalanceReplenished
        v-if="currentMenuPopup === 3"
        @close="closeGetMorePopup"
      />

      <CryptoDepositMenu
        v-if="currentMenuPopup === 4"
        @back-selection="switchGetMoreMenu(0)"
        @switch-menu="switchGetMoreMenu"
      />

      <CryptoDepositProcessing
        v-if="currentMenuPopup === 5"
        @back-selection="switchGetMoreMenu(0)"
        @switch-menu="switchGetMoreMenu"
      />
    </Popup>
  </div>
</template>

<script setup>
  import { onMounted, ref } from 'vue';
  import { useI18n } from 'vue-i18n'
  import Web3 from 'web3';

  import { state, actions } from '@martyrs/src/modules/wallet/views/store/wallet.store';

  import text from '@martyrs/src/modules/wallet/views/localization/wallet.json'

  const { t } = useI18n({
    useScope: 'global',
    ...text
  })

  import Popup from '@martyrs/src/components/Popup/Popup.vue';
  import Button from '@martyrs/src/components/Button/Button.vue';

  import CardBlogpost from '@martyrs/src/modules/community/components/blocks/CardBlogpost.vue';

  import ConnectMetamask from '@martyrs/src/modules/wallet/views/components/elements/ConnectMetamask.vue';

  import CashDepositMenu from '@martyrs/src/modules/wallet/views/components/blocks/CashDeposit.vue';
  import CardDepositMenu from '@martyrs/src/modules/wallet/views/components/blocks/CardDeposit.vue';
  import CryptoDepositMenu from '@martyrs/src/modules/wallet/views/components/blocks/CryptoDeposit.vue';
  import CardBalanceReplenished from '@martyrs/src/modules/wallet/views/components/blocks/CardBalanceReplenished.vue';
  import CryptoDepositProcessing from '@martyrs/src/modules/wallet/views/components/blocks/CryptoDepositProcessing.vue';



  onMounted(() => {
      // User has disconnected metamask from extension
    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length < 1) {
        state.account = null;
      }
    });

    state.web3 = new Web3(window.ethereum || 'http://localhost:8080');

    actions.listRewards();
    actions.tryReconnectWallet();
  });

  // /////////////////////////////////////////
  // GetMore Popup
  // /////////////////////////////////////////
  const isGetMorePopup = ref(false)
  const currentMenuPopup = ref(0)

  function switchGetMoreMenu(value) {
    currentMenuPopup.value = value;
  }

  function openGetMorePopup() {
    isGetMorePopup.value = true;
  }
  function closeGetMorePopup() {
    isGetMorePopup.value = false;
    currentMenuPopup.value = 0;
    actions.stopTimer();
    actions.disconnectWebSocket();
  }
</script>