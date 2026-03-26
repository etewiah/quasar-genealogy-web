import { collection, doc, getDoc, getDocs, limit, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase.js'

// The Firestore tree ID to query.
const TREE_ID = 'campbells'

/**
 * Fetch the focused subgraph from Firestore for a given person ID.
 * Returns data in the same { indis, fams } shape that TopolaWrapper expects.
 */
export async function getFocusedDataFromFirestore(personId) {
  const indiSnap = await getDoc(
    doc(db, `trees/${TREE_ID}/individuals`, sanitizeId(personId))
  )
  if (!indiSnap.exists()) {
    throw new Error(`Individual not found: ${personId}`)
  }
  const focusedIndi = { id: indiSnap.id, ...indiSnap.data() }

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

  const famcSnap = focusedIndi.famc
    ? await getDoc(doc(db, `trees/${TREE_ID}/families`, sanitizeId(focusedIndi.famc)))
    : null

  const families = [
    ...husbSnap.docs.map(d => ({ id: d.id, ...d.data() })),
    ...wifeSnap.docs.map(d => ({ id: d.id, ...d.data() })),
    ...(famcSnap?.exists() ? [{ id: famcSnap.id, ...famcSnap.data() }] : []),
  ]

  const uniqueFamilies = Object.values(
    Object.fromEntries(families.map(f => [f.id, f]))
  )

  const relatedIds = new Set()
  uniqueFamilies.forEach(fam => {
    if (fam.husb) relatedIds.add(fam.husb)
    if (fam.wife) relatedIds.add(fam.wife)
    fam.children?.forEach(c => relatedIds.add(c))
  })
  relatedIds.delete(personId)

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
 * Fetch the first individual in the tree — used as default when no personID is in the URL.
 */
export async function getFirstIndividual() {
  const snap = await getDocs(
    query(collection(db, `trees/${TREE_ID}/individuals`), limit(1))
  )
  if (snap.empty) throw new Error('No individuals found in tree')
  const d = snap.docs[0]
  return { id: d.id, ...d.data() }
}

function sanitizeId(gedcomId) {
  return gedcomId?.replace(/@/g, '').replace(/\s/g, '_') ?? ''
}

function chunk(arr, size) {
  const chunks = []
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size))
  return chunks
}
