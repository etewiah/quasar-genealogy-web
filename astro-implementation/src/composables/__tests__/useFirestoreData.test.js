import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Mock Firebase ─────────────────────────────────────────────────────────────
// getDocs/getDoc are implemented against an in-memory fake tree so multi-hop
// BFS expansion can be exercised without a real Firestore connection.

vi.mock('firebase/firestore', () => ({
  collection: vi.fn((_db, path) => ({ _path: path })),
  doc:        vi.fn((_db, path, id) => ({ _path: path, _id: id })),
  getDoc:     vi.fn(),
  getDocs:    vi.fn(),
  limit:      vi.fn(n => ({ _limit: n })),
  query:      vi.fn((col, ...constraints) => ({ _col: col, _constraints: constraints })),
  where:      vi.fn((field, op, val) => ({ _where: { field, op, val } })),
}))

vi.mock('../../lib/firebase.js', () => ({ db: { _mock: true } }))

import { getDoc, getDocs } from 'firebase/firestore'
import { getFocusedDataFromFirestore } from '../useFirestoreData.js'

// ─── Fake tree ──────────────────────────────────────────────────────────────────
//
//            I4 ─┬─ I5
//                │  (F2)
//               I1 ─┬─ I2
//                   │  (F1)          I52
//                   │                 │
//        I3 ────────┼──── I0 ────────┤ (F0)
//     (sibling)   (focused)          │
//                          I53 ──────┼────── I54
//                           │
//                          I60
//                           │ (F3)
//                          I61

const individuals = {
  I0:  { firstName: 'Root',   lastName: 'Person', famc: 'F1', fams: ['F0'] },
  I1:  { firstName: 'Parent', lastName: 'One',     famc: 'F2', fams: ['F1'] },
  I2:  { firstName: 'Parent', lastName: 'Two',     fams: ['F1'] },
  I3:  { firstName: 'Sib',    lastName: 'Ling',    famc: 'F1' },
  I4:  { firstName: 'Grand',  lastName: 'Pa',      fams: ['F2'] },
  I5:  { firstName: 'Grand',  lastName: 'Ma',      fams: ['F2'] },
  I52: { firstName: 'Spouse', lastName: 'Of Root', fams: ['F0'] },
  I53: { firstName: 'Child',  lastName: 'One',     famc: 'F0', fams: ['F3'] },
  I54: { firstName: 'Child',  lastName: 'Two',     famc: 'F0' },
  I60: { firstName: 'ChildSpouse', lastName: 'X',  fams: ['F3'] },
  I61: { firstName: 'GrandChild',  lastName: 'Y',  famc: 'F3' },
}

const families = {
  F0: { husb: 'I0', wife: 'I52', children: ['I53', 'I54'] },
  F1: { husb: 'I1', wife: 'I2',  children: ['I0', 'I3'] },
  F2: { husb: 'I4', wife: 'I5',  children: ['I1'] },
  F3: { husb: 'I53', wife: 'I60', children: ['I61'] },
}

function fakeDoc(id, data, exists = true) {
  return { id, data: () => data, exists: () => exists }
}

function snapshotFor(collectionPath, constraints) {
  const isFamilies = collectionPath.endsWith('/families')
  const source = isFamilies ? families : individuals
  const whereConstraint = constraints.find(c => c._where)
  if (!whereConstraint) return { docs: [] }

  const { field, op, val } = whereConstraint._where
  let ids
  if (field === '__name__' && op === 'in') {
    ids = val
  } else if (op === '==') {
    ids = Object.keys(source).filter(id => source[id][field] === val)
  } else {
    ids = []
  }
  return { docs: ids.filter(id => source[id]).map(id => fakeDoc(id, source[id])) }
}

beforeEach(() => {
  vi.clearAllMocks()
  getDocs.mockImplementation(async q => snapshotFor(q._col._path, q._constraints))
})

describe('getFocusedDataFromFirestore', () => {
  it('throws when the focused individual does not exist', async () => {
    getDoc.mockResolvedValueOnce(fakeDoc('I999', {}, false))
    await expect(getFocusedDataFromFirestore('I999')).rejects.toThrow('Individual not found')
  })

  it('walks multiple generations of ancestors and descendants', async () => {
    getDoc.mockResolvedValueOnce(fakeDoc('I0', individuals.I0))

    const result = await getFocusedDataFromFirestore('I0')
    const indiIds = result.indis.map(i => i.id).sort()
    const famIds = result.fams.map(f => f.id).sort()

    // Ancestors: parents (I1, I2), sibling (I3), grandparents (I4, I5)
    expect(indiIds).toEqual(
      expect.arrayContaining(['I0', 'I1', 'I2', 'I3', 'I4', 'I5'])
    )
    // Descendants: spouse (I52), children (I53, I54), grandchild's parents (I60), grandchild (I61)
    expect(indiIds).toEqual(
      expect.arrayContaining(['I52', 'I53', 'I54', 'I60', 'I61'])
    )
    expect(famIds).toEqual(['F0', 'F1', 'F2', 'F3'])
  })

  it('does not fetch beyond the top/bottom of the tree', async () => {
    getDoc.mockResolvedValueOnce(fakeDoc('I0', individuals.I0))
    await getFocusedDataFromFirestore('I0')

    // I4/I5 have no famc and I61 has no fams — BFS should stop there rather
    // than keep querying empty generations up to MAX_GENERATIONS.
    const familyNameInQueries = getDocs.mock.calls.filter(([q]) =>
      q._col._path.endsWith('/families') &&
      q._constraints.some(c => c._where?.field === '__name__')
    )
    // One query per ancestor generation that actually found a famc id
    // (F1, then F2) — not one per remaining generation budget.
    expect(familyNameInQueries.length).toBeLessThanOrEqual(2)
  })

  it('does not return duplicate individuals or families', async () => {
    getDoc.mockResolvedValueOnce(fakeDoc('I0', individuals.I0))
    const result = await getFocusedDataFromFirestore('I0')

    expect(new Set(result.indis.map(i => i.id)).size).toBe(result.indis.length)
    expect(new Set(result.fams.map(f => f.id)).size).toBe(result.fams.length)
  })
})
