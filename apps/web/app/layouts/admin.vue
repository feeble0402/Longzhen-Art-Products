<script setup lang="ts">
import {
  ElAside,
  ElButton,
  ElContainer,
  ElHeader,
  ElMain,
  ElMenu,
  ElMenuItem,
} from 'element-plus'
import 'element-plus/dist/index.css'

const route = useRoute()
const auth = useAdminAuth()
auth.restore()

async function logout() {
  auth.logout()
  await navigateTo('/admin/login')
}
</script>

<template>
  <ElContainer class="admin-shell">
    <ElAside width="228px" class="admin-sidebar">
      <div class="admin-brand">
        <strong>龍振藝品</strong>
        <span>內容管理後台</span>
      </div>
      <ElMenu :default-active="route.path" router class="admin-menu">
        <ElMenuItem index="/admin/products">商品管理</ElMenuItem>
        <ElMenuItem index="/admin/categories">分類管理</ElMenuItem>
        <ElMenuItem index="/admin/admins">管理員</ElMenuItem>
        <ElMenuItem index="/admin/audit">操作紀錄</ElMenuItem>
      </ElMenu>
    </ElAside>
    <ElContainer>
      <ElHeader class="admin-header">
        <div>
          <strong>{{ auth.admin.value?.displayName }}</strong>
          <span>{{ auth.admin.value?.email }}</span>
        </div>
        <ElButton plain @click="logout">登出</ElButton>
      </ElHeader>
      <ElMain class="admin-main"><slot /></ElMain>
    </ElContainer>
  </ElContainer>
</template>

<style scoped>
.admin-shell{min-height:100vh;background:#f6f2eb;font-family:"Noto Sans TC","Microsoft JhengHei",sans-serif}.admin-sidebar{position:fixed;inset:0 auto 0 0;z-index:20;color:#f2e8d8;background:#3b271b}.admin-brand{display:flex;height:112px;flex-direction:column;justify-content:center;padding:0 26px;border-bottom:1px solid rgb(255 255 255 / .1)}.admin-brand strong{font-size:22px;letter-spacing:.14em}.admin-brand span{margin-top:4px;color:#cba46f;font-size:13px}.admin-menu{border:0;background:transparent}.admin-menu :deep(.el-menu-item){color:#eadcc8}.admin-menu :deep(.el-menu-item:hover),.admin-menu :deep(.el-menu-item.is-active){color:#fff;background:#684a32}.admin-shell>.el-container{margin-left:228px}.admin-header{display:flex;height:72px;align-items:center;justify-content:space-between;border-bottom:1px solid #e1d8cc;background:white}.admin-header>div{display:flex;flex-direction:column}.admin-header span{color:#84776b;font-size:12px}.admin-main{padding:28px}@media(max-width:760px){.admin-sidebar{position:static;width:100%!important}.admin-shell{display:block}.admin-shell>.el-container{margin-left:0}.admin-menu{display:flex;overflow:auto}.admin-brand{height:76px}.admin-header{height:64px}.admin-main{padding:16px}}
</style>
