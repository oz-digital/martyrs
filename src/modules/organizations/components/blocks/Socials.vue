<template>
    <div class="gap-small flex-nowrap flex">
        <a 
            v-for="social in socialLinks" 
            :key="social.name"
            :href="social.href" 
            target="_blank" 
            class="i-big bg-second t-white flex-nowrap flex-center flex radius-extra"
        >
            <component :is="resolveSocialIcon(social.name)" class="i-medium"></component>
        </a> 
    </div>
</template>

<script setup>
import { ref, computed, resolveComponent } from "vue";

import IconTelegram from '@martyrs/src/modules/icons/socials/telegram.vue'
import IconFacebook from '@martyrs/src/modules/icons/socials/facebook.vue'
import IconInstagram from '@martyrs/src/modules/icons/socials/instagram.vue'
import IconTwitter from '@martyrs/src/modules/icons/socials/twitter.vue'
import IconReddit from '@martyrs/src/modules/icons/socials/reddit.vue'
import IconLine from '@martyrs/src/modules/icons/socials/line.vue'
import IconDribble from '@martyrs/src/modules/icons/socials/dribbble.vue'
import IconYoutube from '@martyrs/src/modules/icons/socials/youtube.vue'


const props = defineProps({
    telegram: {
        type: String,
        default: ''
    },
    facebook: {
        type: String,
        default: ''
    },
    instagram: {
        type: String,
        default: ''
    },
    twitter: {
        type: String,
        default: ''
    },
    reddit: {
        type: String,
        default: ''
    },
    line: {
        type: String,
        default: ''
    },
    dribbble: {
        type: String,
        default: ''
    },
    youtube: {
        type: String,
        default: ''
    }
});

const socialLinks = computed(() => {
    const networks = [
        {name: 'telegram', base: 'https://t.me/'},
        {name: 'facebook', base: 'https://www.facebook.com/'},
        {name: 'instagram', base: 'https://www.instagram.com/'},
        {name: 'twitter', base: 'https://twitter.com/'},
        {name: 'reddit', base: 'https://www.reddit.com/user/'},
        {name: 'line', base: ''}, 
        {name: 'dribbble', base: 'https://dribbble.com/'},
        {name: 'youtube', base: 'https://youtube.com/@'}
    ];

    return networks
        .filter(network => props[network.name])
        .map(network => ({ 
            name: network.name, 
            href: network.base + props[network.name] 
        }));
});


function resolveSocialIcon(name) {
    const icons = {
        telegram: IconTelegram,
        facebook: IconFacebook,
        instagram: IconInstagram,
        twitter: IconTwitter,
        reddit: IconReddit,
        line: IconLine,
        dribbble: IconDribble,
        youtube: IconYoutube
    };

    return icons[name] || null;
}
</script>
