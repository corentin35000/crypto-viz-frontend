<template>
  <header>
    <Selector @update-range="handleRangeUpdate" @update-currency="handleCurrencyUpdate" />
  </header>

  <section class="flex w-full flex-col gap-6">
    <!-- Première ligne des graphiques -->
    <div class="flex items-center justify-around border p-4">
      <div class="m-3 w-1/2 border p-4">
        <h1 class="mb-4 text-2xl font-bold">OHLCV Candlestick Charts - Vue générale des prix</h1>
        <Ohlcv :range="selectedRange" :currency="selectedCurrency" />
      </div>
      <div class="m-3 w-1/2 border p-4">
        <h1 class="mb-4 text-2xl font-bold">Bar chart - Volume d’échange des cryptos</h1>
        <Bar :timestamp="selectedRange.startTimestamp" />
      </div>
    </div>

    <!-- Deuxième ligne des graphiques -->
    <div class="flex items-center justify-around border p-4">
      <div class="m-3 w-1/2 border p-4">
        <h1 class="mb-4 text-2xl font-bold">Répartition des capitalisations</h1>
        <Pie :range="selectedRange" :currency="selectedCurrency" />
      </div>
      <div class="m-3 w-1/2 border p-4">
        <h1 class="mb-4 text-2xl font-bold">Multi line chart - Indicateurs techniques</h1>
        <Multilinechart :timestamp="selectedRange.startTimestamp" :crypto="selectedCurrency" :range="selectedRange" />
      </div>
    </div>

    <!-- Affichage des actualités -->
    <div>
      <news-card
        v-for="(news, index) in FetchNewsTest"
        :key="index"
        :title="news.title"
        :content="news.content"
        :date="news.date"
        :image="news.image"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { NewsCard } from '#components'
import type { News } from '~~/src-core/types/News'
import Pie from '~/components/pie.vue'
import Selector from '~/components/selector.vue'
import Ohlcv from '~/components/chartohlcv.vue'
import Bar from '~/components/barchart.vue'
import Multilinechart from '~/components/multilinechart.vue'

// Variables réactives pour stocker les sélections
const selectedRange: Ref<{ label: string; startTimestamp: number; endTimestamp: number }> = ref({
  label: '24H',
  startTimestamp: Date.now() - 24 * 60 * 60 * 1000,
  endTimestamp: Date.now(),
})

const selectedCurrency: Ref<string> = ref('BTCUSDT')

/**
 * Met à jour la plage de données lorsqu'une nouvelle sélection est effectuée.
 * @param {Object} range - L'objet contenant la plage de temps sélectionnée.
 * @param {string} range.label - L'étiquette de la plage sélectionnée.
 * @param {number} range.startTimestamp - Le timestamp de début de la plage.
 * @param {number} range.endTimestamp - Le timestamp de fin de la plage.
 * @returns {void}
 */
const handleRangeUpdate = (range: { label: string; startTimestamp: number; endTimestamp: number }): void => {
  selectedRange.value = range
}

/**
 * Met à jour la devise sélectionnée.
 * @param {string} currency - Le symbole de la devise sélectionnée.
 * @returns {void}
 */
const handleCurrencyUpdate = (currency: string): void => {
  selectedCurrency.value = currency
}

/**
 * Observe les modifications des variables réactives pour mettre à jour les graphiques.
 * Enregistre les nouvelles sélections de plage et de devise pour les graphiques.
 * Cette fonction est appelée chaque fois que l'une des variables réactives change.
 * @returns {void}
 */
watchEffect(() => {
  console.log('Données mises à jour :', selectedRange.value, selectedCurrency.value)
  // On pourrait appeler une API ici pour actualiser les graphiques
})

/**
 * Tableau simulé de News pour les tests en attendant l'API.
 * @type {Array<News>}
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
</script>