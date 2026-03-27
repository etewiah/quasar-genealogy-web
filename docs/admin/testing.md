# Admin — Testing Guide

## Test suites

There are two test suites for the Astro admin implementation, covering the two composables:

| File | Tests | Covers |
|---|---|---|
| `src/composables/__tests__/useAuth.test.js` | 11 | `useAuth` — login, logout, isAuthed |
| `src/composables/__tests__/useAdminFirestore.test.js` | 37 | All 6 exported functions in `useAdminFirestore` |

**Total: 48 tests**

The Quasar implementation also has tests in the root project:

| File | Tests | Covers |
|---|---|---|
| `src/compose/__tests__/useTopolaData.test.js` | 20 | `cleanUpTopolaJson`, `getFocusedData` |
| `src/compose/__tests__/useFirestoreData.test.js` | 13 | `getFocusedDataFromFirestore`, `getFirstIndividual` |

---

## Running tests

### Astro implementation
```bash
cd astro-implementation
yarn test          # run once
yarn test:watch    # watch mode
```

### Root project (Quasar composables)
```bash
# from project root
yarn vitest run
yarn vitest        # watch mode
```

---

## Mocking strategy

Both test suites mock the Firebase SDK entirely — no real network calls are made.

### Firebase Firestore mock

```js
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
```

Each mock returns an object with debug-friendly properties (e.g. `{ _path: 'trees/campbells' }`) so you can assert on the arguments without needing real Firestore objects.

### Firebase db mock

```js
vi.mock('src/lib/firebase.js', () => ({ db: { _mock: true } }))
```

The `db` object is just passed through to `doc()` and `collection()` as the first argument — the mock functions ignore it.

### Fake document helpers

```js
function fakeDoc(id, data, exists = true) {
  return { id, data: () => data, exists: () => exists }
}

function fakeSnap(docs) {
  return { docs, empty: docs.length === 0 }
}
```

These mirror the shape of `DocumentSnapshot` and `QuerySnapshot` that the real Firebase SDK returns.

---

## Auth mock: environment variables

`useAuth.js` reads `import.meta.env.PUBLIC_MGMT_PASSWORD`. In tests, this is set per-test using Vitest's `vi.stubEnv`:

```js
vi.stubEnv('PUBLIC_MGMT_PASSWORD', 'test-password')
```

All stubs are cleared in `beforeEach` via `vi.unstubAllEnvs()` to prevent test pollution.

In jsdom, `sessionStorage` is available globally. Tests call `sessionStorage.clear()` in `beforeEach`.

---

## What is tested

### `useAuth`
- `isAuthed()` returns false when storage is empty or value is not `'1'`
- `isAuthed()` returns true when storage value is `'1'`
- `login()` throws when `PUBLIC_MGMT_PASSWORD` is not set
- `login()` throws when password is incorrect
- `login()` sets sessionStorage on correct password
- `login()` does not write sessionStorage when password is wrong
- `logout()` clears sessionStorage
- `logout()` is safe to call when not authed
- Full round-trip: not authed → login → authed → logout → not authed

### `getTreeMetadata`
- Returns merged `{ id, ...data }` when document exists
- Returns `null` when document does not exist
- Queries the `trees/campbells` document

### `getIndividualsPage`
- Merges document ID into items
- Attaches `_snap` to each item for cursor pagination
- `hasMore` is `true` for a full page, `false` for partial or empty
- `lastDoc` is the last snapshot, or `null` for empty pages
- Applies `startAfter` when a cursor is provided
- Does NOT apply `startAfter` on the first page
- Orders by `lastName` then `firstName`

### `searchIndividuals`
- Returns `[]` for empty string without querying Firestore
- Runs two parallel queries (firstName and lastName prefix)
- Uses `\uf8ff` sentinel for prefix range on both fields
- Merges and deduplicates results from both queries
- Uses `limit(50)` per query
- Documents behaviour for whitespace-only terms (no trimming)

### `getIndividual`
- Returns merged `{ id, ...data }` when document exists
- Throws `'Individual not found: {id}'` when document does not exist
- Queries the correct `individuals/{id}` path

### `updateIndividual`
- Calls `updateDoc` with provided fields
- Always adds `updatedAt: serverTimestamp()`
- Targets the correct document path
- Propagates errors from Firestore

### `getFamiliesPage`
- Merges document ID into items
- Attaches `_snap` for cursor pagination
- `hasMore` and `lastDoc` behave identically to `getIndividualsPage`
- Applies/skips `startAfter` based on cursor presence

---

## Adding tests for planned improvements

When implementing improvements from [improvements.md](improvements.md), add tests as follows:

**Improvement 2.2 (living filter):** Test that `where('living', '==', true/false)` is included in the query constraints when `livingFilter` is non-null, and absent when it is `null`.

**Improvement 2.5 (family search):** Follow the same pattern as `searchIndividuals` tests — two parallel queries, prefix range, deduplication.

**Improvement 3.1 (livingCount in metadata):** Verify `getTreeMetadata()` returns `livingCount` when it is present in the document.
