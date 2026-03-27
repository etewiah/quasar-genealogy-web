import { describe, it, expect, beforeEach } from 'vitest'
import useTopolaData from '../useTopolaData.js'

// ─── Shared fixtures ─────────────────────────────────────────────────────────
//
// Family structure:
//   Alice (I1) + Bob (I2)  →  F1  →  Carol (I3), Dave (I4)
//   Carol (I3) + Ed (I5)   →  F2  →  Frank (I6)
//   Frank (I6)             →  (no spouse, no children)
//
// This gives us two generations of descendants from Alice/Bob,
// and lets us verify grandchild expansion and subgraph slicing.

function makeIndis() {
  return [
    { id: 'I1', fams: ['F1'], famc: null },       // Alice  — wife in F1
    { id: 'I2', fams: ['F1'], famc: null },       // Bob    — husb in F1
    { id: 'I3', fams: ['F2'], famc: 'F1' },      // Carol  — child in F1, wife in F2
    { id: 'I4', fams: [],     famc: 'F1' },      // Dave   — child in F1, no own family
    { id: 'I5', fams: ['F2'], famc: null },       // Ed     — husb in F2
    { id: 'I6', fams: [],     famc: 'F2' },      // Frank  — child in F2
  ]
}

function makeFams() {
  return [
    { id: 'F1', husb: 'I2', wife: 'I1', children: ['I3', 'I4'] },
    { id: 'F2', husb: 'I5', wife: 'I3', children: ['I6'] },
  ]
}

function makeDataset() {
  return { indis: makeIndis(), fams: makeFams() }
}

function ids(arr) {
  return arr.map(x => x.id).sort()
}

// ─── cleanUpTopolaJson ───────────────────────────────────────────────────────

describe('cleanUpTopolaJson', () => {
  let cleanUpTopolaJson

  beforeEach(() => {
    ;({ cleanUpTopolaJson } = useTopolaData())
  })

  it('strips fams entries that point to families not in the dataset', () => {
    const data = {
      indis: [{ id: 'I1', fams: ['F1', 'F99'], famc: null }],
      fams:  [{ id: 'F1', husb: 'I1', wife: null, children: [] }],
    }
    cleanUpTopolaJson(data)
    expect(data.indis[0].fams).toEqual(['F1'])
  })

  it('nullifies famc when the family is not in the dataset', () => {
    const data = {
      indis: [{ id: 'I3', fams: [], famc: 'F99' }],
      fams:  [],
    }
    cleanUpTopolaJson(data)
    expect(data.indis[0].famc).toBeNull()
  })

  it('preserves valid fams references', () => {
    const data = {
      indis: [{ id: 'I1', fams: ['F1'], famc: null }],
      fams:  [{ id: 'F1', husb: 'I1', wife: null, children: [] }],
    }
    cleanUpTopolaJson(data)
    expect(data.indis[0].fams).toEqual(['F1'])
  })

  it('preserves famc when the family is present in the dataset', () => {
    const data = {
      indis: [{ id: 'I3', fams: [], famc: 'F1' }],
      fams:  [{ id: 'F1', husb: 'I2', wife: 'I1', children: ['I3'] }],
    }
    cleanUpTopolaJson(data)
    expect(data.indis[0].famc).toBe('F1')
  })

  it('handles individuals with no fams field gracefully', () => {
    const data = {
      indis: [{ id: 'I1', fams: undefined, famc: null }],
      fams:  [],
    }
    // Should not throw — intersection with undefined fams returns empty
    expect(() => cleanUpTopolaJson(data)).not.toThrow()
  })

  it('handles an empty dataset without throwing', () => {
    expect(() => cleanUpTopolaJson({ indis: [], fams: [] })).not.toThrow()
  })

  it('strips multiple dangling fams while keeping valid ones', () => {
    const data = {
      indis: [{ id: 'I1', fams: ['F1', 'F_GONE_1', 'F2', 'F_GONE_2'], famc: null }],
      fams:  [
        { id: 'F1', husb: 'I1', wife: null, children: [] },
        { id: 'F2', husb: 'I1', wife: null, children: [] },
      ],
    }
    cleanUpTopolaJson(data)
    expect(data.indis[0].fams.sort()).toEqual(['F1', 'F2'])
  })

  it('returns the same topolaJsonData object (mutates in-place)', () => {
    const data = { indis: [], fams: [] }
    const result = cleanUpTopolaJson(data)
    expect(result).toBe(data)
  })
})

