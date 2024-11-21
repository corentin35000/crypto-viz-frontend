import type NatsService from '~~/src-core/services/nats_service'

declare module '#app' {
  /**
   * The NatsService instance.
   * @type {NatsService}
   */
  interface NuxtApp {
    $natsService: NatsService
  }
}

declare module 'vue' {
  /**
   * The NatsService instance.
   * @type {NatsService}
   */
  interface ComponentCustomProperties {
    $natsService: NatsService
  }
}
