/**
 * compare-ged-firestore.mjs
 *
 * Parses a .ged file exactly as gedcom-to-firestore.mjs does, then fetches
 * every individual and family from Firestore and reports field-level diffs.
 *
 * Usage:
 *   node scripts/compare-ged-firestore.mjs \
 *     --ged src/data/private/campbells.ged \
 *     --tree campbells \
 *     --key serviceAccountKey.json
 *
 * Output:
 *   - Summary counts
 *   - Per-entity diffs (only changed/missing records are shown)
 *   - Optional: --json flag writes full report to compare-report.json
 */

import { readFileSync, writeFileSync } from 'fs'
import { createRequire } from 'module'
import { parseArgs } from 'util'

const require = createRequire(import.meta.url)

// ─── Args ────────────────────────────────────────────────────────────────────

const { values: args } = parseArgs({
  args: process.argv.slice(2),
  options: {
    ged:  { type: 'string' },
    tree: { type: 'string' },
    key:  { type: 'string' },
    json: { type: 'boolean', default: false },
    type: { type: 'string', default: 'both' }, // 'individuals' | 'families' | 'both'
  },
})

if (!args.ged || !args.tree || !args.key) {
  console.error(
    'Usage: node scripts/compare-ged-firestore.mjs --ged <file.ged> --tree <treeId> --key <serviceAccountKey.json> [--json] [--type individuals|families|both]'
  )
  process.exit(1)
}

// ─── Firebase Admin ──────────────────────────────────────────────────────────

const admin = require('firebase-admin')
admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(readFileSync(args.key, 'utf8'))
  ),
})
const db = admin.firestore()

// ─── Parse GEDCOM ────────────────────────────────────────────────────────────

const topola = require('topola')
console.log(`Parsing ${args.ged}...`)
const gedcomText = readFileSync(args.ged, 'utf8')
const { indis: gedIndis, fams: gedFams } = topola.gedcomToJson(gedcomText)
console.log(`GED: ${gedIndis.length} individuals, ${gedFams.length} families\n`)

function sanitizeId(id) {
  return id?.replace(/@/g, '').replace(/\s/g, '_') ?? ''
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Normalise a date value to a plain string for comparison. */
function dateText(val) {
  if (!val) return ''
  if (typeof val === 'string') return val
  return val.text ?? JSON.stringify(val)
}

/** Flatten an individual to a set of comparable scalar fields. */
function flattenIndi(indi) {
  return {
    firstName:  indi.firstName  ?? '',
    lastName:   indi.lastName   ?? '',
    sex:        indi.sex        ?? '',
    birthDate:  dateText(indi.birth?.date),
    birthPlace: indi.birth?.place ?? '',
    deathDate:  dateText(indi.death?.date),
    deathPlace: indi.death?.place ?? '',
    famc:       indi.famc ?? null,
    fams:       JSON.stringify([...(indi.fams ?? [])].sort()),
  }
}

/** Flatten a family to comparable scalar fields. */
function flattenFam(fam) {
  return {
    husb:     fam.husb ?? null,
    wife:     fam.wife ?? null,
    children: JSON.stringify([...(fam.children ?? [])].sort()),
  }
}

/** Return an object with only the keys that differ between a and b. */
function diff(a, b) {
  const changes = {}
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const k of keys) {
    if (a[k] !== b[k]) {
      changes[k] = { ged: a[k], firestore: b[k] }
    }
  }
  return Object.keys(changes).length ? changes : null
}

// ─── Fetch Firestore ──────────────────────────────────────────────────────────

async function fetchAll(collectionPath) {
  const map = {}
  let snap = await db.collection(collectionPath).get()
  for (const doc of snap.docs) map[doc.id] = doc.data()
  // handle pagination
  while (snap.size === 1000) {
    const last = snap.docs[snap.docs.length - 1]
    snap = await db.collection(collectionPath).startAfter(last).get()
    for (const doc of snap.docs) map[doc.id] = doc.data()
  }
  return map
}

const treePath = `trees/${args.tree}`

// ─── Compare Individuals ─────────────────────────────────────────────────────

const report = { individuals: {}, families: {} }

