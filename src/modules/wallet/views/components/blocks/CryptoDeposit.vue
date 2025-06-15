<template>
  <h3 class="mn-b-small t-center t-bold">{{ t('wallet.depositWithCrypto') }}</h3>

  <Field 
    v-if="state.config"
    v-model:field="amount"
    :placeholder="t('wallet.enterAmount')"
    class="mn-b-thin bg-white w-100 br-solid br-1px br-black-transp-5 pd-small radius-small" 
  >
    <Select 
      :options="depositOptions"
      v-model:select="state.chosenNetwork"
      class="bg-light t-nowrap pd-r-thin pd-l-thin pd-t-nano pd-b-nano radius-thin"
    />
  </Field>

  <p class="t-semi">You will receive: {{ receiveAmount }} {{t('wallet.token')}}</p>

  <button
    class="uppercase w-100 bg-main t-black pd-thin radius-medium t-center br-solid br-2px br-black-transp-10 mn-t-small"
    @click="actions.requestCryptoDeposit(amount).then(() => switchMenu(5))"
    :disabled="state.depositRequestIsActive || !state.config"
  >
    {{ t('wallet.pay') }}
  </button>

  <button
    class="uppercase w-100 t-center mn-t-small"
    @click="backSelection"
  >
    {{ t('wallet.backToSelection') }}
  </button>
</template>

<script setup>
  import { useI18n } from 'vue-i18n'
  import { ref, onMounted, computed } from 'vue';
  import { BigNumber } from 'bignumber.js';

  import { state, actions } from '@martyrs/src/modules/wallet/views/store/wallet.store';
  import text from '@martyrs/src/modules/wallet/views/localization/wallet.json'
  import Field from '@martyrs/src/components/Field/Field.vue'
  import Select from '@martyrs/src/components/Select/Select.vue'

  BigNumber.config({
    EXPONENTIAL_AT: [-1000, 20000]
  });

  const amount = ref(1);
  const emits = defineEmits(['back-selection', 'switch-menu'])

  // Localization
  const { t } = useI18n({
    useScope: 'global', 
    ...text
  })

  const receiveAmount = computed(() =>
    new BigNumber(amount.value)
      .dividedBy(process.env.TOKEN_EXCHANGE_RATE)
      .toString()
  )

  const depositOptions = computed(() => {
    const options = [];

    const networks = Object.keys(state.config || {});

    for (const network of networks) {
      for (const token of Object.keys(state.config[network].tokens)) {
        options.push({
          name: `${network}-${token}`,
          value: {
            token: state.config[network].tokens[token],
            network: network
          }
        });
      }
    }

    return options;
  });

  onMounted(() => {
    actions.loadConfig();
  })

  function backSelection() {
    emits("back-selection")
  }

  function switchMenu(screen = 0) {
    emits("switch-menu", screen)
  }
</script>

<style scoped>
</style>