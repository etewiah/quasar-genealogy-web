import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Mock Firebase ─────────────────────────────────────────────────────────────
// Declared before importing the module under test so Vitest hoists them.

vi.mock('firebase/firestore', () => ({
  collection:      vi.fn((_db, path) => ({ _path: path })),
  doc:             vi.fn((_db, ...parts) => ({ _path: parts.join('/') })),
  getDoc:          vi.fn(),
  getDocs:         vi.fn(),
  updateDoc:       vi.fn(),
  orderBy:         vi.fn((field, dir = 'asc') => ({ _orderBy: field, _dir: dir })),
  limit:           vi.fn(n => ({ _limit: n })),
  query:           vi.fn((_col, ...constraints) => ({ _col, _constraints: constraints })),
  startAfter:      vi.fn(doc => ({ _startAfter: doc })),
  where:           vi.fn((field, op, val) => ({ _where: { field, op, val } })),
  serverTimestamp: vi.fn(() => '__SERVER_TS__'),
}))

vi.mock('src/lib/firebase.js', () => ({ db: { _mock: true } }))

import {
  collection, doc, getDoc, getDocs, updateDoc, query, orderBy, limit, startAfter, where,
} from 'firebase/firestore'
import {
  getTreeMetadata,
  getFirstIndividualId,
  getIndividualsPage,
  searchIndividuals,
  getIndividual,
  updateIndividual,
  getFamiliesPage,
  searchFamilies,
} from '../useAdminFirestore.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fakeDoc(id, data, exists = true) {
  return { id, data: () => data, exists: () => exists }
}

function fakeSnap(docs) {
  return { docs, empty: docs.length === 0 }
}

const PAGE_SIZE = 25

// ─── getTreeMetadata ──────────────────────────────────────────────────────────

describe('getTreeMetadata', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns id + data when the document exists', async () => {
    getDoc.mockResolvedValueOnce(
      fakeDoc('campbells', { individualsCount: 3214, familiesCount: 801 })
    )
    const result = await getTreeMetadata()
    expect(result.id).toBe('campbells')
    expect(result.individualsCount).toBe(3214)
    expect(result.familiesCount).toBe(801)
  })

  it('returns null when the document does not exist', async () => {
    getDoc.mockResolvedValueOnce(fakeDoc('campbells', {}, false))
    const result = await getTreeMetadata()
    expect(result).toBeNull()
  })

  it('queries the trees/campbells document', async () => {
    getDoc.mockResolvedValueOnce(fakeDoc('campbells', {}))
    await getTreeMetadata()
    expect(doc).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining('trees'),
      expect.stringContaining('campbells')
    )
  })
})

// ─── getFirstIndividualId ─────────────────────────────────────────────────────

describe('getFirstIndividualId', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns the id of the first document', async () => {
    getDocs.mockResolvedValueOnce(fakeSnap([fakeDoc('I999', {})]))
    const result = await getFirstIndividualId()
    expect(result).toBe('I999')
  })

  it('returns null when the collection is empty', async () => {
    getDocs.mockResolvedValueOnce(fakeSnap([]))
    const result = await getFirstIndividualId()
    expect(result).toBeNull()
  })

  it('uses limit(1)', async () => {
    getDocs.mockResolvedValueOnce(fakeSnap([]))
    await getFirstIndividualId()
    expect(limit).toHaveBeenCalledWith(1)
  })
})

// ─── getIndividualsPage ───────────────────────────────────────────────────────

