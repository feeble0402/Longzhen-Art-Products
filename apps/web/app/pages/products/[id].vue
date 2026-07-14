<script setup lang="ts">
import { products } from '~/data/site'
const route = useRoute()
const product = computed(() => products.find(p => p.id === route.params.id) ?? products[0]!)
</script>
<template><section class="section shell"><NuxtLink class="back-link" to="/products">&#8592; Back</NuxtLink><div class="detail-grid"><img :src="product.image" :alt="product.name"><div><p class="kicker">{{ product.category }} / {{ product.id }}</p><h1>{{ product.name }}</h1><p class="detail-price">{{ product.price }}</p><p class="detail-copy">Each natural artwork has unique grain, color and hand-finished details. Contact the official LINE account for current availability and additional photos.</p><NuxtLink class="gold-button" to="/contact">LINE inquiry</NuxtLink></div></div></section></template>
