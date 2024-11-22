<template>
  <div class="h-1/2 w-1/2">
    <!-- Composant Pie Chart -->
    <Pie :data="chartData" />
  </div>
</template>

<script setup lang="ts">
import { Pie } from 'vue-chartjs'
import type { ChartData } from 'chart.js'
import type { Capitalisation } from '~~/src-core/types/Capitalisation'
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js'

// Enregistre les composants nécessaires de Chart.js
ChartJS.register(Title, Tooltip, Legend, ArcElement)

const props: Capitalisation = defineProps<Capitalisation>()

// Données de charting
const chartData: ChartData<'pie'> = {
  labels: props.labels,
  datasets: [
    {
      data: props.data,
      backgroundColor: props.colors || ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
      borderWidth: 1,
    },
  ],
}
</script>
