<template>
  <h2 class="mn-b-small t-center t-bold">{{ t('wallet.balanceReplenished') }}</h2>

  <div class="radius-medium br-1px br-black br-solid pd-big flex flex-column flex-justify-center flex-items-center">
    <h3 class="t-semi">
      {{ t('wallet.youReceived') }}
    </h3>
    <h3 class="t-semi">
      {{ receiveAmount }} WDT
    </h3>
  </div>

  <button
    class="uppercase w-100 bg-main t-black pd-thin radius-medium t-center br-solid br-2px br-black-transp-10 mn-t-small"
    @click="close"
  >
    {{ t('wallet.backToWallet') }}
  </button>
</template>

<script setup>
  import { useI18n } from 'vue-i18n'
  import { computed } from 'vue'
  import { BigNumber } from 'bignumber.js'

  import text from '@martyrs/src/modules/wallet/views/localization/wallet.json'
  import { state } from '@martyrs/src/modules/wallet/views/store/wallet.store';

  const emits = defineEmits(['close'])

  // Localization
  const { t } = useI18n({
    useScope: 'global', 
    ...text
  })

  const receiveAmount = computed(() =>
    new BigNumber(state.depositInfo.amount)
      .shiftedBy(-8)
      .dividedBy(process.env.TOKEN_EXCHANGE_RATE)
      .toString()
  )

  function close() {
    emits("close")
  }
</script>

<style scoped>
</style>
