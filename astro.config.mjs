// @ts-check

import sitemap from "@astrojs/sitemap";
import tailwind from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://www.renaudgouffe.fr",
  // Astro 7 fait passer la valeur par défaut de `true` à "jsx", ce qui supprime
  // les espaces entre éléments inline et colle des mots ("l'agenceColorzen tant
  // que", "8PROJETS"). On garde la compression HTML historique.
  compressHTML: true,
  // Français à la racine, anglais sous /en/ : les pages vivent dans src/pages/[...locale]/.
  i18n: {
    defaultLocale: "fr",
    locales: ["fr", "en"],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      // Les pages en noindex ne doivent pas figurer au sitemap
      // (les URLs générées portent un slash final).
      filter: (page) =>
        !page.endsWith("/references/") && !page.endsWith("/cv/") && !page.endsWith("/404/"),
    }),
  ],
  vite: {
    plugins: [tailwind()],
  },
});
