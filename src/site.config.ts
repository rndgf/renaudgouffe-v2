import type { SiteConfig } from "@/types";

export const siteConfig: SiteConfig = {
  // Nom de la personne : alimente le Person.name des données structurées
  // JSON-LD (BaseHead). Distinct de `title`, qui est le titre du site.
  author: "Renaud Gouffé",
  // Titre du site : sert de suffixe à toutes les balises <title> (BaseHead)
  // et de og:site_name.
  title: "Renaud Gouffé",
  // URL canonique de repli quand Astro.site n'est pas défini.
  url: "https://www.renaudgouffe.fr/",
  linkedin: "https://www.linkedin.com/in/renaud-gouff%C3%A9-39047287/",
};
