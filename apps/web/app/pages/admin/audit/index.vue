<script setup lang="ts">
import { ElPagination, ElTable, ElTableColumn, ElTag } from 'element-plus'

definePageMeta({ layout: 'admin', middleware: 'admin-auth-client' })
useHead({ title: '操作紀錄｜龍振藝品' })
interface AuditLog { id:string; action:string; entityType:string; entityId?:string; ipAddress?:string; createdAt:string; admin?:{displayName:string;email:string}|null }
interface AuditPage {items:AuditLog[];total:number;page:number;pageSize:number}
const api=useAdminApi();const logs=ref<AuditLog[]>([]);const total=ref(0);const page=ref(1);const loading=ref(false)
async function load(){loading.value=true;try{const result=await api.request<AuditPage>(`/admin/audit-logs?page=${page.value}&pageSize=20`);logs.value=result.items;total.value=result.total}finally{loading.value=false}}
function date(value:string){return new Intl.DateTimeFormat('zh-TW',{dateStyle:'medium',timeStyle:'medium'}).format(new Date(value))}
onMounted(()=>void load())
</script>

<template><section><div class="page-heading"><h1>操作紀錄</h1><p>登入與管理端重要寫入操作的稽核軌跡。</p></div><ElTable v-loading="loading" :data="logs" stripe><ElTableColumn label="時間" width="180"><template #default="{row}">{{date(row.createdAt)}}</template></ElTableColumn><ElTableColumn label="管理員" min-width="180"><template #default="{row}">{{row.admin?.displayName||'未知'}}<small>{{row.admin?.email}}</small></template></ElTableColumn><ElTableColumn label="動作" width="120"><template #default="{row}"><ElTag>{{row.action}}</ElTag></template></ElTableColumn><ElTableColumn prop="entityType" label="資源" width="130"/><ElTableColumn prop="entityId" label="資源 ID" min-width="220"/><ElTableColumn prop="ipAddress" label="IP" width="130"/></ElTable><ElPagination v-model:current-page="page" layout="total, prev, pager, next" :total="total" :page-size="20" class="pager" @current-change="load"/></section></template>

<style scoped>.page-heading{margin-bottom:24px}.page-heading h1{margin:0;color:#3b2a20;font-size:28px}.page-heading p{margin:3px 0 0;color:#7e7066}.el-table small{display:block;color:#8c8076}.pager{justify-content:flex-end;margin-top:22px}</style>
