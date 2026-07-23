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

export interface Reference {
  name: string;
  year: number;
  type: ReferenceType;
  techs: Platform[];
  /** Très courte description (métier de la marque + nature du projet). */
  tagline?: string;
}

/**
 * Références projets — étiquettes uniquement (client, type, plateformes).
 * Ajouter une référence = ajouter une entrée ici, la timeline se met à jour.
 */
export const references: Reference[] = [
  // TODO(taglines) : rédigées d'après le métier public de la marque + les
  // badges — à valider/corriger, surtout celles marquées « à vérifier ».
  { name: "Memoritz", year: 2025, type: "Agence", techs: ["Shopify", "Mirakl"], tagline: "Marketplace Mirakl sur Shopify" }, // à vérifier
  { name: "Vtwonen", year: 2024, type: "Agence", techs: ["Shopify", "Mirakl"], tagline: "Déco & maison — marketplace Mirakl" },
  { name: "Mathon", year: 2024, type: "Agence", techs: ["Shopify", "Mirakl"], tagline: "Ustensiles de cuisine — marketplace Mirakl" },
  { name: "Fleux", year: 2023, type: "Agence", techs: ["Shopify", "Cegid"], tagline: "Concept store déco — intégration Cegid" },
  { name: "Sabon", year: 2022, type: "Agence", techs: ["Shopify"], tagline: "Cosmétiques — boutique Shopify" },
  { name: "Le Club Leader Price", year: 2022, type: "Agence", techs: ["Shopify"], tagline: "Courses discount en ligne" },
  { name: "Chaumet", year: 2021, type: "Agence", techs: ["Magento 2"], tagline: "Haute joaillerie place Vendôme" },
  { name: "Luzaka", year: 2021, type: "Freelance", techs: ["Magento 2"], tagline: "Bijouterie en ligne — refonte Magento 2" }, // à vérifier
  { name: "émoi-émoi", year: 2020, type: "Agence", techs: ["Shopify"], tagline: "Mode famille — migration vers Shopify" },
  { name: "Redline", year: 2019, type: "Agence", techs: ["Magento 2"], tagline: "Bijoux fins — Magento 2" },
  { name: "Natalys", year: 2017, type: "Agence", techs: ["Magento", "Mirakl"], tagline: "Puériculture — marketplace Mirakl" },
  { name: "Luzaka", year: 2017, type: "Freelance", techs: ["Magento"], tagline: "Bijouterie en ligne — Magento" }, // à vérifier
  { name: "Merci Paris", year: 2016, type: "Agence", techs: ["Magento"], tagline: "Concept store parisien" },
  { name: "Make My Lemonade", year: 2016, type: "Agence", techs: ["Magento"], tagline: "Mode & DIY" },
  { name: "Patricia Blanchet", year: 2016, type: "Agence", techs: ["Magento"], tagline: "Chaussures de créatrice" },
  { name: "Rudy's", year: 2015, type: "Agence", techs: ["Magento"], tagline: "Boutique Magento" }, // à vérifier
  { name: "The Beautyst", year: 2015, type: "Agence", techs: ["Magento", "Mirakl"], tagline: "Beauté — marketplace Mirakl" },
  { name: "Hartford", year: 2014, type: "Agence", techs: ["Magento"], tagline: "Prêt-à-porter" },
  { name: "Harmony Paris", year: 2014, type: "Freelance", techs: ["Magento"], tagline: "Mode féminine" },
  { name: "Christofle", year: 2014, type: "Freelance", techs: ["Magento"], tagline: "Orfèvrerie & arts de la table" },
  { name: "Colette", year: 2012, type: "Agence", techs: ["Magento"], tagline: "Concept store légendaire, rue Saint-Honoré" },
  { name: "Gemmyo", year: 2012, type: "Agence", techs: ["Magento"], tagline: "Joaillerie digitale" },
  { name: "Poladdict", year: 2012, type: "Freelance", techs: ["Magento"], tagline: "Boutique Magento" }, // à vérifier
  { name: "Willemy Charpente", year: 2012, type: "Freelance", techs: ["WordPress"], tagline: "Site vitrine d'artisan charpentier" },
  { name: "émoi-émoi", year: 2011, type: "Agence", techs: ["Magento"], tagline: "Mode famille — première boutique Magento" },
  { name: "Jimmy Fairly", year: 2011, type: "Agence", techs: ["Magento"], tagline: "Lunetterie — lancement e-commerce" },
  { name: "Green Republic", year: 2010, type: "Agence", techs: ["Magento", "Marketplace"], tagline: "Marketplace éco-responsable" }, // à vérifier
  { name: "Pierre Sancinéna", year: 2009, type: "Freelance", techs: ["WordPress"], tagline: "Site vitrine WordPress" }, // à vérifier
  { name: "Inédit Joaillier", year: 2008, type: "Freelance", techs: ["Sur-mesure"], tagline: "Joaillier — développement sur-mesure" },
  { name: "La conspiration", year: 2008, type: "Freelance", techs: ["Sur-mesure"], tagline: "Développement sur-mesure" }, // à vérifier
  { name: "Skinizi", year: 2007, type: "Freelance", techs: ["Magento"], tagline: "Skins & personnalisation d'appareils" }, // à vérifier
  { name: "Ville de Gravigny", year: 2004, type: "Freelance", techs: ["Sur-mesure"], tagline: "Plateforme web d'une commune de l'Eure" },
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
