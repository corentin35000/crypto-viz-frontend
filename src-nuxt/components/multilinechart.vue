<script setup lang="ts">
import { defineProps, ref, watch, onMounted } from 'vue'
import { Chart, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip } from 'chart.js'

Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip)

// Définition des propriétés du composant
const props = defineProps<{
  range: { startTimestamp: number; endTimestamp: number }
  crypto: string
}>()

// Référence vers le canvas pour Chart.js
const chartRef = ref<HTMLCanvasElement | null>(null)
// Instance du graphique Chart.js
const chartInstance = ref<Chart | null>(null)

/**
 * Calcule la moyenne mobile sur une période donnée.
 * @param {number[]} data - Tableau des données de prix.
 * @param {number} period - Période pour le calcul de la moyenne mobile.
 * @returns {number[]} Tableau des moyennes mobiles.
 */
function calculateMA(data: number[], period: number): number[] {
  return data.map((_, idx, array) =>
    idx >= period - 1
      ? array.slice(idx - period + 1, idx + 1).reduce((sum: number, val: number) => sum + val, 0) / period
      : NaN,
  )
}

/**
 * Calcule l'indice RSI (Relative Strength Index).
 * @param {number[]} data - Tableau des données de prix.
 * @param {number} period - Période pour le calcul du RSI.
 * @returns {number[]} Tableau des valeurs RSI.
 */
function calculateRSI(data: number[], period: number): number[] {
  const gains: number[] = []
  const losses: number[] = []
  const rsi: number[] = []

  for (let i = 1; i < data.length; i++) {
    const diff: number = data[i] - data[i - 1]
    gains.push(diff > 0 ? diff : 0)
    losses.push(diff < 0 ? Math.abs(diff) : 0)
  }

  for (let i = 0; i < gains.length; i++) {
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
  }

  return [NaN, ...rsi]
}

/**
 * Récupère les données de la cryptomonnaie pour un intervalle donné.
 * @param {string} symbol - Symbole de la cryptomonnaie (ex. : BTCUSDT).
 * @param {{ startTimestamp: number; endTimestamp: number }} range - Intervalle de temps pour les données.
 * @returns {Promise<{ prices: number[]; times: string[] }>} Les prix et les temps associés.
 */
async function fetchCryptoData(
  symbol: string,
  range: { startTimestamp: number; endTimestamp: number },
): Promise<{ prices: number[]; times: string[] }> {
  const response = await fetch(
    `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1d&startTime=${range.startTimestamp}&endTime=${range.endTimestamp}`,
  )
  const data = await response.json()

  return {
    prices: data.map((item: any) => parseFloat(item[4])),
    times: data.map((item: any) => new Date(item[0]).toLocaleString()),
  }
}

/**
 * Initialise le graphique Chart.js.
 * @returns {Promise<void>} Promesse terminée après l'initialisation.
 */
async function initializeChart(): Promise<void> {
  if (!chartRef.value) return

  const { prices, times } = await fetchCryptoData(props.crypto, props.range)

  const ma50: number[] = calculateMA(prices, 50)
  const ma100: number[] = calculateMA(prices, 100)
  const rsi: number[] = calculateRSI(prices, 14)

  chartInstance.value = new Chart(chartRef.value, {
    type: 'line',
    data: {
      labels: times,
      datasets: [
        {
          label: 'Prix de clôture',
          data: prices,
          borderColor: 'blue',
          borderWidth: 2,
          fill: false,
        },
        {
          label: 'MA50',
          data: ma50,
          borderColor: 'green',
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false,
        },
        {
          label: 'MA100',
          data: ma100,
          borderColor: 'orange',
          borderWidth: 2,
          borderDash: [10, 5],
          fill: false,
        },
        {
          label: 'RSI',
          data: rsi,
          borderColor: 'red',
          borderWidth: 2,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: `Graphique pour ${props.crypto}`,
        },
      },
    },
  })
}

// Réagit aux changements des propriétés range ou crypto
watch([() => props.range, () => props.crypto], async () => {
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }
  await initializeChart()
})

// Initialise le graphique lorsque le composant est monté
onMounted(() => {
  initializeChart()
})
</script>

<template>
  <div class="relative rounded-lg bg-white p-6 shadow-md">
    <canvas ref="chartRef" />
  </div>
</template>
