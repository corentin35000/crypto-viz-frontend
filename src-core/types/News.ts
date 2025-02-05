import type { DateTime } from 'luxon'

/**
 * Type pour definir une news
 * @property {string} title - Titre de la news
 * @property {string} content - Contenu de la news
 * @property {string} link - Lien de la news
 * @property {DateTime} date - Date de la news
 * @property {string} image - Image de représentation de la news
 */
export type News = {
  title: string
  content: string
  link?: string
  date?: DateTime
  image?: string
}
