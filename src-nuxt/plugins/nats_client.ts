import NatsService from '~~/src-core/services/nats_service'

export default defineNuxtPlugin(async (nuxtApp: any) => {
  const natsService: NatsService = NatsService.getInstance()

  try {
    nuxtApp.provide('natsService', natsService)
    await natsService.connect()
  } catch (error) {
    console.error('Failed to connect to NATS server:', error)
  }

  nuxtApp.hook('app:beforeDestroy', async () => {
    await natsService.close()
  })
})
