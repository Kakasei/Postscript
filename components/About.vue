<template>
  <div>
    <h1>关于我</h1>
    <p>阿橙，热爱这个世界</p>
    <p>目标是成为前端开发工程师，欢迎查看我的简历：</p>
    <a
      href="/resume.pdf"
      download="胡佳成-简历.pdf"
      target="_blank"
      class="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-[0_1px_2px_rgba(0,0,0,0.05)] text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer !no-underline"
    >
      <svg
        class="w-4 h-4 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        ></path>
      </svg>
      下载 PDF 简历
    </a>

    <h2 class="text-2xl font-bold text-gray-900 mt-16 mb-6">
      可以在这些地方找到我，来和我玩
    </h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <template v-for="item in links" :key="item.name">
        <!-- 支持跳转的链接卡片 -->
        <a
          v-if="item.link"
          :href="item.link"
          target="_blank"
          class="flex flex-col items-center text-center p-6 rounded-xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-md hover:-translate-y-1 !transition-all !duration-300 !no-underline group"
        >
          <div
            class="text-lg font-bold text-gray-900 group-hover:text-blue-500 transition-colors"
          >
            {{ item.name }}
          </div>
          <div
            class="text-sm text-gray-500 mt-2 font-mono break-all flex flex-col items-center"
          >
            <span> {{ item.otherInfo }} </span>
            <span
              class="opacity-0 group-hover:opacity-100 text-xs text-blue-500 transition-opacity whitespace-nowrap mt-1"
              >(点击跳转)</span
            >
          </div>
        </a>

        <!-- 不支持跳转的信息卡片 -->
        <div
          v-else
          @click="copyText(item.info)"
          title="点击复制"
          class="flex flex-col items-center text-center p-6 rounded-xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-md hover:-translate-y-1 !transition-all !duration-300 cursor-pointer group"
        >
          <div
            class="text-lg font-bold text-gray-700 group-hover:text-blue-500 transition-colors"
          >
            {{ item.name }}
          </div>
          <div
            class="text-sm text-gray-500 mt-2 font-mono break-all flex flex-col items-center"
          >
            <span>{{ item.info }}</span>
            <span
              class="opacity-0 group-hover:opacity-100 text-xs text-blue-500 transition-opacity whitespace-nowrap mt-1"
              >(点击复制)</span
            >
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    // 简单的原生提示，你也可以换成更美的 Message 组件
    // alert("已复制到剪贴板: " + text);
  } catch (err) {
    console.error("复制失败", err);
  }
};

const links = ref([
  {
    name: "邮箱",
    link: "mailto:Kakasei@qq.com",
    otherInfo: "Kakasei@qq.com",
  },
  {
    name: "GitHub",
    link: "https://github.com/Kakasei",
    otherInfo: "Kakasei",
  },
  {
    name: "Bilibili",
    link: "https://space.bilibili.com/11946007?spm_id_from=333.1007.0.0",
    otherInfo: "柑橘类佳佳成",
  },
  {
    name: "QQ",
    info: "7518322114",
  },
  {
    name: "战网",
    info: "凤凰院佳成#5510",
  },
]);
</script>

<style scoped></style>
