<template>
  <div class="h-1/3 w-1/3 p-8">
    <h1 class="mb-4 text-2xl font-bold">Répartition des capitalisations</h1>
    <pie-chart
      :labels="['Tech', 'Finance', 'Industrie']"
      :data="[40, 25, 15]"
      :colors="['#FF5733', '#33FFBD', '#3375FF', '#FF33A2', '#8D33FF']"
    />
  </div>
</template>
