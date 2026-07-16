<script setup lang="ts">
import type { PublicProduct } from '~/types/product'
const props = defineProps<{ product: PublicProduct }>()
const presentation = useProductPresentation()
const image = computed(() => presentation.primaryImage(props.product))
</script>
<template>
  <NuxtLink class="product-card" :to="`/products/${product.slug}`">
    <div class="product-photo">
      <img v-if="image" :src="presentation.imageUrl(image)!" :alt="image.altText || product.name" :width="image.width" :height="image.height" loading="lazy">
      <span v-else class="product-placeholder">圖片準備中</span>
      <span v-if="product.saleStatus !== 'ON_SALE'" class="product-status">{{ presentation.statusLabel(product) }}</span>
    </div>
    <h3>{{ product.name }}</h3>
    <div class="card-divider"><span /></div>
    <p>{{ presentation.priceLabel(product) }}</p>
  </NuxtLink>
</template>
