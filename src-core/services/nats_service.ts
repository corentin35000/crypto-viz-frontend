import { connect, StringCodec, ErrorCode, NatsError, nkeyAuthenticator } from 'nats.ws'
import type { NatsConnection, Subscription, Codec } from 'nats.ws'
/**
 * A service that connects to a NATS server and publishes and subscribes to messages.
 * @class NatsService
 */
export default class NatsService {
  private static instance: NatsService | null = null
  private nc: NatsConnection | null = null
  private readonly sc: Codec<string> = StringCodec()
  private readonly subscriptions: Map<string, Subscription> = new Map()

  /**
   * The singleton instance of the NatsService.
   * @returns {NatsService} - The singleton instance of the NatsService.
   */
  public static getInstance(): NatsService {
    if (!NatsService.instance) {
      NatsService.instance = new NatsService()
    }
    return NatsService.instance
  }

  /**
   * Connects to the NATS server using NKEY authentication.
   * @returns {Promise<void>} - A promise that resolves when the connection is established.
   */
  public async connect(): Promise<void> {
    try {
      const serversOptions: string | undefined = import.meta.env.VITE_NATS_SERVER_URL
      const seed: Uint8Array = new TextEncoder().encode(import.meta.env.VITE_NATS_NKEY_PRIVATE_KEY)

      this.nc = await connect({
        servers: serversOptions,
        authenticator: nkeyAuthenticator(seed),
      })

      console.log(`Connected to Server NATS : ${this.nc.getServer()}`)
    } catch (error) {
      if (error instanceof NatsError) {
        console.error(`Failed to connect to NATS server: [${error.code}] ${error.message}`)
      } else {
        console.error('Failed to connect to NATS server:', error)
      }
      throw error
    }
  }

  /**
   * Publishes a message to a subject.
   * @param {string} subject - The subject to publish the message to.
   * @param {string} message - The message to publish.
   * @returns {void} - Nothing.
   */
  public publish(subject: string, message: string): void {
    if (!this.nc) {
      throw new NatsError('Not connected to NATS server.', ErrorCode.ApiError)
    }

    try {
      this.nc.publish(subject, this.sc.encode(message))
      console.log(`Published message to subject: ${subject}`)
    } catch (error) {
      if (error instanceof NatsError) {
        console.error(`Failed to publish message: [${error.code}] ${error.message}`)
      } else {
        console.error('Failed to publish message:', error)
      }
      throw error
    }
  }

  /**
   * Subscribes to a subject and listens for messages.
   * @param {string} subject - The subject to subscribe to.
   * @param {(message: string) => void} callback - The callback function to call when a message is received.
   * @returns {Promise<void>} - A promise that resolves when the subscription is established.
   */
  public async subscribe(subject: string, callback: (message: string) => void): Promise<void> {
    if (!this.nc) {
      throw new NatsError('Not connected to NATS server.', ErrorCode.ApiError)
    }

    try {
      const subscription: Subscription = this.nc.subscribe(subject)
      this.subscriptions.set(subject, subscription)
      console.log(`Subscribed to ${subject}`)

      for await (const msg of subscription) {
        callback(this.sc.decode(msg.data))
      }
    } catch (error) {
      if (error instanceof NatsError) {
        console.error(`Failed to subscribe : [${error.code}] ${error.message}`)
      } else {
        console.error('Failed to subscribe :', error)
      }
      throw error
    }
  }

  /**
   * Unsubscribes from a subject.
   * @param {string} subject - The subject to unsubscribe from.
   * @returns {void} - Nothing.
   */
  public unsubscribe(subject: string): void {
    const subscription: Subscription | undefined = this.subscriptions.get(subject)

    if (subscription) {
      subscription.unsubscribe()
      this.subscriptions.delete(subject)
      console.log(`Unsubscribed from ${subject}`)
    }
  }

  /**
   * Unsubscribes from all subjects.
   * @returns {void} - Nothing.
   */
  public unsubscribeAll(): void {
    for (const [subject, subscription] of this.subscriptions) {
      subscription.unsubscribe()
      console.log(`Unsubscribed from ${subject}`)
    }
    this.subscriptions.clear()
  }

  /**
   * Closes the connection to the NATS server.
   * @returns {Promise<void>} - A promise that resolves when the connection is closed.
   */
  public async close(): Promise<void> {
    if (!this.nc) {
      console.log('Connection already closed or was never opened.')
      return
    }

    try {
      await this.unsubscribeAll()
      await this.nc.drain()
      console.log('Connection drained and closed.')
    } catch (error) {
      if (error instanceof NatsError) {
        console.error(`Failed to close connection: [${error.code}] ${error.message}`)
      } else {
        console.error('Failed to close connection:', error)
      }
      throw error
    } finally {
      this.nc = null
    }
  }
}