describe('getIndividualsPage', () => {
  beforeEach(() => vi.clearAllMocks())

  function makeIndis(n) {
    return Array.from({ length: n }, (_, i) =>
      fakeDoc(`I${i}`, { firstName: `First${i}`, lastName: `Last${i}` })
    )
  }

  it('returns items with id and data merged', async () => {
    getDocs.mockResolvedValueOnce(fakeSnap([
      fakeDoc('I1', { firstName: 'Alice', lastName: 'Campbell' }),
    ]))
    const { items } = await getIndividualsPage()
    expect(items[0].id).toBe('I1')
    expect(items[0].firstName).toBe('Alice')
    expect(items[0].lastName).toBe('Campbell')
  })

  it('attaches _snap to each item for cursor use', async () => {
    const snap = fakeDoc('I1', { firstName: 'Alice', lastName: 'Campbell' })
    getDocs.mockResolvedValueOnce(fakeSnap([snap]))
    const { items } = await getIndividualsPage()
    expect(items[0]._snap).toBe(snap)
  })

  it('sets hasMore=true when a full page is returned', async () => {
    getDocs.mockResolvedValueOnce(fakeSnap(makeIndis(PAGE_SIZE)))
    const { hasMore } = await getIndividualsPage()
    expect(hasMore).toBe(true)
  })

  it('sets hasMore=false when a partial page is returned', async () => {
    getDocs.mockResolvedValueOnce(fakeSnap(makeIndis(10)))
    const { hasMore } = await getIndividualsPage()
    expect(hasMore).toBe(false)
  })

  it('sets hasMore=false when the page is empty', async () => {
    getDocs.mockResolvedValueOnce(fakeSnap([]))
    const { hasMore } = await getIndividualsPage()
    expect(hasMore).toBe(false)
  })

  it('returns lastDoc as the last item in the snapshot', async () => {
    const docs = makeIndis(3)
    getDocs.mockResolvedValueOnce(fakeSnap(docs))
    const { lastDoc } = await getIndividualsPage()
    expect(lastDoc).toBe(docs[2])
  })

  it('returns lastDoc=null for an empty page', async () => {
    getDocs.mockResolvedValueOnce(fakeSnap([]))
    const { lastDoc } = await getIndividualsPage()
    expect(lastDoc).toBeNull()
  })

  it('applies startAfter when a cursor is provided', async () => {
    getDocs.mockResolvedValueOnce(fakeSnap([]))
    const cursor = fakeDoc('I0', {})
    await getIndividualsPage(cursor)
    expect(startAfter).toHaveBeenCalledWith(cursor)
  })

  it('does not apply startAfter when no cursor is provided', async () => {
    getDocs.mockResolvedValueOnce(fakeSnap([]))
    await getIndividualsPage(null)
    expect(startAfter).not.toHaveBeenCalled()
  })

  it('orders by lastName then firstName', async () => {
    getDocs.mockResolvedValueOnce(fakeSnap([]))
    await getIndividualsPage()
    expect(orderBy).toHaveBeenCalledWith('lastName')
    expect(orderBy).toHaveBeenCalledWith('firstName')
  })

  it('adds a where clause when livingFilter is true', async () => {
    getDocs.mockResolvedValueOnce(fakeSnap([]))
    await getIndividualsPage(null, true)
    expect(where).toHaveBeenCalledWith('living', '==', true)
  })

  it('adds a where clause when livingFilter is false', async () => {
    getDocs.mockResolvedValueOnce(fakeSnap([]))
    await getIndividualsPage(null, false)
    expect(where).toHaveBeenCalledWith('living', '==', false)
  })

  it('does not add a where clause when livingFilter is null', async () => {
    getDocs.mockResolvedValueOnce(fakeSnap([]))
    await getIndividualsPage(null, null)
    expect(where).not.toHaveBeenCalled()
  })
})

// ─── searchIndividuals ────────────────────────────────────────────────────────

