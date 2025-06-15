<template>
  <div class="bg-light radius-medium w-100">
    <h3 class="pd-medium">Tracking History</h3>
    <div v-for="status in statusDetailedHistory" :key="status" class="w-100 br-t br-solid br-black-transp-10 pd-medium flex-v-center flex-nowrap flex">
      <div class="flex-center flex i-big radius-extra br-solid br-2px br-black-transp-10 mn-r-small">
        <IconCheckmark
          v-if="isStatusInHistory(status.status)"
          class="i-medium"
        />
      </div>

      <div>
        <p class="h4 w-8r">{{status.status}}</p>
        <!-- <p v-if="status.timestamp" class="h5 w-8r">{{formatDate(status.timestamp)}}</p> -->
      </div>
      <!-- <router-link v-if="status.user" :to="{ 
        name: 'User Profile Main', 
        params: {
          _id: status.user
        }
      }" class="pd-small radius-extra bg-second t-white mn-l-auto flex-center uppercase t-semi">Check User</router-link> -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

import IconCheckmark from '@martyrs/src/modules/icons/navigation/IconCheckmark.vue'

// import Socket from '@vendus/sockets-for-cordova';

const props = defineProps({
  statusHistory: {
    type: Array
  },
  statusCurrent: {
    type: String
  },
  edit: {
    type: Boolean
  },
  statuses: {
    type: Array
  }
})

const statusDetailedHistory = props.statuses.map(status => {
  const historyEntry = props.statusHistory.find(entry => entry.status === status);

  console.log()
  return {
    status,
    user: historyEntry?.user || undefined,
    timestamp: historyEntry ? historyEntry.timestamp : 'N/A',
    inHistory: !!historyEntry,
    _id: historyEntry ? historyEntry._id : null
  };
});

const statusCurrent = ref(props.statusCurrent);
const statusHistory = ref(props.statusHistory);

// Проверка, был ли статус уже установлен
const isStatusInHistory = (statusValue) => {
  return statusHistory.value.some(status => status.status === statusValue);
};


const printerIP = ref('192.168.1.197');
const printerPort = ref(9100);
const textToPrint = ref('This is some text to print\n\n');

// const printReceipt = async () => {
//   try {
//     const initPrinter = new Uint8Array([0x1b, 0x40]); // Команда инициализации принтера
//     const lineFeed = new Uint8Array([0x0a]); // Перевод строки
//     const cutPaper = new Uint8Array([0x1d, 0x56, 0x01]); // Резка бумаги

//     const encoder = new TextEncoder();
//     const textData = encoder.encode(textToPrint.value);

//     const dataToSend = new Uint8Array([
//       ...initPrinter,
//       ...textData,
//       ...lineFeed,
//       ...cutPaper
//     ]);

//     const socket = new Socket();

//     socket.onError = function (errorMessage) {
//       console.error('Ошибка при подключении к принтеру:', errorMessage);
//     };

//     socket.onClose = function (hasError) {
//       console.log('Соединение с принтером закрыто');
//     };

//     await new Promise((resolve, reject) => {
//       socket.open(
//         printerIP.value,
//         printerPort.value,
//         function () {
//           console.log('Подключено к принтеру');
//           resolve();
//         },
//         function (errorMessage) {
//           console.error('Не удалось подключиться к принтеру:', errorMessage);
//           reject(errorMessage);
//         }
//       );
//     });

//     socket.write(dataToSend);

//     socket.shutdownWrite();

//     console.log('Чек успешно напечатан');
//   } catch (error) {
//     console.error('Ошибка при печати чека:', error);
//   }
// };
</script>
