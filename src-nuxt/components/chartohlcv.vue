<template>
  <div class="rounded-lg bg-white p-4 shadow-md">
    <div ref="chartElement"></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import ApexCharts, { type ApexOptions } from 'apexcharts'
import type { CandlestickData } from '~~/src-core/types/Ohlcv'

/**
 * @type {OhlcvTmp}
 * @property {number[]} y - blabla
 */
type OhlcvTmp = {
  ohlcvData: CandlestickData[]
}

/**
 * @type {CandlestickTmp}
 * @property {number} x - blabla
 * @property {number[]} y - blabla
 */
type CandlestickTmp = {
  x: number
  y: number[]
}

const props: OhlcvTmp = defineProps<{
  ohlcvData: CandlestickData[]
}>()
const chartElement: Ref<HTMLDivElement | null> = ref<HTMLDivElement | null>(null)
let chartInstance: ApexCharts | null = null

/**
 * Fonction pour initialiser le graphique.
 */
const initializeChart: () => void = (): void => {
  if (chartElement.value) {
    const chartOptions: ApexOptions = {
      chart: {
        type: 'candlestick',
        height: 350,
      },
      series: [
        {
          data: props.ohlcvData.map(
            (candlestick: CandlestickData): CandlestickTmp => ({
              x: candlestick.x.getTime(), // Conversion en timestamp millisecondes
              y: candlestick.y,
            }),
          ),
        },
      ],
      xaxis: {
        type: 'datetime',
      },
      yaxis: {
        tooltip: {
          enabled: true,
        },
      },
      plotOptions: {
        candlestick: {
          colors: {
            upward: '#4caf50',
            downward: '#f44336',
          },
        },
      },
      tooltip: {
        shared: true,
        /**
         * CUstom
         * @param {number} seriesIndex - blabla
         * @returns {string} - blabla
         */
        custom: ({
          seriesIndex,
          dataPointIndex,
          w,
        }: {
          seriesIndex: number
          dataPointIndex: number
          w: any
        }): string => {
          const data: any = w.globals.seriesCandleO[seriesIndex][dataPointIndex]
          return `
          <div class="p-2 bg-gray-700 text-white rounded shadow-lg">
            <div>Open: ${data[0]}</div>
            <div>High: ${data[1]}</div>
            <div>Low: ${data[2]}</div>
            <div>Close: ${data[3]}</div>
          </div>`
        },
      },
    }

    chartInstance = new ApexCharts(chartElement.value, chartOptions)
    chartInstance.render()
  }
}

/**
 * Initialisation au montage et mise à jour en cas de changement des données.
 */
onMounted((): void => {
  initializeChart()
})

onUnmounted((): void => {
  chartInstance?.destroy()
})

watch(
  () => props.ohlcvData,
  () => {
    initializeChart()
  },
  { deep: true },
)
</script>
