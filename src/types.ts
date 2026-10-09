export interface SiteConfig {
  /** Nom de la personne — schema.org Person.name (BaseHead). */
  author: string;
  description: string;
  lang: string;
  ogLocale: string;
  title: string;
  url: string;
}

export interface SiteMeta {
  title: string;
  description?: string;
  robots?: string | "index, follow";
}
