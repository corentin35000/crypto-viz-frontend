<template>
  <h1 class="flex">INDEX PAGE</h1>
  <news-card
    v-for="(news, index) in FetchNewsTest"
    :key="index"
    :title="news.title"
    :content="news.content"
    :date="news.date"
    :image="news.image"
  />
</template>

<script setup lang="ts">
import { NewsCard } from '#components'
import type { News } from '~~/src-core/types/News'
import { onMounted } from 'vue'
import NatsService from '~~/src-core/services/nats_service'

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

const natsService: NatsService = new NatsService()

onMounted(async (): Promise<void> => {
  try {
    await natsService.connect()
  } catch (error) {
    console.error('Erreur de connexion à NATS:', error)
  }
})
</script>
