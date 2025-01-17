<template>
  <div>
    <label for="duration" class="mb-2 block font-medium text-gray-700">Sélectionnez une durée :</label>
    <select
      id="duration"
      v-model="selectedDuration"
      @change="updateTimestamp"
      class="block w-full rounded-lg border border-gray-300 p-2"
    >
      <option v-for="option in durations" :key="option.label" :value="option.label">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Ref } from 'vue'

/**
 * Durées prédéfinies pour la sélection.
 * @typedef {object} Duration - Durée prédéfinie.
 * @property {string} label - Libellé de la durée.
 * @property {number} [days] - Nombre de jours.
 * @property {boolean} [currentYear] - Année en cours.
 * @property {boolean} [fromStart] - Depuis le début.
 */
type Duration = {
  label: string
  days?: number
  currentYear?: boolean
  fromStart?: boolean
}

/**
 * Durées prédéfinies pour la sélection.
 */
const durations: Duration[] = [
  { label: '1 jour', days: 1 },
  { label: '5 jours', days: 5 },
  { label: '1 mois', days: 30 },
  { label: '6 mois', days: 182 },
  { label: "L'année en cours", currentYear: true },
  { label: '1 an', days: 365 },
  { label: '2 ans', days: 730 },
  { label: 'Depuis ses débuts', fromStart: true },
]

/**
 * Emetteur d'événements pour communiquer avec le parent.
 */
const emit: (e: 'update-timestamp', payload: number) => void = defineEmits<{
  (e: 'update-timestamp', timestamp: number): void
}>()

/**
 * Durée sélectionnée par défaut.
 */
const selectedDuration: Ref<string> = ref<string>('1 jour')

/**
 * Calcule le timestamp basé sur la durée sélectionnée.
 * @returns {number} Le timestamp calculé.
 */
const calculateTimestamp: () => number = (): number => {
  const now: number = Date.now()
  const currentYear: number = new Date(now).getFullYear()
  const startOfYear: number = new Date(currentYear, 0, 1).getTime()

  const selected: Duration | undefined = durations.find(
    (duration: Duration) => duration.label === selectedDuration.value,
  )

  if (selected?.days) {
    return now - selected.days * 24 * 60 * 60 * 1000
  } else if (selected?.currentYear) {
    return startOfYear
  } else if (selected?.fromStart) {
    return 0 // Depuis le début
  }

  return now
}

/**
 * Met à jour le `timestamp` et le communique au parent.
 * @returns {void}
 */
const updateTimestamp: () => void = (): void => {
  const timestamp: number = calculateTimestamp()
  emit('update-timestamp', timestamp)
}

/**
 * Emet le timestamp initial dès que le composant est monté
 */
onMounted((): void => {
  updateTimestamp()
})
</script>