if (args.type === 'individuals' || args.type === 'both') {
  console.log('Fetching individuals from Firestore...')
  const fsIndis = await fetchAll(`${treePath}/individuals`)
  console.log(`Firestore: ${Object.keys(fsIndis).length} individuals\n`)

  const gedIndiMap = {}
  for (const indi of gedIndis) gedIndiMap[sanitizeId(indi.id)] = indi

  let missing = 0, extra = 0, changed = 0, same = 0

  // GED → Firestore
  for (const [fsId, gedIndi] of Object.entries(gedIndiMap)) {
    const fsIndi = fsIndis[fsId]
    if (!fsIndi) {
      report.individuals[fsId] = { status: 'missing_in_firestore', name: `${gedIndi.firstName ?? ''} ${gedIndi.lastName ?? ''}`.trim() }
      missing++
      continue
    }
    const d = diff(flattenIndi(gedIndi), flattenIndi(fsIndi))
    if (d) {
      report.individuals[fsId] = {
        status: 'changed',
        name: `${fsIndi.firstName ?? ''} ${fsIndi.lastName ?? ''}`.trim(),
        diff: d,
      }
      changed++
    } else {
      same++
    }
  }

  // Firestore → GED (extra records)
  for (const fsId of Object.keys(fsIndis)) {
    if (!gedIndiMap[fsId]) {
      const fsIndi = fsIndis[fsId]
      report.individuals[fsId] = { status: 'extra_in_firestore', name: `${fsIndi.firstName ?? ''} ${fsIndi.lastName ?? ''}`.trim() }
      extra++
    }
  }

  console.log('── Individuals ──────────────────────────────────────────────')
  console.log(`  Same:               ${same}`)
  console.log(`  Changed:            ${changed}`)
  console.log(`  Missing in FS:      ${missing}`)
  console.log(`  Extra in FS:        ${extra}`)
  console.log()

  const changedIndis = Object.entries(report.individuals).filter(([, v]) => v.status === 'changed')
  if (changedIndis.length) {
    console.log('Changed individuals:')
    for (const [id, rec] of changedIndis) {
      console.log(`  ${id}  ${rec.name}`)
      for (const [field, { ged, firestore }] of Object.entries(rec.diff)) {
        console.log(`    ${field.padEnd(12)}  GED: ${JSON.stringify(ged)}`)
        console.log(`    ${''.padEnd(12)}   FS: ${JSON.stringify(firestore)}`)
      }
    }
    console.log()
  }
  if (missing) {
    console.log('Missing in Firestore:')
    Object.entries(report.individuals)
      .filter(([, v]) => v.status === 'missing_in_firestore')
      .forEach(([id, rec]) => console.log(`  ${id}  ${rec.name}`))
    console.log()
  }
  if (extra) {
    console.log('Extra in Firestore (not in GED):')
    Object.entries(report.individuals)
      .filter(([, v]) => v.status === 'extra_in_firestore')
      .forEach(([id, rec]) => console.log(`  ${id}  ${rec.name}`))
    console.log()
  }
}

// ─── Compare Families ────────────────────────────────────────────────────────

if (args.type === 'families' || args.type === 'both') {
  console.log('Fetching families from Firestore...')
  const fsFams = await fetchAll(`${treePath}/families`)
  console.log(`Firestore: ${Object.keys(fsFams).length} families\n`)

  const gedFamMap = {}
  for (const fam of gedFams) gedFamMap[sanitizeId(fam.id)] = fam

  let missing = 0, extra = 0, changed = 0, same = 0

  for (const [fsId, gedFam] of Object.entries(gedFamMap)) {
    const fsFam = fsFams[fsId]
    if (!fsFam) {
      report.families[fsId] = { status: 'missing_in_firestore' }
      missing++
      continue
    }
    const d = diff(flattenFam(gedFam), flattenFam(fsFam))
    if (d) {
      report.families[fsId] = { status: 'changed', diff: d }
      changed++
    } else {
      same++
    }
  }

  for (const fsId of Object.keys(fsFams)) {
    if (!gedFamMap[fsId]) {
      report.families[fsId] = { status: 'extra_in_firestore' }
      extra++
    }
  }

  console.log('── Families ─────────────────────────────────────────────────')
  console.log(`  Same:               ${same}`)
  console.log(`  Changed:            ${changed}`)
  console.log(`  Missing in FS:      ${missing}`)
  console.log(`  Extra in FS:        ${extra}`)
  console.log()

  const changedFams = Object.entries(report.families).filter(([, v]) => v.status === 'changed')
  if (changedFams.length) {
    console.log('Changed families:')
    for (const [id, rec] of changedFams) {
      console.log(`  ${id}`)
      for (const [field, { ged, firestore }] of Object.entries(rec.diff)) {
        console.log(`    ${field.padEnd(12)}  GED: ${JSON.stringify(ged)}`)
        console.log(`    ${''.padEnd(12)}   FS: ${JSON.stringify(firestore)}`)
      }
    }
    console.log()
  }
}

// ─── JSON report ─────────────────────────────────────────────────────────────

if (args.json) {
  const outPath = 'compare-report.json'
  writeFileSync(outPath, JSON.stringify(report, null, 2))
  console.log(`Full report written to ${outPath}`)
}

process.exit(0)
