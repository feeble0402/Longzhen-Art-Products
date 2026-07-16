<script setup lang="ts">
import { copy } from '~/data/site'
import type { PublicCategory, PublicProductPage } from '~/types/product'

const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
type ProductSort = 'newest' | 'priceAsc' | 'priceDesc'
const allowedSorts: ProductSort[] = ['newest', 'priceAsc', 'priceDesc']
const routeSort = typeof route.query.sort === 'string' ? route.query.sort : 'newest'
const routeCategory = typeof route.query.category === 'string' ? route.query.category : ''
const query = ref(typeof route.query.q === 'string' ? route.query.q : '')
const categoryId = ref(/^[0-9a-f-]{36}$/i.test(routeCategory) ? routeCategory : '')
const sort = ref<ProductSort>(allowedSorts.includes(routeSort as ProductSort) ? routeSort as ProductSort : 'newest')
const page = ref(Math.max(1, Number(route.query.page) || 1))

const { data: categories } = await useAsyncData('public-categories', () =>
  $fetch<PublicCategory[]>(`${config.public.apiBaseUrl}/categories`),
)
const productKey = computed(() => `products-${query.value}-${categoryId.value}-${sort.value}-${page.value}`)
const { data: result, status } = await useAsyncData(
  productKey,
  () => $fetch<PublicProductPage>(`${config.public.apiBaseUrl}/products`, {
    query: {
      page: page.value,
      pageSize: 12,
      search: query.value || undefined,
      categoryId: categoryId.value || undefined,
      sort: sort.value,
    },
  }),
  { watch: [query, categoryId, sort, page] },
)

watch([query, categoryId, sort], () => { page.value = 1 })
watch([query, categoryId, sort, page], () => {
  void router.replace({ query: {
    q: query.value || undefined,
    category: categoryId.value || undefined,
    sort: sort.value === 'newest' ? undefined : sort.value,
    page: page.value > 1 ? String(page.value) : undefined,
  } })
})
</script>

<template>
  <section class="page-hero"><div class="shell"><p>COLLECTION</p><h1>{{ copy.products }}</h1></div></section>
  <section class="section shell">
    <div class="catalog-tools">
      <label class="search-box"><span>搜尋</span><input v-model.trim="query" type="search" placeholder="搜尋商品名稱或編號"></label>
      <label><span>分類</span><select v-model="categoryId"><option value="">全部分類</option><option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option></select></label>
      <label><span>排序</span><select v-model="sort"><option value="newest">最新上架</option><option value="priceAsc">價格低至高</option><option value="priceDesc">價格高至低</option></select></label>
    </div>
    <p v-if="status === 'pending'" class="empty-state">商品載入中…</p>
    <div v-else-if="result?.items.length" class="product-grid"><ProductCard v-for="product in result.items" :key="product.id" :product="product" /></div>
    <p v-else class="empty-state">目前沒有符合條件的商品。</p>
    <nav v-if="result && result.totalPages > 1" class="catalog-pagination" aria-label="商品分頁">
      <button :disabled="page <= 1" @click="page--">上一頁</button><span>第 {{ page }}／{{ result.totalPages }} 頁</span><button :disabled="page >= result.totalPages" @click="page++">下一頁</button>
    </nav>
  </section>
</template>
