/**
 * Type pour definir une news
 * @property {string} title - Titre de la news
 * @property {string} content - Contenu de la news
 * @property {string} date - Date de la news
 * @property {string} image - Image de représentation de la news
 */
export type News = {
  title: string
  content: string
  date: string
  image?: string
}
