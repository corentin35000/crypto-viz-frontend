<template>
  <section class="w-full flex-col">
    <div class="border p-4">
      <h1 class="text-xl font-bold">Messages reçus via NATS</h1>
      <ul>
        <li v-for="(msg, index) in processedMessages" :key="index">
          {{ msg }}
        </li>
      </ul>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useNuxtApp } from '#app'
import NatsWorker from '~/workers/natsWorker.ts?worker'
import type { AxiosResponse } from 'axios'
import axios from 'axios'

// Liste des messages traités
const processedMessages: Ref<string[]> = ref<string[]>([])

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
    console.log('News récupérées : ', response.data)
    processedMessages.value = response.data
  } catch (error: any) {
    console.error('Erreur lors de la récupération des news : ', error)
  }
}
</script>
