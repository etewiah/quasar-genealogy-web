# Composables

The `src/compose/` directory contains two composable functions that encapsulate the project's core data logic and configuration persistence.

---

## `useTopolaData.js`

Provides functions for filtering and cleaning the full genealogy dataset down to a focused subgraph centered on a specific individual.

### `getFocusedData(allJsonData, focusedIndiForGraph, showGrandchildren = false)`

Filters the full dataset to only include individuals and families directly related to the focused person.

**Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `allJsonData` | Object | Full topola JSON `{ indis: [], fams: [] }` |
| `focusedIndiForGraph` | Object | The individual object to center on |
| `showGrandchildren` | Boolean | If `true`, recursively includes grandchildren (default `false`) |

**Algorithm:**
1. Find all families where the focused individual is a husband, wife, or child
2. Collect the IDs of all members of those families (parents + siblings + children)
3. Filter the full `indis` array to only those IDs
4. If `showGrandchildren` is `true`, recursively call `getFocusedData` for each child and merge the results (using `Set` to deduplicate)

**Returns:** `{ indis: [...], fams: [...] }` — the filtered subgraph

**Why this is needed:** The topola library can render large trees, but it becomes slow and visually overwhelming when given an entire large dataset. Limiting to the immediate family context keeps the chart focused and performant.

---

### `cleanUpTopolaJson(topolaJsonData)`

After `getFocusedData` filters down the dataset, individual records may still contain references to family IDs that are no longer in the filtered set. This function removes those dangling references.

**Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `topolaJsonData` | Object | A filtered topola JSON object |

**What it cleans:**
- `individual.famc` — the family-as-child ID. Nulled out if that family is not in the filtered set.
- `individual.fams` — array of family-as-spouse IDs. Intersected with the set of family IDs present in the filtered data.

**Returns:** The same `topolaJsonData` object with cleaned individual records (mutates in place and returns).

**Why this is needed:** The topola library throws errors or renders incorrectly when individual records reference family IDs that don't exist in the data passed to it.

---

## `useLocalDataForTopola.js`

Provides functions to persist and retrieve chart configuration settings using Quasar's `LocalStorage` wrapper.

The config is stored under the key `'topola-config'`.

### Default configuration

```js
{
  topolaChartType: 'HourglassChart',
  topolaRenderer: 'DetailedRenderer',
  chartColors: 'COLOR_BY_GENERATION',
  chartIsHorizontal: false,
}
```

---

### `getLocalTopolaConfig()`

Retrieves the saved configuration from `localStorage`. Returns the default config object if nothing is stored.

**Returns:** `Object` — the current chart config

---

### `updateLocalConfig(confKey, confValue)`

Updates a single key in the stored config.

**Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `confKey` | String | The config key to update (e.g. `'topolaChartType'`) |
| `confValue` | any | The new value |

**Behavior:** Reads the current stored config, merges the new key/value, and writes back to `localStorage`.

**Returns:** Empty string (no meaningful return value).

---

### Valid config keys and values

| Key | Type | Valid values |
|---|---|---|
| `topolaChartType` | String | `'AncestorChart'`, `'DescendantChart'`, `'KinshipChart'`, `'RelativesChart'`, `'HourglassChart'` |
| `topolaRenderer` | String | `'DetailedRenderer'`, `'SimpleRenderer'`, `'CircleRenderer'` |
| `chartColors` | String | `'COLOR_BY_GENERATION'`, `'COLOR_BY_SEX'` |
| `chartIsHorizontal` | Boolean | `true`, `false` |
