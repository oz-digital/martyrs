<template>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
  container: {
    type: String,
    required: true
  },
  images: {
    type: Array,
    required: true
  },
  config: {
    type: Object,
    required: true,
    default: () => ({
      sizeMin: null,
      sizeMax: null,
      size: '5rem',
      minDuration: 5,
      maxDuration: 15,
      spawnPoints: [10, 90],
      maintainAspectRatio: true,
      animation: {
        startOpacity: 0.1,
        midOpacity: 1,
        endOpacity: 0.0,
        translateY: '-33vh'
      },
      class: ''
    })
  },
});

const getRandomSize = (sizeMin, sizeMax) => {
  const units = sizeMin.replace(/[0-9.]/g, '');
  const min = parseFloat(sizeMin);
  const max = parseFloat(sizeMax);
  const randomSize = Math.random() * (max - min) + min;
  return `${randomSize}${units}`;
};

const createKeyframes = (animation) => {
  const styleSheet = document.styleSheets[0];
  const keyframes = `
    @keyframes floatUp {
      0% {
        transform: translateY(0);
        opacity: ${animation.startOpacity};
      }
      10% {
        opacity: ${animation.midOpacity};
      }
      50% {
        opacity: ${animation.midOpacity};
      }
      90% {
        opacity: ${animation.midOpacity};
      }
      100% {
        transform: translateY(${animation.translateY});
        opacity: ${animation.endOpacity};
      }
    }
  `;
  styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
};

const createFloatingImages = () => {
  createKeyframes(props.config.animation);
  
  props.images.forEach((imageSrc) => {
    let imgElement = document.createElement('img');
    
    imgElement.src = imageSrc;
    imgElement.classList.add('floating-image');

    if (props.config.class) {
      imgElement.classList.add(props.config.class);
    }
    
    let spawnPoint = props.config.spawnPoints[Math.floor(Math.random() * props.config.spawnPoints.length)];
    let deviation = (Math.random() - 0.5) * 2 * 10;
    
    imgElement.style.left = `${spawnPoint + deviation}%`;

    let width, height;

    if (props.config.sizeMin && props.config.sizeMax) {
      width = getRandomSize(props.config.sizeMin, props.config.sizeMax);
    } else {
      width = props.config.size;
    }

    if (props.config.square) {
      height = width;
    } else {
      height = 'auto';
    }
    
    imgElement.style.width = width;
    imgElement.style.height = height;
    imgElement.style.position = 'absolute';
    imgElement.style.bottom = '0';
    imgElement.style.opacity = '1';
    imgElement.style.animation = `floatUp linear infinite`;
    imgElement.style.animationDuration = `${Math.random() * (props.config.maxDuration - props.config.minDuration) + props.config.minDuration}s`;

    if (props.container) document.querySelector(props.container).appendChild(imgElement);

    imgElement.addEventListener("animationiteration", () => {
      const newSpawnPoint = props.config.spawnPoints[Math.floor(Math.random() * props.config.spawnPoints.length)];
      const newDeviation = (Math.random() - 0.5) * 2 * 10;
        imgElement.style.left = `${newSpawnPoint + newDeviation}%`;
      });
  });
};

onMounted(() => {
  createFloatingImages();
});

watch(() => props.images, () => {
  createFloatingImages();
});
</script>