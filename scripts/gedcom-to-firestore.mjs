/**
 * gedcom-to-firestore.mjs
 *
 * One-time migration script: reads a .ged file, parses it with topola,
 * and writes every individual and family to Firestore in batches of 500.
 *
 * Usage:
 *   node scripts/gedcom-to-firestore.mjs \
 *     --ged src/data/private/campbells.ged \
 *     --tree campbells \
 *     --key serviceAccountKey.json
 *
 * Prerequisites:
 *   npm install -g firebase-admin   (or: yarn add --dev firebase-admin)
 *   Place your service account key at serviceAccountKey.json (gitignored)
 */

import { readFileSync } from 'fs'
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
  },
})

if (!args.ged || !args.tree || !args.key) {
  console.error(
    'Usage: node scripts/gedcom-to-firestore.mjs --ged <file.ged> --tree <treeId> --key <serviceAccountKey.json>'
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
db.settings({ ignoreUndefinedProperties: true })

// ─── Parse GEDCOM ────────────────────────────────────────────────────────────

const topola = require('topola')
console.log(`Parsing ${args.ged}...`)
const gedcomText = readFileSync(args.ged, 'utf8')
const { indis, fams } = topola.gedcomToJson(gedcomText)
console.log(`Parsed: ${indis.length} individuals, ${fams.length} families\n`)

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * GEDCOM IDs like "@I392580396428@" contain @ which is invalid in Firestore
 * document paths. Strip them: "@I392580396428@" → "I392580396428".
 * The original GEDCOM ID is still stored as the `id` field on the document
 * so all cross-references (famc, fams, husb, wife, children) remain correct.
 */
function sanitizeId(gedcomId) {
  return gedcomId?.replace(/@/g, '').replace(/\s/g, '_') ?? ''
}

async function writeInBatches(collectionPath, docs) {
  const BATCH_SIZE = 500
  let written = 0
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = db.batch()
    for (const item of docs.slice(i, i + BATCH_SIZE)) {
      batch.set(db.doc(`${collectionPath}/${sanitizeId(item.id)}`), item)
    }
    await batch.commit()
    written += Math.min(BATCH_SIZE, docs.length - i)
    console.log(`  ${collectionPath}: ${written}/${docs.length}`)
  }
}

// ─── Enrich individuals ───────────────────────────────────────────────────────

// Derive a `living` flag: true if the person has no death record.
// Used by Firestore security rules to hide living people from public reads.
const enrichedIndis = indis.map(indi => ({
  ...indi,
  living: !indi.death?.date && !indi.death?.place,
}))

const livingCount = enrichedIndis.filter(i => i.living).length

// Build id → indi map for family denormalization
const indiMap = {}
for (const indi of enrichedIndis) {
  indiMap[sanitizeId(indi.id)] = indi
}

function formatName(indi) {
  if (!indi) return null
  const first = indi.firstName ?? ''
  const last  = indi.lastName  ?? ''
  return [first, last].filter(Boolean).join(' ') || null
}

// Enrich families with denormalized husband/wife names for the admin search
const enrichedFams = fams.map(fam => ({
  ...fam,
  husbName: formatName(fam.husb ? indiMap[sanitizeId(fam.husb)] : null),
  wifeName: formatName(fam.wife ? indiMap[sanitizeId(fam.wife)] : null),
}))

// ─── Write to Firestore ───────────────────────────────────────────────────────

const treePath = `trees/${args.tree}`

// Tree metadata document
await db.doc(treePath).set({
  name:             args.tree,
  individualsCount: indis.length,
  livingCount,
  familiesCount:    fams.length,
  importedAt:       admin.firestore.FieldValue.serverTimestamp(),
  sourceFile:       args.ged.split('/').pop(),
})
console.log(`Tree metadata written to ${treePath}\n`)

console.log('Writing individuals...')
await writeInBatches(`${treePath}/individuals`, enrichedIndis)

console.log('\nWriting families...')
await writeInBatches(`${treePath}/families`, enrichedFams)

console.log('\nDone.')
process.exit(0)
