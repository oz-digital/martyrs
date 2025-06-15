<template>
  <h2 class="mn-b-small t-center t-bold">{{ t('wallet.depositWithCrypto') }}</h2>

  <div class="flex flex-justify-between">
    <h3 class="t-semi">Amount: {{ amount }} {{ state.chosenNetwork.name.toUpperCase() }}</h3>
    <button
      class="uppercase t-main cursor-pointer"
      @click="() => copy(amount)"
    >
      copy
    </button>
  </div>

  <div class="flex flex-justify-between">
    <h3 class="t-semi t-truncate address">Wallet: {{ state.depositInfo.to }}</h3>
    <button
      class="uppercase t-main cursor-pointer"
      @click="() => copy(state.depositInfo.to)"
    >
      copy
    </button>
  </div>

  <div class="flex flex-justify-around radius-big br-solid br-2px br-black-transp-10">
    <canvas id="qrcode_address_deposit"></canvas>
  </div>

  <div class="flex flex-justify-between">
    <h3 class="t-semi">You will receive:</h3>
    <h3 class="t-semi">{{ receive }} WDT</h3>
  </div>
  <div v-if="state.depositInfo.status === 'TRANSFER_STATUS_WAITING_FOR_TX'" class="flex flex-justify-between">
    <h3 class="t-semi">Times left:</h3>
    <h3 class="t-semi">{{ remainingTime }}</h3>
  </div>
  <div class="flex flex-justify-between">
    <h3 class="t-semi">Status:</h3>
    <h3 class="t-semi">{{ status }}</h3>
  </div>

  <button
    v-if="state.depositInfo.status === 'TRANSFER_STATUS_WAITING_FOR_TX'"
    class="uppercase w-100 bg-main t-black pd-thin radius-medium t-center br-solid br-2px br-black-transp-10 mn-t-small"
    @click="actions.cancelDeposit().then(() => backSelection())"
  >
    {{ t('wallet.cancel') }}
  </button>
</template>

<script setup>
  import QRCode from 'qrcode';
  import { useI18n } from 'vue-i18n';
  import { watch, computed, onMounted } from 'vue';
  import { BigNumber } from 'bignumber.js';

  import text from '@martyrs/src/modules/wallet/views/localization/wallet.json';
  import { state, actions, timer } from '@martyrs/src/modules/wallet/views/store/wallet.store';

  BigNumber.config({
    EXPONENTIAL_AT: [-1000, 20000]
  });

  const emits = defineEmits(['back-selection', 'switch-menu']);

  // Localization
  const { t } = useI18n({
    useScope: 'global',
    ...text
  });

  const remainingTime = computed(() => {
    const mins = Math.floor(timer.remaining / 60);
    const secs = Math.floor(timer.remaining % 60);

    return `${mins}:${secs < 10 ? `0${secs}` : secs}`;
  });

  const amount = computed(() =>
    new BigNumber(state.depositInfo.amount)
      .shiftedBy(-8)
      .toString()
  );

  const receive = computed(() =>
    new BigNumber(amount.value)
      .dividedBy(process.env.TOKEN_EXCHANGE_RATE)
      .toString()
  )

  const status = computed(() => {
    switch (state.depositInfo.status) {
      case 'TRANSFER_STATUS_WAITING_FOR_TX':
        return 'Waiting for payment';
      case 'TRANSFER_STATUS_SENT':
        const confirmations = `${state.depositInfo.confirmations || 0} / ${state.config[state.chosenNetwork.value.network].confirmations}`;
        return `Confirming (${confirmations})`;
      default:
        return 'Superposition.';
    }
  });

  function backSelection() {
    emits("back-selection");
  }

  function switchMenu(screen = 0) {
    emits("switch-menu", screen);
  }

  function copy(text) {
    navigator.clipboard.writeText(text);
  }

  onMounted(() => {
    QRCode.toCanvas(
      document.getElementById('qrcode_address_deposit'),
      state.depositInfo.to,
      { width: 300 },
      (error) =>  { if (error) { console.error(error); } }
    )
  })

  watch(
    state,
    async () => {
      if (state.depositInfo.status === 'TRANSFER_STATUS_SENT') {
        actions.stopTimer();
      }

      if (state.depositInfo.status === 'TRANSFER_STATUS_COMPLETED') {
        actions.disconnectWebSocket();
        switchMenu(3);
      }
    },
    { deep: true },
  )
</script>

<style scoped>
  .address {
    text-wrap: nowrap;
    display: block;
  }
</style>