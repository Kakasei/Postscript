import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitepress";
import tailwindcss from "@tailwindcss/vite";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: "/Postscript/",
  title: "Postscript",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    // sidebar: [
    //   {
    //     text: "Guide",
    //     items: [
    //       { text: "Introduction", link: "/introduction" },
    //       { text: "Getting Started", link: "/getting-started" },
    //     ],
    //   },
    // ],
    docFooter: {
      prev: false,
      next: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: [
        {
          find: /^.*\/VPNavBar\.vue$/,
          replacement: fileURLToPath(
            new URL("../components/CustomNavBar.vue", import.meta.url),
          ),
        },
      ],
    },
  },
});