// ─── getFocusedData ──────────────────────────────────────────────────────────

describe('getFocusedData', () => {
  let getFocusedData

  beforeEach(() => {
    ;({ getFocusedData } = useTopolaData())
  })

  it('returns the family where the focused person is the wife', () => {
    const data = makeDataset()
    const alice = data.indis.find(i => i.id === 'I1')
    const result = getFocusedData(data, alice)
    expect(ids(result.fams)).toContain('F1')
  })

  it('returns the family where the focused person is the husband', () => {
    const data = makeDataset()
    const bob = data.indis.find(i => i.id === 'I2')
    const result = getFocusedData(data, bob)
    expect(ids(result.fams)).toContain('F1')
  })

  it('returns the family where the focused person is a child', () => {
    const data = makeDataset()
    const carol = data.indis.find(i => i.id === 'I3')
    const result = getFocusedData(data, carol)
    expect(ids(result.fams)).toContain('F1')
    expect(ids(result.fams)).toContain('F2')
  })

  it('returns all individuals from the related families', () => {
    const data = makeDataset()
    const alice = data.indis.find(i => i.id === 'I1')
    const result = getFocusedData(data, alice)
    // F1 members: I1, I2, I3, I4
    expect(ids(result.indis)).toEqual(['I1', 'I2', 'I3', 'I4'])
  })

  it('does not include individuals from unrelated families', () => {
    const data = makeDataset()
    const alice = data.indis.find(i => i.id === 'I1')
    const result = getFocusedData(data, alice)
    // Ed (I5) and Frank (I6) are only in F2, which Alice is not part of
    const resultIds = ids(result.indis)
    expect(resultIds).not.toContain('I5')
    expect(resultIds).not.toContain('I6')
  })

  it('does not include F2 when focusing on Alice (not in F2)', () => {
    const data = makeDataset()
    const alice = data.indis.find(i => i.id === 'I1')
    const result = getFocusedData(data, alice)
    expect(ids(result.fams)).not.toContain('F2')
  })

  it('returns an empty result for an individual with no family connections', () => {
    const loner = { id: 'IX', fams: [], famc: null }
    const data = {
      indis: [...makeIndis(), loner],
      fams: makeFams(),
    }
    const result = getFocusedData(data, loner)
    expect(result.indis).toHaveLength(0)
    expect(result.fams).toHaveLength(0)
  })

  it('deduplicates individuals when they appear in multiple families', () => {
    // Carol is in both F1 (as child) and F2 (as wife) — should appear once
    const data = makeDataset()
    const carol = data.indis.find(i => i.id === 'I3')
    const result = getFocusedData(data, carol)
    const carolEntries = result.indis.filter(i => i.id === 'I3')
    expect(carolEntries).toHaveLength(1)
  })

  describe('showGrandchildren = true', () => {
    it('includes grandchildren families', () => {
      const data = makeDataset()
      const alice = data.indis.find(i => i.id === 'I1')
      const result = getFocusedData(data, alice, true)
      // Alice's grandchild (Frank via Carol) means F2 is included
      expect(ids(result.fams)).toContain('F2')
    })

    it('includes all grandchild individuals', () => {
      const data = makeDataset()
      const alice = data.indis.find(i => i.id === 'I1')
      const result = getFocusedData(data, alice, true)
      // All 6 individuals should be present
      expect(ids(result.indis)).toEqual(['I1', 'I2', 'I3', 'I4', 'I5', 'I6'])
    })

    it('does not expand grandchildren when showGrandchildren = false (default)', () => {
      const data = makeDataset()
      const alice = data.indis.find(i => i.id === 'I1')
      const resultDefault = getFocusedData(data, alice)
      const resultExplicit = getFocusedData(data, alice, false)
      expect(ids(resultDefault.indis)).toEqual(ids(resultExplicit.indis))
      expect(ids(resultDefault.indis)).not.toContain('I6')
    })

    it('handles a child with no own family during grandchild expansion', () => {
      // Dave (I4) has no family — grandchild expansion should not crash
      const data = makeDataset()
      const alice = data.indis.find(i => i.id === 'I1')
      expect(() => getFocusedData(data, alice, true)).not.toThrow()
    })
  })
})
