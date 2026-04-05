<template>
  <!-- 顶部导航栏 -->
  <header class="sticky top-0 p-3 bg-white pointer-events-auto z-50 border-b-2 border-gray-100">
    <div class="flex justify-between max-w-7xl mx-auto items-center">
      <a :href="withBase('/')" class="text-2xl font-bold">Postscript</a>
      <nav class="flex">
        <a :href="withBase('/')" class="px-4">首页</a>
        <a :href="withBase('/archive')" class="px-4">归档</a>
        <a :href="withBase('/about')" class="px-4">关于作者</a>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { withBase } from "vitepress";
</script>

<style scoped></style>
