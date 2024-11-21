import NatsService from '~~/src-core/services/nats_service'

export default defineNuxtPlugin(async (nuxtApp: any) => {
  const natsService: NatsService = NatsService.getInstance()

  try {
    await natsService.connect()
    nuxtApp.provide('natsService', natsService)
  } catch (error) {
    console.error('Failed to connect to NATS server:', error)
  }

  nuxtApp.hook('app:beforeDestroy', async () => {
    await natsService.close()
  })
})
