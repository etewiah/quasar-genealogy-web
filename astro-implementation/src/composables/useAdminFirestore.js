import {
  collection, doc,
  getDoc, getDocs,
  updateDoc,
  orderBy, limit, query, startAfter, where,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase.js'

const TREE_ID = 'campbells'
const PAGE_SIZE = 25

// ─── Tree ────────────────────────────────────────────────────────────────────

export async function getTreeMetadata() {
  const snap = await getDoc(doc(db, 'trees', TREE_ID))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function getFirstIndividualId() {
  const q = query(
    collection(db, `trees/${TREE_ID}/individuals`),
    orderBy('lastName'),
    orderBy('firstName'),
    limit(1)
  )
  const snap = await getDocs(q)
  return snap.docs[0]?.id ?? null
}

// ─── Individuals ─────────────────────────────────────────────────────────────

/**
 * @param {object|null} cursorDoc  - Firestore DocumentSnapshot to paginate after
 * @param {boolean|null} livingFilter - true = living only, false = deceased only, null = all
 */
export async function getIndividualsPage(cursorDoc = null, livingFilter = null) {
  const constraints = [
    ...(livingFilter !== null ? [where('living', '==', livingFilter)] : []),
    orderBy('lastName'),
    orderBy('firstName'),
    ...(cursorDoc ? [startAfter(cursorDoc)] : []),
    limit(PAGE_SIZE),
  ]
  const q = query(collection(db, `trees/${TREE_ID}/individuals`), ...constraints)
  const snap = await getDocs(q)
  return {
    items:   snap.docs.map(d => ({ id: d.id, _snap: d, ...d.data() })),
    lastDoc: snap.docs[snap.docs.length - 1] ?? null,
    hasMore: snap.docs.length === PAGE_SIZE,
  }
}

export async function searchIndividuals(term) {
  if (!term) return []
  const end = term + '\uf8ff'
  const [byFirst, byLast] = await Promise.all([
    getDocs(query(
      collection(db, `trees/${TREE_ID}/individuals`),
      where('firstName', '>=', term),
      where('firstName', '<', end),
      orderBy('firstName'),
      limit(50)
    )),
    getDocs(query(
      collection(db, `trees/${TREE_ID}/individuals`),
      where('lastName', '>=', term),
      where('lastName', '<', end),
      orderBy('lastName'),
      limit(50)
    )),
  ])
  const all = [
    ...byFirst.docs.map(d => ({ id: d.id, ...d.data() })),
    ...byLast.docs.map(d => ({ id: d.id, ...d.data() })),
  ]
  return Object.values(Object.fromEntries(all.map(i => [i.id, i])))
}

export async function getIndividual(id) {
  const snap = await getDoc(doc(db, `trees/${TREE_ID}/individuals`, id))
  if (!snap.exists()) throw new Error(`Individual not found: ${id}`)
  return { id: snap.id, ...snap.data() }
}

export async function updateIndividual(id, updates) {
  await updateDoc(doc(db, `trees/${TREE_ID}/individuals`, id), {
    ...updates,
    updatedAt: serverTimestamp(),
  })
}

// ─── Families ────────────────────────────────────────────────────────────────

export async function getFamiliesPage(cursorDoc = null) {
  const constraints = [
    orderBy('__name__'),
    ...(cursorDoc ? [startAfter(cursorDoc)] : []),
    limit(PAGE_SIZE),
  ]
  const q = query(collection(db, `trees/${TREE_ID}/families`), ...constraints)
  const snap = await getDocs(q)
  return {
    items:   snap.docs.map(d => ({ id: d.id, _snap: d, ...d.data() })),
    lastDoc: snap.docs[snap.docs.length - 1] ?? null,
    hasMore: snap.docs.length === PAGE_SIZE,
  }
}

export async function getFamily(id) {
  const snap = await getDoc(doc(db, `trees/${TREE_ID}/families`, id))
  if (!snap.exists()) throw new Error(`Family not found: ${id}`)
  return { id: snap.id, ...snap.data() }
}

/**
 * Fetch multiple individuals by ID in parallel.
 * Missing documents are returned as null (not thrown).
 */
export async function getIndividualsByIds(ids) {
  if (!ids?.length) return []
  const snaps = await Promise.all(
    ids.map(id => getDoc(doc(db, `trees/${TREE_ID}/individuals`, id)))
  )
  return snaps
    .filter(s => s.exists())
    .map(s => ({ id: s.id, ...s.data() }))
}

/**
 * Fetch a family document plus all related individuals (husb, wife, children)
 * in a single round of parallel reads.
 */
export async function getFamilyDetail(id) {
  const family = await getFamily(id)
  const memberIds = [
    family.husb,
    family.wife,
    ...(family.children ?? []),
  ].filter(Boolean)

  const members = await getIndividualsByIds(memberIds)
  const byId = Object.fromEntries(members.map(m => [m.id, m]))

  return {
    family,
    husb:     family.husb  ? (byId[family.husb]  ?? null) : null,
    wife:     family.wife  ? (byId[family.wife]  ?? null) : null,
    children: (family.children ?? []).map(cid => byId[cid] ?? { id: cid }),
  }
}

export async function searchFamilies(term) {
  if (!term) return []
  const end = term + '\uf8ff'
  const [byHusb, byWife] = await Promise.all([
    getDocs(query(
      collection(db, `trees/${TREE_ID}/families`),
      where('husbName', '>=', term),
      where('husbName', '<', end),
      orderBy('husbName'),
      limit(50)
    )),
    getDocs(query(
      collection(db, `trees/${TREE_ID}/families`),
      where('wifeName', '>=', term),
      where('wifeName', '<', end),
      orderBy('wifeName'),
      limit(50)
    )),
  ])
  const all = [
    ...byHusb.docs.map(d => ({ id: d.id, ...d.data() })),
    ...byWife.docs.map(d => ({ id: d.id, ...d.data() })),
  ]
  return Object.values(Object.fromEntries(all.map(f => [f.id, f])))
}
