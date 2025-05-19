// @ts-check
import tailwind from "@tailwindcss/vite";

import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://www.renaudgouffe.fr",
  integrations: [
    sitemap({
      filter: (page) => page !== "https://www.renaudgouffe.fr/references",
    }),
  ],
  vite: {
    plugins: [tailwind()],
  },
});
