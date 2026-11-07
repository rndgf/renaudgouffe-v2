// Deux langues : français à la racine, anglais sous /en/. Pas de bibliothèque i18n :
// un dictionnaire pour les libellés partagés et deux helpers de chemin.
export type Locale = "fr" | "en";

/** Chaîne traduite ; une chaîne nue vaut pour les deux langues (noms propres, dates). */
export type Localized = string | Record<Locale, string>;

export const localeOf = (value: string | undefined): Locale => (value === "en" ? "en" : "fr");

export const t = (value: Localized, locale: Locale): string =>
  typeof value === "string" ? value : value[locale];

/** `/contact` → `/en/contact` en anglais, inchangé en français. */
export const localePath = (locale: Locale, path: string): string =>
  locale === "en" ? `/en${path === "/" ? "/" : path}` : path;

/** `/en/contact/` → `{ locale: "en", path: "/contact" }`. */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const m = /^\/en(?=\/|$)(.*)$/.exec(pathname);
  const path = (m ? m[1] : pathname)?.replace(/\/$/, "") || "/";
  return { locale: m ? "en" : "fr", path };
}

/** Une page par langue pour les routes `src/pages/[...locale]/*`. */
export const getStaticPaths = () => [
  { params: { locale: undefined } },
  { params: { locale: "en" } },
];

export const ui = {
  fr: {
    lang: "fr-FR",
    ogLocale: "fr-FR",
    siteDescription:
      "Architecte e-commerce : écoute du métier, cadrage, intégrations SI (ERP, PIM, OMS, Mirakl) et développement Shopify. Rouen · Paris · Remote.",
    skipToContent: "Aller au contenu",
    mainNav: "Navigation principale",
    footerNav: "Navigation pied de page",
    home: "rndgf — accueil",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    freelance: "freelance",
    references: "références",
    about: "à propos",
    contact: "contact",
    contactMe: "me contacter",
    language: "Langue",
    jobTitle: "Architecte e-commerce, Solutions Architect",
    knowsAbout: [
      "Shopify",
      "Magento",
      "Architecture e-commerce",
      "Intégration ERP / PIM",
      "Mirakl",
    ],
    region: "Normandie",
    referenceType: { Agence: "agence", Freelance: "freelance" },
  },
  en: {
    lang: "en",
    ogLocale: "en_US",
    siteDescription:
      "E-commerce architect: listening to the business, scoping, system integrations (ERP, PIM, OMS, Mirakl) and Shopify development. Rouen · Paris · Remote.",
    skipToContent: "Skip to content",
    mainNav: "Main navigation",
    footerNav: "Footer navigation",
    home: "rndgf — home",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    freelance: "freelance",
    references: "references",
    about: "about",
    contact: "contact",
    contactMe: "contact me",
    language: "Language",
    jobTitle: "E-commerce architect, Solutions Architect",
    knowsAbout: [
      "Shopify",
      "Magento",
      "E-commerce architecture",
      "ERP / PIM integration",
      "Mirakl",
    ],
    region: "Normandy",
    referenceType: { Agence: "agency", Freelance: "freelance" },
  },
} as const satisfies Record<Locale, unknown>;
