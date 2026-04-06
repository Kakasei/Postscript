<script setup>
import { ref } from "vue";
const randomPhrases = ref([
  "I love you",
  "幸福只是海市蜃楼",
  "明天也要早起呀",
]);
</script>

<template>
  <div class="bg-white text-gray-900 font-sans max-w-7xl mx-auto">
    <!-- Hero 区块 -->
    <section
      class="py-24 md:py-32 flex flex-col items-center justify-center text-center px-4 border"
    >
      <h1 class="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
        Postscript <span class="text-xl">对当下的附言</span>
      </h1>
      <p class="text-lg md:text-xl text-gray-600">
        P.S.
        {{
          randomPhrases[Math.floor(Math.random() * randomPhrases.length)]
        }}
      </p>
    </section>
    <div class="grid grid-cols-9 border">
      <!-- 主内容区域 -->
      <div class="col-span-7 border">主内容</div>
      <!-- 侧边栏 -->
      <div class="col-span-2 border">我是侧边栏</div>
    </div>
  </div>
</template>
