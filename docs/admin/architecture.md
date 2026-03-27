# Admin Architecture

## Directory layout

```
astro-implementation/src/
├── composables/
│   ├── useAuth.js               # sessionStorage-based auth
│   └── useAdminFirestore.js     # all Firestore queries for admin
├── components/admin/
│   ├── AdminShell.vue           # layout wrapper + auth guard
│   ├── AdminLoginApp.vue        # standalone login form
│   ├── AdminDashboardApp.vue    # stats overview
│   ├── AdminIndividualsApp.vue  # paginated list + search
│   ├── AdminIndividualEditApp.vue # edit form
│   └── AdminFamiliesApp.vue     # paginated families list
└── pages/admin/
    ├── login.astro
    ├── index.astro              # redirects to /admin/dashboard
    ├── dashboard.astro
    ├── individuals.astro
    ├── individual-edit.astro
    └── families.astro
```

## Auth flow

```
User visits /admin/dashboard
         │
         ▼
AdminShell.vue
  isAuthed() → reads sessionStorage.getItem('admin_authed')
         │
    ─────┴──────────────────────
    '1'                  null/other
     │                       │
  render page         window.location.href = '/admin/login'


User visits /admin/login, submits password
         │
         ▼
AdminLoginApp.vue → useAuth.login(password)
  password === import.meta.env.PUBLIC_MGMT_PASSWORD?
         │
    ─────┴──────────────────────
    yes                   no
     │                     │
sessionStorage             throw Error('Incorrect password')
.setItem('admin_authed','1')
     │
window.location.href = '/admin/dashboard'
```

## Astro static page + Vue mounting pattern

Astro is configured for `output: 'static'`. Admin pages cannot use `client:load` directives because the admin shell wraps everything — instead, each page creates a Vue app directly:

```astro
---
// server-side: nothing to do
---
<html>
  <body>
    <div id="app"></div>
    <script>
      import { createApp } from 'vue'
      import AdminDashboardApp from '../../components/admin/AdminDashboardApp.vue'
      createApp(AdminDashboardApp).mount('#app')
    </script>
  </body>
</html>
```

This avoids the `before-hydration.js` virtual module that Astro's island system requests when you use `client:only="vue"` — that virtual module causes 404 errors in some Astro versions.

## Cursor pagination pattern

Firestore's `startAfter` cursor-based pagination is used throughout.

Each page response returns:
```js
{
  items: [...],      // the current page's documents (with _snap attached)
  lastDoc: snap,     // the last DocumentSnapshot — used as cursor for next page
  hasMore: boolean,  // items.length === PAGE_SIZE means there's probably more
}
```

The Vue component tracks history for "previous page":
```js
const pageHistory = ref([])  // stack of cursor docs

async function nextPage() {
  pageHistory.value.push(lastDoc.value)  // save current cursor
  await loadPage(lastDoc.value)
}

async function prevPage() {
  pageHistory.value.pop()                // remove current
  const prev = pageHistory.value.at(-1) ?? null  // go back one
  await loadPage(prev)
}
```

## Firestore index requirements

The individuals query orders by two fields:
```js
orderBy('lastName'), orderBy('firstName')
```

This requires a composite index. It is defined in `firestore.indexes.json`:
```json
{
  "indexes": [{
    "collectionGroup": "individuals",
    "queryScope": "COLLECTION",
    "fields": [
      { "fieldPath": "lastName",  "order": "ASCENDING" },
      { "fieldPath": "firstName", "order": "ASCENDING" }
    ]
  }]
}
```

Deploy with: `firebase deploy --only firestore:indexes`

## Search implementation

`searchIndividuals(term)` runs two parallel prefix-range queries and deduplicates results:

```js
// firstName >= term AND firstName < term + '\uf8ff'
// lastName  >= term AND lastName  < term + '\uf8ff'
```

The `\uf8ff` character is the highest Unicode code point in the Private Use Area — any string starting with `term` will sort before it, making this an effective prefix match.

Deduplication is done via an `Object.fromEntries` map keyed on individual ID:
```js
const all = [...byFirst.docs, ...byLast.docs]
return Object.values(Object.fromEntries(all.map(i => [i.id, i])))
```

**Limitation:** Case-sensitive. "smith" will not match "Smith". The Firestore data stores names as-imported from GEDCOM (typically mixed case).

## Environment variables

| Variable | Used by | Purpose |
|---|---|---|
| `PUBLIC_MGMT_PASSWORD` | `useAuth.js` | Admin password |
| `PUBLIC_FIREBASE_API_KEY` | `lib/firebase.js` | Firebase project config |
| `PUBLIC_FIREBASE_AUTH_DOMAIN` | `lib/firebase.js` | Firebase project config |
| `PUBLIC_FIREBASE_PROJECT_ID` | `lib/firebase.js` | Firebase project config |
| `PUBLIC_FIREBASE_APP_ID` | `lib/firebase.js` | Firebase project config |

All are set in `.env` (gitignored) and in the Cloudflare Pages environment variables dashboard.

`PUBLIC_*` prefix is required by Astro to expose env vars to client-side JavaScript. Astro strips unprefixed vars from the client bundle.