describe('searchIndividuals', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns empty array for empty search term', async () => {
    const results = await searchIndividuals('')
    expect(results).toEqual([])
    expect(getDocs).not.toHaveBeenCalled()
  })

  it('runs queries for whitespace-only term (no trim applied)', async () => {
    // The function checks `if (!term)` — whitespace is truthy, so it does run queries.
    // This test documents current behaviour: no trimming, empty results returned.
    getDocs.mockResolvedValue(fakeSnap([]))
    const results = await searchIndividuals('   ')
    expect(Array.isArray(results)).toBe(true)
    expect(getDocs).toHaveBeenCalledTimes(2)
  })

  it('runs two parallel queries (firstName and lastName)', async () => {
    getDocs.mockResolvedValue(fakeSnap([]))
    await searchIndividuals('camp')
    expect(getDocs).toHaveBeenCalledTimes(2)
  })

  it('uses prefix range on firstName', async () => {
    getDocs.mockResolvedValue(fakeSnap([]))
    await searchIndividuals('ali')
    expect(where).toHaveBeenCalledWith('firstName', '>=', 'ali')
    expect(where).toHaveBeenCalledWith('firstName', '<',  'ali\uf8ff')
  })

  it('uses prefix range on lastName', async () => {
    getDocs.mockResolvedValue(fakeSnap([]))
    await searchIndividuals('camp')
    expect(where).toHaveBeenCalledWith('lastName', '>=', 'camp')
    expect(where).toHaveBeenCalledWith('lastName', '<',  'camp\uf8ff')
  })

  it('merges results from both queries', async () => {
    getDocs
      .mockResolvedValueOnce(fakeSnap([fakeDoc('I1', { firstName: 'Alice', lastName: 'A' })]))
      .mockResolvedValueOnce(fakeSnap([fakeDoc('I2', { firstName: 'Bob', lastName: 'Campbell' })]))
    const results = await searchIndividuals('a')
    expect(results).toHaveLength(2)
    expect(results.map(r => r.id)).toContain('I1')
    expect(results.map(r => r.id)).toContain('I2')
  })

  it('deduplicates individuals appearing in both queries', async () => {
    const duplicate = fakeDoc('I1', { firstName: 'Ally', lastName: 'Ally' })
    getDocs
      .mockResolvedValueOnce(fakeSnap([duplicate]))
      .mockResolvedValueOnce(fakeSnap([duplicate]))
    const results = await searchIndividuals('ally')
    expect(results).toHaveLength(1)
  })

  it('returns up to 50 results per query', async () => {
    getDocs.mockResolvedValue(fakeSnap([]))
    await searchIndividuals('test')
    expect(limit).toHaveBeenCalledWith(50)
  })
})

// ─── getIndividual ────────────────────────────────────────────────────────────

describe('getIndividual', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns id + data when document exists', async () => {
    getDoc.mockResolvedValueOnce(
      fakeDoc('I1', { firstName: 'Alice', lastName: 'Campbell', living: false })
    )
    const result = await getIndividual('I1')
    expect(result.id).toBe('I1')
    expect(result.firstName).toBe('Alice')
    expect(result.living).toBe(false)
  })

  it('throws when the document does not exist', async () => {
    getDoc.mockResolvedValueOnce(fakeDoc('I_NONE', {}, false))
    await expect(getIndividual('I_NONE')).rejects.toThrow('Individual not found: I_NONE')
  })

  it('queries the correct Firestore path', async () => {
    getDoc.mockResolvedValueOnce(fakeDoc('I1', {}))
    await getIndividual('I1')
    expect(doc).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining('individuals'),
      'I1'
    )
  })
})

// ─── updateIndividual ─────────────────────────────────────────────────────────

describe('updateIndividual', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls updateDoc with the provided fields', async () => {
    updateDoc.mockResolvedValueOnce(undefined)
    await updateIndividual('I1', { firstName: 'Alice', lastName: 'Smith' })
    expect(updateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ firstName: 'Alice', lastName: 'Smith' })
    )
  })

  it('always includes updatedAt: serverTimestamp()', async () => {
    updateDoc.mockResolvedValueOnce(undefined)
    await updateIndividual('I1', { firstName: 'Alice' })
    expect(updateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ updatedAt: '__SERVER_TS__' })
    )
  })

  it('targets the correct document path', async () => {
    updateDoc.mockResolvedValueOnce(undefined)
    await updateIndividual('I42', { firstName: 'Bob' })
    expect(doc).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining('individuals'),
      'I42'
    )
  })

  it('propagates errors from Firestore', async () => {
    updateDoc.mockRejectedValueOnce(new Error('Permission denied'))
    await expect(updateIndividual('I1', {})).rejects.toThrow('Permission denied')
  })
})

// ─── getFamiliesPage ──────────────────────────────────────────────────────────

