<template>
  <header>
    <Selector @update-range="handleRangeUpdate" @update-currency="handleCurrencyUpdate" />
  </header>

  <section class="flex w-full flex-col gap-6">
    <h1 class="text-center text-3xl font-bold">Vue d'ensemble du marché</h1>

    <!-- Première ligne des graphiques -->
    <div class="flex items-center justify-around border p-4">
      <div class="m-3 w-1/2 border p-4">
        <h2 class="mb-4 text-2xl font-bold">OHLCV Candlestick Charts - Vue générale des prix</h2>
        <Ohlcv :range="selectedRange" :currency="selectedCurrency" />
      </div>
      <div class="m-3 w-1/2 border p-4">
        <h2 class="mb-4 text-2xl font-bold">Multi line chart - Indicateurs techniques</h2>
        <Multilinechart :timestamp="selectedRange.startTimestamp" :crypto="selectedCurrency" :range="selectedRange" />
      </div>
    </div>

    <!-- Deuxième ligne des graphiques -->
    <div class="flex items-center justify-around border p-4">
      <div class="m-3 w-1/2 border p-4">
        <h2 class="mb-4 text-2xl font-bold">Répartition des capitalisations</h2>
        <Pie :range="selectedRange" :currency="selectedCurrency" />
      </div>
      <div class="m-3 w-1/2 border p-4">
        <h2 class="mb-4 text-2xl font-bold">Bar chart - Volume d’échange des cryptos</h2>
        <Bar :timestamp="selectedRange.startTimestamp" />
      </div>
    </div>

    <!-- Affichage des actualités en deux colonnes -->
    <h1 class="text-center text-3xl font-bold">Actualités</h1>
    <div class="grid grid-cols-2 gap-4 px-6 pb-10">
      <news-card
        v-for="(news, index) in processedMessages"
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
import { NewsCard } from '#components'
import type { News } from '~~/src-core/types/News'
import Pie from '~/components/pie.vue'
import Selector from '~/components/selector.vue'
import Ohlcv from '~/components/chartohlcv.vue'
import Bar from '~/components/barchart.vue'
import Multilinechart from '~/components/multilinechart.vue'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useNuxtApp } from '#app'
import NatsWorker from '~/workers/natsWorker.ts?worker'
import type { AxiosResponse } from 'axios'
import axios from 'axios'

// Variables réactives pour stocker les sélections
const selectedRange: Ref<{ label: string; startTimestamp: number; endTimestamp: number }> = ref({
  label: '24H',
  startTimestamp: Date.now() - 24 * 60 * 60 * 1000,
  endTimestamp: Date.now(),
})

// Devise sélectionnée actuellement
const selectedCurrency: Ref<string> = ref('BTCUSDT')

/**
 * Met à jour la plage de données lorsqu'une nouvelle sélection est effectuée.
 * @param {object} range - L'objet contenant la plage de temps sélectionnée.
 * @param {string} range.label - L'étiquette de la plage sélectionnée.
 * @param {number} range.startTimestamp - Le timestamp de début de la plage.
 * @param {number} range.endTimestamp - Le timestamp de fin de la plage.
 * @returns {void}
 */
const handleRangeUpdate: (range: { label: string; startTimestamp: number; endTimestamp: number }) => void = (range: {
  label: string
  startTimestamp: number
  endTimestamp: number
}): void => {
  selectedRange.value = range
}

/**
 * Met à jour la devise sélectionnée.
 * @param {string} currency - Le symbole de la devise sélectionnée.
 * @returns {void}
 */
const handleCurrencyUpdate: (currency: string) => void = (currency: string): void => {
  selectedCurrency.value = currency
}

// Liste des messages traités
const processedMessages: Ref<News[]> = ref([])

// Initialisation du Worker
const worker: Worker = new NatsWorker()

/**
 * onMounted hook
 * @returns {void}
 */
onMounted(async (): Promise<void> => {
  await fetchStoredNews()
  setupNatsSubscription()
})

/**
 * onBeforeUnmount hook
 * @returns {void}
 */
onBeforeUnmount((): void => {
  // Arrête le Worker avant de détruire le composant
  worker.terminate()
})

/**
 * Configure l'abonnement au broker NATS pour écouter les messages en temps réel
 * @returns {void}
 */
const setupNatsSubscription: () => void = (): void => {
  // Injection de $natsService
  const { $natsService } = useNuxtApp()

  /**
   * Abonnement au sujet 'crypto.news.filtered' de NATS pour recevoir
   * les messages du broker par rapport au backend
   * @param {string} message - Message reçu
   * @returns {void}
   */
  $natsService.subscribe('crypto.news.filtered', (message: string): void => {
    // Envoie le message brut au Worker pour traitement
    worker.postMessage({ message })
  })

  /**
   * Récupère les messages traités par le Worker
   * @param {MessageEvent} messageEvent - Événement de message
   * @returns {void}
   */
  worker.onmessage = (messageEvent: MessageEvent): void => {
    processedMessages.value.push(messageEvent.data.processedMessage) // Ajoute le message traité
  }
}

/**
 * Récupère les news déjà enregistrées côté backend au chargement de la page
 * @returns {Promise<void>}
 */
const fetchStoredNews: () => Promise<void> = async (): Promise<void> => {
  try {
    const response: AxiosResponse<any, any> = await axios.get(import.meta.env.VITE_BASE_URL_API + '/news')
    for (const news of response.data) {
      processedMessages.value.push({
        title: news.title,
        content: news.content,
        date: news.createdAt, // remplacer par la date de l'actualité et pas la date de création en base de données
        link: news?.link,
        image: news?.image,
      })
    }
    console.log('processedMessages : ', processedMessages.value)
  } catch (error: any) {
    console.error('Erreur lors de la récupération des news : ', error)
  }
}
</script>
