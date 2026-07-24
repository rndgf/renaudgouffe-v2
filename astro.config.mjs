// @ts-check
import tailwind from "@tailwindcss/vite";

import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://www.renaudgouffe.fr",
  integrations: [
    sitemap({
      // Les pages en noindex ne doivent pas figurer au sitemap
      // (les URLs générées portent un slash final).
      filter: (page) =>
        !page.endsWith("/references/") && !page.endsWith("/cv/"),
    }),
  ],
  vite: {
    plugins: [tailwind()],
  },
});
