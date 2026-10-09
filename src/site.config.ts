import type { SiteConfig } from "@/types";

export const siteConfig: SiteConfig = {
  // Nom de la personne : alimente le Person.name des données structurées
  // JSON-LD (BaseHead). Distinct de `title`, qui est le titre du site.
  author: "Renaud Gouffé",
  // Titre du site : sert de suffixe à toutes les balises <title> (BaseHead)
  // et de og:site_name.
  title: "Renaud Gouffé",
  // Description par défaut, utilisée quand une page n'en fournit pas.
  description:
    "Architecte Solutions & Développeur Shopify — architecture e-commerce, intégrations SI et développement. Rouen · Paris · Remote.",
  // Attribut lang de <html> (Base.astro).
  lang: "fr-FR",
  // Balise og:locale (BaseHead).
  ogLocale: "fr-FR",
  // URL canonique de repli quand Astro.site n'est pas défini.
  url: "https://www.renaudgouffe.fr/",
};
