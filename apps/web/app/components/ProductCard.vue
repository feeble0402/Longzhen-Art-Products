<script setup lang="ts">
defineProps<{ product: { id: string; name: string; price: string; image: string; category: string } }>()
</script>
<template>
  <NuxtLink class="product-card" :to="`/products/${product.id}`">
    <div class="product-photo"><img :src="product.image" :alt="product.name" width="600" height="600" loading="lazy"></div>
    <h3>{{ product.name }}</h3>
    <div class="card-divider"><span /></div>
    <p>{{ product.price }}</p>
  </NuxtLink>
</template>
