<script setup lang="ts">
import { computed } from "vue";
import { useData } from "vitepress";
import { data as archivePosts } from "../../../utils/archive.data.ts";

// 组件职责：在文章正文前渲染元数据卡片。
// 数据优先级：frontmatter > archive.data.ts 的归档数据。
const { frontmatter, page } = useData();

// 标准化路径，便于在不同 URL 形态下做稳定匹配。
function normalizePath(path: string): string {
  return decodeURIComponent(path)
    .replace(/\/index(\.html)?$/, "")
    .replace(/\.html$/, "")
    .replace(/\/$/, "");
}

// 兼容 tags 可能是数组或逗号分隔字符串。
function normalizeTags(rawTags: unknown): string[] {
  if (Array.isArray(rawTags)) {
    return rawTags.map((tag) => String(tag).trim()).filter(Boolean);
  }

  if (typeof rawTags === "string") {
    return rawTags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

// 统一将 number / Date / string 转成时间戳，失败返回 0。
function toTimestamp(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.floor(value);
  }

  if (value instanceof Date) {
    const timestamp = value.getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }

  if (typeof value !== "string" || value.trim() === "") {
    return 0;
  }

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

// 统一日期时间展示格式：YYYY-MM-DD HH:mm:ss
function formatDateTime(value: unknown): string {
  const timestamp = toTimestamp(value);
  if (!timestamp) {
    return "";
  }

  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  const second = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

function goBack() {
  if (typeof window !== "undefined") {
    window.history.back();
  }
}

// 仅在 posts 下的 doc 页面显示元数据卡片。
const isPostDocPage = computed(() => {
  const relativePath = String(
    page.value.relativePath ?? page.value.filePath ?? "",
  ).replace(/^[\\/]+/, "");

  return (
    (relativePath.startsWith("posts/") || relativePath.includes("/posts/")) &&
    (frontmatter.value.layout ?? "doc") === "doc"
  );
});

// 根据当前页面路径，从归档数据中定位当前文章。
const currentPost = computed(() => {
  const relativePath = String(page.value.relativePath ?? "");
  if (!relativePath) {
    return undefined;
  }

  const expectedUrl = `/${relativePath.replace(/\.md$/i, ".html")}`;
  const currentPath = normalizePath(expectedUrl);
  return archivePosts.find((post) => normalizePath(post.url) === currentPath);
});

// 标题优先使用 frontmatter，缺失时回退归档数据。
const displayTitle = computed(() => {
  const rawTitle = frontmatter.value.title;
  if (typeof rawTitle === "string" && rawTitle.trim()) {
    return rawTitle.trim();
  }

  return currentPost.value?.title ?? "";
});

// 发布时间优先使用归档层的时间戳，保证自动时间策略也能展示到秒。
const publishedAt = computed(() => {
  if (typeof currentPost.value?.publishedTimestamp === "number") {
    const formatted = formatDateTime(currentPost.value.publishedTimestamp);
    if (formatted) {
      return formatted;
    }
  }

  const rawPublished = frontmatter.value.publishedAt ?? frontmatter.value.date;
  return formatDateTime(rawPublished);
});

// 更新时间优先使用归档层的时间戳，保证自动时间策略也能展示到秒。
const updatedAt = computed(() => {
  if (typeof currentPost.value?.updatedTimestamp === "number") {
    const formatted = formatDateTime(currentPost.value.updatedTimestamp);
    if (formatted) {
      return formatted;
    }
  }

  const rawUpdated =
    frontmatter.value.updatedAt ?? frontmatter.value.lastModified;
  return formatDateTime(rawUpdated);
});

// 标签优先使用 frontmatter，缺失时回退归档数据。
const tags = computed(() => {
  const fromFrontmatter = normalizeTags(frontmatter.value.tags);
  if (fromFrontmatter.length > 0) {
    return fromFrontmatter;
  }

  return currentPost.value?.tags ?? [];
});

// 只显示手写摘要，不回退自动摘要。
const manualSummary = computed(() => {
  const rawSummary = frontmatter.value.summary;
  if (typeof rawSummary === "string") {
    return rawSummary.trim();
  }

  return "";
});

// 只要文章页存在任一元数据字段，就显示卡片。
const shouldShow = computed(() => {
  if (!isPostDocPage.value) {
    return false;
  }

  return Boolean(
    displayTitle.value ||
    publishedAt.value ||
    updatedAt.value ||
    tags.value.length > 0 ||
    manualSummary.value,
  );
});
</script>

<template>
  <section
    v-if="shouldShow"
    class="post-meta-header mb-8 rounded-2xl border border-gray-200 bg-white px-6 py-6"
  >
    <button
      type="button"
      class="inline-flex items-center rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
      @click="goBack"
    >
      返回上一页
    </button>

    <h1
      v-if="displayTitle"
      class="mt-4 text-3xl font-bold text-gray-900 leading-tight"
    >
      {{ displayTitle }}
    </h1>

    <div
      class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500"
    >
      <span v-if="publishedAt">发布：{{ publishedAt }}</span>
      <span v-if="updatedAt">更新：{{ updatedAt }}</span>
    </div>

    <div v-if="tags.length > 0" class="mt-4 flex flex-wrap gap-2">
      <span
        v-for="tag in tags"
        :key="tag"
        class="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600"
      >
        #{{ tag }}
      </span>
    </div>

    <p v-if="manualSummary" class="mt-4 text-sm leading-relaxed text-gray-700">
      {{ manualSummary }}
    </p>
  </section>
</template>
