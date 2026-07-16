<script setup lang="ts">
import {
  ElButton, ElDialog, ElForm, ElFormItem, ElImage, ElInput, ElInputNumber,
  ElMessage, ElMessageBox, ElSwitch, ElTable, ElTableColumn, ElTag, ElUpload,
} from 'element-plus'
import type { UploadUserFile } from 'element-plus'

definePageMeta({ layout: 'admin', middleware: 'admin-auth-client' })
useHead({ title: '首頁輪播管理｜龍振藝品' })

interface CarouselSlide {
  id: string
  desktopKey: string
  mobileKey: string
  title?: string | null
  subtitle?: string | null
  buttonLabel?: string | null
  targetUrl?: string | null
  sortOrder: number
  active: boolean
  startsAt?: string | null
  endsAt?: string | null
}

const api = useAdminApi()
const config = useRuntimeConfig()
const loading = ref(false)
const saving = ref(false)
const slides = ref<CarouselSlide[]>([])
const dialogOpen = ref(false)
const editing = ref<CarouselSlide | null>(null)
const desktopFiles = ref<UploadUserFile[]>([])
const mobileFiles = ref<UploadUserFile[]>([])

const emptyForm = () => ({
  title: '', subtitle: '', buttonLabel: '', targetUrl: '', sortOrder: 0,
  active: true, startsAt: '', endsAt: '',
})
const form = reactive(emptyForm())

function imageUrl(key: string) { return `${config.public.apiBaseUrl}/media/carousel/${key}` }
function localDateTime(value?: string | null) {
  if (!value) return ''
  const date = new Date(value)
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}
function resetForm() {
  Object.assign(form, emptyForm())
  editing.value = null
  desktopFiles.value = []
  mobileFiles.value = []
}

async function load() {
  loading.value = true
  try { slides.value = await api.request<CarouselSlide[]>('/admin/carousel-slides') }
  finally { loading.value = false }
}

function openCreate() { resetForm(); dialogOpen.value = true }
function openEdit(slide: CarouselSlide) {
  resetForm()
  editing.value = slide
  Object.assign(form, {
    title: slide.title ?? '', subtitle: slide.subtitle ?? '',
    buttonLabel: slide.buttonLabel ?? '', targetUrl: slide.targetUrl ?? '',
    sortOrder: slide.sortOrder, active: slide.active,
    startsAt: localDateTime(slide.startsAt), endsAt: localDateTime(slide.endsAt),
  })
  dialogOpen.value = true
}

async function save() {
  const desktop = desktopFiles.value[0]?.raw
  const mobile = mobileFiles.value[0]?.raw
  if (!editing.value && (!desktop || !mobile)) {
    ElMessage.warning('新增輪播時必須同時上傳桌機版與手機版圖片')
    return
  }
  if (form.startsAt && form.endsAt && new Date(form.startsAt) >= new Date(form.endsAt)) {
    ElMessage.warning('結束時間必須晚於開始時間')
    return
  }
  saving.value = true
  try {
    const body = new FormData()
    body.append('title', form.title)
    body.append('subtitle', form.subtitle)
    body.append('buttonLabel', form.buttonLabel)
    body.append('targetUrl', form.targetUrl)
    body.append('sortOrder', String(form.sortOrder))
    body.append('active', String(form.active))
    body.append('startsAt', form.startsAt ? new Date(form.startsAt).toISOString() : '')
    body.append('endsAt', form.endsAt ? new Date(form.endsAt).toISOString() : '')
    if (desktop) body.append('desktopImage', desktop)
    if (mobile) body.append('mobileImage', mobile)
    const path = editing.value ? `/admin/carousel-slides/${editing.value.id}` : '/admin/carousel-slides'
    await api.request(path, { method: editing.value ? 'PATCH' : 'POST', body })
    ElMessage.success(editing.value ? '輪播已更新' : '輪播已建立')
    dialogOpen.value = false
    await load()
  } finally { saving.value = false }
}

async function remove(slide: CarouselSlide) {
  await ElMessageBox.confirm(`確定刪除「${slide.title || '未命名輪播'}」？`, '刪除輪播', { type: 'warning' })
  await api.request(`/admin/carousel-slides/${slide.id}`, { method: 'DELETE' })
  ElMessage.success('輪播已刪除')
  await load()
}

onMounted(() => void load())
</script>

