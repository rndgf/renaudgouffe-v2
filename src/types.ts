export interface SiteConfig {
  /** Nom de la personne — schema.org Person.name (BaseHead). */
  author: string;
  title: string;
  url: string;
  /** Profil LinkedIn : pied de page, bandeau contact, page contact, JSON-LD. */
  linkedin: string;
}

export interface SiteMeta {
  title: string;
  description?: string;
  robots?: string | "index, follow";
}
