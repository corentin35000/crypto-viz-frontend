/**
 * Type pour definir la capitalisation
 * @type {Capitalization}
 * @property {string[]} labels - Labels des capitalisations
 * @property {number[]} data - Data des capitalisations
 * @property {string[]} colors - Couleurs pour le pie chart
 * @property {string} title - Titre du pie chart
 */
export type Capitalization = {
  labels: string[]
  data: number[]
  colors?: string[]
  title?: string
}
