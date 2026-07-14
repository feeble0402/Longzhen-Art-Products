<script setup lang="ts">
import { copy } from '~/data/site'
const faqs = [
  ['\u70ba\u4ec0\u9ebc\u90e8\u5206\u5546\u54c1\u6c92\u6709\u516c\u958b\u50f9\u683c\uff1f', '\u90e8\u5206\u73cd\u7a00\u6728\u6599\u6216\u55ae\u4ef6\u6536\u85cf\u6703\u63a1 LINE \u6d3d\u8a62\u65b9\u5f0f\u3002'],
  ['\u5546\u54c1\u5716\u7247\u8207\u5be6\u54c1\u6703\u5b8c\u5168\u76f8\u540c\u55ce\uff1f', '\u5929\u7136\u6728\u7d0b\u8207\u8272\u6fa4\u5177\u6709\u500b\u9ad4\u5dee\u7570\uff0c\u78ba\u8a8d\u524d\u53ef\u5411\u5c08\u4eba\u7d22\u53d6\u66f4\u591a\u5be6\u62cd\u3002'],
  ['\u53ef\u4ee5\u900f\u904e LINE \u8a62\u554f\u55ce\uff1f', '\u53ef\u4ee5\uff0c\u8acb\u50b3\u9001\u5546\u54c1\u9023\u7d50\u8207\u5546\u54c1\u7de8\u865f\u3002'],
]
</script>
<template><section class="page-hero"><div class="shell"><p>FAQ</p><h1>{{ copy.faq }}</h1></div></section><section class="section narrow"><details v-for="(item, i) in faqs" :key="i" :open="i === 0"><summary>{{ item[0] }}</summary><p>{{ item[1] }}</p></details></section></template>
