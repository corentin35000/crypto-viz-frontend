<template>
  <div class="rounded-lg bg-white p-4 shadow-md">
    <div v-if="errorMessage" class="text-red-500">{{ errorMessage }}</div>
    <canvas v-else ref="chartElement"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick, type Ref } from 'vue'
import { Chart, registerables } from 'chart.js'
import axios from 'axios'
import type { AxiosResponse } from 'axios'

Chart.register(...registerables)

type PieChartData = {
  x: string
  y: number
}

type Props = {
  range: { label: string; startTimestamp: number; endTimestamp: number }
  currency: string
}

// Props passées depuis le parent
const props: Props = defineProps<Props>()

// Références et états
const chartElement: Ref<HTMLCanvasElement | null> = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart<'pie', number[], unknown> | null = null
const chartData: Ref<PieChartData[]> = ref<PieChartData[]>([])
const errorMessage: Ref<string | null> = ref<string | null>(null)

/**
 * Récupère les volumes de trading et les prix des cryptos sur Binance.
 * @returns {Promise<PieChartData[]>} Les données du graphique.
 */
const fetchCryptoMarketData = async (): Promise<PieChartData[]> => {
  const url: string = 'https://api.binance.com/api/v3/ticker/24hr'

  try {
    const response: AxiosResponse<any[]> = await axios.get(url)

    console.log('Données API Binance :', response.data)

    const tickers: any[] = response.data

    // Filtrer les principales cryptos
    const btc: any = tickers.find((ticker: any) => ticker.symbol === 'BTCUSDT')
    const eth: any = tickers.find((ticker: any) => ticker.symbol === 'ETHUSDT')

    if (!btc || !eth) {
      throw new Error('Données de BTC ou ETH introuvables.')
    }

    // Récupération des volumes et calcul de la dominance
    const btcVolume: number = parseFloat(btc.quoteVolume)
    const ethVolume: number = parseFloat(eth.quoteVolume)
    const totalVolume: number = tickers.reduce((sum: number, ticker: any) => sum + parseFloat(ticker.quoteVolume), 0)

    const otherVolume: number = totalVolume - (btcVolume + ethVolume)

    return [
      { x: 'Bitcoin (BTC)', y: (btcVolume / totalVolume) * 100 },
      { x: 'Ethereum (ETH)', y: (ethVolume / totalVolume) * 100 },
      { x: 'Autres Cryptos', y: (otherVolume / totalVolume) * 100 },
    ]
  } catch (error) {
    console.error('Erreur lors de la récupération des données :', error)
    errorMessage.value = 'Impossible de récupérer les données du graphique.'
    return []
  }
}

/**
 * Initialise le graphique.
 * @returns {void}
 */
const initializeChart = (): void => {
  if (!chartElement.value || chartData.value.length === 0) {
    console.warn('Aucune donnée disponible pour initialiser le graphique.')
    return
  }

  console.log('Initialisation du graphique avec les données :', chartData.value)

  const colors: string[] = chartData.value.map(
    () => `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`,
  )

  chartInstance = new Chart<'pie'>(chartElement.value, {
    type: 'pie',
    data: {
      labels: chartData.value.map((data) => data.x),
      datasets: [
        {
          data: chartData.value.map((data) => data.y),
          backgroundColor: colors,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Répartition du Marché Crypto par Volume',
        },
        legend: {
          position: 'top',
        },
      },
    },
  })
}

/**
 * Réinitialise et met à jour les données du graphique.
 * @returns {Promise<void>}
 */
const updateGraph = async (): Promise<void> => {
  console.log('Mise à jour des données du graphique avec le range :', props.range, 'et currency :', props.currency)

  errorMessage.value = null

  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  await nextTick()

  chartData.value = await fetchCryptoMarketData()

  if (chartData.value.length > 0) {
    initializeChart()
  } else {
    console.warn('Aucune donnée disponible après la mise à jour.')
  }
}

/**
 * Met à jour les données du graphique lorsque le composant est monté.
 * @returns {Promise<void>}
 */
onMounted(async (): Promise<void> => {
  console.log('Composant monté, création du graphique.')
  await updateGraph()
})

/**
 * Détruit le graphique lors du démontage du composant.
 * @returns {void}
 */
onBeforeUnmount((): void => {
  chartInstance?.destroy()
})

/**
 * Met à jour les données du graphique lorsque le range ou la monnaie changent.
 * @returns {Promise<void>}
 */
watch(
  [() => props.range, () => props.currency],
  async (): Promise<void> => {
    await updateGraph()
  },
  { deep: true },
)
</script>

<style scoped>
canvas {
  max-width: 400px;
  max-height: 400px;
}
</style>