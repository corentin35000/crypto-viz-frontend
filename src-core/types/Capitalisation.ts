/**
 * Type pour definir la capitalisation
 * @type {Capitalisation}
 * @Property {string[]} labels - Labels des capitalisations
 * @Property {number[]} data - Data des capitalisations
 * @Property {string[] | undefined} colors - Couleurs pour le pie chart
 */
export type Capitalisation = {
  labels: string[]
  data: number[]
  colors?: string[]
}
