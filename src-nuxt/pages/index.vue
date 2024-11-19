<template>
  <h1 class="flex">INDEX PAGE</h1>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import NatsService from '~~/src-core/services/nats_service'

const natsService: NatsService = new NatsService()

onMounted(async (): Promise<void> => {
  try {
    await natsService.connect()
  } catch (error) {
    console.error('Erreur de connexion à NATS:', error)
  }
})
</script>
