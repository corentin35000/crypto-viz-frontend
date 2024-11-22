<template>
  <div>
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Chart, Title, Tooltip, Legend, ArcElement, PieController } from 'chart.js'
import type { ChartOptions, ChartData, ChartItem } from 'chart.js'
import type { Capitalization } from '~~/src-core/types/Capitalization'

Chart.register(Title, Tooltip, Legend, ArcElement, PieController)

// Référence pour le canevas
const chartCanvas: Ref<ChartItem | null> = ref(null)

// Instance de graphique (pour destruction propre)
let pieChart: Chart<'pie'> | null = null

const props: Capitalization = defineProps<Capitalization>()

/**
 * Données pour le graphique
 */
const chartData: ChartData = {
  labels: props.labels,
  datasets: [
    {
      data: props.data,
      backgroundColor: props.colors || ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
      borderWidth: 1,
    },
  ],
}

/**
 * Options pour le graphique
 */
const chartOptions: ChartOptions | undefined = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: props.title,
    },
  },
}

/**
 * Crée le graphique lors du montage du composant
 * Crée une instance de graphique pour le canevas
 */
onMounted((): void => {
  // @ts-ignore
  pieChart = new Chart(<ChartItem>chartCanvas.value, {
    type: 'pie',
    data: chartData,
    options: chartOptions,
  })
})

/**
 * Détruit le graphique lors du démontage du composant
 * Détruit l'instance de graphique pour éviter les fuites de mémoire
 */
onBeforeUnmount((): void => {
  if (pieChart) {
    pieChart.destroy()
  }
})
</script>

<style>
canvas {
  max-width: 400px;
  max-height: 400px;
}
</style>