describe('getFamiliesPage', () => {
  beforeEach(() => vi.clearAllMocks())

  function makeFams(n) {
    return Array.from({ length: n }, (_, i) =>
      fakeDoc(`F${i}`, { husb: `I${i}`, wife: null, children: [] })
    )
  }

  it('returns items with id and data merged', async () => {
    getDocs.mockResolvedValueOnce(fakeSnap([
      fakeDoc('F1', { husb: 'I1', wife: 'I2', children: ['I3', 'I4'] }),
    ]))
    const { items } = await getFamiliesPage()
    expect(items[0].id).toBe('F1')
    expect(items[0].husb).toBe('I1')
    expect(items[0].children).toHaveLength(2)
  })

  it('attaches _snap to each item', async () => {
    const snap = fakeDoc('F1', {})
    getDocs.mockResolvedValueOnce(fakeSnap([snap]))
    const { items } = await getFamiliesPage()
    expect(items[0]._snap).toBe(snap)
  })

  it('sets hasMore=true when a full page is returned', async () => {
    getDocs.mockResolvedValueOnce(fakeSnap(makeFams(PAGE_SIZE)))
    const { hasMore } = await getFamiliesPage()
    expect(hasMore).toBe(true)
  })

  it('sets hasMore=false for a partial page', async () => {
    getDocs.mockResolvedValueOnce(fakeSnap(makeFams(5)))
    const { hasMore } = await getFamiliesPage()
    expect(hasMore).toBe(false)
  })

  it('returns lastDoc as the last snapshot in the page', async () => {
    const docs = makeFams(3)
    getDocs.mockResolvedValueOnce(fakeSnap(docs))
    const { lastDoc } = await getFamiliesPage()
    expect(lastDoc).toBe(docs[2])
  })

  it('returns lastDoc=null for an empty page', async () => {
    getDocs.mockResolvedValueOnce(fakeSnap([]))
    const { lastDoc } = await getFamiliesPage()
    expect(lastDoc).toBeNull()
  })

  it('applies startAfter when a cursor is provided', async () => {
    getDocs.mockResolvedValueOnce(fakeSnap([]))
    const cursor = fakeDoc('F0', {})
    await getFamiliesPage(cursor)
    expect(startAfter).toHaveBeenCalledWith(cursor)
  })

  it('does not apply startAfter on the first page', async () => {
    getDocs.mockResolvedValueOnce(fakeSnap([]))
    await getFamiliesPage(null)
    expect(startAfter).not.toHaveBeenCalled()
  })
})

// ─── searchFamilies ───────────────────────────────────────────────────────────

describe('searchFamilies', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns empty array for empty search term', async () => {
    const results = await searchFamilies('')
    expect(results).toEqual([])
    expect(getDocs).not.toHaveBeenCalled()
  })

  it('runs two parallel queries (husbName and wifeName)', async () => {
    getDocs.mockResolvedValue(fakeSnap([]))
    await searchFamilies('camp')
    expect(getDocs).toHaveBeenCalledTimes(2)
  })

  it('uses prefix range on husbName', async () => {
    getDocs.mockResolvedValue(fakeSnap([]))
    await searchFamilies('john')
    expect(where).toHaveBeenCalledWith('husbName', '>=', 'john')
    expect(where).toHaveBeenCalledWith('husbName', '<',  'john\uf8ff')
  })

  it('uses prefix range on wifeName', async () => {
    getDocs.mockResolvedValue(fakeSnap([]))
    await searchFamilies('mary')
    expect(where).toHaveBeenCalledWith('wifeName', '>=', 'mary')
    expect(where).toHaveBeenCalledWith('wifeName', '<',  'mary\uf8ff')
  })

  it('merges results from both queries', async () => {
    getDocs
      .mockResolvedValueOnce(fakeSnap([fakeDoc('F1', { husbName: 'John C', wifeName: null })]))
      .mockResolvedValueOnce(fakeSnap([fakeDoc('F2', { husbName: null, wifeName: 'Mary C' })]))
    const results = await searchFamilies('c')
    expect(results).toHaveLength(2)
    expect(results.map(r => r.id)).toContain('F1')
    expect(results.map(r => r.id)).toContain('F2')
  })

  it('deduplicates families appearing in both queries', async () => {
    const dup = fakeDoc('F1', { husbName: 'Carl Carl', wifeName: 'Carl Carl' })
    getDocs
      .mockResolvedValueOnce(fakeSnap([dup]))
      .mockResolvedValueOnce(fakeSnap([dup]))
    const results = await searchFamilies('carl')
    expect(results).toHaveLength(1)
  })

  it('uses limit(50) per query', async () => {
    getDocs.mockResolvedValue(fakeSnap([]))
    await searchFamilies('test')
    expect(limit).toHaveBeenCalledWith(50)
  })
})
