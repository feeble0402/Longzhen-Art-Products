<script setup lang="ts">
import {
  ElButton, ElDialog, ElForm, ElFormItem, ElImage, ElInput, ElInputNumber,
  ElMessage, ElMessageBox, ElOption, ElPagination, ElSelect, ElSwitch,
  ElTable, ElTableColumn, ElTag, ElUpload,
} from 'element-plus'
import type { UploadUserFile } from 'element-plus'

definePageMeta({ layout: 'admin', middleware: 'admin-auth-client' })
useHead({ title: '商品管理｜龍振藝品' })

interface Category { id: string; name: string }
interface ProductImage { id: string; objectKey: string; altText: string; isPrimary: boolean; sortOrder: number }
interface Product {
  id: string; sku: string; slug: string; name: string; shortDescription: string
  description: string; priceMode: string; saleStatus: string; salePrice?: string | number | null
  acceptsLine: boolean; acceptsShopee: boolean; shopeeUrl?: string | null
  categories: Array<{ categoryId: string; category: Category }>; images: ProductImage[]
}
interface ProductPage { items: Product[]; total: number; page: number; pageSize: number }

const api = useAdminApi()
const config = useRuntimeConfig()
const loading = ref(false)
const saving = ref(false)
const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const search = ref('')
const dialogOpen = ref(false)
const editingId = ref<string | null>(null)
const files = ref<UploadUserFile[]>([])

const emptyForm = () => ({
  sku: '', slug: '', name: '', shortDescription: '', description: '', categoryIds: [] as string[],
  priceMode: 'LINE_OFFER', publicPrice: '', saleStatus: 'DRAFT', acceptsLine: true,
  acceptsShopee: false, shopeeUrl: '', showOnHome: false, isNew: false,
  isFeatured: false, isBestSeller: false, homeSortOrder: 0,
})
const form = reactive(emptyForm())

function imageUrl(key: string) { return `${config.public.apiBaseUrl}/media/products/${key}` }
function resetForm() { Object.assign(form, emptyForm()); editingId.value = null; files.value = [] }

async function load() {
  loading.value = true
  try {
    const [productPage, categoryList] = await Promise.all([
      api.request<ProductPage>(`/admin/products?page=${page.value}&pageSize=${pageSize.value}&search=${encodeURIComponent(search.value)}`),
      api.request<Category[]>('/admin/categories'),
    ])
    products.value = productPage.items
    total.value = productPage.total
    categories.value = categoryList
  } finally { loading.value = false }
}

function openCreate() { resetForm(); dialogOpen.value = true }
function openEdit(product: Product) {
  resetForm(); editingId.value = product.id
  Object.assign(form, {
    sku: product.sku, slug: product.slug, name: product.name,
    shortDescription: product.shortDescription, description: product.description,
    categoryIds: product.categories.map(item => item.categoryId), priceMode: product.priceMode,
    publicPrice: product.salePrice?.toString() ?? '', saleStatus: product.saleStatus,
    acceptsLine: product.acceptsLine, acceptsShopee: product.acceptsShopee,
    shopeeUrl: product.shopeeUrl ?? '',
  })
  dialogOpen.value = true
}

async function save() {
  if (!form.name || !form.sku || !form.slug || !form.categoryIds.length || !form.description || !form.shortDescription) {
    ElMessage.warning('請完成商品名稱、編號、網址代稱、分類與說明')
    return
  }
  if (form.priceMode === 'PUBLIC_PRICE' && !form.publicPrice) {
    ElMessage.warning('公開價格商品必須填寫價格')
    return
  }
  saving.value = true
  try {
    const payload = {
      ...form,
      publicPrice: form.publicPrice || undefined,
      shopeeUrl: form.shopeeUrl || undefined,
    }
    const product = editingId.value
      ? await api.request<Product>(`/admin/products/${editingId.value}`, { method: 'PATCH', body: payload })
      : await api.request<Product>('/admin/products', { method: 'POST', body: payload })
    const pendingFiles = files.value.flatMap(file => file.raw ? [file.raw] : [])
    if (pendingFiles.length) {
      const body = new FormData()
      pendingFiles.forEach((file) => { body.append('images', file); body.append('altTexts', form.name) })
      await api.request(`/admin/products/${product.id}/images`, { method: 'POST', body })
    }
    ElMessage.success(editingId.value ? '商品已更新' : '商品已建立')
    dialogOpen.value = false
    await load()
  } finally { saving.value = false }
}

