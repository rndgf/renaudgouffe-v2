# renaudgouffe.fr

Site personnel de Renaud Gouffé — consultant Shopify, architecte e-commerce, développeur senior.

Construit avec [Astro](https://astro.build) 5 + Tailwind CSS 4. Site statique, dark theme, zéro framework JS côté client (interactions en JS vanilla + `IntersectionObserver`).

## Commandes

| Commande          | Action                                        |
| :---------------- | :-------------------------------------------- |
| `npm install`     | Installe les dépendances                      |
| `npm run dev`     | Serveur de dev sur `localhost:4321`           |
| `npm run build`   | Build de production dans `./dist/`            |
| `npm run preview` | Prévisualise le build localement              |

## Où éditer le contenu

| Contenu                          | Fichier                       |
| :------------------------------- | :---------------------------- |
| Références (timeline)            | `src/data/references.ts`      |
| CV (expériences, formation)      | `src/data/cv.ts`              |
| Textes homepage                  | `src/pages/index.astro`       |
| Page freelance Shopify (SEO)     | `src/pages/freelance-shopify.astro` |
| Métadonnées site (titre, langue) | `src/site.config.ts`          |
| Design system (couleurs, fonts)  | `src/styles/global.css` (`@theme`) |

## Ajouter une référence

Ajouter une entrée dans le tableau `references` de `src/data/references.ts` :

```ts
{ name: "Client", year: 2026, type: "Agence", techs: ["Shopify"] },
```

La timeline, les filtres et le compteur se mettent à jour automatiquement.
Plateformes disponibles : `Shopify`, `Magento`, `Magento 2`, `WordPress`, `Mirakl`, `Cegid`, `Marketplace`, `Sur-mesure` (couleurs dans `platformColor`, même fichier).

## Pages

- `/` — homepage (hero, services, bio, contact)
- `/references` — timeline des missions 2004 → aujourd'hui, filtrable par type et plateforme
- `/cv` — parcours, freelance, formation
- `/freelance-shopify` — landing SEO freelance
- Contact : lien `mailto:` (header, CTA, footer)