<template>
  <section>
    <div class="page-toolbar"><div><h1>首頁輪播管理</h1><p>分別設定桌機與手機圖片、顯示順序及排程。</p></div><ElButton type="primary" @click="openCreate">新增輪播</ElButton></div>
    <ElTable v-loading="loading" :data="slides" stripe row-key="id">
      <ElTableColumn label="桌機圖片" width="150"><template #default="{ row }"><ElImage :src="imageUrl(row.desktopKey)" fit="cover" class="slide-thumb" /></template></ElTableColumn>
      <ElTableColumn prop="title" label="標題" min-width="190"><template #default="{ row }">{{ row.title || '未設定標題' }}</template></ElTableColumn>
      <ElTableColumn prop="sortOrder" label="排序" width="80" />
      <ElTableColumn label="狀態" width="100"><template #default="{ row }"><ElTag :type="row.active ? 'success' : 'info'">{{ row.active ? '啟用' : '停用' }}</ElTag></template></ElTableColumn>
      <ElTableColumn label="顯示期間" min-width="220"><template #default="{ row }">{{ row.startsAt ? new Date(row.startsAt).toLocaleString('zh-TW') : '立即' }} ～ {{ row.endsAt ? new Date(row.endsAt).toLocaleString('zh-TW') : '不限期' }}</template></ElTableColumn>
      <ElTableColumn label="操作" width="150" fixed="right"><template #default="{ row }"><ElButton link type="primary" @click="openEdit(row as CarouselSlide)">編輯</ElButton><ElButton link type="danger" @click="remove(row as CarouselSlide)">刪除</ElButton></template></ElTableColumn>
    </ElTable>

    <ElDialog v-model="dialogOpen" :title="editing ? '編輯輪播' : '新增輪播'" width="min(760px, 94vw)" destroy-on-close>
      <ElForm label-position="top">
        <ElFormItem label="標題"><ElInput v-model="form.title" maxlength="200" show-word-limit /></ElFormItem>
        <ElFormItem label="副標題"><ElInput v-model="form.subtitle" maxlength="300" show-word-limit /></ElFormItem>
        <div class="form-grid"><ElFormItem label="按鈕文字"><ElInput v-model="form.buttonLabel" placeholder="例如：瀏覽商品" /></ElFormItem><ElFormItem label="按鈕連結"><ElInput v-model="form.targetUrl" placeholder="/products 或 https://..." /></ElFormItem></div>
        <div class="form-grid"><ElFormItem label="排序"><ElInputNumber v-model="form.sortOrder" :min="0" /></ElFormItem><ElFormItem label="顯示狀態"><ElSwitch v-model="form.active" active-text="啟用" inactive-text="停用" /></ElFormItem></div>
        <div class="form-grid"><ElFormItem label="開始時間（選填）"><ElInput v-model="form.startsAt" type="datetime-local" /></ElFormItem><ElFormItem label="結束時間（選填）"><ElInput v-model="form.endsAt" type="datetime-local" /></ElFormItem></div>
        <div v-if="editing" class="current-images"><div><span>目前桌機圖片</span><ElImage :src="imageUrl(editing.desktopKey)" fit="cover" /></div><div><span>目前手機圖片</span><ElImage :src="imageUrl(editing.mobileKey)" fit="cover" /></div></div>
        <div class="form-grid"><ElFormItem :label="editing ? '更換桌機圖片（選填）' : '桌機圖片'"><ElUpload v-model:file-list="desktopFiles" action="#" :auto-upload="false" :limit="1" accept="image/jpeg,image/png,image/webp" list-type="picture-card"><span class="upload-plus">＋</span></ElUpload></ElFormItem><ElFormItem :label="editing ? '更換手機圖片（選填）' : '手機圖片'"><ElUpload v-model:file-list="mobileFiles" action="#" :auto-upload="false" :limit="1" accept="image/jpeg,image/png,image/webp" list-type="picture-card"><span class="upload-plus">＋</span></ElUpload></ElFormItem></div>
      </ElForm>
      <template #footer><ElButton @click="dialogOpen=false">取消</ElButton><ElButton type="primary" :loading="saving" @click="save">儲存</ElButton></template>
    </ElDialog>
  </section>
</template>

<style scoped>
.page-toolbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}.page-toolbar h1{margin:0;color:#3b2a20;font-size:28px}.page-toolbar p{margin:3px 0 0;color:#7e7066}.page-toolbar .el-button{--el-color-primary:#5a3c28}.slide-thumb{width:120px;height:68px;border-radius:6px}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}.current-images{display:grid;grid-template-columns:1.5fr 1fr;gap:18px;margin-bottom:20px}.current-images>div{display:grid;gap:6px;color:#6f6258;font-size:13px}.current-images .el-image{width:100%;height:150px;border-radius:6px}.upload-plus{font-size:30px;color:#8a7768}@media(max-width:700px){.form-grid,.current-images{grid-template-columns:1fr}.page-toolbar{align-items:flex-start;gap:12px}}
</style>
