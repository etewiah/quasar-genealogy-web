# Approach B: Firestore Structured Database

Parse the GEDCOM once and store every individual and family as its own Firestore document. The app then queries only the documents it needs for the current view — typically 20–50 reads per page load instead of downloading the full 5.9MB file.

This is the recommended approach for any tree intended for ongoing use. It is the foundation that enables editing, privacy controls, real-time collaboration, and the AI features described in the [roadmap](../roadmap.md).

---

## Data model

```
Firestore
└── trees/
    └── {treeId}/                         ← e.g. "campbells"
        ├── (tree metadata document)
        ├── individuals/
        │   ├── {individualId}            ← e.g. "@I392580396428@"
        │   └── ...                       ← 3,214 documents for campbells
        └── families/
            ├── {familyId}               ← e.g. "@F408@"
            └── ...                      ← 1,608 documents for campbells
```

### Individual document schema

Mirrors the topola JSON format exactly, so the existing rendering code requires no changes:

```json
{
  "id": "@I392580396428@",
  "firstName": "Joanna",
  "lastName": "Campbell",
  "sex": "M",
  "birth": {
    "date": "May 1933",
    "place": "Oxford, England"
  },
  "death": {
    "date": "12 Jan 2005",
    "place": "Edinburgh, Scotland"
  },
  "famc": "@F408@",
  "fams": ["@F407@", "@F1543@"]
}
```

### Family document schema

```json
{
  "id": "@F407@",
  "husb": "@I100023@",
  "wife": "@I392580396428@",
  "children": ["@I200045@", "@I200046@", "@I200047@"]
}
```

---

## Querying the focused subgraph

The current `useTopolaData.getFocusedData()` filters an in-memory array. With Firestore, equivalent queries are:

```js
import { collection, doc, getDoc, getDocs, query, where, or } from 'firebase/firestore'

async function getFocusedDataFromFirestore(db, treeId, personId) {
  // 1. Fetch the focused individual
  const indiDoc = await getDoc(
    doc(db, `trees/${treeId}/individuals`, personId)
  )
  const focusedIndi = { id: indiDoc.id, ...indiDoc.data() }

  // 2. Fetch families where person is husband or wife
  const [husbSnap, wifeSnap] = await Promise.all([
    getDocs(query(
      collection(db, `trees/${treeId}/families`),
      where('husb', '==', personId)
    )),
    getDocs(query(
      collection(db, `trees/${treeId}/families`),
      where('wife', '==', personId)
    )),
  ])

  // 3. Firestore cannot do OR across different fields in one query,
  //    so also fetch families where person is a child
  const famcId = focusedIndi.famc
  const childFamSnap = famcId
    ? await getDoc(doc(db, `trees/${treeId}/families`, famcId))
    : null

  const families = [
    ...husbSnap.docs.map(d => ({ id: d.id, ...d.data() })),
    ...wifeSnap.docs.map(d => ({ id: d.id, ...d.data() })),
    ...(childFamSnap?.exists() ? [{ id: childFamSnap.id, ...childFamSnap.data() }] : []),
  ]

  // 4. Collect all related individual IDs from those families
  const relatedIds = new Set()
  families.forEach(fam => {
    if (fam.husb) relatedIds.add(fam.husb)
    if (fam.wife) relatedIds.add(fam.wife)
    fam.children?.forEach(c => relatedIds.add(c))
  })
  relatedIds.delete(personId) // already fetched

  // 5. Fetch related individuals in parallel (batch by 10 for 'in' query limit)
  const idBatches = [...relatedIds].reduce((acc, id, i) => {
    const batch = Math.floor(i / 10)
    acc[batch] = acc[batch] || []
    acc[batch].push(id)
    return acc
  }, [])

  const relatedSnaps = await Promise.all(
    idBatches.map(batch =>
      getDocs(query(
        collection(db, `trees/${treeId}/individuals`),
        where('id', 'in', batch)
      ))
    )
  )

  const individuals = [
    focusedIndi,
    ...relatedSnaps.flatMap(snap => snap.docs.map(d => ({ id: d.id, ...d.data() }))),
  ]

  return { indis: individuals, fams: families }
}
```

This replaces the client-side filtering in `useTopolaData.js` and returns data in the same `{ indis, fams }` shape that `TopolaWrapper` already expects.

---

## Firestore indexes required

Firestore automatically creates indexes for single-field queries. The queries above use:
- `families` where `husb == personId` — auto-indexed
- `families` where `wife == personId` — auto-indexed
- `individuals` where `id in [...]` — auto-indexed

No composite indexes are needed for the basic focused subgraph query.

If you later add queries like "all individuals born in Scotland" (`where('birth.place', '==', 'Scotland')`), Firestore will prompt you to create a composite index the first time the query runs in development.

---

## Updating `TopolaStaticDataPage.vue`

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getFirestore } from 'firebase/firestore'
import TopolaWrapper from 'components/TopolaWrapper.vue'
import TopolaIndividual from 'components/TopolaIndividual.vue'
import { getFocusedDataFromFirestore } from 'src/compose/useFirestoreData'

defineOptions({ name: 'TopolaStaticDataPage' })
const props = defineProps({ topolaConfig: Object })
const route = useRoute()

const topolaJsonData = ref(null)
const focusedIndiForGraph = ref(null)
const loading = ref(true)

onMounted(async () => {
  const db = getFirestore()
  const personID = route.query.personID || 'DEFAULT_FIRST_PERSON_ID'
  const data = await getFocusedDataFromFirestore(db, 'campbells', personID)
  focusedIndiForGraph.value = data.indis.find(i => i.id === personID)
  topolaJsonData.value = data
  loading.value = false
})
</script>
```

The rest of the template and `TopolaWrapper` / `TopolaIndividual` components are unchanged.

---

## Firestore vs in-memory filtering: trade-offs

| | Current (in-memory) | Firestore queries |
|---|---|---|
| **Data loaded** | Full dataset (5.9MB) | ~20–50 documents per view |
| **Filtering logic** | `useTopolaData.js` (pure JS) | Firestore `where()` queries |
| **Network round-trips** | 1 (fetch bundle) + client parse | 3–5 parallel Firestore reads |
| **Latency** | High first load, instant navigation | Consistent ~100–300ms per navigation |
| **Offline support** | Yes (once bundle loaded) | Yes (Firestore has offline cache) |

For a 3,000-person tree, the Firestore approach is faster after the first load. For a 50-person tree, the difference is negligible.

---

## Adding and editing records

Once data is in Firestore, editing is straightforward:

```js
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore'

// Update a field on an existing individual
await updateDoc(
  doc(db, 'trees/campbells/individuals', '@I392580396428@'),
  { 'death.date': '15 Mar 2005', 'death.place': 'Glasgow, Scotland' }
)

// Add a new individual
const newIndi = await addDoc(
  collection(db, 'trees/campbells/individuals'),
  { firstName: 'Robert', lastName: 'Campbell', sex: 'M', fams: [], famc: null }
)
```

This is the foundation for building an editing UI — something the static bundle approach cannot support at all.
