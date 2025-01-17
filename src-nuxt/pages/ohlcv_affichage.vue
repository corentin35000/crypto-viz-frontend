<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Ref } from 'vue'
import Chartohlcv from '~/components/chartohlcv.vue'
import { fetchOhlcvData } from '~~/src-core/services/ohlcv_service'
import type { CandlestickData, OhlcvRequest } from '~~/src-core/types/Ohlcv'

const candlestick: Ref<CandlestickData[] | undefined> = ref<CandlestickData[] | undefined>(undefined)
const ohlcvRequest: OhlcvRequest = {
  symbol: 'BTCUSDT',
  interval: '1h',
  limit: 10,
}

/**
 * onMounted hook
 * @returns {Promise<void>}
 */
onMounted(async (): Promise<void> => {
  candlestick.value = await fetchOhlcvData(ohlcvRequest)
})
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <div class="rounded-lg bg-white p-6 shadow-md">
      <!-- Affichage du graphique avec les données OHLCV -->
      <Chartohlcv v-if="!!candlestick" :ohlcvData="candlestick" />
      <!--<loader v-else></loader>-->
    </div>
  </div>
</template>
