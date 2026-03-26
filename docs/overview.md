# Project Overview

## What is quasar-genealogy-web?

`quasar-genealogy-web` is an interactive genealogy family tree viewer built with [Quasar Framework](https://quasar.dev/) (Vue 3). It reads GEDCOM-format genealogy data, converts it to a structured JSON format, and renders it as an interactive SVG chart using the [topola](https://github.com/PeWu/topola) library.

A live demo is available at: [https://quasar-genealogy-web-demo.chattymaps.com/](https://quasar-genealogy-web-demo.chattymaps.com/)

---

## Goals

- Provide a clean, embeddable family tree viewer that works from static data (GEDCOM files)
- Allow end users to navigate through family relationships interactively
- Support multiple chart views (ancestor, descendant, hourglass, kinship, relatives)
- Enable easy sharing of a specific person's view via URL and QR code
- Serve as a foundation for a future backend-connected genealogy application with AI-enhanced features

---

## Current Limitations

- **Static data only** — the dataset is a hardcoded GEDCOM file bundled with the app. There is no live backend or API integration yet.
- **Single dataset** — the demo ships with Kennedy Family data. Switching datasets requires a code change.
- **No user accounts or persistence** — chart configuration is stored in `localStorage`, and there is no user authentication.
- **Notes disabled** — the `notesAboutPerson` feature in `TopolaIndividual` is commented out pending a better data model.

---

## Planned Future Work

- Connect a REST API backend (options under consideration: [geneac](https://github.com/mrysav/geneac) Rails app, custom Rails API using [this schema](https://github.com/sedelmeyer/family-genealogy-database), or [Gramps Web API](https://github.com/gramps-project/gramps-web-api))
- AI-powered features for exploring and enriching genealogy records
- Dynamic GEDCOM upload from the browser

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | [Quasar v2](https://quasar.dev/) + Vue 3 |
| Build Tool | Vite (via `@quasar/app-vite`) |
| Routing | Vue Router v4 |
| Chart rendering | [topola v3](https://github.com/PeWu/topola) |
| GEDCOM parsing | `topola.gedcomToJson()` |
| QR code generation | `qrcode` + `@vueuse/integrations/useQRCode` |
| JSON debug display | `vue-json-pretty` |
| Composable utilities | `@vueuse/core` |
| Config persistence | Quasar `LocalStorage` |
| SSR support | `src-ssr/` (optional) |
