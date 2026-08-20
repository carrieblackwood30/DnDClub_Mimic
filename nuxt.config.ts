import tailwindcss from "@tailwindcss/vite";
import pinia from "@pinia/nuxt";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  modules: ["@pinia/nuxt"],
})