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
}

/**
 * Références projets — étiquettes uniquement (client, type, plateformes).
 * Ajouter une référence = ajouter une entrée ici, la timeline se met à jour.
 */
export const references: Reference[] = [
  { name: "Memoritz", year: 2025, type: "Agence", techs: ["Shopify", "Mirakl"] },
  { name: "Vtwonen", year: 2024, type: "Agence", techs: ["Shopify", "Mirakl"] },
  { name: "Mathon", year: 2024, type: "Agence", techs: ["Shopify", "Mirakl"] },
  { name: "Fleux", year: 2023, type: "Agence", techs: ["Shopify", "Cegid"] },
  { name: "Sabon", year: 2022, type: "Agence", techs: ["Shopify"] },
  { name: "Le Club Leader Price", year: 2022, type: "Agence", techs: ["Shopify"] },
  { name: "Chaumet", year: 2021, type: "Agence", techs: ["Magento 2"] },
  { name: "Luzaka", year: 2021, type: "Freelance", techs: ["Magento 2"] },
  { name: "émoi-émoi", year: 2020, type: "Agence", techs: ["Shopify"] },
  { name: "Redline", year: 2019, type: "Agence", techs: ["Magento 2"] },
  { name: "Natalys", year: 2017, type: "Agence", techs: ["Magento", "Mirakl"] },
  { name: "Luzaka", year: 2017, type: "Freelance", techs: ["Magento"] },
  { name: "Merci Paris", year: 2016, type: "Agence", techs: ["Magento"] },
  { name: "Make My Lemonade", year: 2016, type: "Agence", techs: ["Magento"] },
  { name: "Patricia Blanchet", year: 2016, type: "Agence", techs: ["Magento"] },
  { name: "Rudy's", year: 2015, type: "Agence", techs: ["Magento"] },
  { name: "The Beautyst", year: 2015, type: "Agence", techs: ["Magento", "Mirakl"] },
  { name: "Hartford", year: 2014, type: "Agence", techs: ["Magento"] },
  { name: "Harmony Paris", year: 2014, type: "Freelance", techs: ["Magento"] },
  { name: "Christofle", year: 2014, type: "Freelance", techs: ["Magento"] },
  { name: "Colette", year: 2012, type: "Agence", techs: ["Magento"] },
  { name: "Gemmyo", year: 2012, type: "Agence", techs: ["Magento"] },
  { name: "Poladdict", year: 2012, type: "Freelance", techs: ["Magento"] },
  { name: "Willemy Charpente", year: 2012, type: "Freelance", techs: ["WordPress"] },
  { name: "émoi-émoi", year: 2011, type: "Agence", techs: ["Magento"] },
  { name: "Jimmy Fairly", year: 2011, type: "Agence", techs: ["Magento"] },
  { name: "Green Republic", year: 2010, type: "Agence", techs: ["Magento", "Marketplace"] },
  { name: "Pierre Sancinéna", year: 2009, type: "Freelance", techs: ["WordPress"] },
  { name: "Inédit Joaillier", year: 2008, type: "Freelance", techs: ["Sur-mesure"] },
  { name: "La conspiration", year: 2008, type: "Freelance", techs: ["Sur-mesure"] },
  { name: "Skinizi", year: 2007, type: "Freelance", techs: ["Magento"] },
  { name: "Ville de Gravigny", year: 2004, type: "Freelance", techs: ["Sur-mesure"] },
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
