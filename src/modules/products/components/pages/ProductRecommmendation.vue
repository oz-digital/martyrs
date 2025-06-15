<template>
    <div id="product-recommendation" class="h-min-100 pd-thin t-white bg-black">
        <Loader v-if="loading" :status="loadingText" class="pos-fixed"/>

        <div v-if="!loading && !showInput" class="section">

            <div v-if="!loading" class="mn-b-thin">
                <FieldBig 
                    :input="inputValue" 
                    :loopTyping="false"
                    :enableTyping="false"
                    :placeholder="t('placeholder')"
                    :action="t('action')"
                    @update:input="inputValue = $event"
                    @action="submitInput"
                    class="t-white bg-dark-transp-50 w-100"
                 />
            </div>

            <SectionProduct 
                :product="products.state.current" 
                :recommendation="products.state.current.recommendation" 
                class="bg-dark-transp-50 pd-big radius-medium"
            />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Loader from '@martyrs/src/components/Loader/Loader.vue'
import Breadcrumbs from '@martyrs/src/components/Breadcrumbs/Breadcrumbs.vue'
import FieldBig from "@martyrs/src/components/FieldBig/FieldBig.vue";
import SectionProduct from '@martyrs/src/modules/products/components/sections/SectionProduct.vue'
import HeroRecommendation           from '@martyrs/src/modules/products/components/sections/HeroRecommendation.vue'

import * as products from '@martyrs/src/modules/products/store/products.js';

const router = useRouter()
const loading = ref(true)
const showInput = ref(false)
const loadingTexts = ref([
    "Loading all we know about the buds",
    "Processing the cannabis universe",
    "Creating a strain of knowledge",
    "Harvesting taste insights",
])

const text = {
    messages: {
        en: {
            TITLE: "Increase Your High,<br><b class='t-white'>Powered by AI Budtender</b>",
            DESCRIPTION: "AI's got your chill, bro. We're picking out the most cosmic weed strains based on your desired vibe:",
            placeholder: 'Describe your desired high, bro...',
            action: "Transmit →",
        },
        ru: {
            TITLE: "Персональный Накур,<br><b class='t-white'>Напрямую от AI</b>",
            DESCRIPTION: "AI на страже твоего релакса, бро. Мы подбираем самые космические сорта травы, исходя из твоего желаемого настроения:",
            placeholder: 'Опиши свой желамый хай, bro...',
            action: "Передать →",
        }
    }
}

const { t } = useI18n(text)

const loadingText = ref(loadingTexts.value[0])

let mood = ref(router.currentRoute.value.query.mood || t('Recommend me something'))

watchEffect(async () => {
    mood.value = router.currentRoute.value.query.mood || t('Recommend me something')
    loading.value = true
    await products.actions.submitMood(mood.value)
    loading.value = false
})

onMounted(async () => {
    // await products.actions.submitMood(mood.value)
    // loading.value = false
})

setInterval(() => {
    const index = loadingTexts.value.indexOf(loadingText.value)
    loadingText.value = loadingTexts.value[(index + 1) % loadingTexts.value.length]
}, 2000)

let inputValue = ref(router.currentRoute.value.query.mood || t('Recommend me something'))

function submitInput() {
    router.push({ name: 'Product Recommmendation', query: { mood: inputValue.value } })
}


function tryAgain() {
    loading.value = true
    showInput.value = true
}

function hideInput() {
    showInput.value = false
}
</script>

<style scoped>
/* Add your styles here */
</style>
