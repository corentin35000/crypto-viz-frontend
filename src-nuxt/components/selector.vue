<script setup lang="ts">
import { defineEmits } from 'vue'

/**
 * Définition du type pour les événements émis.
 * @typedef {EmitType} EmitType - Type des événements émis par le composant.
 * @property {Function} 'update-range' - Événement déclenché lors de la mise à jour de l'intervalle de temps.
 * @param {string} e - Nom de l'événement, ici 'update-range'.
 * @param {{ label: string; startTimestamp: number; endTimestamp: number }} range - Données associées à l'intervalle de temps.
 * @param {string} range.label - Libellé de l'intervalle de temps.
 * @param {number} range.startTimestamp - Timestamp de début de l'intervalle.
 * @param {number} range.endTimestamp - Timestamp de fin de l'intervalle.
 * @property {Function} 'update-currency' - Événement déclenché lors de la mise à jour de la cryptomonnaie sélectionnée.
 * @param {string} e - Nom de l'événement, ici 'update-currency'.
 * @param {string} currency - Symbole de la cryptomonnaie mise à jour.
 */
type EmitType = {
  (e: 'update-range', range: { label: string; startTimestamp: number; endTimestamp: number }): void
  (e: 'update-currency', currency: string): void
}

const emit: EmitType = defineEmits<EmitType>()

/**
 * Représente une plage de temps avec diverses options.
 * @property {string} label - Le libellé de la plage de temps.
 * @property {number} [days] - Nombre de jours définissant la plage (facultatif).
 * @property {boolean} [currentYear] - Indique si la plage se limite à l'année en cours (facultatif).
 * @property {boolean} [fromStart] - Indique si la plage commence depuis le début d'une période (facultatif).
 */
type Range = {
  label: string
  days?: number
  currentYear?: boolean
  fromStart?: boolean
}

/**
 * Définition des plages de temps disponibles.
 */
const ranges: Array<{ label: string; days?: number; currentYear?: boolean; fromStart?: boolean }> = [
  { label: '1 jour', days: 2 },
  { label: '5 jours', days: 5 },
  { label: '1 mois', days: 30 },
  { label: '6 mois', days: 182 },
  { label: "L'année en cours", currentYear: true },
  { label: '1 an', days: 365 },
  { label: '2 ans', days: 730 },
  { label: 'Depuis ses débuts', fromStart: true },
]

/**
 * Gère le changement de plage de temps.
 * @param {Event} event - Événement de changement du sélecteur.
 */
const changeRange: (event: Event) => void = (event: Event): void => {
  const value: string = (event.target as HTMLSelectElement).value
  const selectedRange: Range | undefined = ranges.find((range: Range) => range.label === value)

  if (!selectedRange) return

  const now: number = Date.now()
  let startTimestamp: number = now // Par défaut, le début est maintenant
  let endTimestamp: number = now // Par défaut, la fin est maintenant

  if (selectedRange.days) {
    startTimestamp = now - selectedRange.days * 24 * 60 * 60 * 1000
  } else if (selectedRange.currentYear) {
    const currentYear: number = new Date().getFullYear()
    startTimestamp = new Date(currentYear, 0, 1).getTime() // Début de l'année
  } else if (selectedRange.fromStart) {
    startTimestamp = 0 // Timestamp depuis le début (1970)
  }

  // Émet la plage de temps sélectionnée
  emit('update-range', { label: selectedRange.label, startTimestamp, endTimestamp })
}

/**
 * Gère le changement de devise.
 * @param {Event} event - Événement de changement du sélecteur.
 */
const changeCurrency: (event: Event) => void = (event: Event): void => {
  const value: string = (event.target as HTMLSelectElement).value
  emit('update-currency', value)
}
</script>

<template>
  <div class="flex space-x-4 p-4">
    <!-- Sélection de la plage de temps -->
    <select @change="changeRange" class="rounded-md border p-2" aria-label="Sélecteur de plage de temps">
      <option v-for="range in ranges" :key="range.label" :value="range.label">
        {{ range.label }}
      </option>
    </select>

    <!-- Sélection de la devise -->
    <select @change="changeCurrency" class="rounded-md border p-2" aria-label="Sélecteur de devise">
      <option value="BTCUSDT">BTC/USDT</option>
      <option value="ETHUSDT">ETH/USDT</option>
    </select>
  </div>
</template>
