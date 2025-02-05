<template>
  <div class="flex h-auto w-full flex-col rounded-lg bg-gray-300 shadow-lg">
    <div class="flex flex-grow flex-col p-4">
      <h2 class="mb-2 text-xl font-semibold text-gray-800">{{ props.title }}</h2>

      <!-- Contenu avec gestion de l'affichage -->
      <p class="flex-grow text-base text-gray-700 transition-all duration-300" :class="{ 'line-clamp-4': !isExpanded }">
        {{ props.content }}
      </p>

      <!-- Bouton "Lire plus / Réduire" -->
      <button
        v-if="props.content.length > 200"
        @click="isExpanded = !isExpanded"
        class="mt-2 text-blue-500 hover:underline"
      >
        {{ isExpanded ? 'Réduire' : 'Lire plus' }}
      </button>

      <p class="mt-2 text-sm text-gray-500">{{ formattedDate }}</p>
    </div>

    <!-- Image si présente -->
    <div v-if="props.image" class="h-[180px] w-full overflow-hidden rounded-b-lg">
      <img :src="props.image" alt="Image de la news" class="h-full w-full object-cover" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { News } from '~~/src-core/types/News'
import type { ComputedRef, Ref } from 'vue'

// Déclare un état réactif local pour chaque NewsCard
const isExpanded: Ref<boolean> = ref(false)

const props: News = defineProps<News>()

const formattedDate: ComputedRef<string> = computed(() =>
  // @ts-ignore
  new Date(props.date).toLocaleString('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }),
)
</script>
