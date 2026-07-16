<script setup lang="ts">
import type { PublicProduct } from '~/types/product'

const route = useRoute()
const config = useRuntimeConfig()
const presentation = useProductPresentation()
const copied = ref(false)
const shared = ref(false)
const { data: product } = await useAsyncData(`product-${route.params.id}`, () =>
  $fetch<PublicProduct>(`${config.public.apiBaseUrl}/products/${encodeURIComponent(String(route.params.id))}`),
)
if (!product.value) throw createError({ statusCode: 404, statusMessage: '找不到商品' })
const selectedImageId = ref(presentation.primaryImage(product.value)?.id)
const selectedImage = computed(() => product.value?.images.find(image => image.id === selectedImageId.value) ?? product.value?.images[0])
const categoryNames = computed(() => product.value?.categories.map(item => item.category.name).join('、') ?? '')
const inquiryText = computed(() => product.value?.lineInquiryTemplate || `您好，我想詢問商品「${product.value?.name}」（商品編號：${product.value?.sku}），請問目前是否可購買？`)
const canPurchase = computed(() => product.value?.saleStatus === 'ON_SALE')
const specifications = computed(() => Object.entries(product.value?.specifications ?? {}))

useSeoMeta({
  title: () => product.value?.seoTitle || `${product.value?.name}｜龍振藝品`,
  description: () => product.value?.seoDescription || product.value?.shortDescription,
  ogTitle: () => product.value?.seoTitle || product.value?.name,
  ogDescription: () => product.value?.seoDescription || product.value?.shortDescription,
  ogImage: () => selectedImage.value ? presentation.imageUrl(selectedImage.value) || undefined : undefined,
})

const structuredData = computed(() => {
  const value: Record<string, unknown> = {
    '@context': 'https://schema.org', '@type': 'Product',
    name: product.value?.name, sku: product.value?.sku,
    description: product.value?.shortDescription,
    image: product.value?.images.map(image => presentation.imageUrl(image)),
  }
  if (product.value?.priceMode === 'PUBLIC_PRICE' && product.value.publicPrice !== undefined) {
    value.offers = {
      '@type': 'Offer', priceCurrency: 'TWD', price: product.value.publicPrice,
      availability: product.value.saleStatus === 'ON_SALE' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    }
  }
  return value
})
useHead({ script: [{ type: 'application/ld+json', innerHTML: () => JSON.stringify(structuredData.value).replaceAll('<', '\\u003c') }] })

async function copyInquiry() {
  try {
    await navigator.clipboard.writeText(inquiryText.value)
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = inquiryText.value
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    textarea.remove()
  }
  copied.value = true
  window.setTimeout(() => { copied.value = false }, 2000)
}

async function shareProduct() {
  const shareData = { title: product.value?.name, text: product.value?.shortDescription, url: window.location.href }
  if (navigator.share) await navigator.share(shareData)
  else await navigator.clipboard.writeText(window.location.href)
  shared.value = true
  window.setTimeout(() => { shared.value = false }, 2000)
}
</script>

<template>
  <section v-if="product" class="section shell">
    <NuxtLink class="back-link" to="/products">&#8592; 返回商品列表</NuxtLink>
    <div class="detail-grid detail-top">
      <div class="product-gallery">
        <div class="gallery-main"><img v-if="selectedImage" :src="presentation.imageUrl(selectedImage)!" :alt="selectedImage.altText || product.name" :width="selectedImage.width" :height="selectedImage.height"><span v-else>圖片準備中</span></div>
        <div v-if="product.images.length > 1" class="gallery-thumbs"><button v-for="image in product.images" :key="image.id" :class="{ active: image.id === selectedImage?.id }" @click="selectedImageId = image.id"><img :src="presentation.imageUrl(image)!" :alt="image.altText" loading="lazy"></button></div>
      </div>
      <div>
        <p class="kicker">{{ categoryNames }} / {{ product.sku }}</p>
        <h1>{{ product.name }}</h1>
        <p class="product-sale-status">{{ presentation.statusLabel(product) }}</p>
        <p class="detail-price">{{ presentation.priceLabel(product) }}</p>
        <p v-if="product.priceMode==='PUBLIC_PRICE' && product.originalPrice" class="original-price">原價 NT$ {{ Number(product.originalPrice).toLocaleString('zh-TW') }}</p>
        <div v-if="product.tags.length" class="product-tags"><span v-for="item in product.tags" :key="item.tag.id"># {{ item.tag.name }}</span></div>
        <p class="detail-copy">{{ product.shortDescription }}</p>
        <div v-if="canPurchase" class="product-actions">
          <a v-if="product.acceptsShopee && product.shopeeUrl" class="gold-button" :href="product.shopeeUrl" target="_blank" rel="noopener noreferrer">前往蝦皮</a>
          <button v-if="product.acceptsLine" class="gold-button secondary" type="button" @click="copyInquiry">{{ copied ? '詢問文字已複製' : '複製 LINE 詢問文字' }}</button>
          <NuxtLink v-if="product.acceptsLine" class="text-action" to="/contact">前往 LINE 聯絡方式</NuxtLink>
        </div>
        <p v-else class="purchase-disabled">此商品目前無法購買，歡迎瀏覽其他作品。</p>
        <button class="share-button" type="button" @click="shareProduct">{{ shared ? '商品連結已複製' : '分享商品' }}</button>
      </div>
    </div>
    <article class="product-description"><h2>作品介紹</h2><p>{{ product.description }}</p><template v-if="specifications.length"><h2>商品規格</h2><dl class="specification-list"><template v-for="([name,value]) in specifications" :key="name"><dt>{{ name }}</dt><dd>{{ value }}</dd></template></dl></template><template v-if="product.notices"><h2>收藏須知</h2><p>{{ product.notices }}</p></template></article>
    <section v-if="product.relatedProducts?.length" class="related-products"><div class="section-title"><span /><h2>推薦作品</h2><span /></div><div class="product-grid"><ProductCard v-for="item in product.relatedProducts" :key="item.id" :product="item" /></div></section>
  </section>
</template>
