<script setup lang="ts">
import { copy } from '~/data/site'
import type { PublicProductPage } from '~/types/product'
const config = useRuntimeConfig()
const { data: featured } = await useAsyncData('home-products', () =>
  $fetch<PublicProductPage>(`${config.public.apiBaseUrl}/products`, {
    query: { page: 1, pageSize: 3, homeOnly: 'true' },
  }),
)
interface CarouselSlide {
  id: string
  desktopKey: string
  mobileKey: string
  title?: string | null
  subtitle?: string | null
  buttonLabel?: string | null
  targetUrl?: string | null
}
const { data: carousel } = await useAsyncData('home-carousel', () =>
  $fetch<CarouselSlide[]>(`${config.public.apiBaseUrl}/carousel-slides`),
)
const slide = ref(0)
const fallbackSlides = [
  { desktopImage: '/images/prototype/asset-01-9a9223d67eb2.jpg', mobileImage: '/images/prototype/asset-01-9a9223d67eb2.jpg', title: copy.headline, subtitle: copy.subline, buttonLabel: null, targetUrl: null },
  { desktopImage: '/images/prototype/asset-06-8c61c443b385.jpg', mobileImage: '/images/prototype/asset-06-8c61c443b385.jpg', title: '一器一物　自有神韻', subtitle: '細賞木紋與工藝留下的溫度', buttonLabel: null, targetUrl: null },
  { desktopImage: '/images/prototype/asset-07-e8c6d7b20543.jpg', mobileImage: '/images/prototype/asset-07-e8c6d7b20543.jpg', title: '藝品入室　喜樂相隨', subtitle: '為日常留下一處安定的風景', buttonLabel: null, targetUrl: null },
]
const slides = computed(() => carousel.value?.length
  ? carousel.value.map(item => ({
      desktopImage: `${config.public.apiBaseUrl}/media/carousel/${item.desktopKey}`,
      mobileImage: `${config.public.apiBaseUrl}/media/carousel/${item.mobileKey}`,
      title: item.title || copy.headline,
      subtitle: item.subtitle || copy.subline,
      buttonLabel: item.buttonLabel,
      targetUrl: item.targetUrl,
    }))
  : fallbackSlides)
const currentSlide = computed(() => slides.value[slide.value] ?? slides.value[0]!)
const previous = () => { slide.value = (slide.value + slides.value.length - 1) % slides.value.length }
const next = () => { slide.value = (slide.value + 1) % slides.value.length }
</script>

<template>
  <section class="hero-section shell">
    <div class="hero-frame">
      <div class="hero-copy"><h1 style="white-space: pre-line">{{ currentSlide.title }}</h1><div class="ornament"><span />&#12336;<span /></div><p>{{ currentSlide.subtitle }}</p><NuxtLink v-if="currentSlide.buttonLabel && currentSlide.targetUrl" class="hero-cta" :to="currentSlide.targetUrl">{{ currentSlide.buttonLabel }}</NuxtLink></div>
      <picture class="hero-picture"><source media="(max-width: 760px)" :srcset="currentSlide.mobileImage"><img :src="currentSlide.desktopImage" :alt="currentSlide.title" width="1200" height="680"></picture>
      <button class="hero-arrow prev" type="button" aria-label="Previous" @click="previous">&#8592;</button>
      <button class="hero-arrow next" type="button" aria-label="Next" @click="next">&#8594;</button>
      <div class="cloud-line" aria-hidden="true" />
    </div>
    <div class="hero-dots"><button v-for="(_, i) in slides" :key="i" :class="{ active: slide === i }" :aria-label="`第 ${i + 1} 張輪播`" @click="slide = i" /></div>
  </section>
  <section class="section shell">
    <SectionTitle :title="copy.featured" />
    <div v-if="featured?.items.length" class="product-grid"><ProductCard v-for="product in featured.items" :key="product.id" :product="product" /></div>
    <p v-else class="empty-state">精選商品準備中，歡迎稍後再訪。</p>
    <div class="more-row"><NuxtLink class="gold-button" to="/products">{{ copy.more }}</NuxtLink></div>
  </section>
</template>
