import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Mock Firebase ────────────────────────────────────────────────────────────
// Must be declared before importing the module under test so that Vitest
// hoists the mocks before any module-level code runs.

vi.mock('firebase/firestore', () => ({
  collection: vi.fn((_db, path) => ({ _path: path })),
  doc:        vi.fn((_db, path, id) => ({ _path: `${path}/${id}` })),
  getDoc:     vi.fn(),
  getDocs:    vi.fn(),
  limit:      vi.fn(n => ({ _limit: n })),
  query:      vi.fn((...args) => ({ _args: args })),
  where:      vi.fn((field, op, val) => ({ _field: field, _op: op, _val: val })),
}))

vi.mock('src/boot/firebase', () => ({ db: {} }))

import { getDoc, getDocs } from 'firebase/firestore'
import { getFocusedDataFromFirestore, getFirstIndividual } from '../useFirestoreData.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Create a fake Firestore DocumentSnapshot */
function fakeDoc(id, data, exists = true) {
  return { id, data: () => data, exists: () => exists }
}

/** Create a fake Firestore QuerySnapshot */
function fakeSnap(docs) {
  return { docs, empty: docs.length === 0 }
}

// ─── getFirstIndividual ───────────────────────────────────────────────────────

describe('getFirstIndividual', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns the first individual with merged id + data fields', async () => {
    getDocs.mockResolvedValueOnce(
      fakeSnap([fakeDoc('I1', { name: 'Alice', living: false })])
    )
    const result = await getFirstIndividual()
    expect(result.id).toBe('I1')
    expect(result.name).toBe('Alice')
    expect(result.living).toBe(false)
  })

  it('throws when the collection is empty', async () => {
    getDocs.mockResolvedValueOnce(fakeSnap([]))
    await expect(getFirstIndividual()).rejects.toThrow('No individuals found in tree')
  })
})

// ─── getFocusedDataFromFirestore ──────────────────────────────────────────────

