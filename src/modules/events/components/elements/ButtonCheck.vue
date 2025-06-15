<template>
  <div>
    <Button @click="startScan" class="bg-main button-small radius-extra button">
      Check Tickets
    </Button>
    
    <teleport to="body" v-if="isScanning">
      <div v-if="isScanning" class="barcode-scanner-modal">
        <div class="square"></div>
        <div class="zoom-ratio-wrapper" v-if="minZoomRatio !== undefined && maxZoomRatio !== undefined">
          <input type="range" :min="minZoomRatio" :max="maxZoomRatio" @input="setZoomRatio" />
        </div>
        <Button @click="stopScan" class="bg-white t-black stop-scan-button">Stop Scan</Button>
        <Button v-if="isTorchAvailable" @click="toggleTorch" class="bg-white torch-button">
          Toggle Torch
        </Button>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning'
import Button from '@martyrs/src/components/Button/Button.vue'
import * as tickets from '@martyrs/src/modules/events/store/tickets.js'

const emits = defineEmits(['qrcodecheck'])
const error = ref('')
const isScanning = ref(false)
const isTorchAvailable = ref(false)
const minZoomRatio = ref(undefined)
const maxZoomRatio = ref(undefined)
const isProcessing = ref(false)

onMounted(async () => {
  const { supported } = await BarcodeScanner.isSupported()
  if (!supported) {
    error.value = 'Barcode scanning is not supported on this device'
  }
  const { available } = await BarcodeScanner.isTorchAvailable()
  isTorchAvailable.value = available
})

onUnmounted(async () => {
  // await stopScan()
})

const SCAN_TIMEOUT = 1000 // 5 секунд (можно изменить по вашему усмотрению)

async function startScan() {
  try {
    const { camera } = await BarcodeScanner.checkPermissions()
    if (camera !== 'granted') {
      const { camera: newStatus } = await BarcodeScanner.requestPermissions()
      if (newStatus !== 'granted') {
        throw new Error('Camera permission is required to scan barcodes')
      }
    }
    document.querySelector('body')?.classList.add('barcode-scanner-active')
    document.querySelector('html')?.classList.add('barcode-scanner-active-html')
    isScanning.value = true
    await BarcodeScanner.addListener('barcodeScanned', async (result) => {
      if (!isProcessing.value) {
        await processBarcode(result.barcode)
      }
    })
    await BarcodeScanner.startScan()
    const { zoomRatio: min } = await BarcodeScanner.getMinZoomRatio()
    const { zoomRatio: max } = await BarcodeScanner.getMaxZoomRatio()
    minZoomRatio.value = min
    maxZoomRatio.value = max
  } catch (e) {
    error.value = e.message
    alert(`Error: ${error.value}`)
  }
}

async function stopScan() {
  try {
    document.querySelector('body')?.classList.remove('barcode-scanner-active')
    document.querySelector('html')?.classList.remove('barcode-scanner-active-html')
    isScanning.value = false
    await BarcodeScanner.stopScan()
    await BarcodeScanner.removeAllListeners()
  } catch (e) {
    error.value = e.message
    alert(`Error stopping scan: ${error.value}`)
  }
}

async function processBarcode(barcode) {
  if (isProcessing.value) return;
  isProcessing.value = true;
  
  try {
    if (!barcode || !barcode.rawValue) {
      throw new Error('Invalid barcode data');
    }
    console.log('barcode is', barcode);

    const response = await tickets.actions.update({
      _id: barcode.rawValue,
      status: 'used',
      check: true
    });

    alert("Ticket checked. And it's all right!");
    emits('qrcodecheck');
  } catch (e) {
    console.error(e);
    alert(`Ticket is not found, already used or deactivated!`);
  } finally {
    // Устанавливаем таймаут перед следующим сканированием
    setTimeout(() => {
      isProcessing.value = false;
    }, SCAN_TIMEOUT);
  }
}

async function setZoomRatio(event) {
  const zoomRatio = parseFloat(event.target.value)
  await BarcodeScanner.setZoomRatio({ zoomRatio })
}

async function toggleTorch() {
  await BarcodeScanner.toggleTorch()
}
</script>

<style>
.barcode-scanner-modal {
  visibility: visible;
  position: fixed;
  top: 0;
  left: 0%;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.square {
  width: 200px;
  height: 200px;
  border: 2px solid white;
  border-radius: 10px;
}

.zoom-ratio-wrapper {
  width: 80%;
  margin-top: 20px;
}

.stop-scan-button,
.torch-button {
  margin-top: 20px;
}

/* Existing styles */
body.barcode-scanner-active {
  left: -100%;
/*  visibility: hidden !important;*/
  background: transparent !important;
  --background: transparent;
  --ion-background-color: transparent;
}

html.barcode-scanner-active-html {
  background: transparent !important;
}
</style>
