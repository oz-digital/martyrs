<template>
  <section>
    <component
      v-model="block.content"
      v-for="(block, index) in content"
      :is="ComponentMap[block.type]"
      :key="index"
      :index="index"
      :component="block"
      :prop="block"
      :class="block.class"
      :isEditing="false"
      content="content"
      v-bind="getBlockProps(block, index)"
      class="mn-b-medium"
    />
  </section>  
</template>

<script setup>
  import Image  from '@martyrs/src/modules/constructor/components/elements/Image.vue';
  import VideoPlayer  from '@martyrs/src/modules/constructor/components/elements/VideoPlayer.vue';
  import Embed  from '@martyrs/src/modules/constructor/components/elements/Embed.vue';
  import Card  from '@martyrs/src/modules/constructor/components/elements/Card.vue';

  const props = defineProps([
    'content',
    'notitle'
  ])

const ComponentMap = {
  'Textarea': 'p',
  'H2': props.notitle ? 'h3' : 'h2',
  'H3': 'h3',
  'Bullets': 'p',
  'Caption': 'p',
  'ImageUpload': Image,
  'Video': VideoPlayer,
  'Embed': Embed,
  'Card': Card
};

function getBlockProps(block, index) {
  if (block.type === 'Textarea') {
    // Проверяем, был ли до этого другой Textarea
    const prevTextarea = props.content.slice(0, index).find(b => b.type === 'Textarea');
    if (!prevTextarea) {
      return { innerHTML: block.content, class: props.notitle ? "h3" : "h2" };
    }
    return { innerHTML: block.content, class: "p-semi" };
  } else if (block.type === 'H2') {
    return { innerHTML: block.content, class: props.notitle ? "h3" : "h2" };
  } else if (block.type === 'Caption') {
    return { innerHTML: block.content };
  } else if (block.type === 'ImageUpload') {
    return { src: block.content };
  }
  return {};
}
</script>