export interface CvEvent {
  date: string;
  title: string;
  roles?: string[];
  company?: string;
  url?: string;
  logo?: string;
  logoClass?: string;
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
        date: "Depuis 2020",
        title: "Colorz",
        roles: [
          "Solution Architect Shopify",
          "Senior Technical Consultant",
          "Senior Lead Developer",
        ],
        company: "Colorz",
        url: "https://www.colorz.fr/",
        logo: "/assets/icons/colorz.svg",
        logoClass: "h-6 brightness-0 invert",
      },
      {
        date: "2015 → 2020",
        title: "Colorz",
        roles: ["Senior Technical Consultant", "Senior Lead Developer"],
        company: "Colorz",
        url: "https://www.colorz.fr/",
        logo: "/assets/icons/colorz.svg",
        logoClass: "h-6 brightness-0 invert",
      },
      {
        date: "2010 → 2014",
        title: "Colorz",
        roles: ["Lead Developer"],
        company: "Colorz",
        url: "https://www.colorz.fr/",
        logo: "/assets/icons/colorz.svg",
        logoClass: "h-6 brightness-0 invert",
      },
      {
        date: "2005 → 2010",
        title: "FTEL",
        roles: ["Développeur web"],
        company: "FTEL",
        url: "https://www.ftel.fr/",
        logo: "/assets/icons/ftel.svg",
        logoClass: "h-7",
      },
      {
        date: "2003 → 2005",
        title: "FTEL",
        roles: ["Contrat de professionnalisation (BTS)"],
        company: "FTEL",
        url: "https://www.ftel.fr/",
        logo: "/assets/icons/ftel.svg",
        logoClass: "h-7",
      },
    ],
  },
  {
    category: "Expériences freelance",
    events: [
      { date: "Depuis 2021", title: "Freelance Shopify" },
      { date: "Depuis 2009", title: "Freelance Magento" },
      { date: "Depuis 2005", title: "Freelance en développement web" },
    ],
  },
  {
    category: "Formation",
    events: [
      {
        date: "2003 → 2005",
        title: "BTS « Conception et développement multimédia »",
        roles: [
          'CESI Rouen — réalisé en alternance chez <a href="https://www.ftel.fr/" target="_blank" rel="nofollow noopener" class="text-accent-2 underline decoration-accent-2/40 underline-offset-2 hover:decoration-accent-2">FTEL</a>',
        ],
      },
      {
        date: "1998 → 2003",
        title: "Licence en Géographie",
        roles: ["Université de Rouen"],
      },
      {
        date: "1998",
        title: "Baccalauréat Littéraire",
        roles: ["Lycée du Canada (Évreux)"],
      },
    ],
  },
];
