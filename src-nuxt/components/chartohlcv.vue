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
 * @property {number} timestamp - Timestamp de début.
 * @property {object} crypto - Cryptomonnaie.
 */
type Props = {
  range: { startTimestamp: number; endTimestamp: number } | null
  currency: string
}

// Props passées depuis le parent
const props: Props = defineProps<{
  range: { startTimestamp: number; endTimestamp: number } | null
  currency: string
}>()

// Références et états
const chartElement: Ref<HTMLDivElement | null> = ref<HTMLDivElement | null>(null)
let chartInstance: ApexCharts | null = null
const ohlcvData: Ref<CandlestickData[] | null> = ref<CandlestickData[] | null>(null)

// Calcul de l'intervalle en fonction de la range, en s'assurant que range est défini
const interval = computed<string>(() => {
  if (!props.range || !props.range.startTimestamp || !props.range.endTimestamp) {
    return '1h' // Si range est mal défini, utilise un interval par défaut (1h)
  }

  const days: number = (props.range.endTimestamp - props.range.startTimestamp) / (1000 * 60 * 60 * 24)
  if (days <= 1) {
    return '1h' // intervalle 1 minute pour les données de moins d'un jour
  } else if (days <= 7) {
    return '4h' // intervalle 5 minutes pour les données de moins d'une semaine
  } else if (days <= 30) {
    return '1d'
  } else if (days <= 182) {
    return '1w'
  } else if (days <= 365) {
    return '1M'
  } else {
    return '1M'
  }
})

// Calcul de la limite en fonction de la range, en s'assurant que range est défini
const limit = computed<number>(() => {
  if (!props.range || !props.range.startTimestamp || !props.range.endTimestamp) {
    return 20
  }

  const limit: number = (props.range.endTimestamp - props.range.startTimestamp) / (1000 * 60 * 60 * 24)
  if (limit <= 1) {
    return 20
  } else if (limit <= 7) {
    return 30
  } else if (limit <= 30) {
    return 50
  } else if (limit <= 182) {
    return 50
  } else if (limit <= 365) {
    return 50
  } else {
    return 100
  }
})

// Requête OHLCV avec le range et la currency
const ohlcvRequest = computed<OhlcvRequest>(() => ({
  symbol: props.currency,
  interval: interval.value,
  limit: limit.value, // Limite plus grande pour couvrir une plage étendue
  startTime: props.range?.startTimestamp,
  endTime: props.range?.endTimestamp,
}))

/**
 * Initialisation du graphique à partir des données récupérées.
 * Cette fonction crée une instance d'ApexCharts avec des options de configuration pour l'affichage d'un graphique de type "candlestick".
 */
const initializeChart = (): void => {
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
            upward: '#4caf50', // Couleur pour les bougies haussières
            downward: '#f44336', // Couleur pour les bougies baissières
          },
        },
      },
      tooltip: {
        shared: true,
        custom: ({ seriesIndex, dataPointIndex, w }: { seriesIndex: number; dataPointIndex: number; w: any }) => {
          const data: number[] = w.globals.seriesCandleO[seriesIndex][dataPointIndex]
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
 * Effet de montage du composant, déclenché lorsque le composant est monté.
 * Effectue la récupération des données OHLCV en fonction des props et initialise le graphique.
 */
onMounted(async () => {
  if (props.range?.startTimestamp && props.range?.endTimestamp) {
    const data: CandlestickData[] | null = (await fetchOhlcvData(ohlcvRequest.value)) ?? null
    ohlcvData.value = data || []
    initializeChart()
  }
})

/**
 * Effet de démontage du composant, déclenché lorsque le composant est démonté.
 * Détruit l'instance du graphique si elle existe.
 */
onUnmounted(() => {
  chartInstance?.destroy()
})

/**
 * Observation des changements dans la requête OHLCV.
 * Dès que la requête change, récupère de nouvelles données et met à jour ou initialise le graphique.
 */
watch(
  () => ohlcvRequest.value,
  async () => {
    const data: CandlestickData[] | null = (await fetchOhlcvData(ohlcvRequest.value)) ?? null
    ohlcvData.value = data || []
    if (chartInstance) {
      chartInstance.updateSeries([
        {
          data:
            ohlcvData.value.map((candlestick: CandlestickData) => ({
              x: candlestick.x.getTime(),
              y: candlestick.y,
            })) || [],
        },
      ])
    } else {
      initializeChart()
    }
  },
  { deep: true },
)
</script>