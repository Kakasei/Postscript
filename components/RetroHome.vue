<script setup>
import { ref, onMounted } from 'vue'

const blink = ref(true)

onMounted(() => {
  setInterval(() => {
    blink.value = !blink.value
  }, 500)
})
</script>

<template>
  <div class="font-[VT323,monospace] bg-[#111] text-[#3f3] min-h-screen m-0 p-12 relative overflow-hidden box-border drop-shadow-[0_0_5px_rgba(51,255,51,0.5)]">
    <!-- CRT 显示器扫描线特效 -->
    <div class="absolute top-0 left-0 min-w-full h-full pointer-events-none z-10 scanlines-bg"></div>
    
    <div class="relative z-[2] max-w-[800px] mx-auto">
      <header class="mb-8">
        <h1 class="text-5xl mb-2 tracking-[2px]">> KAKASEI_OS v1.0.0</h1>
        <p class="text-2xl mb-12 text-[#afa]">System booted successfully. Welcome to my digital garden.</p>
      </header>

      <section>
        <div class="text-2xl mb-8">
          <p>> Select an option:</p>
          <ul class="list-none pl-0 mt-4">
            <li class="mb-3"><a href="/markdown-examples" class="text-[#3f3] no-underline inline-block px-2 py-1 border border-transparent transition-all duration-200 hover:bg-[#3f3] hover:text-[#111] hover:border-[#3f3] hover:drop-shadow-none">[1] Read Articles (.md)</a></li>
            <li class="mb-3"><a href="/api-examples" class="text-[#3f3] no-underline inline-block px-2 py-1 border border-transparent transition-all duration-200 hover:bg-[#3f3] hover:text-[#111] hover:border-[#3f3] hover:drop-shadow-none">[2] About Me (sysinfo)</a></li>
            <li class="mb-3"><a href="#" class="text-[#3f3] no-underline inline-block px-2 py-1 border border-transparent transition-all duration-200 hover:bg-[#3f3] hover:text-[#111] hover:border-[#3f3] hover:drop-shadow-none">[3] Projects (dir /w)</a></li>
          </ul>
        </div>
        
        <div class="text-2xl mt-12 flex items-center gap-2">
          <span>C:\KakaseiBlog></span>
          <span class="inline-block w-3 h-6 bg-[#3f3]" :class="{ 'opacity-0': !blink }"></span>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* 一些无法用原生 Tailwind 一次性完全替代的复杂背景渐变，可以直接留在 scoped，这也是实际项目中的常态 */
.scanlines-bg {
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0),
    rgba(255, 255, 255, 0) 50%,
    rgba(0, 0, 0, 0.25) 50%,
    rgba(0, 0, 0, 0.25)
  );
  background-size: 100% 4px;
}
</style>