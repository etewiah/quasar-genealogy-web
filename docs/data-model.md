# Data Model

## GEDCOM Format

[GEDCOM](https://en.wikipedia.org/wiki/GEDCOM) (Genealogical Data Communication) is the industry-standard file format for genealogy data. The project stores GEDCOM data as JavaScript string exports in `src/data/`:

```js
// KennedyFamilyData.ged.js
export default `
0 HEAD
1 SOUR GRAMPS
...
0 @I1@ INDI
1 NAME John /Kennedy/
1 SEX M
1 BIRT
2 DATE 6 SEP 1888
2 PLAC East Boston, MA
...
`
```

This approach bundles the GEDCOM data directly into the JavaScript module graph at build time.

---

## topola JSON Format

The `topola.gedcomToJson()` function converts GEDCOM text into a structured JSON object. This is the internal data format used throughout the application.

### Top-level structure

```json
{
  "indis": [ ...individual records... ],
  "fams":  [ ...family records... ]
}
```

---

### Individual record (`indi`)

Represents a single person.

```json
{
  "id": "I1",
  "firstName": "John",
  "lastName": "Kennedy",
  "birth": {
    "date": "6 SEP 1888",
    "place": "East Boston, MA"
  },
  "death": {
    "date": "18 NOV 1969",
    "place": "Hyannis Port, MA"
  },
  "sex": "M",
  "famc": "F1",        // family ID where this person is a child
  "fams": ["F2", "F3"] // family IDs where this person is a spouse
}
```

| Field | Description |
|---|---|
| `id` | Unique identifier matching the GEDCOM `@I...@` tag |
| `firstName` | Given name |
| `lastName` | Surname |
| `birth.date` | Birth date string (GEDCOM format) |
| `birth.place` | Birth place string |
| `death.date` | Death date string |
| `death.place` | Death place string |
| `sex` | `"M"` or `"F"` |
| `famc` | The family ID in which this person appears as a child (`null` if none) |
| `fams` | Array of family IDs in which this person appears as a spouse |

---

### Family record (`fam`)

Represents a family unit (couple and their children).

```json
{
  "id": "F1",
  "husb": "I1",
  "wife": "I2",
  "children": ["I3", "I4", "I5"]
}
```

| Field | Description |
|---|---|
| `id` | Unique identifier matching the GEDCOM `@F...@` tag |
| `husb` | Individual ID of the husband (`null` if unknown) |
| `wife` | Individual ID of the wife (`null` if unknown) |
| `children` | Array of individual IDs of children in this family |

---

## Bundled Datasets

### `KennedyFamilyData`

The Kennedy family tree, used as the live demo dataset on the `/static-data` page. Available in both GEDCOM (`.ged.js`) and pre-converted JSON formats.

### `MinimalExampleData`

A small minimal dataset used for development and testing purposes. Available in both GEDCOM and JSON formats. Currently commented out in `TopolaStaticDataPage.vue`.

---

## Adding a New Dataset

To swap in a different GEDCOM file:

1. Convert the `.ged` file to a JS string export:
   ```js
   // src/data/MyFamilyData.ged.js
   export default `
   0 HEAD
   ...
   `
   ```

2. In `TopolaStaticDataPage.vue`, update the import:
   ```js
   import topolaGedcomData from 'src/data/MyFamilyData.ged.js'
   ```

The rest of the pipeline (parsing, filtering, rendering) will work automatically.
