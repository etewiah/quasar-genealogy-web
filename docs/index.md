# Documentation

## Contents

- [Overview](overview.md) — What the project does, goals, tech stack, and current limitations
- [Getting Started](getting-started.md) — Installation, dev server, build commands, and routes
- [Architecture](architecture.md) — Directory structure, data flow, config flow, and URL navigation
- [Components](components.md) — Reference for all Vue components (pages, layout, core, sharing)
- [Composables](composables.md) — Reference for `useTopolaData` and `useLocalDataForTopola`
- [Data Model](data-model.md) — GEDCOM format, topola JSON schema, and how to add new datasets
- [Roadmap](roadmap.md) — Potential improvements: quick wins, medium-effort features, backend options, and AI features
- [Extracting Data from a Deployed Build](extracting-deployed-data.md) — How bundled GEDCOM data can be recovered from a live site, and why this matters for privacy
- [Firestore Backend](firestore/index.md) — Using Firebase as a backend: Storage vs Firestore, migration script, and security rules
  - [Approach A: Firebase Storage](firestore/approach-a-storage.md)
  - [Approach B: Firestore Structured Database](firestore/approach-b-firestore.md)
  - [Migration Script](firestore/migration.md)
  - [Security & Access Control](firestore/security.md)
- [Admin Interface](admin/index.md) — Password-protected admin for browsing and editing Firestore data
  - [Architecture](admin/architecture.md) — Auth flow, Astro mounting pattern, pagination, search, env vars
  - [Improvements](admin/improvements.md) — Prioritised spec for all identified UI/UX improvements
  - [Testing](admin/testing.md) — Test suites, mocking strategy, and coverage guide
