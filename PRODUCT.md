# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Sources : entretien avec Renaud du 2026-11-04, sauf mention contraire.

Visiteurs prioritaires :

- **Recruteurs et employeurs** qui évaluent un profil pour un poste salarié. Ils arrivent depuis un lien (CV, profil, candidature, recherche sur le nom) et veulent juger vite le niveau, le parcours et le périmètre.
- **DSI et équipes techniques** qui cherchent un regard d'architecte sur leur système d'information : ERP, PIM, OMS, middleware, marketplace.

Visiteurs secondaires : e-commerçants et agences qui cherchent une mission freelance Shopify. Ils restent servis par `/freelance-shopify` (source : `src/pages/freelance-shopify.astro`), sans porter le message principal.

Postes que le site prépare, sans les nommer comme une recherche :

- Solutions Architect ;
- architecte d'entreprise ou architecte SI ;
- Lead engineer ou Staff engineer.

## Product Purpose

Site personnel de Renaud Gouffé. Il présente son expertise en architecture e-commerce, en intégrations SI et en développement.

Objectif au 2026-11-04 : préparer une future recherche de poste. Renaud est en poste chez Colorz et ne cherche pas encore. Le site doit donc rendre le profil lisible pour un recruteur, sans signaler une disponibilité ni une recherche active.

Succès : un recruteur ou une DSI comprend en une visite le niveau du profil, son périmètre (architecture, SI, code) et sa trajectoire, puis sait comment le contacter.

## Positioning

Un architecte qui code encore. Le profil combine trois niveaux qu'un candidat voisin couvre rarement ensemble :

- décision d'architecture : cadrage, choix de plateforme, replatforming ;
- intégration SI : connecteurs vers ERP, PIM, OMS, marketplace Mirakl ;
- développement senior : Shopify Functions, UI Extensions, checkout, sur-mesure.

Parcours chiffré par le site : dix ans de Magento, Shopify ensuite (source : `src/pages/index.astro`).

## Operating Context

- Langue : français uniquement (`lang: "fr-FR"`, source : `src/site.config.ts`).
- Prise de contact : page `/contact` et lien `mailto:` dans l'en-tête, le bandeau d'appel à l'action et le pied de page (source : `README.md`).
- Pages : `/`, `/references`, `/cv`, `/freelance-shopify`, `/contact`, `/404` (source : `src/pages/`).
- Employeur actuel : le site cite Colorz par lien. Un collègue ou la direction de Colorz peut lire le site ; rien ne doit y ressembler à une annonce de départ.

## Capabilities and Constraints

- Site statique Astro 7 et Tailwind CSS 4, sans framework JavaScript côté client. Node 22.12 ou plus (source : `README.md`, `package.json`).
- Hébergement GitHub Pages, domaine `www.renaudgouffe.fr` (source : `CNAME`, `src/site.config.ts`).
- Contenu éditable dans les données : références dans `src/data/references.ts`, parcours dans `src/data/cv.ts`.
- `/freelance-shopify` reste en ligne pour le référencement, en second plan.
- **Ancienneté :** le site écrit « depuis 2003 », jamais un nombre d'années (décision de Renaud du 2026-11-04).
- **Parcours Colorz :** Senior Lead Developer de 2010 à 2019, consultant technique depuis 2019, Solutions Architect depuis 2020 (décision de Renaud du 2026-11-04, source : `src/data/cv.ts`).

## Brand Commitments

- Nom affiché : Renaud Gouffé. Signature courte : RNDGF (pied de page).
- Titre actuel : Solutions Architect chez Colorz (source : `src/pages/index.astro`, commit `e90f7cb`).
- Voix : première personne, ton direct et sobre, sans superlatif commercial.
- Logo : chevron et curseur (source : `public/favicon.svg`, commit `71aba40`).

## Evidence on Hand

- Références : 36 clients au 2026-11-04 (22 en agence, 14 en freelance), avec année, type, plateformes et parfois une courte description et le rôle tenu (source : `src/data/references.ts`).
- Parcours, postes et formation : `src/data/cv.ts`.
- Photo : `public/me-avatar.webp`. Image de partage : `public/og.jpg`.

Absent, à ne jamais inventer :

- logos clients ;
- témoignages ;
- chiffres de résultat (chiffre d'affaires, conversion, performance) ;
- études de cas.

Les références s'affichent par leur nom seulement (décision de Renaud du 2026-11-04).

## Product Principles

1. **Le profil d'abord, l'offre ensuite.** Chaque page aide à juger un candidat senior ; l'offre freelance reste accessible sans dominer.
2. **Discret sur l'intention.** Aucun « disponible », « open to work » ni « en recherche ». Le parcours et le niveau parlent seuls.
3. **Trois niveaux visibles ensemble.** Architecture, SI et code apparaissent côte à côte ; aucun ne disparaît derrière les autres.
4. **Preuve factuelle uniquement.** Noms de clients, années, plateformes, rôles : rien qui ne soit dans les données du dépôt.
