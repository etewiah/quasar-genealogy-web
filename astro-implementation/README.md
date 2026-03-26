# Genealogy Site — Astro Implementation

This is a re-implementation of the [quasar-genealogy-web](../) project using the [Astro](https://astro.build/) framework with Vue 3 components.

## Overview

The app is functionally identical to the Quasar version: it loads Kennedy Family GEDCOM data, renders an interactive SVG family tree using the [topola](https://github.com/PeWu/topola) library, and lets you navigate through family relationships. Chart type, orientation, and colour scheme are configurable and persisted in `localStorage`.

## Key differences from the Quasar version

| Concern | Quasar version | Astro version |
|---|---|---|
| Framework | Quasar + Vue 3 (SPA) | Astro + Vue 3 (static site + islands) |
| Routing | Vue Router | Astro file-based routing |
| Navigation | `router.push()` (client-side) | Full page reload (`?personID=X`) |
| Icons | `@quasar/extras/mdi-v5` | Inline SVG paths |
| QR code | `@vueuse/integrations/useQRCode` | `qrcode` npm package directly |
| localStorage | Quasar `LocalStorage` wrapper | Native `localStorage` |
| UI components | Quasar (`q-radio`, `q-drawer`, etc.) | Plain HTML + CSS |
| Chart island | Entire app is reactive (SPA) | `FamilyTreeApp.vue` with `client:only="vue"` |

## Architecture

The Astro version uses a single Vue island (`FamilyTreeApp.vue`) for all interactive content on the chart page. Astro's server-rendered HTML is used for the static pages (landing page, nav, footer).

```
src/pages/index.astro          → static landing page
src/pages/static-data.astro    → mounts FamilyTreeApp.vue (client:only)
src/components/FamilyTreeApp.vue     → root Vue island (owns all state)
src/components/TopolaChart.vue       → SVG chart renderer (topola)
src/components/TopolaIndividual.vue  → selected person detail
src/components/TopolaSettings.vue   → chart type / orientation / color controls
src/components/sharing/QrCodeShare.vue
src/components/sharing/SocialSharing.vue
src/composables/useTopolaData.js     → data filtering (identical to original)
src/composables/useLocalConfig.js    → localStorage config persistence
src/data/KennedyFamilyData.json      → pre-converted genealogy dataset
```

## Getting started

```bash
npm install
npm run dev       # development server at http://localhost:4321
npm run build     # production build → dist/
npm run preview   # preview production build
```

## Notes

- `postcss.config.cjs` in this folder is intentionally empty — it prevents Vite from picking up the parent Quasar project's PostCSS config (which requires packages not installed here).
- The `topola` library's D3-based chart rendering is browser-only. `FamilyTreeApp.vue` uses `client:only="vue"` to ensure it never runs during Astro's server-side build.
