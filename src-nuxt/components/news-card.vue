<template>
  <div class="flex h-[280px] w-full flex-col rounded-lg bg-gray-300 shadow-lg">
    <div class="flex flex-grow flex-col p-4">
      <h2 class="mb-2 text-xl font-semibold text-gray-800">{{ props.title }}</h2>
      <p class="line-clamp-3 flex-grow text-base text-gray-700">{{ props.content }}</p>
      <p class="mt-2 text-sm text-gray-500">{{ formattedDate }}</p>
    </div>
    <div v-if="props.image" class="h-[120px] w-full">
      <img :src="image" alt="Image de la news" class="h-full w-full rounded-b-lg object-cover" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { News } from '~~/src-core/types/News'

const props: News = defineProps<News>()

const formattedDate: ComputedRef<string> = computed(() =>
  // @ts-ignore
  new Date(props.date).toLocaleString('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }),
)
</script>
