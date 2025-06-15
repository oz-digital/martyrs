<template>
  <div class="bg-white radius-semi bg-white o-hidden pos-relative">
    <div ref="allMessages" class="chat-messages o-scroll h-max-20r">
      <div class="pos-relative h-min-20r flex-justify-end flex flex-column br-b br-solid br-black-transp-10">
        <transition name="scaleIn" mode="out-in">
          <div v-if="messages.length < 1" class="flex-center pd-small t-center w-100 h-100 flex-column flex pos-absolute">
            <PlaceholderChat class="radius-100 mn-b-thin"/>
            <h4 class='mn-b-thin'>Here you can view your chat history</h4>
            <p>Feel free to ask if you have any questions.</p>
          </div>

          <TransitionGroup v-else name="list" tag="ul" class="w-100 o-hidden" @after-enter="scrollToBottom">
            <ChatMessage
              v-for="message in messages"
              :key="message._id"
              :message="message"
            />
          </TransitionGroup>
        </transition>
      </div>
    </div>

    <div class="flex-nowrap flex-v-center flex bg-white w-100 radius-big pd-small">
      <IconAdd class="mn-r-thin t-transp i-regular" />
      <input class="" placeholder="Enter your message" type="text" v-model="newMessage" @keyup.enter="sendMessage" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';

import IconAdd from '@martyrs/src/modules/icons/navigation/IconAdd.vue'
import PlaceholderChat from '@martyrs/src/modules/icons/placeholders/PlaceholderChat.vue'

import ChatMessage from '../blocks/ChatMessage.vue';
import chatStore from '../../store/chat.store.js';

const newMessage = ref('');
const allMessages = ref(null);

// Вычисляемые свойства
const messages = computed(() => chatStore.state.messages);

// Функция прокрутки вниз
const scrollToBottom = () => {
  if (allMessages.value) {
    allMessages.value.scrollTop = allMessages.value.scrollHeight;
  }
};

// Функция для отправки сообщения
const sendMessage = async () => {
  if (newMessage.value) {
    const message = {
      text: newMessage.value,
      module: 'chat',
      username: chatStore.state.username,
      chatId: chatStore.state.currentChatId
    };

    chatStore.methods.addMessage(message);
    newMessage.value = '';

    // Ждем, пока все анимации и рендеринг завершатся
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 100)); // Небольшая задержка для анимаций
    scrollToBottom();
  }
};

// Прокрутка вниз при монтировании
onMounted(() => {
  nextTick(() => {
    if (allMessages.value) {
      allMessages.value.scrollTop = allMessages.value.scrollHeight;
    }
  });
});

// Прокрутка вниз при изменении сообщений
watch(messages, () => {
  nextTick(() => {
    if (allMessages.value) {
      allMessages.value.scrollTop = allMessages.value.scrollHeight;
    }
  });
}, { deep: true });

// Обработчик после завершения анимации входа нового элемента
</script>

<style>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>