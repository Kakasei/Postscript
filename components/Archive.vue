<script setup>
import { computed } from 'vue'
// 在 Vite 特性中，即使文件叫 .data.ts，引用时通常写 .data，这里为了稳妥写带后缀 ts
import { data as posts } from '../archive.data.ts'

// 将文章按年份分组，形成一个 { 2026: [...], 2025: [...] } 的结构
const groupedPosts = computed(() => {
  const groups = {}
  posts.forEach(post => {
    // 假设 date 格式为 2026/03/15，取前四个字符为年份
    const year = post.date === 'Unknown' ? 'Older' : post.date.substring(0, 4)
    if (!groups[year]) {
      groups[year] = []
    }
    groups[year].push(post)
  })
  
  // 将键按从大到小排序
  return Object.keys(groups)
    .sort((a, b) => b - a)
    .map(year => ({
      year,
      posts: groups[year]
    }))
})
</script>

<template>
  <div class="max-w-3xl mx-auto py-16 px-6">
    <header class="mb-12">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">Archive</h1>
      <p class="text-lg text-gray-500">共计 {{ posts.length }} 篇文章的归档记录</p>
    </header>

    <div class="space-y-16">
      <section v-for="group in groupedPosts" :key="group.year">
        <h2 class="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-4 mb-8">
          {{ group.year }}
        </h2>
        
        <div class="space-y-6">
          <article 
            v-for="post in group.posts" 
            :key="post.url"
            class="group flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6 py-2 transition-all hover:translate-x-2"
          >
            <time class="text-sm font-mono text-gray-400 min-w-[100px] shrink-0">
              {{ post.date }}
            </time>
            <div class="flex-1 flex items-center justify-between gap-4">
              <a :href="post.url" class="text-lg font-medium text-gray-800 group-hover:text-blue-500 !no-underline transition-colors">
                {{ post.title }}
              </a>
              <span v-if="post.category !== 'Default'" class="text-xs px-2 py-1 bg-gray-50 text-gray-400 rounded-md border border-gray-100 ml-auto shrink-0 whitespace-nowrap">
                {{ post.category }}
              </span>
            </div>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* 使用简单的 Tailwind，不需写额外复杂 CSS */
</style>