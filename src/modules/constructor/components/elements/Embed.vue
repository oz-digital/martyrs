<template>
  <div 
    class="w-100 h-max-40r pd-medium bg-white radius-medium pos-relative">
    
    <div 
      v-if="prop.content" 
      v-html="prop.content" 
      class="flex-center constructor-iframe flex pos-relative"
    />
    
    <div
      class="" 
      v-else
    >
      <Field 
        v-model:field="embedCode"
        type="textarea"   
        :placeholder="'Paste your embed code here'" 
        class="
          w-100
          br-solid
          br-1px
          br-black-transp-10
          pd-medium
          radius-small
          mn-b-thin
        "
      />
      <div class="flex-v-center flex-nowrap flex gap-small">
        
          <p class="p-small t-left">Embeds from Youtube, Facebook, Instagram, Twitter, Tiktok, Soundcloud, Vimeo, Reddit, Linkedin, Medium, Spotify and Soundcloud are allowed.</p>
          <button 
            @click="onComponentClick"
            class="button-small bg-second t-white button"
          >
            <span>Save</span>
        </button>
      </div>
    </div>
    <!-- <button v-if="prop.content" @click="editEmbedCode">Edit Embed Code</button> -->
  </div>
</template>

<style lang="scss">
.constructor-iframe {
  iframe { 
    width: 100% !important;
    height: 100% !important;
    position: relative !important;
  }
}
</style>


<script setup>
import { ref,onMounted } from 'vue';

import Field         from '@martyrs/src/components/Field/Field.vue'

const embedCode = ref(null);

const props = defineProps([
  'label',
  'value',
  'prop'
]);

const emit = defineEmits(['input', 'updateBlock']);

function isValidEmbedCode(code) {
  const allowedSources = [
    /youtube\.com/,
    /facebook\.com/,
    /instagram\.com/,
    /twitter\.com/,
    /tiktok\.com/,
    /soundcloud\.com/,
    /vimeo\.com/,
    /reddit\.com/,
    /linkedin\.com/,
    /medium\.com/,
    /spotify\.com/,
  ];
  return allowedSources.some(pattern => pattern.test(code));
}

onMounted(() => {
  if (props.prop.content?.includes('instagram.com') && window.instgrm) {
    window.instgrm.Embeds.process();
  }
});


function onComponentClick() {

  if (embedCode.value && isValidEmbedCode(embedCode.value)) {
    emit('input', embedCode.value);
    emit('updateBlock', props.prop, { content: embedCode.value });
  } else {
    alert('Invalid embed code or source not allowed.');
  }
}

function editEmbedCode() {
  let embedInput = prompt('Edit embed code:', prop.content);
  if (embedInput && isValidEmbedCode(embedInput)) {
    embedCode.value = embedInput;
    emit('input', embedCode.value);
    emit('updateBlock', props.prop, { content: embedCode.value });
  } else {
    alert('Invalid embed code or source not allowed.');
  }
}
</script>

