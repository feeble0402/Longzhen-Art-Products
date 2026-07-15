<script setup lang="ts">
import { ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElInputNumber, ElMessage, ElMessageBox, ElSwitch, ElTable, ElTableColumn } from 'element-plus'

definePageMeta({ layout: 'admin', middleware: 'admin-auth-client' })
useHead({ title: '分類管理｜龍振藝品' })
interface Category { id: string; name: string; slug: string; description?: string; sortOrder: number; active: boolean; _count: { products: number; children: number } }
const api = useAdminApi(); const categories = ref<Category[]>([]); const loading = ref(false); const dialogOpen = ref(false); const editingId = ref<string|null>(null)
const emptyForm=()=>({name:'',slug:'',description:'',sortOrder:0,active:true}); const form=reactive(emptyForm())
async function load(){loading.value=true;try{categories.value=await api.request<Category[]>('/admin/categories')}finally{loading.value=false}}
function create(){Object.assign(form,emptyForm());editingId.value=null;dialogOpen.value=true}
function edit(row:Category){Object.assign(form,{name:row.name,slug:row.slug,description:row.description??'',sortOrder:row.sortOrder,active:row.active});editingId.value=row.id;dialogOpen.value=true}
async function save(){if(!form.name||!form.slug){ElMessage.warning('請填寫分類名稱與網址代稱');return}const body={...form,description:form.description||undefined};if(editingId.value)await api.request(`/admin/categories/${editingId.value}`,{method:'PATCH',body});else await api.request('/admin/categories',{method:'POST',body});ElMessage.success('分類已儲存');dialogOpen.value=false;await load()}
async function remove(row:Category){await ElMessageBox.confirm(`確定刪除「${row.name}」？`,'刪除分類',{type:'warning'});await api.request(`/admin/categories/${row.id}`,{method:'DELETE'});ElMessage.success('分類已刪除');await load()}
onMounted(() => void load())
</script>

<template><section><div class="page-toolbar"><div><h1>分類管理</h1><p>分類仍有商品或子分類時無法刪除。</p></div><ElButton type="primary" @click="create">新增分類</ElButton></div><ElTable v-loading="loading" :data="categories" stripe><ElTableColumn prop="name" label="分類名稱"/><ElTableColumn prop="slug" label="網址代稱"/><ElTableColumn prop="sortOrder" label="排序" width="80"/><ElTableColumn label="商品數" width="90"><template #default="{row}">{{row._count.products}}</template></ElTableColumn><ElTableColumn label="啟用" width="80"><template #default="{row}">{{row.active?'是':'否'}}</template></ElTableColumn><ElTableColumn label="操作" width="150"><template #default="{row}"><ElButton link type="primary" @click="edit(row as Category)">編輯</ElButton><ElButton link type="danger" @click="remove(row as Category)">刪除</ElButton></template></ElTableColumn></ElTable><ElDialog v-model="dialogOpen" :title="editingId?'編輯分類':'新增分類'" width="min(520px,94vw)"><ElForm label-position="top"><ElFormItem label="分類名稱"><ElInput v-model="form.name"/></ElFormItem><ElFormItem label="網址代稱"><ElInput v-model="form.slug"/></ElFormItem><ElFormItem label="說明"><ElInput v-model="form.description" type="textarea"/></ElFormItem><ElFormItem label="排序"><ElInputNumber v-model="form.sortOrder" :min="0"/></ElFormItem><ElSwitch v-model="form.active" active-text="啟用"/></ElForm><template #footer><ElButton @click="dialogOpen=false">取消</ElButton><ElButton type="primary" @click="save">儲存</ElButton></template></ElDialog></section></template>

<style scoped>.page-toolbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}.page-toolbar h1{margin:0;color:#3b2a20;font-size:28px}.page-toolbar p{margin:3px 0 0;color:#7e7066}.page-toolbar .el-button{--el-color-primary:#5a3c28}</style>
