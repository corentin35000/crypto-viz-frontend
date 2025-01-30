<script setup lang="ts">
import { defineProps, ref, watch, onMounted, type Ref } from 'vue'
import { Chart, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip } from 'chart.js'
import type { AxiosResponse } from 'axios'
import axios from 'axios'

// Enregistrement des composants nécessaires de Chart.js
Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip)

/**
 * Définition des types pour la range (intervalle de temps).
 * @property {number} startTimestamp - Le timestamp de début de l'intervalle (en millisecondes depuis l'époque UNIX).
 * @property {number} endTimestamp - Le timestamp de fin de l'intervalle (en millisecondes depuis l'époque UNIX).
 */
type Range = {
  startTimestamp: number
  endTimestamp: number
}

/**
 * Définition des types pour les propriétés du composant.
 * @typedef {object} Props
 * @property {number} timestamp - Timestamp indiquant une valeur temporelle spécifique pour le composant.
 * @property {string} crypto - Symbole de la cryptomonnaie (par exemple, "BTCUSDT").
 * @property {Range} range - Intervalle de temps utilisé pour récupérer les données.
 */
type Props = {
  timestamp: number
  crypto: string
  range: Range
}

// Définition des propriétés du composant
const props: Props = defineProps<{
  timestamp: number
  crypto: string
  range: Range
}>()

/**
 * Référence au canvas pour le graphique.
 */
const chartRef: Ref<HTMLCanvasElement | null> = ref(null)

/**
 * Instance du graphique.
 */
const chartInstance: Ref<Chart | null> = ref(null)

/**
 * Calcule la moyenne mobile sur une période donnée.
 * @param {number[]} data - Liste des données de prix.
 * @param {number} period - Période de la moyenne mobile.
 * @returns {number[]} Moyenne mobile calculée.
 */
function calculateMA(data: number[], period: number): number[] {
  return data.map((_: number, idx: number, array: number[]) =>
    idx >= period - 1
      ? array.slice(idx - period + 1, idx + 1).reduce((sum: number, val: number) => sum + val, 0) / period
      : NaN,
  )
}

/**
 * Calcule l'indice RSI (Relative Strength Index).
 * @param {number[]} data - Liste des données de prix.
 * @param {number} period - Période pour le calcul du RSI.
 * @returns {number[]} Valeurs RSI calculées.
 */
function calculateRSI(data: number[], period: number): number[] {
  const gains: number[] = []
  const losses: number[] = []
  const rsi: number[] = []

  data.slice(1).forEach((current: number, i: number) => {
    const diff: number = current - data[i]
    gains.push(Math.max(diff, 0))
    losses.push(Math.max(-diff, 0))
  })

  gains.forEach((i: number) => {
    if (i >= period - 1) {
      const avgGain: number =
        gains.slice(i - period + 1, i + 1).reduce((sum: number, val: number) => sum + val, 0) / period
      const avgLoss: number =
        losses.slice(i - period + 1, i + 1).reduce((sum: number, val: number) => sum + val, 0) / period
      const rs: number = avgGain / avgLoss
      rsi.push(100 - 100 / (1 + rs))
    } else {
      rsi.push(NaN)
    }
  })

  return [NaN, ...rsi]
}

/**
 * Récupère les données pour une cryptomonnaie.
 * @param {string} symbol - Symbole de la cryptomonnaie.
 * @param {Range} range - Intervalle de temps.
 * @returns {Promise<{ prices: number[]; times: string[] }>} Données de prix et des horaires.
 */
async function fetchCryptoData(symbol: string, range: Range): Promise<{ prices: number[]; times: string[] }> {
  const response: AxiosResponse<any, any> = await axios.get(
    `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1d&startTime=${range.startTimestamp}&endTime=${range.endTimestamp}`,
  )

  const data: any = response.data

  return {
    prices: data.map((item: any) => parseFloat(item[4])),
    times: data.map((item: any) => new Date(item[0]).toLocaleString()),
  }
}

/**
 * Initialise et affiche le graphique.
 */
async function initializeChart(): Promise<void> {
  if (!chartRef.value) {
    return
  }

  try {
    const { prices, times } = await fetchCryptoData(props.crypto, props.range)
    const ma50: number[] = calculateMA(prices, 50)
    const ma100: number[] = calculateMA(prices, 100)
    const rsi: number[] = calculateRSI(prices, 14)

    chartInstance.value = new Chart(chartRef.value, {
      type: 'line',
      data: {
        labels: times,
        datasets: [
          { label: 'Prix', data: prices, borderColor: 'blue', borderWidth: 2, fill: false },
          { label: 'MA50', data: ma50, borderColor: 'green', borderWidth: 2, borderDash: [5, 5], fill: false },
          { label: 'MA100', data: ma100, borderColor: 'orange', borderWidth: 2, borderDash: [10, 5], fill: false },
          { label: 'RSI', data: rsi, borderColor: 'red', borderWidth: 2, fill: false },
        ],
      },
      options: { responsive: true, plugins: { title: { display: true, text: `Graphique - ${props.crypto}` } } },
    })
  } catch (error: unknown) {
    console.error("Erreur lors de l'initialisation du graphique :", error)
  }
}

// Surveiller les changements des propriétés et réinitialiser le graphique si nécessaire
watch([(): Range => props.range, (): string => props.crypto], async (): Promise<void> => {
  if (chartInstance.value) {
    // Détruit l'instance actuelle du graphique
    chartInstance.value.destroy()
  }
  // Réinitialise le graphique avec les nouvelles données
  await initializeChart()
})

// Initialiser le graphique lors du montage
onMounted(() => {
  initializeChart()
})
</script>

<template>
  <div class="relative rounded-lg bg-white p-6 shadow-md">
    <canvas ref="chartRef" />
  </div>
</template>
