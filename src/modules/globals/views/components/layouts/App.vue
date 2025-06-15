<template>
  <router-view 
    v-slot="{ Component }"
  >
    <component 
      ref="page" 
      :env="env"
      :app="app"
      :modules="modules"
      :is="Component"
    />
  </router-view>
</template>

<script setup>
  import { computed, ref, onMounted, defineAsyncComponent, onBeforeMount } from 'vue'
  import { Preferences } from '@capacitor/preferences';
  import { Keyboard } from '@capacitor/keyboard';

  import { useHead } from '@unhead/vue'
  import { useI18n } from 'vue-i18n'
  import { useRoute } from 'vue-router'

  import * as globals from '@martyrs/src/modules/globals/views/store/globals.js'
  import * as auth from '@martyrs/src/modules/auth/views/store/auth.js'

  const props = defineProps({
    env: {
      type: Object,
      required: true
    },
    app: {
      type: Object,
      required: true
    },
    modules: {
      type: Object,
      required: true
    }
  })
  /////////////////////////////
  // LOADING
  /////////////////////////////
    // State
  let show = ref(false)
  // Preloader
  const page = ref(null)
  /////////////////////////////
  // META
  /////////////////////////////
  const { t, locale, availableLocales } = useI18n({
    messages: props.app.messages
  })

  const route = useRoute();

  const languages = availableLocales;
  const base_url = process.env.FILE_SERVER_URL;

  function removeTrailingSlash(url) {
    return url.endsWith('/') ? url.slice(0, -1) : url;
  }
  // Используйте эту функцию, чтобы удалить слэш в конце URL
  const metadata = computed(() => {return {
    title: t('meta.title'),
    description: t('meta.description'),
    meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, shrink-to-fit=no' },
        { hid: 'description', name: 'description', content: t('meta.description') },
        { hid: 'keywords', name: 'keywords', content: t('meta.keywords') },
        { hid: 'og:title', property: 'og:title', content: t('meta.og.title') },
        { hid: 'og:description', property: 'og:description', content: t('meta.og.description') },
        { hid: 'og:image', property: 'og:image', content: base_url + '/favicon/cover.jpg' },
        { hid: 'og:url', property: 'og:url', content: removeTrailingSlash(`${base_url}${route.path}`) },
        { hid: 'twitter:title', name: 'twitter:title', content: t('meta.twitter.title') },
        { hid: 'twitter:description', name: 'twitter:description', content: t('meta.twitter.description') },
        { hid: 'twitter:image', name: 'twitter:image', content: base_url + '/favicon/cover.jpg' },
        { hid: 'twitter:card', name: 'twitter:card', content: t('meta.twitter.card') },
        ],
    link: [
      { hid: 'canonical', rel: 'canonical', href: removeTrailingSlash(`${base_url}${route.path}`) },
      ...generateAlternateLinks.value,
    ],
    htmlAttrs: { lang: t('meta.htmlAttrs.lang') }
  }});

  const generateAlternateLinks = computed(() => {
    return languages.map(lang => {
      let newPath = route.path;

      if (route.params.locale) {
        newPath = newPath.replace(`/${route.params.locale}`, `/${lang}`);
      } else {
        newPath = `/${lang}${newPath}`;
      }
      const href = removeTrailingSlash(`${base_url}${newPath}`);
      return { 
        hid: 'alternate', 
        rel: 'alternate', 
        hreflang: lang, 
        href: href
      };
    });
  });

  useHead(metadata)

  onBeforeMount(async()=>{
    if (process.env.MOBILE_APP === 'ios') Keyboard.setAccessoryBarVisible({ isVisible: false }) 

    const { value } = await Preferences.get({ key: 'darkmode' });

    const isDarkMode = value ? JSON.parse(value) : false;
    
    globals.actions.setTheme(isDarkMode);
  })
</script>