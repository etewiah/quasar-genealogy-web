# Roadmap & Improvement Options

This document describes potential improvements to the project, grouped by the effort required and whether they need a backend.

---

## Quick Wins — No Backend Required

These improvements work entirely in the browser and can be built on top of the existing Quasar + Vue frontend.

---

### 1. GEDCOM File Upload

**What it is:** A file picker (`<input type="file" accept=".ged">`) that lets a user upload their own GEDCOM file. The file is read with the [FileReader API](https://developer.mozilla.org/en-US/docs/Web/API/FileReader), the text content is passed to `topola.gedcomToJson()`, and the resulting JSON replaces the hardcoded Kennedy dataset.

**Why it matters:** This is the single biggest usability improvement possible without a backend. Right now, anyone who wants to explore their own family tree must modify the source code and rebuild the app. A file picker makes the tool useful for anyone with a `.ged` export from Ancestry, FamilySearch, MyHeritage, or any other genealogy application.

**Implementation notes:**
- All parsing logic already exists in `topola.gedcomToJson()` — only the data source needs to change
- The resulting JSON can be stored in component state (reactive ref) and passed to `TopolaWrapper` and `useTopolaData`
- The uploaded dataset could be persisted to `localStorage` or IndexedDB so it survives a page reload (see option 5 below)
- The URL-based `?personID=` navigation would continue to work unchanged once the data is loaded

**Effort:** Low (a few hours). The hardest part is deciding where to place the upload UI and how to handle the loading state.

---

### 2. Search / Jump-to-Person

**What it is:** An autocomplete search box that filters `allJsonData.indis` by name and navigates to the selected person by updating `?personID=` in the URL.

**Why it matters:** With a large GEDCOM file (hundreds or thousands of individuals), navigating the tree by clicking node-to-node is impractical. Search is the primary way most users would want to find a specific ancestor or relative.

**Implementation notes:**
- Quasar's [`q-select`](https://quasar.dev/vue-components/select) with `use-input` and `filter` supports autocomplete over an array out of the box
- The search options array is `allJsonData.indis.map(i => ({ label: i.firstName + ' ' + i.lastName, value: i.id }))`
- On selection, navigate to `router.push({ query: { personID: selected.value } })`
- Could also display birth year alongside the name to disambiguate people with the same name

**Effort:** Low (1–2 hours).

---

### 3. Richer Individual Profile Panel

**What it is:** Expand the `TopolaIndividual` component to display all the data that GEDCOM carries for a person: occupation, notes, sources, marriage events, additional dates and places.

**Why it matters:** The current panel shows only name and birth/death place. A real genealogy record is much richer — occupation, notes from the researcher, source citations, marriage details, and sometimes even photos (stored as file references in GEDCOM). Surfacing this makes each person feel like a real historical record.

**What GEDCOM carries that is not currently shown:**
- `OCCU` — occupation
- `NOTE` — researcher's notes
- `SOUR` — source citations (census records, vital records, etc.)
- `MARR` — marriage event with date and place (on the family record `fam`, not the individual)
- `RESI` — residence events with date and place
- `BURI` — burial place
- `EDUC` — education
- `RELI` — religion

**Implementation notes:**
- `topola.gedcomToJson()` may or may not preserve all these fields; check what the parsed JSON actually contains for a given GEDCOM file by inspecting `allJsonData.indis` in the browser console
- If topola strips fields, consider using a dedicated GEDCOM parser (e.g. [`parse-gedcom`](https://www.npmjs.com/package/parse-gedcom)) in parallel to extract the full record, keyed by individual ID
- The panel could be a collapsible sidebar or a modal/drawer triggered by clicking a person's name

**Effort:** Medium (half a day to a day, depending on how complete the data extraction is).

---

### 4. Configurable Relative Depth

**What it is:** UI controls that let the user choose how many generations of ancestors and/or descendants to display around the focused person.

**Why it matters:** `useTopolaData.getFocusedData()` already has a `showGrandchildren` parameter that is hardcoded to `false`. The function is also recursive, making it straightforward to extend to arbitrary ancestor/descendant depth. Exposing this as a slider or +/− control gives users meaningful control over how much of the tree they see at once without requiring navigation.

**Implementation notes:**
- `getFocusedData` currently shows: the focused person's parents, siblings, spouse(s), and children
- `showGrandchildren = true` adds one more level of children
- To support ancestor depth, extend `getFocusedData` to accept an `ancestorDepth` parameter and recurse upward through `famc` links similarly to how it recurses downward for grandchildren
- The topola library handles rendering any size dataset; the depth control is purely a data-filtering concern in `useTopolaData`

**Effort:** Medium (a few hours for the `useTopolaData` extension + UI).

---

## Medium Effort, High Value

These features are more involved but still achievable without a backend.

---

### 5. Local Dataset Persistence (IndexedDB)

**What it is:** After a user uploads a GEDCOM file (option 1), store the parsed JSON in the browser's [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) so it persists across page reloads and browser sessions. The app checks for a stored dataset on startup and loads it automatically.

**Why it matters:** Without persistence, the user must re-upload their GEDCOM file every time they open the app. Persistence makes the app feel like a proper personal tool rather than a stateless demo.

**Implementation notes:**
- Use [`@vueuse/integrations`](https://vueuse.org/integrations/useIDBKeyval/) which is already in the project dependencies: `useIDBKeyval('genealogy-data', null)` provides a reactive ref backed by IndexedDB with a simple key/value API
- Store the full parsed `allJsonData` JSON (not the raw GEDCOM text — the parsed JSON is faster to load on subsequent visits)
- Provide a "Clear / Upload new dataset" button so the user can replace the stored data
- `localStorage` is not suitable for large GEDCOM files (5 MB limit); IndexedDB has no practical size limit

**Effort:** Medium (half a day).

---

### 6. Timeline View

**What it is:** A supplementary view that plots the focused person and their immediate family on a horizontal time axis, using birth, marriage, and death dates from the GEDCOM data.

**Why it matters:** The tree chart shows structural relationships but collapses time. A timeline view shows the same family in a historical context — you can immediately see which generations overlapped, how long people lived, how old parents were when children were born.

**Implementation notes:**
- The data needed is already available: `birth.date`, `death.date` on individual records
- GEDCOM dates come in a variety of formats (`6 SEP 1888`, `ABT 1870`, `BEF 1900`, `1845`); a date parsing utility is needed to convert these to JavaScript `Date` objects
- [D3.js](https://d3js.org/) (already a transitive dependency via `topola`) is well-suited for this — a simple horizontal bar chart per person
- Alternatively, a charting library like [Chart.js](https://www.chartjs.org/) or [Apache ECharts](https://echarts.apache.org/) would require less D3 knowledge
- The view could be a second tab alongside the existing tree chart, sharing the same filtered dataset

**Effort:** Medium to high (1–2 days depending on date parsing robustness and desired interactivity).

---

### 7. Map View

**What it is:** A geographic map showing pins for the birth, death, marriage, and residence places associated with the focused person and their immediate family.

**Why it matters:** Many genealogy researchers are interested in migration patterns — where their ancestors came from, how far they moved. A map makes this immediately visual in a way text or a tree chart cannot.

**Implementation notes:**
- Place names in GEDCOM are freeform strings (`"East Boston, MA"`, `"County Cork, Ireland"`)
- These must be geocoded to lat/lng coordinates before mapping; options:
  - [Nominatim](https://nominatim.org/) (OpenStreetMap, free, rate-limited) — suitable for a personal tool
  - [MapBox Geocoding API](https://www.mapbox.com/geocoding) — more accurate, requires API key, has a generous free tier
  - Cache geocoded results in IndexedDB to avoid repeated API calls for the same place name
- Map rendering: [Leaflet.js](https://leafletjs.com/) with [vue-leaflet](https://vue-leaflet.com/) integrates cleanly with Vue 3
- Connect pins with lines to show migration paths (e.g. birth place → marriage place → death place for one individual)

**Effort:** High (2–3 days: geocoding pipeline + caching + map component + integration with filtered dataset).

---

## Backend Path

The README identifies adding a backend as the next major milestone. Here are the concrete options, in ascending order of effort.

---

### Option A: Gramps Web API

**What it is:** [Gramps Web API](https://github.com/gramps-project/gramps-web-api) is a Python/Flask REST API that exposes a full-featured genealogy backend. It reads from the Gramps database format and provides endpoints for individuals, families, events, places, sources, and media.

**Pros:**
- Fully-featured and production-ready
- Has a well-documented REST API
- Active open source community
- Includes authentication, user management, and multi-user support

**Cons:**
- Python stack — requires deploying a Python/Flask service
- As noted in the README: the underlying Gramps database serialises Python objects as blobs, which makes the API slow for large datasets and awkward to query from non-Python clients
- Data migration to/from GEDCOM requires going through the Gramps desktop application

**Verdict:** Best choice if you are comfortable with Python and want a complete, maintained solution. Not ideal if you want to stay in the Ruby/Rails ecosystem or need high API performance.

---

### Option B: geneac (Rails) + Custom API Layer

**What it is:** [geneac](https://github.com/mrysav/geneac) is an open-source Ruby on Rails genealogy application with a proper relational database schema. It currently has no API, but the data models and web UI are already built.

**Pros:**
- Ruby on Rails — matches your backend experience
- Clean relational schema (individuals, families, events stored as proper rows, not blobs)
- GEDCOM import already implemented
- Web UI included — usable as a standalone tool in addition to providing an API

**Cons:**
- No API yet — you would need to add JSON endpoints
- May not be actively maintained (check the repo's recent activity before committing)
- Would be running someone else's codebase rather than something you fully own

**Implementation plan:**
1. Fork geneac and deploy it (Heroku, Render, or a VPS)
2. Add a JSON API layer — at minimum:
   - `GET /api/individuals` — list all individuals (id, name, birth, death)
   - `GET /api/individuals/:id` — full record for one individual
   - `GET /api/families` — list all families with member IDs
   - `GET /api/families/:id` — one family record
3. Update `TopolaStaticDataPage.vue` to fetch from the API instead of importing static JSON

**Effort:** Medium (1–2 weeks to get a working API with basic endpoints).

---

### Option C: Custom Rails API from Scratch

**What it is:** Build a new Rails API-only application using a clean genealogy database schema, such as the one described in [sedelmeyer/family-genealogy-database](https://github.com/sedelmeyer/family-genealogy-database).

**Pros:**
- Full control over the schema, API design, and feature set
- No legacy code or design decisions to work around
- Can be designed specifically to serve the topola JSON format the frontend already expects
- Can add AI features, privacy controls, and any custom logic from the start

**Cons:**
- Most work up front — schema design, models, controllers, authentication, GEDCOM import, deployment
- No existing UI (would rely entirely on this Vue frontend)

**Schema considerations:**
- Core entities: `Individual`, `Family`, `Event`, `Place`, `Source`, `Note`, `Media`
- `Individual` belongs to many `Family` records (as child in one, as spouse in others)
- `Event` is polymorphic — an individual or family can have many events (birth, death, marriage, residence, etc.)
- Places should be a separate normalised table with optional lat/lng for map support
- Sources and notes should be linkable to any entity

**Recommended API output format:** Design the API to return the same JSON structure that `topola.gedcomToJson()` produces (`{ indis: [...], fams: [...] }`). This means the frontend requires no changes — just swap the data source from a static import to an API fetch call.

**Effort:** High (several weeks for a solid foundation with GEDCOM import, auth, and full CRUD).

---

## AI Features

These become practical once a backend is in place and individual records are queryable as structured data.

---

### AI Biographical Summaries

**What it is:** For a selected individual, send their structured data (name, birth/death dates and places, occupation, family connections, notable events) to an LLM and ask it to write a 2–3 sentence biographical summary in plain English.

**Example prompt:**
> "Write a 2–3 sentence biography of the following person based on their genealogical record: [JSON record]. Focus on the most historically interesting facts."

**Implementation notes:**
- Use the [Claude API](https://www.anthropic.com/api) (or OpenAI) from a backend endpoint — do not call the LLM directly from the frontend (API keys would be exposed)
- Cache summaries by individual ID in the database so the API is only called once per person
- Display the summary in the `TopolaIndividual` detail panel alongside the structured facts

**Effort:** Low once the backend exists (1–2 days: backend endpoint + frontend display).

---

### Gap Detection

**What it is:** Identify periods in a person's life where no records exist and provide historical context about what might have happened during those years.

**Example:** "We have records of Mary Kennedy in Boston in 1855 and in New York in 1872, but nothing in between. This was the period of the American Civil War (1861–1865) and significant Irish immigration…"

**Implementation notes:**
- Compute gaps from the structured events in the database (sort events by date, find intervals with no records)
- Pass the gap information along with the person's location and time period to an LLM
- The LLM can provide relevant historical context (wars, famines, migration waves, census years) that might explain the gap or suggest where to look for records

**Effort:** Medium (requires reliable date parsing across GEDCOM date formats before the gap computation is meaningful).

---

### Relationship Path Explanation

**What it is:** Given two individuals in the tree, compute the shortest relationship path between them and express it in plain English.

**Example:** "Thomas Kennedy is your great-great-uncle: he is the brother of your great-great-grandfather Patrick Kennedy."

**Implementation notes:**
- Graph traversal (BFS) through the `fams`/`famc` links to find the shortest path between two individual IDs — this is pure JavaScript, no AI needed for the computation
- The LLM's role is to convert the computed path (a sequence of individual IDs and relationship types) into a natural-language sentence
- This is a useful feature even without AI — the computed path itself (e.g. `self → famc:F1 → husb:I3 → fams:F4 → children:I7`) is technically correct but hard to read

**Effort:** Medium (graph traversal algorithm + LLM sentence generation).

---

### Record Suggestions

**What it is:** Cross-reference a person's name, approximate birth year, and birth place against public genealogy databases and suggest likely matching records.

**Data sources with APIs:**
- [FamilySearch API](https://www.familysearch.org/developers/) — free, very large database, requires OAuth
- [Ancestry Developer Network](https://developer.ancestry.com/) — requires a partnership agreement
- [FindMyPast API](https://www.findmypast.com/) — UK/Irish records, requires a subscription

**Implementation notes:**
- This is more of an integration task than an AI task — the "suggestions" come from querying external APIs with name + date + place as search parameters
- An LLM could be used to score or rank results ("which of these 5 census records is most likely to be the same person as our John Kennedy born 1888 in East Boston?")
- Privacy: living individuals should be excluded from any external lookups

**Effort:** High (external API partnerships/auth are the main bottleneck, not the implementation).
