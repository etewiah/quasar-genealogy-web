# Component Reference

## Pages

### `IndexPage.vue`

The landing page at `/`. Renders only `ProjectIntro` — a static content component explaining the project.

---

### `TopolaStaticDataPage.vue`

The main application page at `/static-data`. Orchestrates loading and filtering of GEDCOM data.

**What it does:**
1. Imports Kennedy Family GEDCOM data from `src/data/KennedyFamilyData.ged.js`
2. Converts it to JSON with `topola.gedcomToJson()`
3. Reads `?personID` from the URL query string
4. Falls back to the first individual if no `personID` is given or it is not found
5. Calls `getFocusedData()` to filter to the relevant subgraph
6. Calls `cleanUpTopolaJson()` to remove dangling family references
7. Passes the cleaned data to `TopolaWrapper` and `TopolaIndividual`

**Props received from layout:**
- `topolaConfig` — chart display configuration object

---

## Layout

### `MainLayout.vue`

The app shell. Wraps all pages via the router.

**Responsibilities:**
- Top navigation bar with "Home" and "Kennedy Demo" links
- Settings gear button (only shown on the `/static-data` route)
- Right-side drawer containing `TopolaSettings`
- Passes `topolaConfig` reactive ref as a prop to the active page via `<router-view>`
- Renders `SocialSharing`, `QrCodeShare`, and `GenealogyFooter` globally

**Config management:**
- Loads initial config from `localStorage` via `useLocalDataForTopola`
- Listens to events emitted by `TopolaSettings` and mutates `topolaConfig` reactively

---

## Core Components

### `TopolaWrapper.vue`

The heart of the application. Renders the interactive family tree SVG.

**Props:**
| Prop | Type | Required | Description |
|---|---|---|---|
| `topolaData` | Object | Yes | The filtered topola JSON `{ indis, fams }` |
| `focusedIndiForGraph` | Object | No | The individual to center the chart on |
| `topolaConfig` | Object | No | Chart display settings |

**How it works:**
- On mount, calls `initiateChart()` which creates a topola chart instance with `topola.createChart()`
- The chart is rendered into `<svg id="graph" />`
- Watches `$route.query.personID` — when it changes, calls `updateChart()`
- Watches `topolaConfig` (deep) — when it changes, calls `updateChart()`
- `updateChart()` optimizes re-renders: horizontal orientation changes can be applied without clearing the SVG; all other changes (chart type, renderer, colors) require clearing the SVG innerHTML first

**Chart init options passed to topola:**

```js
{
  json: topolaData,
  animate: true,
  svgSelector: '#graph',
  chartType: topola[topolaConfig.topolaChartType],
  renderer: topola[topolaConfig.topolaRenderer],
  indiUrl: '/static-data?personID=${id}',    // click nav template
  famUrl: '/static-data?familyID=${id}',
  horizontal: topolaConfig.chartIsHorizontal,
  colors: topola.ChartColors[topolaConfig.chartColors],
  indiCallback: topolaIndiCallback,
  updateSvgSize: true,
}
```

**Debug feature:**
A `showRawData` data flag (default `false`) controls whether `vue-json-pretty` panels are shown above/below the chart for inspecting raw `fams` and `indis` data.

---

### `TopolaIndividual.vue`

Displays a detail panel for the currently focused individual.

**Props:**
| Prop | Type | Required | Description |
|---|---|---|---|
| `topolaJsonData` | Object | No | The filtered topola JSON `{ indis, fams }` |

**What it shows (when a person is selected):**
- Full name (`firstName + lastName`)
- Birth and optionally death location sentence, e.g. _"John Kennedy was born in Brookline and died in Dallas"_
- Notes (currently disabled — commented out)

**Behavior:**
- Watches `$route.query.personID` immediately — looks up the matching individual from `topolaJsonData.indis` when the URL changes

---

### `TopolaSettings.vue`

A settings panel rendered inside the right drawer.

**Props:**
| Prop | Type | Description |
|---|---|---|
| `topolaConfig` | Object | Current chart configuration |

**Emitted events:**
| Event | Payload | Description |
|---|---|---|
| `triggerChartTypeChanged` | `String` | New chart type key (e.g. `"HourglassChart"`) |
| `triggerLayoutChanged` | `Boolean` | `true` = horizontal, `false` = vertical |
| `triggerRendererChanged` | `String` | New renderer key |
| `triggerChartColorsChanged` | `String` | New color scheme key |

**Available chart types:**
- `AncestorChart` — shows ancestors of the focused person
- `DescendantChart` — shows descendants
- `KinshipChart` — shows kinship relationships
- `RelativesChart` — shows all relatives
- `HourglassChart` — shows both ancestors and descendants (default)
- `FancyChart` — available in topola but currently commented out in the UI

**Orientation options:** Horizontal / Vertical

**Color schemes:**
- `COLOR_BY_GENERATION` — each generation gets a distinct color (default)
- `COLOR_BY_SEX` — nodes are colored by gender

**Side effect:** Each change also persists the setting to `localStorage` via `useLocalDataForTopola.updateLocalConfig()`.

---

## Content Components

### `ProjectIntro.vue`

Static marketing/intro content rendered on the landing page. No props or logic.

### `GenealogyFooter.vue`

Global footer rendered at the bottom of every page. No props or logic.

---

## Sharing Components

### `QrCodeShare.vue`

Displays a QR code that encodes the current page URL, allowing the user to scan it to open the same view on another device.

**Props:**
| Prop | Type | Description |
|---|---|---|
| `urlProp` | String | Override URL. Falls back to `window.location.origin + route.href` |
| `qrCodeTitle` | String | Alt text for the QR image |

**Implementation:**
- Uses `@vueuse/integrations/useQRCode` to generate a data-URI image
- Wrapped in `<q-no-ssr>` because `window.location` is not available during SSR

### `SocialSharing.vue`

Renders social sharing links for the current page. No documented props.
