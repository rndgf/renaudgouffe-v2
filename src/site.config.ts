import type { SiteConfig } from "@/types";

export const siteConfig: SiteConfig = {
  // Used as both a meta property (src/components/BaseHead.astro L:31 + L:49) & the generated satori png (src/pages/og-image/[slug].png.ts)
  author: "Renaud Gouffé",
  // Meta property used to construct the meta title property, found in src/components/BaseHead.astro L:11
  title: "Renaud Gouffé",
  // Meta property used as a default description meta property
  description:
    "Développeur Senior, magento / shopify freelance - Rouen (Normandie - 76) et Paris",
  // HTML lang property, found in src/layouts/Base.astro L:18
  lang: "fr-FR",
  // Meta property, found in src/components/BaseHead.astro L:42
  ogLocale: "fr-FR",

  // Date.prototype.toLocaleDateString() parameters, found in src/utils/date.ts.
  date: {
    locale: "fr-FR",
    options: {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  },
  url: "https://www.renaudgouffe.fr/",
};
