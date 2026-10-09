# renaudgouffe.fr

Site personnel de Renaud Gouffé — consultant Shopify, architecte e-commerce, développeur senior.

Construit avec [Astro](https://astro.build) 7 + Tailwind CSS 4. Site statique, dark theme, zéro framework JS côté client (interactions en JS vanilla + `IntersectionObserver`).

**Node 22.12 ou plus est requis** (imposé par Astro 7). La CI GitHub Pages est alignée sur Node 22.

## Commandes

| Commande          | Action                                        |
| :---------------- | :-------------------------------------------- |
| `npm install`     | Installe les dépendances                      |
| `npm run dev`     | Serveur de dev sur `localhost:4321`           |
| `npm run build`   | Build de production dans `./dist/`            |
| `npm run preview` | Prévisualise le build localement              |
| `npm run check`   | Vérification TypeScript / Astro               |

## Où éditer le contenu

| Contenu                          | Fichier                       |
| :------------------------------- | :---------------------------- |
| Références (timeline)            | `src/data/references.ts`      |
| CV (expériences, formation)      | `src/data/cv.ts`              |
| Textes homepage                  | `src/pages/index.astro`       |
| Page freelance Shopify (SEO)     | `src/pages/freelance-shopify.astro` |
| Métadonnées site (titre, langue) | `src/site.config.ts`          |
| Design system (couleurs, fonts)  | `src/styles/global.css` (`@theme`) |

Tailwind 4 se configure entièrement en CSS via le bloc `@theme` de `src/styles/global.css`. Il n'y a pas de `tailwind.config.ts` : ce format v3 n'est plus lu par Tailwind 4.

## Ajouter une référence

Ajouter une entrée dans le tableau `references` de `src/data/references.ts` :

```ts
{ name: "Client", year: 2026, type: "Agence", techs: ["Shopify"] },
```

La timeline et les compteurs se mettent à jour automatiquement.
Plateformes disponibles : `Shopify`, `Magento`, `Magento 2`, `WordPress`, `Mirakl`, `Cegid`, `Marketplace`, `Sur-mesure` (couleurs dans `platformColor`, même fichier).

## Pages

- `/` — homepage (hero, services, bio, contact)
- `/references` — timeline des missions 2004 → aujourd'hui, groupée par période et par type
- `/cv` — parcours, freelance, formation
- `/freelance-shopify` — landing SEO freelance
- Contact : lien `mailto:` (header, CTA, footer)

## Pièges connus

Deux réglages non évidents sont volontaires. Les retirer casse le site sans casser le build.

### `compressHTML: true` dans `astro.config.mjs`

Astro 7 a changé la valeur par défaut de `compressHTML` de `true` à `"jsx"`. Le mode `"jsx"` supprime les espaces entre éléments inline et colle les mots dans le rendu final : « l'agence**Colorz**en tant que », « 8**PROJETS** », « © 2026 —**RNDGF** ». Le build passe sans le moindre avertissement — seul l'affichage est touché. La ligne `compressHTML: true` restaure le comportement d'origine.

### Exclusion des `.astro` du linter Biome

`biome.json` exclut `**/*.astro` du `linter` et de l'`assist`. Biome 2 ne parse que le frontmatter des fichiers `.astro` et ignore le template : tout import ou variable consommé uniquement dans le template est signalé « inutilisé » — et marqué auto-corrigeable. Un `biome check --write` sans cette exclusion supprimerait les imports de `<Header />`, `<Footer />`, `<BottomNav />`, les préchargements de fontes et le JSON-LD. Biome 1 ne lintait pas les `.astro` du tout ; l'exclusion rétablit ce périmètre.

`css.parser.tailwindDirectives` est activé pour que Biome comprenne `@theme` et `@layer`.
