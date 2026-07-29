import { collection, doc, getDoc, getDocs, limit, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase.js'

// The Firestore tree ID to query.
const TREE_ID = 'campbells'

// How many generations to walk in each direction from the focused person.
// topola's chart algorithms (Ancestor/Descendant/Hourglass/Kinship/Relatives)
// recurse through the graph as far as data allows, so fetching only one hop
// silently truncated every chart type to parents+children. This bounds the
// walk instead of leaving it unbounded, to keep Firestore reads predictable.
const MAX_GENERATIONS = 5

/**
 * Fetch a multi-generation subgraph from Firestore for a given person ID.
 * Walks up through `famc` (parents, grandparents, ...) and down through
 * spouse families (children, grandchildren, ...), up to MAX_GENERATIONS
 * in each direction. Returns data in the { indis, fams } shape topola expects.
 */
export async function getFocusedDataFromFirestore(personId) {
  const focusedSnap = await getDoc(
    doc(db, `trees/${TREE_ID}/individuals`, sanitizeId(personId))
  )
  if (!focusedSnap.exists()) {
    throw new Error(`Individual not found: ${personId}`)
  }
  const focusedIndi = { id: focusedSnap.id, ...focusedSnap.data() }

  const indiById = new Map([[focusedIndi.id, focusedIndi]])
  const famById = new Map()

  await expandAncestors([focusedIndi], indiById, famById)
  await expandDescendants([focusedIndi], indiById, famById)

  return {
    indis: [...indiById.values()],
    fams: [...famById.values()],
  }
}

/**
 * Walk upward from `frontier` through each individual's parent family
 * (`famc`), pulling in parents and siblings at each generation.
 */
async function expandAncestors(frontier, indiById, famById) {
  for (let gen = 0; gen < MAX_GENERATIONS && frontier.length; gen++) {
    const famcIds = uniqueIds(frontier.map(i => i.famc))
    const fams = await fetchFamiliesByIds(famcIds, famById)
    if (!fams.length) break

    const parentIds = uniqueIds(fams.flatMap(f => [f.husb, f.wife]))
    const siblingIds = uniqueIds(fams.flatMap(f => f.children ?? []))
    await fetchIndividualsByIds([...parentIds, ...siblingIds], indiById)

    frontier = parentIds.map(id => indiById.get(sanitizeId(id))).filter(Boolean)
  }
}

/**
 * Walk downward from `frontier` through each individual's spouse families,
 * pulling in spouses and children at each generation.
 */
async function expandDescendants(frontier, indiById, famById) {
  for (let gen = 0; gen < MAX_GENERATIONS && frontier.length; gen++) {
    const fams = await fetchSpouseFamilies(frontier.map(i => i.id), famById)
    if (!fams.length) break

    const spouseIds = uniqueIds(fams.flatMap(f => [f.husb, f.wife]))
    const childIds = uniqueIds(fams.flatMap(f => f.children ?? []))
    await fetchIndividualsByIds([...spouseIds, ...childIds], indiById)

    frontier = childIds.map(id => indiById.get(sanitizeId(id))).filter(Boolean)
  }
}

async function fetchFamiliesByIds(ids, famById) {
  const missing = uniqueIds(ids).filter(id => !famById.has(sanitizeId(id)))
  if (!missing.length) return []
  const batches = chunk(missing.map(sanitizeId), 10)
  const snaps = await Promise.all(
    batches.map(batch =>
      getDocs(query(
        collection(db, `trees/${TREE_ID}/families`),
        where('__name__', 'in', batch)
      ))
    )
  )
  const fetched = snaps.flatMap(snap => snap.docs.map(d => ({ id: d.id, ...d.data() })))
  fetched.forEach(f => famById.set(f.id, f))
  return fetched
}

async function fetchSpouseFamilies(indiIds, famById) {
  const ids = uniqueIds(indiIds)
  if (!ids.length) return []
  const snaps = await Promise.all(
    ids.flatMap(id => [
      getDocs(query(collection(db, `trees/${TREE_ID}/families`), where('husb', '==', id))),
      getDocs(query(collection(db, `trees/${TREE_ID}/families`), where('wife', '==', id))),
    ])
  )
  const fetched = snaps.flatMap(snap => snap.docs.map(d => ({ id: d.id, ...d.data() })))
  const newOnes = fetched.filter(f => !famById.has(f.id))
  newOnes.forEach(f => famById.set(f.id, f))
  return newOnes
}

async function fetchIndividualsByIds(ids, indiById) {
  const missing = uniqueIds(ids).filter(id => !indiById.has(sanitizeId(id)))
  if (!missing.length) return
  const batches = chunk(missing.map(sanitizeId), 10)
  const snaps = await Promise.all(
    batches.map(batch =>
      getDocs(query(
        collection(db, `trees/${TREE_ID}/individuals`),
        where('__name__', 'in', batch)
      ))
    )
  )
  snaps.flatMap(snap => snap.docs).forEach(d => {
    if (!indiById.has(d.id)) indiById.set(d.id, { id: d.id, ...d.data() })
  })
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

function uniqueIds(ids) {
  return [...new Set(ids.filter(Boolean))]
}

function chunk(arr, size) {
  const chunks = []
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size))
  return chunks
}
