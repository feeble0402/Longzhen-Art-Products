<script setup lang="ts">
import { ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElMessage, ElMessageBox, ElSwitch, ElTable, ElTableColumn, ElTag } from 'element-plus'

definePageMeta({ layout: 'admin', middleware: 'admin-auth-client' })
useHead({ title: '管理員｜龍振藝品' })
interface Admin { id:string; email:string; displayName:string; active:boolean; failedLoginCount:number; lockedUntil?:string|null; lastLoginAt?:string|null }
const api=useAdminApi();const auth=useAdminAuth();const admins=ref<Admin[]>([]);const loading=ref(false);const dialogOpen=ref(false);const resetOpen=ref(false);const resetId=ref('')
const form=reactive({email:'',displayName:'',password:'',active:true});const newPassword=ref('')
async function load(){loading.value=true;try{admins.value=await api.request<Admin[]>('/admin/admins')}finally{loading.value=false}}
function openCreate(){Object.assign(form,{email:'',displayName:'',password:'',active:true});dialogOpen.value=true}
async function create(){if(!form.email||!form.displayName||form.password.length<12){ElMessage.warning('請填妥資料，密碼至少 12 字元');return}await api.request('/admin/admins',{method:'POST',body:form});ElMessage.success('管理員已建立');dialogOpen.value=false;await load()}
async function toggle(admin:Admin){await ElMessageBox.confirm(`確定${admin.active?'停用':'啟用'}「${admin.displayName}」？`,'變更帳號狀態',{type:'warning'});await api.request(`/admin/admins/${admin.id}`,{method:'PATCH',body:{active:!admin.active}});await load()}
function openReset(admin:Admin){resetId.value=admin.id;newPassword.value='';resetOpen.value=true}
async function reset(){if(newPassword.value.length<12){ElMessage.warning('密碼至少 12 字元');return}await api.request(`/admin/admins/${resetId.value}/reset-password`,{method:'POST',body:{password:newPassword.value}});ElMessage.success('密碼已重設，該帳號既有 Token 已失效');resetOpen.value=false}
onMounted(()=>void load())
</script>

<template><section><div class="page-toolbar"><div><h1>管理員</h1><p>每位管理員應使用獨立帳號，不得共用密碼。</p></div><ElButton type="primary" @click="openCreate">新增管理員</ElButton></div><ElTable v-loading="loading" :data="admins" stripe><ElTableColumn prop="displayName" label="名稱"/><ElTableColumn prop="email" label="Email" min-width="210"/><ElTableColumn label="狀態" width="100"><template #default="{row}"><ElTag :type="row.active?'success':'info'">{{row.active?'啟用':'停用'}}</ElTag></template></ElTableColumn><ElTableColumn prop="failedLoginCount" label="失敗次數" width="100"/><ElTableColumn label="操作" width="210"><template #default="{row}"><ElButton link type="primary" @click="openReset(row as Admin)">重設密碼</ElButton><ElButton link :type="row.active?'danger':'success'" :disabled="row.id===auth.admin.value?.sub" @click="toggle(row as Admin)">{{row.active?'停用':'啟用'}}</ElButton></template></ElTableColumn></ElTable><ElDialog v-model="dialogOpen" title="新增管理員" width="min(520px,94vw)"><ElForm label-position="top"><ElFormItem label="顯示名稱"><ElInput v-model="form.displayName"/></ElFormItem><ElFormItem label="電子郵件"><ElInput v-model="form.email" type="email"/></ElFormItem><ElFormItem label="初始密碼"><ElInput v-model="form.password" type="password" show-password/></ElFormItem><ElSwitch v-model="form.active" active-text="立即啟用"/></ElForm><template #footer><ElButton @click="dialogOpen=false">取消</ElButton><ElButton type="primary" @click="create">建立</ElButton></template></ElDialog><ElDialog v-model="resetOpen" title="重設密碼" width="min(480px,94vw)"><ElInput v-model="newPassword" type="password" show-password placeholder="至少 12 字元"/><template #footer><ElButton @click="resetOpen=false">取消</ElButton><ElButton type="primary" @click="reset">確認重設</ElButton></template></ElDialog></section></template>

<style scoped>.page-toolbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}.page-toolbar h1{margin:0;color:#3b2a20;font-size:28px}.page-toolbar p{margin:3px 0 0;color:#7e7066}.page-toolbar .el-button{--el-color-primary:#5a3c28}</style>
