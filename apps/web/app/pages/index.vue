<script setup lang="ts">
import { copy, products } from '~/data/site'
const slide = ref(0)
const slides = [
  { image: '/images/prototype/asset-01-9a9223d67eb2.jpg', title: copy.headline, subtitle: copy.subline },
  { image: '/images/prototype/asset-06-8c61c443b385.jpg', title: '\u4e00\u5668\u4e00\u7269\u3000\u81ea\u6709\u795e\u97fb', subtitle: '\u7d30\u8cde\u6728\u7d0b\u8207\u5de5\u85dd\u7559\u4e0b\u7684\u6eab\u5ea6' },
  { image: '/images/prototype/asset-07-e8c6d7b20543.jpg', title: '\u85dd\u54c1\u5165\u5ba4\u3000\u559c\u6a02\u76f8\u96a8', subtitle: '\u70ba\u65e5\u5e38\u7559\u4e0b\u4e00\u8655\u5b89\u5b9a\u7684\u98a8\u666f' },
]
const currentSlide = computed(() => slides[slide.value] ?? slides[0]!)
const previous = () => { slide.value = (slide.value + slides.length - 1) % slides.length }
const next = () => { slide.value = (slide.value + 1) % slides.length }
</script>

<template>
  <section class="hero-section shell">
    <div class="hero-frame">
      <div class="hero-copy"><h1 style="white-space: pre-line">{{ currentSlide.title }}</h1><div class="ornament"><span />&#12336;<span /></div><p>{{ currentSlide.subtitle }}</p></div>
      <img :src="currentSlide.image" :alt="currentSlide.title" width="1200" height="680">
      <button class="hero-arrow prev" type="button" aria-label="Previous" @click="previous">&#8592;</button>
      <button class="hero-arrow next" type="button" aria-label="Next" @click="next">&#8594;</button>
      <div class="cloud-line" aria-hidden="true" />
    </div>
    <div class="hero-dots"><button v-for="(_, i) in slides" :key="i" :class="{ active: slide === i }" :aria-label="`Slide ${i + 1}`" @click="slide = i" /></div>
  </section>
  <section class="section shell">
    <SectionTitle :title="copy.featured" />
    <div class="product-grid"><ProductCard v-for="product in products.slice(0, 3)" :key="product.id" :product="product" /></div>
    <div class="more-row"><NuxtLink class="gold-button" to="/products">{{ copy.more }}</NuxtLink></div>
  </section>
</template>
