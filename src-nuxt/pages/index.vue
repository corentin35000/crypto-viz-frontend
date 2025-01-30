<template>
  <header>
    <Selector @update-range="handleRangeUpdate" @update-currency="handleCurrencyUpdate" />
  </header>

  <section class="w-full flex-col">
    <div class="flex items-center justify-around border">
      <div class="m-3 w-1/2 border">
        <h1 class="mb-4 text-2xl font-bold">OHLCV Candlestick Charts - Vue générale des prix</h1>
        <!-- Pie Chart pour les prix, passe la sélection range -->
        <Pie :range="selectedRange"/>
      </div>
      <div class="m-3 w-1/2 border">
        <h1 class="mb-4 text-2xl font-bold">Bar chart - Volume d’échange des cryptos</h1>
        <!-- Autre Pie Chart avec des données fictives -->
        <Pie :labels="['Tech', 'Finance', 'Industrie']" :data="[40, 25, 15]" :colors="['#FF5733', '#33FFBD', '#3375FF']" />
      </div>
    </div>

    <div class="flex items-center justify-around border">
      <div class="m-3 w-1/2 border">
        <h1 class="mb-4 text-2xl font-bold">Répartition des capitalisations</h1>
        <Pie :labels="['Tech', 'Finance', 'Industrie']" :data="[40, 25, 15]" :colors="['#FF5733', '#33FFBD', '#3375FF']" />
      </div>
      <div class="m-3 w-1/2 border">
        <h1 class="mb-4 text-2xl font-bold">Multi line chart - Indicateurs techniques</h1>
        <Pie :labels="['Tech', 'Finance', 'Industrie']" :data="[40, 25, 15]" :colors="['#FF5733', '#33FFBD', '#3375FF']" />
      </div>
    </div>

    <news-card v-for="(news, index) in FetchNewsTest" :key="index" :title="news.title" :content="news.content"
      :date="news.date" :image="news.image" />
  </section>
</template>

<script setup lang="ts">
import { NewsCard } from '#components'
import type { News } from '~~/src-core/types/News'
import { ref, onMounted } from 'vue'
import Pie from '~/components/pie.vue'
import Selector from '~/components/selector.vue'

// Importer le service NATS
const { $natsService } = useNuxtApp()

// Variables pour stocker les données sélectionnées
const selectedRange = ref<{ label: string; startTimestamp: number; endTimestamp: number }>({
  label: '',
  startTimestamp: 0,
  endTimestamp: 0,
})
const selectedCurrency = ref<string>('BTCUSDT')

// Recevoir les données du composant enfant
const handleRangeUpdate = (range: { label: string; startTimestamp: number; endTimestamp: number }) => {
  selectedRange.value = range
}

const handleCurrencyUpdate = (currency: string) => {
  selectedCurrency.value = currency
}

/**
 * Tableau de News pour faire les tests en attendant le fetch API
 */
const FetchNewsTest: News[] = [
  {
    title: 'Nouvelle fonctionnalité disponible',
    content: "Découvrez les nouvelles options dans la dernière version de l'application.",
    date: '2024-11-08T10:00:00',
    image: 'https://thumbs.dreamstime.com/b/nouvelles-42301371.jpg',
  },
  {
    title: 'Maintenance programmée',
    content: 'Nous effectuerons une maintenance ce week-end. Merci pour votre compréhension.',
    date: '2024-11-09T08:00:00',
    image:
      'https://yt3.googleusercontent.com/GjDLYFGF4IQaUobUK-6q3nOsU4o8fRMl4XgVipPWRqdRVt61s2LqgnbBXu3-qYL4Ab2xsfVo=s900-c-k-c0x00ffffff-no-rj',
  },
  {
    title: 'Mise à jour de sécurité',
    content: 'Une mise à jour de sécurité a été déployée pour corriger des vulnérabilités critiques.',
    date: '2024-11-07T14:30:00',
    image:
      'https://media.istockphoto.com/id/1387606902/fr/vectoriel/étiquette-des-dernières-nouvelles-avec-mégaphone-dernières-nouvelles-annoncez-licône-du.jpg?s=612x612&w=0&k=20&c=ApyxpBl972vVJi8nLySaPSZv8kSlBcNnqswto0UKhpo=',
  },
]

onMounted((): void => {
  $natsService.subscribe('crypto.news.filtered', (message: string): void => {
    console.log('Received message:', message)
  })
})
</script>
