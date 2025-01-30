<template>
  <div class="rounded-lg bg-white p-4 shadow-md">
    <div v-if="errorMessage" class="text-red-500">{{ errorMessage }}</div>
    <canvas v-else ref="chartElement"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import axios from 'axios'
import type { AxiosResponse } from 'axios'

Chart.register(...registerables)

type PieChartData = {
  x: string
  y: number
}

type Props = {
  timestamp: number
}

const props: Props = defineProps<{
  timestamp: number
}>()

const chartElement: Ref<HTMLCanvasElement | null> = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart<"pie", number[], unknown> | null = null
const chartData: Ref<PieChartData[]> = ref<PieChartData[]>([])
const errorMessage: Ref<string | null> = ref<string | null>(null)

/**
 * Récupère la capitalisation de marché des cryptomonnaies.
 * @param {number} timestamp - Timestamp de début.
 * @returns {Promise<PieChartData[]>} Les données du graphique.
 */
 const fetchCryptoMarketData: (timestamp: number) => Promise<PieChartData[]> = async (
  timestamp: number,
): Promise<PieChartData[]> => {
  const url = 'https://api.coingecko.com/api/v3/coins/markets'
  try {
    const response: AxiosResponse<any, any> = await axios.get(url, {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 100,
        page: 1,
      },
    })
    console.log("Données API :", response.data) // Debug
    const data = response.data
    const totalMarketCap = data.reduce((sum: number, crypto: any) => sum + (crypto.market_cap || 0), 0)
    const btcData = data.find((crypto: any) => crypto.id === 'bitcoin')
    const ethData = data.find((crypto: any) => crypto.id === 'ethereum')
    const btcMarketCap = btcData?.market_cap || 0
    const ethMarketCap = ethData?.market_cap || 0
    const otherMarketCap = totalMarketCap - (btcMarketCap + ethMarketCap)

    return [
      { x: 'Bitcoin (BTC)', y: (btcMarketCap / totalMarketCap) * 100 },
      { x: 'Ethereum (ETH)', y: (ethMarketCap / totalMarketCap) * 100 },
      { x: 'Autres Cryptos', y: (otherMarketCap / totalMarketCap) * 100 },
    ]
  } catch (error) {
    console.error('Erreur lors de la récupération des données :', error)
    errorMessage.value = 'Impossible de récupérer les données du graphique.'
    return []
  }
}


/**
 * Initialise le graphique.
 */
 const initializeChart: () => void = (): void => {
  if (!chartElement.value || chartData.value.length === 0) {
    console.warn('Aucune donnée disponible pour initialiser le graphique.')
    return
  }

  const colors: string[] = chartData.value.map(
    () => `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`
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
          text: 'Répartition du Marché Crypto par Capitalisation',
        },
        legend: {
          position: 'top',
        },
      },
    },
  })

  chartInstance.update() // Ajoutez cette ligne pour forcer la mise à jour
}


/**
 * Met à jour les données du graphique.
 */
const setDataGraph: () => Promise<void> = async (): Promise<void> => {
  chartData.value = await fetchCryptoMarketData(props.timestamp)
}

/**
 * Réinitialise le graphique.
 */
const resetGraph: () => Promise<void> = async (): Promise<void> => {
  errorMessage.value = null
  await nextTick()
  chartInstance?.destroy()
}

/**
 * Crée un nouveau graphique.
 */
const newGraph: () => Promise<void> = async (): Promise<void> => {
  await resetGraph()
  await setDataGraph()
  initializeChart()
}

/**
 * Met à jour les données du graphique lors du montage du composant.
 */
onMounted(async (): Promise<void> => {
  await newGraph()
})

/**
 * Détruit le graphique lors du démontage du composant.
 */
onBeforeUnmount((): void => {
  chartInstance?.destroy()
})

/**
 * Met à jour les données du graphique lorsque le timestamp change.
 */
watch(() => props.timestamp, newGraph)
</script>

<style scoped>
canvas {
  max-width: 400px;
  max-height: 400px;
}
</style>
