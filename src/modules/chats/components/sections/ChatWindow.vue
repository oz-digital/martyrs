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
      <!-- <IconAdd class="mn-r-thin t-transp i-regular" /> -->
      <input class="" placeholder="Enter your message" type="text" v-model="newMessage" @keyup.enter="sendMessage" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';

import IconAdd from '@martyrs/src/modules/icons/navigation/IconAdd.vue'
import PlaceholderChat from '@martyrs/src/modules/icons/placeholders/PlaceholderChat.vue'

import ChatMessage from '../blocks/ChatMessage.vue';
import chatStore from '../../store/chat.store.js';

const newMessage = ref('');
const allMessages = ref(null);
const visibleMessageIds = ref(new Set());
let messageObserver = null;

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

// Отслеживание видимых сообщений
const observeMessages = () => {
  console.log('[CHAT] Setting up message observer');
  
  // Очищаем предыдущий observer если есть
  if (messageObserver) {
    messageObserver.disconnect();
  }
  
  messageObserver = new IntersectionObserver((entries) => {
    console.log('[CHAT] Observer triggered for', entries.length, 'entries');
    entries.forEach(entry => {
      const messageId = entry.target.dataset.messageId;
      if (entry.isIntersecting) {
        visibleMessageIds.value.add(messageId);
      } else {
        visibleMessageIds.value.delete(messageId);
      }
    });
    
    // Отправляем прочтение видимых сообщений
    if (visibleMessageIds.value.size > 0) {
      const unreadVisibleMessages = messages.value
        .filter(msg => {
          // Проверяем, что сообщение видимо
          if (!visibleMessageIds.value.has(msg._id)) return false;
          
          // Проверяем, что сообщение не от текущего пользователя
          console.log('[CHAT] Checking if own message:', {
            msgUserId: msg.userId,
            msgAnonymousId: msg.anonymousId,
            currentUserId: chatStore.state.userId,
            currentAnonymousId: chatStore.state.anonymousId,
            isEqual: msg.userId === chatStore.state.userId,
            msgUserIdType: typeof msg.userId,
            currentUserIdType: typeof chatStore.state.userId
          });
          
          // Для аутентифицированных пользователей
          if (msg.userId && chatStore.state.userId && msg.userId === chatStore.state.userId) return false;
          
          // Для анонимных пользователей
          if (!msg.userId && !chatStore.state.userId && msg.anonymousId === chatStore.state.anonymousId) return false;
          
          // Проверяем, что сообщение еще не прочитано текущим пользователем
          // Для анонимных пользователей не отмечаем сообщения как прочитанные
          if (!chatStore.state.userId) return false;
          if (msg.readBy?.some(r => r.userId === chatStore.state.userId)) return false;
          
          console.log('[CHAT] Message can be marked as read:', {
            msgId: msg._id,
            msgUserId: msg.userId,
            currentUserId: chatStore.state.userId,
            readBy: msg.readBy
          });
          
          return true;
        })
        .map(msg => msg._id);
      
      console.log('[CHAT] Unread visible messages to mark:', unreadVisibleMessages);
      
      if (unreadVisibleMessages.length > 0) {
        console.log('[CHAT] Sending markAsRead for messages:', unreadVisibleMessages);
        chatStore.methods.markMessagesAsRead(unreadVisibleMessages);
      } else {
        console.log('[CHAT] No unread messages to mark');
      }
    }
  }, {
    root: allMessages.value,
    threshold: 0.5
  });
  
  // Наблюдаем за всеми сообщениями
  nextTick(() => {
    const messageElements = allMessages.value?.querySelectorAll('[data-message-id]');
    console.log('[CHAT] Found message elements to observe:', messageElements?.length);
    messageElements?.forEach(el => messageObserver.observe(el));
  });
};

// Прокрутка вниз при монтировании
onMounted(() => {
  nextTick(() => {
    if (allMessages.value) {
      allMessages.value.scrollTop = allMessages.value.scrollHeight;
    }
    observeMessages();
  });
});

// Прокрутка вниз при изменении сообщений
watch(messages, () => {
  nextTick(() => {
    if (allMessages.value) {
      allMessages.value.scrollTop = allMessages.value.scrollHeight;
    }
    observeMessages();
  });
}, { deep: true });

// Очистка observer при размонтировании
onUnmounted(() => {
  if (messageObserver) {
    messageObserver.disconnect();
  }
});
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