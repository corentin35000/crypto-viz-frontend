<template>
  <div class="rounded-lg bg-white p-4 shadow-md">
    <div v-if="errorMessage" class="text-red-500">{{ errorMessage }}</div>
    <canvas v-else ref="chartElement"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Chart, registerables } from 'chart.js'
import axios from 'axios'
import type { AxiosResponse } from 'axios'

Chart.register(...registerables)

/**
 * Définit le type des données du graphique.
 * @typedef {object} BarChartData
 * @property {string} x - L'axe des abscisses.
 * @property {number} y - L'axe des ordonnées.
 */
type BarChartData = {
  x: string
  y: number
}

/**
 * Propriétés du composant.
 * @typedef {object} Props
 * @property {number} timestamp - Timestamp de début.
 */
type Props = {
  timestamp: number
}

const props: Props = defineProps<{
  timestamp: number
}>()
const chartElement: Ref<HTMLCanvasElement | null> = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null
const chartData: Ref<BarChartData[]> = ref<BarChartData[]>([])
const errorMessage: Ref<string | null> = ref<string | null>(null)

/**
 * Récupère les données des volumes échangés pour les cryptomonnaies.
 * @param {number} timestamp - Timestamp de début.
 * @returns {Promise<BarChartData[]>} Les données du graphique.
 */
const fetchCryptoVolumes: (timestamp: number) => Promise<BarChartData[]> = async (
  timestamp: number,
): Promise<BarChartData[]> => {
  const symbols: string[] = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT']
  const interval: string = '1d'
  const endTime: number = timestamp + 5 * 24 * 60 * 60 * 1000

  try {
    const promises: Promise<{
      x: string
      y: any
    }>[] = symbols.map(async (symbol: string) => {
      const response: AxiosResponse<any, any> = await axios.get('https://api.binance.com/api/v3/klines', {
        params: { symbol, interval, startTime: timestamp, endTime },
      })
      const totalVolume: any = response.data.reduce((sum: number, entry: any[]) => sum + parseFloat(entry[5]), 0)
      return { x: symbol, y: totalVolume }
    })

    return await Promise.all(promises)
  } catch (error) {
    console.error('Erreur lors de la récupération des données :', error)
    errorMessage.value = 'Impossible de récupérer les données du graphique.'
    return []
  }
}

/**
 * Initialise le graphique.
 * Crée une instance de graphique pour le canevas.
 * @returns {void}
 */
const initializeChart: () => void = (): void => {
  if (!chartElement.value || chartData.value.length === 0) {
    console.warn('Aucune donnée disponible pour initialiser le graphique.')
    return
  }

  const colors: string[] = chartData.value.map(
    () => `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`,
  )

  chartInstance = new Chart(chartElement.value, {
    type: 'bar',
    data: {
      labels: chartData.value.map((barchatData: BarChartData) => barchatData.x),
      datasets: [
        {
          label: 'Volumes échangés',
          data: chartData.value.map((barchatData: BarChartData) => barchatData.y),
          backgroundColor: colors,
        },
      ],
    },
    options: {
      responsive: true,
      indexAxis: 'y',
    },
  })
}

/**
 * Met à jour les données du graphique.
 * @returns {Promise<void>}
 */
const setDataGraph: () => Promise<void> = async (): Promise<void> => {
  chartData.value = await fetchCryptoVolumes(props.timestamp)
}

/**
 * Réinitialise le graphique.
 * @returns {Promise<void>}
 */
const resetGraph: () => Promise<void> = async (): Promise<void> => {
  errorMessage.value = null
  await nextTick()
  chartInstance?.destroy()
}

/**
 * Crée un nouveau graphique.
 * Réinitialise le graphique, met à jour les données et initialise le graphique.
 * @returns {Promise<void>}
 */
const newGraph: () => Promise<void> = async (): Promise<void> => {
  // Reset last graph
  await resetGraph()

  // Set new data
  await setDataGraph()

  // Initialize new chart
  initializeChart()
}

/**
 * Met à jour les données du graphique lors du montage du composant.
 */
onMounted(async (): Promise<void> => {
  await newGraph()
})

/**
 * Détruit le graphique lors du démontage du composant
 * Détruit l'instance de graphique pour éviter les fuites de mémoire
 */
onBeforeUnmount((): void => {
  chartInstance?.destroy()
})

/**
 * Met à jour les données du graphique lorsque le timestamp change.
 */
watch(() => props.timestamp, newGraph)
</script>
