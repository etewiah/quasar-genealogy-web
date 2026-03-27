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

// ─── Individuals ─────────────────────────────────────────────────────────────

export async function getIndividualsPage(cursorDoc = null) {
  let q = query(
    collection(db, `trees/${TREE_ID}/individuals`),
    orderBy('lastName'),
    orderBy('firstName'),
    limit(PAGE_SIZE)
  )
  if (cursorDoc) {
    q = query(
      collection(db, `trees/${TREE_ID}/individuals`),
      orderBy('lastName'),
      orderBy('firstName'),
      startAfter(cursorDoc),
      limit(PAGE_SIZE)
    )
  }
  const snap = await getDocs(q)
  return {
    items: snap.docs.map(d => ({ id: d.id, _snap: d, ...d.data() })),
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
  let q = query(
    collection(db, `trees/${TREE_ID}/families`),
    orderBy('__name__'),
    limit(PAGE_SIZE)
  )
  if (cursorDoc) {
    q = query(
      collection(db, `trees/${TREE_ID}/families`),
      orderBy('__name__'),
      startAfter(cursorDoc),
      limit(PAGE_SIZE)
    )
  }
  const snap = await getDocs(q)
  return {
    items: snap.docs.map(d => ({ id: d.id, _snap: d, ...d.data() })),
    lastDoc: snap.docs[snap.docs.length - 1] ?? null,
    hasMore: snap.docs.length === PAGE_SIZE,
  }
}
