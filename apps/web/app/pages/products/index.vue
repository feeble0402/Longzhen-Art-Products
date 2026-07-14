<script setup lang="ts">
import { copy, products } from '~/data/site'
const query = ref('')
const filtered = computed(() => products.filter(p => `${p.name} ${p.category}`.toLowerCase().includes(query.value.toLowerCase())))
</script>
<template><section class="page-hero"><div class="shell"><p>COLLECTION</p><h1>{{ copy.products }}</h1></div></section><section class="section shell"><label class="search-box"><span>Search</span><input v-model="query" type="search" :placeholder="'\u641c\u5c0b\u5546\u54c1\u540d\u7a31\u6216\u5206\u985e'"></label><div v-if="filtered.length" class="product-grid"><ProductCard v-for="product in filtered" :key="product.id" :product="product" /></div><p v-else class="empty-state">No matching products.</p></section></template>
