<template>
  <div class="rounded-lg bg-white p-4 shadow-md">
    <div ref="chartElement"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted, defineProps, computed, type Ref } from 'vue'
import ApexCharts, { type ApexOptions } from 'apexcharts'
import { fetchOhlcvData } from '~~/src-core/services/ohlcv_service'
import type { CandlestickData, OhlcvRequest } from '~~/src-core/types/Ohlcv'

/**
 * Propriétés du composant.
 * @typedef {object} Props
 * @property {object} range - Plage de temps.
 * @property {string} currency - Devise.
 */
type Props = {
  range: { startTimestamp: number; endTimestamp: number } | null
  currency: string
}

/**
 * Références et états.
 */
type ComputedInterval = string

/**
 * Calcul de l'intervalle en fonction de la range.
 */
type ComputedLimit = number

/**
 * Calcul de la limite en fonction de la range.
 */
type ComputedOhlcvRequest = OhlcvRequest

/**
 * Données calculées pour le graphique.
 */
type ComputedData = CandlestickData[]

/**
 * Initialisation du graphique à partir des données récupérées.
 */
type InitializeChart = () => void

/**
 * Fonction de formatage du tooltip.
 */
type TooltipFormatter = ({
  seriesIndex,
  dataPointIndex,
  w,
}: {
  seriesIndex: number
  dataPointIndex: number
  w: any
}) => string

/**
 * Définition des props du composant.
 */
const props: Props = defineProps<Props>()

// Références et états
const chartElement: Ref<HTMLDivElement | null> = ref(null)
let chartInstance: ApexCharts | null = null
const ohlcvData: Ref<ComputedData | null> = ref(null)

/**
 * Calcul de l'intervalle en fonction de la range.
 */
const interval: ComputedRef<ComputedInterval> = computed<ComputedInterval>(() => {
  if (!props.range?.startTimestamp || !props.range.endTimestamp) {
    return '1h' // Si range est mal défini, utilise un interval par défaut (1h)
  }

  const days: number = (props.range.endTimestamp - props.range.startTimestamp) / (1000 * 60 * 60 * 24)
  if (days <= 1) {
    return '1h'
  } else if (days <= 7) {
    return '4h'
  } else if (days <= 30) {
    return '1d'
  } else if (days <= 182) {
    return '1w'
  } else {
    return '1M'
  }
})

/**
 * Calcul de la limite en fonction de la range.
 */
const limit: ComputedRef<ComputedLimit> = computed<ComputedLimit>(() => {
  if (!props.range?.startTimestamp || !props.range.endTimestamp) {
    return 20
  }

  const diff: number = (props.range.endTimestamp - props.range.startTimestamp) / (1000 * 60 * 60 * 24)
  if (diff <= 1) {
    return 20
  } else if (diff <= 7) {
    return 30
  } else {
    return 50
  }
})

/**
 * Requête OHLCV avec le range et la currency.
 */
const ohlcvRequest: ComputedRef<ComputedOhlcvRequest> = computed<ComputedOhlcvRequest>(() => ({
  symbol: props.currency,
  interval: interval.value,
  limit: limit.value,
  startTime: props.range?.startTimestamp ?? 0,
  endTime: props.range?.endTimestamp ?? 0,
}))

/**
 * Initialisation du graphique à partir des données récupérées.
 */
const initializeChart: InitializeChart = (): void => {
  if (chartElement.value && ohlcvData.value) {
    const chartOptions: ApexOptions = {
      chart: {
        type: 'candlestick',
        height: 350,
      },
      series: [
        {
          data: ohlcvData.value.map((candlestick: CandlestickData) => ({
            x: candlestick.x.getTime(),
            y: candlestick.y,
          })),
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
        custom: (({ seriesIndex, dataPointIndex, w }: Parameters<TooltipFormatter>[0]) => {
          const data: number[] = w.globals.seriesCandleO[seriesIndex][dataPointIndex]
          return `
          <div class="p-2 bg-gray-700 text-white rounded shadow-lg">
            <div>Open: ${data[0]}</div>
            <div>High: ${data[1]}</div>
            <div>Low: ${data[2]}</div>
            <div>Close: ${data[3]}</div>
          </div>`
        }) as TooltipFormatter,
      },
    }
    chartInstance = new ApexCharts(chartElement.value, chartOptions)
    chartInstance.render()
  }
}

// Effet de montage du composant
onMounted(async () => {
  if (props.range?.startTimestamp && props.range.endTimestamp) {
    const data: ComputedData | null = (await fetchOhlcvData(ohlcvRequest.value)) ?? []
    ohlcvData.value = data
    initializeChart()
  }
})

// Effet de démontage du composant
onUnmounted(() => {
  chartInstance?.destroy()
})

// Observation des changements dans la requête OHLCV
watch(
  () => ohlcvRequest.value,
  async () => {
    const data: ComputedData | null = (await fetchOhlcvData(ohlcvRequest.value)) ?? []
    ohlcvData.value = data
    if (chartInstance) {
      chartInstance.updateSeries([
        {
          data: ohlcvData.value.map((candlestick: CandlestickData) => ({
            x: candlestick.x.getTime(),
            y: candlestick.y,
          })),
        },
      ])
    } else {
      initializeChart()
    }
  },
  { deep: true },
)
</script>
