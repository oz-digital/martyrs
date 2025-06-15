<template>
  <div>
  <textarea 
    v-model="prop[content]" 
    :placeholder="placeholder ? placeholder : 'Enter text'"
    @input="handleInput" 
    @focus="emit('focus', textarea)"
    ref="textarea" 
    tabindex="-1"
    class="br-l br-solid br-main pd-l-small text-area mn-b-small">    
  </textarea>
</div>
</template>

<script setup="props">
  import { computed, ref, onMounted, watch, nextTick, onUpdated } from 'vue'

  const props = defineProps(
    ['obj','label','prop','value','content','textarea','placeholder','index','ref']
  )

  const data = ref(props)
  const textarea = ref(null)
  const emit = defineEmits(['deleteBlock', 'addBlock','focus'])

  function handleInput(event) {
    const bulletRegex = /^\s*[-*]\s+(.*)/;
    let lines = event.target.value.split(/\n+/);

    let bulletLines = lines.map(line => {
      const match = bulletRegex.exec(line);
      return match ? match[1] : null;
    }).filter(line => line !== null);

    if (bulletLines.length > 0) {
      props.prop[props.content] = bulletLines;
      resize();
    } else if (event.target.value.trim() === "") {
      props.prop[props.content] = [];
      resize();
    }
  }

  function focus() {
     nextTick(() => { 
        textarea.value.focus();
      })
  }

  function resize() {
    textarea.value.style.height = "1rem";
    textarea.value.style.height = textarea.value.scrollHeight + "px";
  }

  onUpdated(() => {
    resize()
  });

  onMounted(() => {
    resize()
  });

  watch(() => props.prop[props.content], (newValue) => {
    if (!newValue || newValue.length === 0) {
      emit('deleteBlock', props.prop)
    }
  });
</script>

<style lang="scss">
</style>
