<script setup>
import { computed, ref } from "vue";
import { withBase } from "vitepress";
import { data as posts } from "../utils/archive.data.ts";

console.log("posts",posts);

const PAGE_SIZE = 10;
const currentPage = ref(1);

const totalPosts = computed(() => posts.length);
const totalWordCount = computed(() =>
  posts.reduce((sum, post) => sum + post.wordCount, 0),
);

const pinnedPosts = computed(() =>
  posts.filter((post) => post.isPinned).slice(0, 6),
);

const totalPages = computed(() =>
  Math.max(1, Math.ceil(posts.length / PAGE_SIZE)),
);

const pagedPosts = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return posts.slice(start, start + PAGE_SIZE);
});

function goToPrevPage() {
  currentPage.value = Math.max(1, currentPage.value - 1);
}

function goToNextPage() {
  currentPage.value = Math.min(totalPages.value, currentPage.value + 1);
}
</script>

<template>
  <div class="space-y-12">
    <header>
      <h1 class="text-4xl font-bold text-gray-900 mb-4">Archive</h1>
      <p class="text-lg text-gray-500">按首次发布时间从新到旧展示所有文章</p>
    </header>

    <section class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="rounded-xl border border-gray-200 bg-white p-5">
        <p class="text-sm text-gray-500 mb-2">文章总数</p>
        <p class="text-3xl font-bold text-gray-900">{{ totalPosts }}</p>
      </div>

      <div class="rounded-xl border border-gray-200 bg-white p-5">
        <p class="text-sm text-gray-500 mb-2">总字数</p>
        <p class="text-3xl font-bold text-gray-900">
          {{ totalWordCount.toLocaleString("zh-CN") }}
        </p>
      </div>

      <div class="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5">
        <p class="text-sm text-gray-500 mb-2">搜索（预留）</p>
        <div class="text-sm text-gray-400">
          暂未实现，后续可接入本地索引或 Algolia
        </div>
      </div>
    </section>

    <section v-if="pinnedPosts.length" class="space-y-6">
      <h2 class="text-2xl font-bold text-gray-900">置顶精选</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <article
          v-for="post in pinnedPosts"
          :key="`pin-${post.url}`"
          class="rounded-xl border border-gray-200 bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-md"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs px-2 py-1 rounded-md bg-gray-900 text-white">
              置顶
            </span>
            <time class="text-xs text-gray-400">{{ post.publishedAt }}</time>
          </div>
          <a
            :href="withBase(post.url)"
            class="text-lg font-bold text-gray-900 !no-underline hover:text-blue-500 transition-colors"
          >
            {{ post.title }}
          </a>
          <p class="mt-3 text-sm text-gray-600 line-clamp-3">{{ post.summary }}</p>
          <div class="mt-4 flex flex-wrap gap-2">
            <span
              v-for="tag in post.tags"
              :key="`${post.url}-${tag}`"
              class="text-xs px-2 py-1 rounded-md bg-gray-50 border border-gray-200 text-gray-500"
            >
              #{{ tag }}
            </span>
          </div>
        </article>
      </div>
    </section>

    <section class="space-y-6">
      <h2 class="text-2xl font-bold text-gray-900">全部文章</h2>

      <div class="space-y-5">
        <article
          v-for="post in pagedPosts"
          :key="post.url"
          class="group rounded-xl border border-gray-100 bg-white p-5 transition-all hover:translate-x-2 hover:shadow-sm"
        >
          <div class="flex flex-col gap-3">
            <div class="flex items-center flex-wrap gap-2 text-xs text-gray-500">
              <time>发布：{{ post.publishedAt }}</time>
              <span>|</span>
              <time>更新：{{ post.updatedAt }}</time>
              <span>|</span>
              <span>{{ post.wordCount.toLocaleString("zh-CN") }} 字</span>
            </div>

            <a
              :href="withBase(post.url)"
              class="text-xl font-bold text-gray-900 group-hover:text-blue-500 !no-underline transition-colors"
            >
              {{ post.title }}
            </a>

            <p class="text-gray-600 leading-relaxed">{{ post.summary }}</p>

            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in post.tags"
                :key="`${post.url}-${tag}`"
                class="text-xs px-2 py-1 bg-gray-50 text-gray-500 rounded-md border border-gray-100"
              >
                #{{ tag }}
              </span>
            </div>
          </div>
        </article>
      </div>

      <div
        v-if="totalPages > 1"
        class="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4"
      >
        <button
          class="px-3 py-2 text-sm rounded-md border border-gray-200 text-gray-700 disabled:opacity-40"
          :disabled="currentPage <= 1"
          @click="goToPrevPage"
        >
          上一页
        </button>

        <span class="text-sm text-gray-500">
          第 {{ currentPage }} / {{ totalPages }} 页
        </span>

        <button
          class="px-3 py-2 text-sm rounded-md border border-gray-200 text-gray-700 disabled:opacity-40"
          :disabled="currentPage >= totalPages"
          @click="goToNextPage"
        >
          下一页
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* 使用简单的 Tailwind，不需写额外复杂 CSS */
</style>
