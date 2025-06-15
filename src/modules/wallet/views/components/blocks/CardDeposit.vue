<template>
  <h2 class="mn-b-small t-center t-bold">Deposit with card</h2>

  <div class="bg-grey radius-big mn-t-semi mn-b-semi flex flex-justify-between">
    <Field
      :placeholder="t('wallet.enterAmount')"
      class="pd-medium radius-small"
    />

    <div class="uppercase flex flex-justify-center flex-items-center mn-r-semi t-semi">
      USD
    </div>
  </div>

  <h3 class="t-semi">You will receieve: 0 WDT</h3>

  <button
    class="uppercase w-100 bg-main t-black pd-thin radius-medium t-center br-solid br-2px br-black-transp-10 mn-t-small"
    @click="switchMenu(3)"
  >
    {{ t('wallet.pay') }}
  </button>

  <button
    class="uppercase w-100 bg-main t-black pd-thin radius-medium t-center br-solid br-2px br-black-transp-10 mn-t-small"
    @click="backSelection"
  >
    {{ t('wallet.backToSelection') }}
  </button>
</template>

<script setup>
  import text from '@martyrs/src/modules/wallet/views/localization/wallet.json'
  import Field from '@martyrs/src/components/Field/Field.vue'
  import { useI18n } from 'vue-i18n'

  const emits = defineEmits(['back-selection', 'switch-menu'])

  // Localization
  const { t } = useI18n({
    useScope: 'global', 
    ...text
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