async function remove(product: Product) {
  await ElMessageBox.confirm(`確定刪除「${product.name}」？圖片也會一併刪除。`, '刪除商品', { type: 'warning' })
  await api.request(`/admin/products/${product.id}`, { method: 'DELETE' })
  ElMessage.success('商品已刪除')
  await load()
}

async function removeImage(product: Product, image: ProductImage) {
  await ElMessageBox.confirm('確定刪除這張圖片？', '刪除圖片', { type: 'warning' })
  await api.request(`/admin/products/${product.id}/images/${image.id}`, { method: 'DELETE' })
  await load()
}

async function setPrimary(product: Product, image: ProductImage) {
  await api.request(`/admin/products/${product.id}/images/${image.id}/primary`, { method: 'PATCH' })
  ElMessage.success('主圖已更新')
  await load()
}

onMounted(() => void load())
</script>

<template>
  <section>
    <div class="page-toolbar">
      <div><h1>商品管理</h1><p>管理商品內容、狀態、分類與多張圖片。</p></div>
      <ElButton type="primary" @click="openCreate">新增商品</ElButton>
    </div>
    <div class="filter-row">
      <ElInput v-model="search" clearable placeholder="搜尋商品名稱或編號" @keyup.enter="page=1;load()" />
      <ElButton @click="page=1;load()">搜尋</ElButton>
    </div>
    <ElTable v-loading="loading" :data="products" stripe row-key="id">
      <ElTableColumn label="圖片" width="92">
        <template #default="{ row }"><ElImage v-if="row.images[0]" :src="imageUrl(row.images.find((item: ProductImage)=>item.isPrimary)?.objectKey || row.images[0].objectKey)" fit="cover" class="thumb" /><span v-else>無圖片</span></template>
      </ElTableColumn>
      <ElTableColumn prop="sku" label="商品編號" width="130" />
      <ElTableColumn prop="name" label="商品名稱" min-width="190" />
      <ElTableColumn label="狀態" width="110"><template #default="{ row }"><ElTag>{{ row.saleStatus }}</ElTag></template></ElTableColumn>
      <ElTableColumn label="圖片數" width="82"><template #default="{ row }">{{ row.images.length }}</template></ElTableColumn>
      <ElTableColumn label="操作" width="210" fixed="right"><template #default="{ row }"><ElButton link type="primary" @click="openEdit(row as Product)">編輯</ElButton><ElButton link type="danger" @click="remove(row as Product)">刪除</ElButton></template></ElTableColumn>
      <ElTableColumn type="expand">
        <template #default="{ row }"><div class="image-strip"><div v-for="image in row.images" :key="image.id" class="image-item"><ElImage :src="imageUrl(image.objectKey)" fit="cover" /><ElTag v-if="image.isPrimary" size="small">主圖</ElTag><div><ElButton link type="primary" :disabled="image.isPrimary" @click="setPrimary(row as Product,image)">設主圖</ElButton><ElButton link type="danger" @click="removeImage(row as Product,image)">刪除</ElButton></div></div></div></template>
      </ElTableColumn>
    </ElTable>
    <ElPagination v-model:current-page="page" v-model:page-size="pageSize" layout="total, prev, pager, next" :total="total" class="pager" @current-change="load" />

    <ElDialog v-model="dialogOpen" :title="editingId ? '編輯商品' : '新增商品'" width="min(760px, 94vw)" destroy-on-close>
      <ElForm label-position="top" class="product-form">
        <div class="form-grid"><ElFormItem label="商品名稱"><ElInput v-model="form.name" /></ElFormItem><ElFormItem label="商品編號"><ElInput v-model="form.sku" /></ElFormItem></div>
        <ElFormItem label="網址代稱（英文小寫與連字號）"><ElInput v-model="form.slug" /></ElFormItem>
        <ElFormItem label="商品分類"><ElSelect v-model="form.categoryIds" multiple filterable class="full"><ElOption v-for="category in categories" :key="category.id" :label="category.name" :value="category.id" /></ElSelect></ElFormItem>
        <ElFormItem label="商品簡介"><ElInput v-model="form.shortDescription" maxlength="500" show-word-limit /></ElFormItem>
        <ElFormItem label="詳細說明"><ElInput v-model="form.description" type="textarea" :rows="5" /></ElFormItem>
        <div class="form-grid"><ElFormItem label="價格模式"><ElSelect v-model="form.priceMode" class="full"><ElOption label="公開價格" value="PUBLIC_PRICE" /><ElOption label="LINE 詢價" value="LINE_OFFER" /><ElOption label="聯絡詢價" value="CONTACT_PRICE" /></ElSelect></ElFormItem><ElFormItem v-if="form.priceMode==='PUBLIC_PRICE'" label="公開價格"><ElInput v-model="form.publicPrice" inputmode="decimal" /></ElFormItem></div>
        <div class="form-grid"><ElFormItem label="銷售狀態"><ElSelect v-model="form.saleStatus" class="full"><ElOption v-for="status in ['DRAFT','ON_SALE','SOLD_OUT','PAUSED','UNLISTED']" :key="status" :label="status" :value="status" /></ElSelect></ElFormItem><ElFormItem label="首頁排序"><ElInputNumber v-model="form.homeSortOrder" :min="0" /></ElFormItem></div>
        <div class="switches"><ElSwitch v-model="form.acceptsLine" active-text="接受 LINE 詢問" /><ElSwitch v-model="form.acceptsShopee" active-text="啟用蝦皮連結" /><ElSwitch v-model="form.showOnHome" active-text="首頁顯示" /></div>
        <ElFormItem v-if="form.acceptsShopee" label="蝦皮商品網址"><ElInput v-model="form.shopeeUrl" /></ElFormItem>
        <ElFormItem label="新增圖片（一次最多 10 張）"><ElUpload v-model:file-list="files" action="#" multiple :auto-upload="false" accept="image/jpeg,image/png,image/webp" :limit="10" list-type="picture-card"><span class="upload-plus">＋</span></ElUpload></ElFormItem>
      </ElForm>
      <template #footer><ElButton @click="dialogOpen=false">取消</ElButton><ElButton type="primary" :loading="saving" @click="save">儲存</ElButton></template>
    </ElDialog>
  </section>
</template>

<style scoped>
.page-toolbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}.page-toolbar h1{margin:0;color:#3b2a20;font-size:28px}.page-toolbar p{margin:3px 0 0;color:#7e7066}.page-toolbar .el-button{--el-color-primary:#5a3c28}.filter-row{display:flex;gap:10px;max-width:460px;margin-bottom:18px}.thumb{width:60px;height:60px;border-radius:6px}.pager{justify-content:flex-end;margin-top:22px}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}.full{width:100%}.switches{display:flex;gap:24px;flex-wrap:wrap;margin-bottom:20px}.image-strip{display:flex;gap:14px;flex-wrap:wrap;padding:16px}.image-item{width:140px}.image-item>.el-image{width:140px;height:110px;border-radius:6px}.image-item>.el-tag{display:block;width:max-content;margin-top:5px}.upload-plus{font-size:30px;color:#8a7768}@media(max-width:700px){.form-grid{grid-template-columns:1fr}.page-toolbar{align-items:flex-start;gap:12px}.filter-row{max-width:none}}
</style>
