// Deux langues : français à la racine, anglais sous /en/ (routage i18n d'Astro, voir
// astro.config.mjs). Les URL se construisent avec `getRelativeLocaleUrl` d'`astro:i18n`,
// qui suit `trailingSlash` et `build.format` ; ce module garde le dictionnaire partagé.
import { getRelativeLocaleUrl } from "astro:i18n";
import { Marked } from "marked";

export type Locale = "fr" | "en";

/** Chaîne traduite ; une chaîne nue vaut pour les deux langues (noms propres, dates). */
export type Localized = string | Record<Locale, string>;

export const localeOf = (value: string | undefined): Locale => (value === "en" ? "en" : "fr");

export const t = (value: Localized, locale: Locale): string =>
  typeof value === "string" ? value : value[locale];

/** `/en/contact/` → `contact/` : chemin de la page sans préfixe de langue, à passer à `getRelativeLocaleUrl`. */
export const pagePath = (pathname: string, locale: Locale): string =>
  pathname.slice(getRelativeLocaleUrl(locale).length);

// Textes avec lien ou gras : écrits en Markdown dans les dictionnaires des pages, rendus
// ici en HTML au build. Lien interne `[texte](/references)` : préfixé selon la langue ;
// lien externe : nouvel onglet. Saut de ligne simple dans le texte = <br>.
// Le HTML brut passe tel quel (<span class="text-coral">, <abbr>, <br>…) ; un <a href="/…">
// écrit en HTML n'est pas préfixé par la langue : préférer la syntaxe Markdown pour les liens internes.
const inline = (locale: Locale) =>
  new Marked({
    breaks: true,
    renderer: {
      link({ href, tokens }) {
        const text = this.parser.parseInline(tokens);
        return href.startsWith("/")
          ? `<a href="${getRelativeLocaleUrl(locale, href.slice(1))}" class="link">${text}</a>`
          : `<a href="${href}" target="_blank" rel="nofollow noopener" class="link">${text}</a>`;
      },
      strong({ tokens }) {
        return `<strong class="font-medium text-strong">${this.parser.parseInline(tokens)}</strong>`;
      },
    },
  });
const parsers = { fr: inline("fr"), en: inline("en") };

/** Markdown inline → HTML, à passer à `set:html`. */
export const md = (text: string, locale: Locale): string =>
  parsers[locale].parseInline(text, { async: false });

/** Une page par langue pour les routes `src/pages/[...locale]/*`. */
export const getStaticPaths = () => [
  { params: { locale: undefined } },
  { params: { locale: "en" } },
];

export const ui = {
  fr: {
    lang: "fr-FR",
    ogLocale: "fr_FR",
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
