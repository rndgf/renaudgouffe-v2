export interface CvEvent {
  date: string;
  /** Intitulé en gros ; absent quand l'employeur est affiché par son logo. */
  title?: string;
  /** Lignes secondaires (postes, établissement…). */
  lines: string[];
  /** Employeur affiché par son logo (Colorz) ou son wordmark texte (ftel). */
  org?: "colorz" | "ftel";
  /** Période en cours : pastille ambrée. */
  current?: boolean;
}

export interface CvSection {
  category: string;
  events: CvEvent[];
}

export const cvSections: CvSection[] = [
  {
    category: "Expériences professionnelles",
    events: [
      {
        date: "depuis 2020",
        org: "colorz",
        current: true,
        lines: [
          "Solution Architect Shopify",
          "Senior Technical Consultant",
          "Senior Lead Developer",
        ],
      },
      {
        date: "2015 → 2020",
        org: "colorz",
        lines: ["Senior Technical Consultant", "Senior Lead Developer"],
      },
      { date: "2010 → 2014", org: "colorz", lines: ["Lead Developer"] },
      {
        date: "2003 → 2010",
        org: "ftel",
        lines: ["Développeur web (dont 2 ans en formation en alternance)"],
      },
    ],
  },
  {
    category: "Expériences freelance",
    events: [
      { date: "depuis 2021", title: "Freelance Shopify", current: true, lines: [] },
      { date: "depuis 2009", title: "Freelance Magento", lines: [] },
      { date: "depuis 2005", title: "Freelance en développement web", lines: [] },
    ],
  },
  {
    category: "Formation",
    events: [
      {
        date: "2003 → 2005",
        title: "BTS « Conception et développement multimédia »",
        lines: ["CESI Rouen · en alternance chez FTEL"],
      },
      {
        date: "1998 → 2003",
        title: "Licence en Géographie",
        lines: ["Université de Rouen"],
      },
      {
        date: "1998",
        title: "Baccalauréat Littéraire",
        lines: ["Lycée du Canada (Évreux)"],
      },
    ],
  },
];
