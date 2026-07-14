<script setup lang="ts">
import { copy } from '~/data/site'
const open = ref(false)
const links = [
  { to: '/about', label: copy.about },
  { to: '/products', label: copy.products },
  { to: '/faq', label: copy.faq },
  { to: '/contact', label: copy.contact },
]
</script>

<template>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="shell header-inner">
      <NuxtLink to="/" class="brand-mark" :aria-label="copy.brand">
        <img src="/images/prototype/asset-02-b870bef4a43d.png" alt="" width="56" height="56">
      </NuxtLink>
      <button class="menu-button" type="button" :aria-expanded="open" @click="open = !open">&#9776;</button>
      <nav class="main-nav" :class="{ open }" aria-label="Primary navigation">
        <NuxtLink v-for="link in links" :key="link.to" :to="link.to" @click="open = false">{{ link.label }}</NuxtLink>
      </nav>
    </div>
  </header>
  <main id="main"><slot /></main>
  <footer class="site-footer">
    <div class="shell footer-grid">
      <div><strong>{{ copy.brand }}</strong><p>{{ copy.headline }}</p></div>
      <div><p>LINE Official Account</p><p>Taichung, Taiwan</p></div>
    </div>
  </footer>
  <NuxtLink to="/contact" class="line-fab" :aria-label="copy.line">LINE</NuxtLink>
</template>
