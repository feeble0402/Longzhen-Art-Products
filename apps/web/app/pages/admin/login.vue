<script setup lang="ts">
import { ElAlert, ElButton, ElCard, ElForm, ElFormItem, ElInput } from 'element-plus'
import 'element-plus/dist/index.css'

definePageMeta({ layout: false, middleware: 'admin-auth-client' })
useHead({ title: '管理員登入｜龍振藝品' })

const auth = useAdminAuth()
const form = reactive({ email: '', password: '' })
const loading = ref(false)
const errorMessage = ref('')

async function submit() {
  errorMessage.value = ''
  loading.value = true
  try {
    await auth.login(form.email, form.password)
    await navigateTo('/admin/products')
  } catch (error: unknown) {
    errorMessage.value = (error as { data?: { message?: string } }).data?.message ?? '登入失敗，請確認帳號密碼'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="login-page">
    <ElCard class="login-card" shadow="always">
      <div class="login-heading">
        <span>LONGZHEN ADMIN</span>
        <h1>龍振藝品管理後台</h1>
        <p>請使用獨立管理員帳號登入</p>
      </div>
      <ElAlert v-if="errorMessage" :title="errorMessage" type="error" :closable="false" show-icon />
      <ElForm label-position="top" @submit.prevent="submit">
        <ElFormItem label="電子郵件">
          <ElInput v-model="form.email" type="email" autocomplete="username" size="large" />
        </ElFormItem>
        <ElFormItem label="密碼">
          <ElInput v-model="form.password" type="password" autocomplete="current-password" show-password size="large" @keyup.enter="submit" />
        </ElFormItem>
        <ElButton type="primary" size="large" :loading="loading" class="login-submit" @click="submit">登入</ElButton>
      </ElForm>
    </ElCard>
  </main>
</template>

<style scoped>
.login-page{display:grid;min-height:100vh;place-items:center;padding:24px;background:radial-gradient(circle at 20% 10%,rgb(182 129 66 / .28),transparent 35%),linear-gradient(135deg,#2d1d14,#5a3c28)}.login-card{width:min(440px,100%);border:0;border-radius:16px}.login-card :deep(.el-card__body){padding:42px}.login-heading{text-align:center;margin-bottom:28px}.login-heading span{color:#b68142;font-size:12px;font-weight:700;letter-spacing:.25em}.login-heading h1{margin:8px 0;color:#3d2a1f;font-size:27px}.login-heading p{margin:0;color:#88776b}.login-card .el-alert{margin-bottom:20px}.login-submit{width:100%;margin-top:8px;--el-color-primary:#5a3c28;--el-color-primary-light-3:#806451;--el-color-primary-dark-2:#3f2a1c}@media(max-width:520px){.login-card :deep(.el-card__body){padding:30px 22px}}
</style>
