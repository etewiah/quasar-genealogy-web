# Architecture

## Directory Structure

```
quasar-genealogy-web/
├── src/
│   ├── App.vue                        # Root Vue app component
│   ├── router/
│   │   ├── index.js                   # Vue Router setup
│   │   └── routes.js                  # Route definitions
│   ├── layouts/
│   │   └── MainLayout.vue             # App shell: header, drawers, footer
│   ├── pages/
│   │   ├── IndexPage.vue              # Landing page (/)
│   │   ├── TopolaStaticDataPage.vue   # Family tree viewer (/static-data)
│   │   └── ErrorNotFound.vue          # 404 page
│   ├── components/
│   │   ├── TopolaWrapper.vue          # SVG chart renderer (core)
│   │   ├── TopolaIndividual.vue       # Selected person detail panel
│   │   ├── TopolaSettings.vue         # Settings panel (chart type, colors, orientation)
│   │   ├── TopolaExample.vue          # Unused example component
│   │   ├── EssentialLink.vue          # Unused Quasar starter component
│   │   ├── content/
│   │   │   ├── ProjectIntro.vue       # Landing page content
│   │   │   └── GenealogyFooter.vue    # Global footer
│   │   └── sharing/
│   │       ├── QrCodeShare.vue        # QR code for current URL
│   │       └── SocialSharing.vue      # Social share links
│   ├── compose/
│   │   ├── useTopolaData.js           # Data filtering/cleanup logic
│   │   └── useLocalDataForTopola.js   # LocalStorage config persistence
│   └── data/
│       ├── KennedyFamilyData.ged.js   # Kennedy GEDCOM data (JS string export)
│       ├── KennedyFamilyData.json     # Same data pre-converted to JSON
│       ├── MinimalExampleData.ged.js  # Minimal example GEDCOM
│       └── MinimalExampleData.json    # Minimal example pre-converted
├── src-ssr/                           # Optional SSR server files
│   ├── server.js
│   ├── middlewares/render.js
│   └── ssr-flag.d.ts
├── quasar.config.js                   # Quasar/Vite build config
├── package.json
└── jsconfig.json
```

---

## Data Flow

```
GEDCOM file (*.ged.js)
        │
        ▼
topola.gedcomToJson()           ← converts raw GEDCOM text to structured JSON
        │
        ▼
useTopolaData.getFocusedData()  ← filters to families relevant to the focused person
        │
        ▼
useTopolaData.cleanUpTopolaJson() ← strips dangling family references from individuals
        │
        ▼
TopolaWrapper.vue               ← creates and renders the SVG chart via topola.createChart()
        │
        ▼
<svg id="graph" />              ← rendered in the DOM
```

---

## Configuration Flow

```
LocalStorage ('topola-config')
        │
        ▼
useLocalDataForTopola.getLocalTopolaConfig()
        │
        ▼
MainLayout.vue  (topolaConfig reactive ref)
        │
        ├──► TopolaSettings.vue   (reads + mutates config via events)
        │
        └──► TopolaStaticDataPage.vue → TopolaWrapper.vue  (consumes config)
```

Settings changes emit events upward to `MainLayout`, which updates the shared reactive `topolaConfig` ref. This ref is passed as a prop down to `TopolaWrapper`, which watches it and re-renders the chart.

---

## URL Navigation

Navigating to a specific person is done via query parameter:

```
/static-data?personID=I1
```

- `TopolaStaticDataPage` reads `route.query.personID` on mount
- `TopolaWrapper` watches `$route.query.personID` and calls `updateChart()` on change
- `TopolaIndividual` watches `$route.query.personID` and calls `updateCurrentUser()` on change

The indiUrl template passed to topola is:
```
/static-data?personID=${id}
```

This means clicking a person node in the chart navigates the browser to that person's view.

---

## SSR Considerations

The project includes `src-ssr/` for optional server-side rendering. The `QrCodeShare` component wraps its QR code in `<q-no-ssr>` because `window.location` is not available server-side. Other components access `window` conditionally for the same reason.
