import type { Localized } from "@/i18n";

export interface CvEvent {
  date: Localized;
  /** Intitulé en gros ; absent quand l'employeur est affiché par son logo. */
  title?: Localized;
  /** Lignes secondaires (postes, établissement…). */
  lines: Localized[];
  /** Employeur affiché par son logo (Colorz) ou son wordmark texte (ftel). */
  org?: "colorz" | "ftel";
  /** Période en cours : pastille ambrée. */
  current?: boolean;
}

export interface CvSection {
  category: Localized;
  events: CvEvent[];
}

export const cvSections: CvSection[] = [
  {
    category: { fr: "Expériences professionnelles", en: "Professional experience" },
    events: [
      {
        date: { fr: "depuis 2020", en: "since 2020" },
        org: "colorz",
        current: true,
        lines: [
          "Solutions Architect Shopify",
          "Senior Technical Consultant",
          "Senior Lead Developer",
        ],
      },
      {
        date: "2019 → 2020",
        org: "colorz",
        lines: ["Senior Technical Consultant", "Senior Lead Developer"],
      },
      { date: "2015 → 2019", org: "colorz", lines: ["Senior Lead Developer"] },
      { date: "2010 → 2014", org: "colorz", lines: ["Senior Lead Developer"] },
      {
        date: "2003 → 2010",
        org: "ftel",
        lines: [
          {
            fr: "Développeur web (dont 2 ans en formation en alternance)",
            en: "Web developer (including 2 years as a work-study trainee)",
          },
        ],
      },
    ],
  },
  {
    category: { fr: "Expériences freelance", en: "Freelance experience" },
    events: [
      {
        date: { fr: "depuis 2021", en: "since 2021" },
        title: "Freelance Shopify",
        current: true,
        lines: [],
      },
      { date: { fr: "depuis 2009", en: "since 2009" }, title: "Freelance Magento", lines: [] },
      {
        date: { fr: "depuis 2005", en: "since 2005" },
        title: { fr: "Freelance en développement web", en: "Freelance web development" },
        lines: [],
      },
    ],
  },
  {
    category: { fr: "Formation", en: "Education" },
    events: [
      {
        date: "2003 → 2005",
        title: {
          fr: "BTS « Conception et développement multimédia »",
          en: "BTS (two-year degree) in multimedia design and development",
        },
        lines: [
          { fr: "CESI Rouen · en alternance chez FTEL", en: "CESI Rouen · work-study at FTEL" },
        ],
      },
      {
        date: "1998 → 2003",
        title: { fr: "Licence en Géographie", en: "Bachelor's degree in Geography" },
        lines: [{ fr: "Université de Rouen", en: "University of Rouen" }],
      },
      {
        date: "1998",
        title: { fr: "Baccalauréat Littéraire", en: "Baccalauréat (literary track)" },
        lines: ["Lycée du Canada (Évreux)"],
      },
    ],
  },
];
