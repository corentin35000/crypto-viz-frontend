<template>
  <div class="m-4 mx-auto ml-4 mr-3 flex rounded-lg bg-gray-300 shadow-lg">
    <div class="flex w-2/3 flex-col p-6">
      <h2 class="mb-2 text-2xl font-semibold text-gray-800">{{ title }}</h2>
      <p class="mb-4 text-base text-gray-700">{{ content }}</p>
      <p class="mb-4 text-sm text-gray-500">{{ formattedDate }}</p>
    </div>
    <div class="w-1/3">
      <img :src="image" alt="Image de la news" class="h-[200px] w-full rounded-r-lg object-cover" />
    </div>
  </div>
  <div class="m-10 my-4 border-t border-gray-300"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { News } from '~~/src-core/types/News'

const props: News = defineProps<News>()

const formattedDate: ComputedRef<string> = computed(() =>
  new Date(props.date).toLocaleString('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }),
)
</script>
