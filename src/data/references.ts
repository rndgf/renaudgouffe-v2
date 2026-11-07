import type { Localized } from "@/i18n";

export type ReferenceType = "Agence" | "Freelance";

export type Platform =
  | "Shopify"
  | "Magento"
  | "Magento 2"
  | "WordPress"
  | "Mirakl"
  | "Cegid"
  | "Marketplace"
  | "Sur-mesure"
  | "Astro"
  | "Tailwind";

/** Rôles tenus sur le projet (pastilles A / D sur les cartes). */
export type Role = "architecte" | "dev" | "design";

export interface Reference {
  name: string;
  year: number;
  type: ReferenceType;
  techs: Platform[];
  /** Très courte description de la marque ou du site. */
  tagline?: Localized;
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
  {
    name: "clm.ink",
    year: 2026,
    type: "Freelance",
    techs: ["Astro", "Tailwind"],
    tagline: { fr: "Salon de tatouage à Chambéry", en: "Tattoo studio in Chambéry" },
    roles: ["dev", "design"],
  },
  {
    name: "Showroomprivé",
    year: 2026,
    type: "Agence",
    techs: ["Shopify", "Mirakl"],
    tagline: { fr: "Ventes privées en ligne", en: "Online flash sales" },
    roles: ["architecte"],
  },
  {
    name: "Memoritz",
    year: 2025,
    type: "Agence",
    techs: ["Shopify", "Mirakl"],
    tagline: { fr: "Photographie scolaire en ligne", en: "School photography online" },
    roles: ["architecte", "dev"],
  },
  {
    name: "Vtwonen",
    year: 2024,
    type: "Agence",
    techs: ["Shopify", "Mirakl"],
    tagline: { fr: "Déco & maison, marque néerlandaise", en: "Home & decor, Dutch brand" },
    roles: ["architecte", "dev"],
  },
  {
    name: "Mathon",
    year: 2024,
    type: "Agence",
    techs: ["Shopify", "Mirakl"],
    tagline: { fr: "Ustensiles et matériel de cuisine", en: "Cookware and kitchen equipment" },
    roles: ["architecte", "dev"],
  },
  {
    name: "Fleux",
    year: 2023,
    type: "Agence",
    techs: ["Shopify", "Cegid"],
    tagline: { fr: "Concept store déco du Marais", en: "Decor concept store in the Marais" },
    roles: ["architecte", "dev"],
  },
  {
    name: "Sabon",
    year: 2022,
    type: "Agence",
    techs: ["Shopify"],
    tagline: { fr: "Savons et cosmétiques", en: "Soaps and cosmetics" },
    roles: ["architecte", "dev"],
  },
  {
    name: "Le Club Leader Price",
    year: 2022,
    type: "Agence",
    techs: ["Shopify"],
    tagline: { fr: "L'enseigne discount en ligne", en: "The discount retailer online" },
    roles: ["dev"],
  },
  {
    name: "Chaumet",
    year: 2021,
    type: "Agence",
    techs: ["Magento 2"],
    tagline: { fr: "Haute joaillerie, place Vendôme", en: "High jewellery, place Vendôme" },
    roles: ["dev"],
  },
  {
    name: "Luzaka",
    year: 2021,
    type: "Freelance",
    techs: ["Magento 2"],
    tagline: { fr: "Bijoux fantaisie et montres", en: "Fashion jewellery and watches" },
    roles: ["dev"],
  },
  {
    name: "émoi-émoi",
    year: 2020,
    type: "Agence",
    techs: ["Shopify"],
    tagline: { fr: "Mode pour mamans et enfants", en: "Fashion for mums and kids" },
    roles: ["dev"],
  },
  {
    name: "Redline",
    year: 2019,
    type: "Agence",
    techs: ["Magento 2"],
    tagline: { fr: "Bijoux diamants sur fil", en: "Diamonds on a thread" },
    roles: ["dev"],
  },
  {
    name: "Natalys",
    year: 2017,
    type: "Agence",
    techs: ["Magento", "Mirakl"],
    tagline: { fr: "Puériculture et mode enfant", en: "Baby care and kids' fashion" },
    roles: ["dev"],
  },
  {
    name: "Luzaka",
    year: 2017,
    type: "Freelance",
    techs: ["Magento"],
    tagline: { fr: "Bijoux fantaisie et montres", en: "Fashion jewellery and watches" },
    roles: ["dev"],
  },
  {
    name: "Merci Paris",
    year: 2016,
    type: "Agence",
    techs: ["Magento"],
    tagline: { fr: "Concept store parisien", en: "Parisian concept store" },
    roles: ["dev"],
  },
  {
    name: "Make My Lemonade",
    year: 2016,
    type: "Agence",
    techs: ["Magento"],
    tagline: { fr: "Mode et patrons DIY", en: "Fashion and DIY sewing patterns" },
    roles: ["dev"],
  },
  {
    name: "Patricia Blanchet",
    year: 2016,
    type: "Agence",
    techs: ["Magento"],
    tagline: { fr: "Chaussures de créatrice parisienne", en: "Parisian designer shoes" },
    roles: ["dev"],
  },
  {
    name: "Rudy's",
    year: 2015,
    type: "Agence",
    techs: ["Magento"],
    tagline: { fr: "Chaussures en cuir pour homme", en: "Leather shoes for men" },
    roles: ["dev"],
  },
  {
    name: "The Beautyst",
    year: 2015,
    type: "Agence",
    techs: ["Magento", "Mirakl"],
    tagline: { fr: "Marketplace beauté", en: "Beauty marketplace" },
    roles: ["dev"],
  },
  {
    name: "Hartford",
    year: 2014,
    type: "Agence",
    techs: ["Magento"],
    tagline: { fr: "Prêt-à-porter homme et femme", en: "Ready-to-wear for men and women" },
    roles: ["dev"],
  },
  {
    name: "Harmony Paris",
    year: 2014,
    type: "Freelance",
    techs: ["Magento"],
    tagline: { fr: "Mode féminine parisienne", en: "Parisian womenswear" },
    roles: ["dev"],
  },
  {
    name: "Christofle",
    year: 2014,
    type: "Freelance",
    techs: ["Magento"],
    tagline: { fr: "Orfèvrerie et arts de la table", en: "Silverware and tableware" },
    roles: ["dev"],
  },
  {
    name: "Colette",
    year: 2012,
    type: "Agence",
    techs: ["Magento"],
    tagline: {
      fr: "Concept store légendaire, rue Saint-Honoré",
      en: "Legendary concept store, rue Saint-Honoré",
    },
    roles: ["dev"],
  },
  {
    name: "Gemmyo",
    year: 2012,
    type: "Agence",
    techs: ["Magento"],
    tagline: {
      fr: "Joaillerie française nouvelle génération",
      en: "New-generation French jewellery",
    },
    roles: ["dev"],
  },
  {
    name: "Poladdict",
    year: 2012,
    type: "Freelance",
    techs: ["Magento"],
    tagline: { fr: "Tirages photo façon polaroid", en: "Polaroid-style photo prints" },
    roles: ["dev", "design"],
  },
  {
    name: "Willemy Charpente",
    year: 2012,
    type: "Freelance",
    techs: ["WordPress"],
    tagline: { fr: "Artisan charpentier", en: "Carpentry craftsman" },
    roles: ["dev", "design"],
  },
  {
    name: "émoi-émoi",
    year: 2011,
    type: "Agence",
    techs: ["Magento"],
    tagline: { fr: "Mode pour mamans et enfants", en: "Fashion for mums and kids" },
    roles: ["dev"],
  },
  {
    name: "Jimmy Fairly",
    year: 2011,
    type: "Agence",
    techs: ["Magento"],
    tagline: { fr: "Lunetterie parisienne", en: "Parisian eyewear" },
    roles: ["dev"],
  },
  {
    name: "Green Republic",
    year: 2010,
    type: "Agence",
    techs: ["Magento", "Marketplace"],
    tagline: {
      fr: "Marketplace de produits bio et équitables",
      en: "Organic and fair-trade marketplace",
    },
    roles: ["dev"],
  },
  {
    name: "Pierre Sancinéna",
    year: 2009,
    type: "Freelance",
    techs: ["WordPress"],
    tagline: { fr: "Pilote de Formule 4", en: "Formula 4 driver" },
    roles: ["dev", "design"],
  },
  {
    name: "Inédit Joaillier",
    year: 2008,
    type: "Freelance",
    techs: ["Sur-mesure"],
    tagline: { fr: "Joaillier indépendant", en: "Independent jeweller" },
    roles: ["dev", "design"],
  }, // à vérifier
  {
    name: "La conspiration",
    year: 2008,
    type: "Freelance",
    techs: ["Sur-mesure"],
    tagline: { fr: "Groupe de musique local", en: "Local band" },
    roles: ["dev", "design"],
  },
  {
    name: "Skinizi",
    year: 2007,
    type: "Freelance",
    techs: ["Magento"],
    tagline: {
      fr: "Skins et stickers pour ordinateurs et mobiles",
      en: "Skins and stickers for laptops and phones",
    },
    roles: ["dev", "design"],
  },
  {
    name: "Ville de Gravigny",
    year: 2004,
    type: "Freelance",
    techs: ["Sur-mesure"],
    tagline: { fr: "Commune de l'Eure", en: "Town in the Eure department" },
    roles: ["dev", "design"],
  },
  {
    name: "DoD Blackliste",
    year: 2003,
    type: "Freelance",
    techs: ["Sur-mesure"],
    tagline: {
      fr: "Site communautaire d'une équipe e-sport",
      en: "Community site of an e-sports team",
    },
    roles: ["dev", "design"],
  },
  {
    name: "Principe Actif",
    year: 2002,
    type: "Freelance",
    techs: ["Sur-mesure"],
    tagline: { fr: "Station de radio locale", en: "Local radio station" },
    roles: ["dev", "design"],
  },
];
