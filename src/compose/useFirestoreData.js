import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore'
import { db } from 'src/boot/firebase'

// The Firestore tree ID to query. This will become configurable once
// multi-tree support is added.
const TREE_ID = 'campbells'

/**
 * Fetch the focused subgraph from Firestore — the equivalent of
 * useTopolaData.getFocusedData(), but reading from Firestore instead of
 * filtering an in-memory array.
 *
 * Returns data in the same { indis, fams } shape that TopolaWrapper expects.
 */
export async function getFocusedDataFromFirestore(personId) {
  // 1. Fetch the focused individual
  const indiSnap = await getDoc(
    doc(db, `trees/${TREE_ID}/individuals`, sanitizeId(personId))
  )
  if (!indiSnap.exists()) {
    throw new Error(`Individual not found: ${personId}`)
  }
  const focusedIndi = { id: indiSnap.id, ...indiSnap.data() }

  // 2. Fetch families where the person is husband or wife (two separate queries
  //    because Firestore cannot OR across different fields in one query)
  const [husbSnap, wifeSnap] = await Promise.all([
    getDocs(query(
      collection(db, `trees/${TREE_ID}/families`),
      where('husb', '==', personId)
    )),
    getDocs(query(
      collection(db, `trees/${TREE_ID}/families`),
      where('wife', '==', personId)
    )),
  ])

  // 3. Fetch the family in which the person is a child (stored on individual as famc)
  const famcSnap = focusedIndi.famc
    ? await getDoc(doc(db, `trees/${TREE_ID}/families`, sanitizeId(focusedIndi.famc)))
    : null

  const families = [
    ...husbSnap.docs.map(d => ({ id: d.id, ...d.data() })),
    ...wifeSnap.docs.map(d => ({ id: d.id, ...d.data() })),
    ...(famcSnap?.exists() ? [{ id: famcSnap.id, ...famcSnap.data() }] : []),
  ]

  // Deduplicate families (person could appear in husb and wife results on same family)
  const uniqueFamilies = Object.values(
    Object.fromEntries(families.map(f => [f.id, f]))
  )

  // 4. Collect all related individual IDs from those families
  const relatedIds = new Set()
  uniqueFamilies.forEach(fam => {
    if (fam.husb) relatedIds.add(fam.husb)
    if (fam.wife) relatedIds.add(fam.wife)
    fam.children?.forEach(c => relatedIds.add(c))
  })
  relatedIds.delete(personId)

  // 5. Fetch related individuals in parallel, batching by 10 (Firestore 'in' limit)
  let relatedIndis = []
  if (relatedIds.size > 0) {
    const idBatches = chunk([...relatedIds].map(sanitizeId), 10)
    const snaps = await Promise.all(
      idBatches.map(batch =>
        getDocs(query(
          collection(db, `trees/${TREE_ID}/individuals`),
          where('__name__', 'in', batch)
        ))
      )
    )
    relatedIndis = snaps.flatMap(snap =>
      snap.docs.map(d => ({ id: d.id, ...d.data() }))
    )
  }

  return {
    indis: [focusedIndi, ...relatedIndis],
    fams: uniqueFamilies,
  }
}

/**
 * Fetch the first individual in the tree — used as the default when no
 * personID is provided in the URL.
 */
export async function getFirstIndividual() {
  const snap = await getDocs(
    query(collection(db, `trees/${TREE_ID}/individuals`), where('famc', '==', null))
  )
  if (!snap.empty) {
    const d = snap.docs[0]
    return { id: d.id, ...d.data() }
  }
  // Fallback: just grab any individual
  const fallback = await getDocs(
    query(collection(db, `trees/${TREE_ID}/individuals`))
  )
  const d = fallback.docs[0]
  return { id: d.id, ...d.data() }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * GEDCOM IDs like "@I392580396428@" are sanitized to "I392580396428" when
 * stored as Firestore document IDs (@ is not valid in Firestore paths).
 * The original ID is preserved as the `id` field on each document.
 */
function sanitizeId(gedcomId) {
  return gedcomId?.replace(/@/g, '').replace(/\s/g, '_') ?? ''
}

function chunk(arr, size) {
  const chunks = []
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size))
  return chunks
}
