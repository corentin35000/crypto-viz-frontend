/**
 * Type pour definir la capitalisation
 * @type {Capitalisation}
 * @property {string[]} labels - Labels des capitalisations
 * @property {number[]} data - Data des capitalisations
 * @property {string[] | undefined} colors - Couleurs pour le pie chart
 */
export type Capitalisation = {
  labels: string[]
  data: number[]
  colors?: string[]
}
