# Migration Script: GEDCOM → Firestore

A one-time Node.js script that reads a `.ged` file, parses it with topola, and writes every individual and family to Firestore in batches.

Run this once to populate the database. After that, the live app reads from Firestore rather than the bundled file.

---

## Prerequisites

- Node.js 18+
- A Firebase project with Firestore enabled
- A Firebase **service account key** (for server-side writes — do not use the client SDK config for this)
  - Firebase console → Project settings → Service accounts → Generate new private key
  - Save as `serviceAccountKey.json` (never commit this file)

---

## Script

Save as `scripts/gedcom-to-firestore.mjs` in the project root.

```js
// scripts/gedcom-to-firestore.mjs
//
// Usage:
//   node scripts/gedcom-to-firestore.mjs \
//     --ged src/data/private/campbells.ged \
//     --tree campbells \
//     --key serviceAccountKey.json

import { readFileSync } from 'fs'
import { createRequire } from 'module'
import { parseArgs } from 'util'

const require = createRequire(import.meta.url)

// Parse CLI args
const { values: args } = parseArgs({
  args: process.argv.slice(2),
  options: {
    ged:  { type: 'string' },
    tree: { type: 'string' },
    key:  { type: 'string' },
  },
})

if (!args.ged || !args.tree || !args.key) {
  console.error('Usage: node scripts/gedcom-to-firestore.mjs --ged <file> --tree <treeId> --key <serviceAccountKey.json>')
  process.exit(1)
}

// Initialise Firebase Admin SDK
const admin = require('firebase-admin')
const serviceAccount = JSON.parse(readFileSync(args.key, 'utf8'))

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

const db = admin.firestore()

// Parse GEDCOM
const topola = require('topola')
const gedcomText = readFileSync(args.ged, 'utf8')
console.log(`Parsing ${args.ged}...`)
const { indis, fams } = topola.gedcomToJson(gedcomText)
console.log(`Parsed: ${indis.length} individuals, ${fams.length} families`)

// Write to Firestore in batches of 500 (Firestore batch write limit)
async function writeBatch(collectionPath, docs) {
  const BATCH_SIZE = 500
  let count = 0
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = db.batch()
    const chunk = docs.slice(i, i + BATCH_SIZE)
    for (const item of chunk) {
      // Use the GEDCOM ID (e.g. "@I392580396428@") as the Firestore document ID,
      // but strip the @ symbols to avoid Firestore path issues
      const docId = item.id.replace(/@/g, '').replace(/\s/g, '_')
      const ref = db.doc(`${collectionPath}/${docId}`)
      batch.set(ref, item)
    }
    await batch.commit()
    count += chunk.length
    console.log(`  ${collectionPath}: wrote ${count}/${docs.length}`)
  }
}

const treeId = args.tree
const treePath = `trees/${treeId}`

// Write tree metadata
await db.doc(treePath).set({
  name: treeId,
  individualsCount: indis.length,
  familiesCount: fams.length,
  importedAt: admin.firestore.FieldValue.serverTimestamp(),
  sourceFile: args.ged.split('/').pop(),
})

// Write individuals and families
console.log('Writing individuals...')
await writeBatch(`${treePath}/individuals`, indis)

console.log('Writing families...')
await writeBatch(`${treePath}/families`, fams)

console.log('Done.')
process.exit(0)
```

---

## Running the script

Install the required dependencies (these are dev/script tools, not app dependencies):

```bash
yarn add --dev firebase-admin
```

Add `serviceAccountKey.json` to `.gitignore` (it should never be committed):

```
# .gitignore
serviceAccountKey.json
```

Run the migration:

```bash
node scripts/gedcom-to-firestore.mjs \
  --ged src/data/private/campbells.ged \
  --tree campbells \
  --key serviceAccountKey.json
```

Expected output:

```
Parsing src/data/private/campbells.ged...
Parsed: 3214 individuals, 1608 families
Writing individuals...
  trees/campbells/individuals: wrote 500/3214
  trees/campbells/individuals: wrote 1000/3214
  trees/campbells/individuals: wrote 1500/3214
  trees/campbells/individuals: wrote 2000/3214
  trees/campbells/individuals: wrote 2500/3214
  trees/campbells/individuals: wrote 3000/3214
  trees/campbells/individuals: wrote 3214/3214
Writing families...
  trees/campbells/families: wrote 500/1608
  trees/campbells/families: wrote 1000/1608
  trees/campbells/families: wrote 1500/1608
  trees/campbells/families: wrote 1608/1608
Done.
```

Total time for the campbells dataset: approximately 2–4 minutes (network dependent).

---

## Re-running the migration

The script uses `batch.set()` which overwrites existing documents. It is safe to re-run after updating the `.ged` file — records are upserted, not duplicated. The only side effect is that documents for individuals or families removed from the new `.ged` file will remain in Firestore (they are not deleted). To do a clean re-import:

```bash
# Delete the existing tree subcollections first (use with caution)
firebase firestore:delete trees/campbells --recursive
```

Then re-run the migration script.

---

## Document ID format

GEDCOM IDs (e.g. `@I392580396428@`) contain `@` characters which are not valid in Firestore document paths. The script strips them: `@I392580396428@` becomes `I392580396428` as the Firestore document ID. The original GEDCOM ID is still stored as the `id` field within the document, so all cross-references (famc, fams, husb, wife, children) remain correct.

---

## Estimated Firestore write costs

The Spark (free) plan allows 20,000 writes/day. The campbells migration requires 4,823 writes (3,214 + 1,608 + 1 tree metadata doc), well within the daily limit. The migration can be completed in a single run on the free tier.