describe('getFocusedDataFromFirestore', () => {
  beforeEach(() => vi.clearAllMocks())

  // Shared fixture data
  const aliceId = 'I1'
  const aliceData = { id: 'I1', famc: 'F0', fams: ['F1'], living: false }

  const bobData   = { id: 'I2', fams: ['F1'], famc: null, living: false }
  const carolData = { id: 'I3', fams: ['F1'], famc: null, living: false }

  const f0Data = { id: 'F0', husb: 'I_PARENT', wife: 'I_MOM', children: ['I1'] }
  const f1Data = { id: 'F1', husb: 'I1',       wife: null,    children: ['I2', 'I3'] }

  function setupHappyPath() {
    // getDoc calls: focused individual, then famc family
    getDoc
      .mockResolvedValueOnce(fakeDoc('I1', aliceData))   // focused individual
      .mockResolvedValueOnce(fakeDoc('F0', f0Data))      // famc family

    // getDocs calls: husb families, wife families, related individuals batch
    getDocs
      .mockResolvedValueOnce(fakeSnap([fakeDoc('F1', f1Data)]))  // husb query
      .mockResolvedValueOnce(fakeSnap([]))                        // wife query
      .mockResolvedValueOnce(                                     // related indis batch
        fakeSnap([fakeDoc('I2', bobData), fakeDoc('I3', carolData)])
      )
  }

  it('fetches the focused individual by sanitized document ID', async () => {
    setupHappyPath()
    await getFocusedDataFromFirestore(aliceId)
    // First getDoc call should be for the individual
    expect(getDoc).toHaveBeenCalledWith(
      expect.objectContaining({ _path: expect.stringContaining('individuals/I1') })
    )
  })

  it('throws when the focused individual does not exist', async () => {
    getDoc.mockResolvedValueOnce(fakeDoc('I1', {}, false))
    await expect(getFocusedDataFromFirestore('I1'))
      .rejects.toThrow('Individual not found: I1')
  })

  it('returns the focused individual in the indis array', async () => {
    setupHappyPath()
    const { indis } = await getFocusedDataFromFirestore(aliceId)
    expect(indis.find(i => i.id === 'I1')).toBeDefined()
  })

  it('includes related individuals from families', async () => {
    setupHappyPath()
    const { indis } = await getFocusedDataFromFirestore(aliceId)
    expect(indis.find(i => i.id === 'I2')).toBeDefined()
    expect(indis.find(i => i.id === 'I3')).toBeDefined()
  })

  it('includes the husb family in fams', async () => {
    setupHappyPath()
    const { fams } = await getFocusedDataFromFirestore(aliceId)
    expect(fams.find(f => f.id === 'F1')).toBeDefined()
  })

  it('includes the famc family in fams', async () => {
    setupHappyPath()
    const { fams } = await getFocusedDataFromFirestore(aliceId)
    expect(fams.find(f => f.id === 'F0')).toBeDefined()
  })

  it('does not duplicate families when the same family appears in husb and wife queries', async () => {
    // F1 returns in both husb and wife results (edge case for same family)
    getDoc
      .mockResolvedValueOnce(fakeDoc('I1', { ...aliceData, famc: null }))
    getDocs
      .mockResolvedValueOnce(fakeSnap([fakeDoc('F1', f1Data)]))
      .mockResolvedValueOnce(fakeSnap([fakeDoc('F1', f1Data)]))  // duplicate
      .mockResolvedValueOnce(fakeSnap([fakeDoc('I2', bobData), fakeDoc('I3', carolData)]))

    const { fams } = await getFocusedDataFromFirestore(aliceId)
    const f1Count = fams.filter(f => f.id === 'F1').length
    expect(f1Count).toBe(1)
  })

  it('skips the famc fetch when the individual has no famc', async () => {
    getDoc.mockResolvedValueOnce(fakeDoc('I1', { ...aliceData, famc: null }))
    getDocs
      .mockResolvedValueOnce(fakeSnap([fakeDoc('F1', f1Data)]))
      .mockResolvedValueOnce(fakeSnap([]))
      .mockResolvedValueOnce(fakeSnap([fakeDoc('I2', bobData), fakeDoc('I3', carolData)]))

    await getFocusedDataFromFirestore(aliceId)
    // getDoc called only once (individual), not twice (individual + famc)
    expect(getDoc).toHaveBeenCalledTimes(1)
  })

  it('handles an individual with no family connections', async () => {
    const loner = { id: 'IX', famc: null, fams: [] }
    getDoc.mockResolvedValueOnce(fakeDoc('IX', loner))
    getDocs
      .mockResolvedValueOnce(fakeSnap([]))  // husb
      .mockResolvedValueOnce(fakeSnap([]))  // wife

    const { indis, fams } = await getFocusedDataFromFirestore('IX')
    expect(indis).toHaveLength(1)
    expect(fams).toHaveLength(0)
  })

  it('batches related individual lookups in groups of 10', async () => {
    // Build a family with 25 children — requires 3 getDocs batches
    const children = Array.from({ length: 25 }, (_, i) => `I${i + 10}`)
    const bigFam = { id: 'FB', husb: 'I1', wife: null, children }

    getDoc.mockResolvedValueOnce(fakeDoc('I1', { ...aliceData, famc: null }))
    getDocs
      .mockResolvedValueOnce(fakeSnap([fakeDoc('FB', bigFam)]))  // husb
      .mockResolvedValueOnce(fakeSnap([]))                        // wife
      // 3 batches of up to 10 each for 25 children
      .mockResolvedValueOnce(fakeSnap([]))
      .mockResolvedValueOnce(fakeSnap([]))
      .mockResolvedValueOnce(fakeSnap([]))

    await getFocusedDataFromFirestore('I1')
    // getDocs: husb + wife + 3 batches = 5 calls total
    expect(getDocs).toHaveBeenCalledTimes(5)
  })

  it('sanitizes GEDCOM IDs with @ signs when looking up documents', async () => {
    // Old-style GEDCOM IDs with @ should be stripped for the Firestore doc path
    getDoc
      .mockResolvedValueOnce(fakeDoc('I1', { ...aliceData, famc: '@F0@' }))
      .mockResolvedValueOnce(fakeDoc('F0', f0Data))  // famc lookup uses sanitized ID
    getDocs
      .mockResolvedValueOnce(fakeSnap([]))  // husb
      .mockResolvedValueOnce(fakeSnap([]))  // wife
      .mockResolvedValueOnce(fakeSnap([]))  // related-individual batch (F0 has husb/wife members)

    await getFocusedDataFromFirestore('@I1@')
    // The first getDoc should have been called with sanitized 'I1', not '@I1@'
    expect(getDoc).toHaveBeenCalledWith(
      expect.objectContaining({ _path: expect.stringContaining('individuals/I1') })
    )
  })
})
