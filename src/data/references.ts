export type ReferenceType = "Agence" | "Freelance";

export type Platform =
  | "Shopify"
  | "Magento"
  | "Magento 2"
  | "WordPress"
  | "Mirakl"
  | "Cegid"
  | "Marketplace"
  | "Sur-mesure";

/** Rôles tenus sur le projet (pastilles A / D sur les cartes). */
export type Role = "architecte" | "dev";

export interface Reference {
  name: string;
  year: number;
  type: ReferenceType;
  techs: Platform[];
  /** Très courte description de la marque ou du site. */
  tagline?: string;
  /** Renseigné à partir de 2022 (Sabon) — avant, non distingué. */
  roles?: Role[];
}

/**
 * Références projets — étiquettes uniquement (client, type, plateformes).
 * Ajouter une référence = ajouter une entrée ici, la timeline se met à jour.
 */
export const references: Reference[] = [
  // Taglines = la marque ou le site en quelques mots (pas la mission).
  // Celles marquées « à vérifier » n'ont pas pu être confirmées.
  { name: "Showroomprivé", year: 2026, type: "Agence", techs: ["Shopify"], tagline: "Ventes privées en ligne", roles: ["architecte"] },
  { name: "Memoritz", year: 2025, type: "Agence", techs: ["Shopify", "Mirakl"], tagline: "Photographie scolaire en ligne", roles: ["architecte", "dev"] },
  { name: "Vtwonen", year: 2024, type: "Agence", techs: ["Shopify", "Mirakl"], tagline: "Déco & maison, marque néerlandaise", roles: ["architecte", "dev"] },
  { name: "Mathon", year: 2024, type: "Agence", techs: ["Shopify", "Mirakl"], tagline: "Ustensiles et matériel de cuisine", roles: ["architecte", "dev"] },
  { name: "Fleux", year: 2023, type: "Agence", techs: ["Shopify", "Cegid"], tagline: "Concept store déco du Marais", roles: ["architecte", "dev"] },
  { name: "Sabon", year: 2022, type: "Agence", techs: ["Shopify"], tagline: "Savons et cosmétiques", roles: ["architecte", "dev"] },
  { name: "Le Club Leader Price", year: 2022, type: "Agence", techs: ["Shopify"], tagline: "L'enseigne discount en ligne", roles: ["architecte", "dev"] },
  { name: "Chaumet", year: 2021, type: "Agence", techs: ["Magento 2"], tagline: "Haute joaillerie, place Vendôme", roles: ["dev"] },
  { name: "Luzaka", year: 2021, type: "Freelance", techs: ["Magento 2"], tagline: "Bijoux fantaisie et montres", roles: ["dev"] },
  { name: "émoi-émoi", year: 2020, type: "Agence", techs: ["Shopify"], tagline: "Mode pour mamans et enfants", roles: ["dev"] },
  { name: "Redline", year: 2019, type: "Agence", techs: ["Magento 2"], tagline: "Bijoux diamants sur fil", roles: ["dev"] },
  { name: "Natalys", year: 2017, type: "Agence", techs: ["Magento", "Mirakl"], tagline: "Puériculture et mode enfant", roles: ["dev"] },
  { name: "Luzaka", year: 2017, type: "Freelance", techs: ["Magento"], tagline: "Bijoux fantaisie et montres", roles: ["dev"] },
  { name: "Merci Paris", year: 2016, type: "Agence", techs: ["Magento"], tagline: "Concept store parisien solidaire", roles: ["dev"] },
  { name: "Make My Lemonade", year: 2016, type: "Agence", techs: ["Magento"], tagline: "Mode et patrons DIY", roles: ["dev"] },
  { name: "Patricia Blanchet", year: 2016, type: "Agence", techs: ["Magento"], tagline: "Chaussures de créatrice parisienne", roles: ["dev"] },
  { name: "Rudy's", year: 2015, type: "Agence", techs: ["Magento"], tagline: "Chaussures en cuir pour homme", roles: ["dev"] },
  { name: "The Beautyst", year: 2015, type: "Agence", techs: ["Magento", "Mirakl"], tagline: "Marketplace beauté", roles: ["dev"] },
  { name: "Hartford", year: 2014, type: "Agence", techs: ["Magento"], tagline: "Prêt-à-porter homme et femme", roles: ["dev"] },
  { name: "Harmony Paris", year: 2014, type: "Freelance", techs: ["Magento"], tagline: "Mode féminine parisienne", roles: ["dev"] },
  { name: "Christofle", year: 2014, type: "Freelance", techs: ["Magento"], tagline: "Orfèvrerie et arts de la table", roles: ["dev"] },
  { name: "Colette", year: 2012, type: "Agence", techs: ["Magento"], tagline: "Concept store légendaire, rue Saint-Honoré", roles: ["dev"] },
  { name: "Gemmyo", year: 2012, type: "Agence", techs: ["Magento"], tagline: "Joaillerie française nouvelle génération", roles: ["dev"] },
  { name: "Poladdict", year: 2012, type: "Freelance", techs: ["Magento"], tagline: "Tirages photo façon polaroid", roles: ["dev"] },
  { name: "Willemy Charpente", year: 2012, type: "Freelance", techs: ["WordPress"], tagline: "Artisan charpentier", roles: ["dev"] },
  { name: "émoi-émoi", year: 2011, type: "Agence", techs: ["Magento"], tagline: "Mode pour mamans et enfants", roles: ["dev"] },
  { name: "Jimmy Fairly", year: 2011, type: "Agence", techs: ["Magento"], tagline: "Lunetterie parisienne", roles: ["dev"] },
  { name: "Green Republic", year: 2010, type: "Agence", techs: ["Magento", "Marketplace"], tagline: "Marketplace de produits bio et équitables", roles: ["dev"] },
  { name: "Pierre Sancinéna", year: 2009, type: "Freelance", techs: ["WordPress"], tagline: "Pilote de Formule 4", roles: ["dev"] },
  { name: "Inédit Joaillier", year: 2008, type: "Freelance", techs: ["Sur-mesure"], tagline: "Joaillier indépendant", roles: ["dev"] }, // à vérifier
  { name: "La conspiration", year: 2008, type: "Freelance", techs: ["Sur-mesure"], tagline: "Groupe de musique local", roles: ["dev"] },
  { name: "Skinizi", year: 2007, type: "Freelance", techs: ["Magento"], tagline: "Skins et stickers pour ordinateurs et mobiles", roles: ["dev"] },
  { name: "Ville de Gravigny", year: 2004, type: "Freelance", techs: ["Sur-mesure"], tagline: "Commune de l'Eure", roles: ["dev"] },
];

/** Couleur CSS (token du thème) associée à chaque plateforme. */
export const platformColor: Record<Platform, string> = {
  Shopify: "var(--color-shopify)",
  Magento: "var(--color-magento)",
  "Magento 2": "var(--color-magento)",
  WordPress: "var(--color-wordpress)",
  Mirakl: "var(--color-mirakl)",
  Cegid: "var(--color-cegid)",
  Marketplace: "var(--color-custom)",
  "Sur-mesure": "var(--color-custom)",
};
