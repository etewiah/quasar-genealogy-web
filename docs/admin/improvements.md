# Admin Interface — Improvement Specifications

This document captures every identified weakness in the current admin UI and specifies how to fix it, with enough detail to implement without ambiguity.

---

## Priority 1 — Quick wins (1–2 hours each)

### 1.1 Auto-dismiss the "Changes saved" banner

**Problem:** After saving an individual, the green "Changes saved." banner stays visible permanently until the user navigates away. It becomes invisible noise.

**Fix:** After a successful save, set a 3-second timeout to clear `saved.value`:

```js
// AdminIndividualEditApp.vue — inside handleSave()
saved.value = true
setTimeout(() => { saved.value = false }, 3000)
```

**No data model changes required.**

---

### 1.2 Clickable rows on the individuals table

**Problem:** The only way to edit an individual is to click a small "Edit" text link at the far right of the row. The whole row should be clickable.

**Fix:** Add a `@click` handler to each `<tr>`:

```html
<tr
  v-for="row in rows"
  :key="row.id"
  class="admin-table-row--clickable"
  @click="goToEdit(row.id)"
>
```

```js
function goToEdit(id) {
  window.location.href = `/admin/individual-edit?id=${encodeURIComponent(id)}`
}
```

CSS:
```css
.admin-table-row--clickable { cursor: pointer; }
.admin-table-row--clickable:hover { background: #f5f5f5; }
```

Remove the separate "Edit" link column from the table.

---

### 1.3 Fix sidebar active state for the edit page

**Problem:** `AdminShell.vue` uses `window.location.pathname.startsWith(path)` to highlight the active nav item. The edit page URL is `/admin/individual-edit` which does not start with `/admin/individuals`, so "Individuals" is not highlighted when editing.

**Fix:** Map edit pages back to their parent section:

```js
function isActive(path) {
  const pathname = window.location.pathname
  // Map edit pages to their list pages
  if (pathname.startsWith('/admin/individual-edit')) return path === '/admin/individuals'
  return pathname.startsWith(path)
}
```

---

### 1.4 "View on tree" link on the edit page

**Problem:** There is no way to see how this individual looks in the rendered genealogy chart from the edit page.

**Fix:** Add a link in the page header of `AdminIndividualEditApp.vue`:

```html
<div class="admin-page-header">
  <a href="/admin/individuals" class="admin-back-link">← Back to Individuals</a>
  <h2 class="admin-page-title">Edit Individual</h2>
  <a
    v-if="form"
    :href="`/?indi=${encodeURIComponent(form.id)}`"
    target="_blank"
    class="admin-view-link"
  >View on tree ↗</a>
</div>
```

---

### 1.5 Show total count on the individuals page

**Problem:** "Page 3" tells you nothing. You don't know if you're looking at 75 of 3,214 or 75 of 80.

**Fix — part A:** Store `individualsCount` and `familiesCount` in the `trees/campbells` metadata document. This already happens at migration time — confirm the migration script writes these fields. If not, add:

```js
// gedcom-to-firestore.mjs
await setDoc(doc(db, 'trees', TREE_ID), {
  individualsCount: Object.keys(data.indis).length,
  familiesCount:    Object.keys(data.fams).length,
  // ...
})
```

**Fix — part B:** Fetch the count in `AdminIndividualsApp.vue` and display it:

```js
import { getTreeMetadata } from '../../composables/useAdminFirestore.js'

const totalCount = ref(null)
onMounted(async () => {
  const meta = await getTreeMetadata()
  totalCount.value = meta?.individualsCount ?? null
  await loadPage()
})
```

```html
<p v-if="totalCount !== null" class="admin-count-hint">
  {{ rows.length }} of {{ totalCount.toLocaleString() }} individuals
  (page {{ currentPage }})
</p>
```

---

### 1.6 Make family IDs in the edit form into links

**Problem:** The Record Info section shows `famc` and `fams` as plain text IDs. They're not clickable.

**Fix:** Link to the families page filtered by ID. For now, link to the families list (full filter support is a larger task):

```html
<dt>Parent family</dt>
<dd>
  <a
    v-if="form.famc"
    :href="`/admin/families`"
    class="admin-link"
  >{{ form.famc }}</a>
  <span v-else>none</span>
</dd>
<dt>Spouse families</dt>
<dd>
  <template v-if="form.fams?.length">
    <span v-for="(fid, i) in form.fams" :key="fid">
      <a :href="`/admin/families`" class="admin-link">{{ fid }}</a>
      <span v-if="i < form.fams.length - 1">, </span>
    </span>
  </template>
  <span v-else>none</span>
</dd>
```

(When per-family deep links are implemented, update the href to `/admin/families?id=${fid}`.)

---

## Priority 2 — Medium effort

### 2.1 Add gender field to the individual edit form

**Problem:** GEDCOM records include a `sex` field (M/F/U). Topola uses it for chart colour coding. It is not currently exposed in the edit form.

**Data model:** The `sex` field is already stored in Firestore by the migration script (topola passes it through). No schema change needed.

**Fix — form:**

```html
<div class="admin-form-card">
  <h3 class="admin-section-title">Identity</h3>
  <div class="admin-field">
    <label>Gender</label>
    <select v-model="form.sex">
      <option value="M">Male</option>
      <option value="F">Female</option>
      <option value="U">Unknown</option>
      <option value="">Not specified</option>
    </select>
  </div>
</div>
```

**Fix — initialise in onMounted:**
```js
form.value = {
  ...indi,
  sex:   indi.sex ?? '',
  birth: { date: '', place: '', ...indi.birth },
  death: { date: '', place: '', ...indi.death },
}
```

**Fix — include in updateIndividual call:**
```js
await updateIndividual(id, {
  firstName: form.value.firstName,
  lastName:  form.value.lastName,
  sex:       form.value.sex,
  birth:     { ... },
  death:     { ... },
  living:    form.value.living,
})
```

---

### 2.2 Living/deceased filter on the individuals page

**Problem:** There is no way to filter individuals by living status. With 3,214+ records, finding all living individuals requires browsing every page.

**Firestore approach:** Add a `where('living', '==', filterValue)` clause when a filter is active. This requires no new Firestore index (single-field indexes are auto-managed).

**Fix — `useAdminFirestore.js`:** Add an optional `livingFilter` parameter to `getIndividualsPage`:

```js
export async function getIndividualsPage(cursorDoc = null, livingFilter = null) {
  const constraints = [
    orderBy('lastName'),
    orderBy('firstName'),
    limit(PAGE_SIZE),
  ]
  if (livingFilter !== null) {
    constraints.unshift(where('living', '==', livingFilter))
  }
  if (cursorDoc) constraints.push(startAfter(cursorDoc))

  const q = query(collection(db, `trees/${TREE_ID}/individuals`), ...constraints)
  const snap = await getDocs(q)
  return {
    items:   snap.docs.map(d => ({ id: d.id, _snap: d, ...d.data() })),
    lastDoc: snap.docs.at(-1) ?? null,
    hasMore: snap.docs.length === PAGE_SIZE,
  }
}
```

**Note:** Adding `where` before `orderBy` requires the composite index to include the `living` field. Either add it to `firestore.indexes.json`, or use a client-side filter instead:

```js
// Client-side fallback (works without new index):
const filtered = computed(() =>
  livingFilter.value === null
    ? rows.value
    : rows.value.filter(r => r.living === livingFilter.value)
)
```

Client-side filtering only applies within the current page (25 rows). A proper server-side filter requires the index update.

**Fix — UI:**

```html
<div class="admin-filter-bar">
  <button
    class="admin-filter-chip"
    :class="{ active: livingFilter === null }"
    @click="setFilter(null)"
  >All</button>
  <button
    class="admin-filter-chip"
    :class="{ active: livingFilter === true }"
    @click="setFilter(true)"
  >Living</button>
  <button
    class="admin-filter-chip"
    :class="{ active: livingFilter === false }"
    @click="setFilter(false)"
  >Deceased</button>
</div>
```

---

### 2.3 Replace birth place column with death date

**Problem:** The individuals table shows Birth Date and Birth Place. Birth Place is rarely the differentiating field when scanning a list. Death Date tells you at a glance when the person lived.

**Fix — swap the column in `AdminIndividualsApp.vue`:**

```html
<!-- Remove: -->
<th>Birth Place</th>
<!-- ...and... -->
<td>{{ row.birth?.place ?? '—' }}</td>

<!-- Add: -->
<th>Death Date</th>
<!-- ...and... -->
<td>{{ row.death?.date ?? '—' }}</td>
```

No data or composable changes required.

---

### 2.4 Show husband/wife names on families page

**Problem:** The families table shows raw Firestore document IDs for husband and wife. These IDs are meaningless to the user.

**Approach:** Denormalize names into the family document at migration time. This is the cleanest solution — it avoids N+1 lookups at read time.

**Fix — migration script `gedcom-to-firestore.mjs`:** When writing each family, look up husband/wife names from the already-built `indis` map:

```js
for (const [famId, fam] of Object.entries(data.fams)) {
  const husbName = fam.husb ? formatName(data.indis[fam.husb]) : null
  const wifeName = fam.wife ? formatName(data.indis[fam.wife]) : null

  batch.set(doc(db, `trees/${TREE_ID}/families`, famId), {
    husb:     fam.husb ?? null,
    husbName: husbName,
    wife:     fam.wife ?? null,
    wifeName: wifeName,
    children: fam.children ?? [],
    // ...marriage date if available
  })
}

function formatName(indi) {
  if (!indi) return null
  const first = indi.firstName ?? ''
  const last  = indi.lastName  ?? ''
  return [first, last].filter(Boolean).join(' ') || null
}
```

**Fix — `AdminFamiliesApp.vue`:** Update columns to use the name fields:

```html
<th>Husband</th>
<th>Wife</th>
<!-- ... -->
<td>{{ row.husbName ?? row.husb ?? '—' }}</td>
<td>{{ row.wifeName ?? row.wife ?? '—' }}</td>
```

The `?? row.husb` fallback ensures the table still works before re-migration.

---

### 2.5 Add search to the families page

**Problem:** No search exists on families. Finding a specific family requires paging through the entire list.

**Fix:** Add `searchFamilies(term)` to `useAdminFirestore.js`. Because family documents don't have a single searchable text field, search on the denormalized `husbName` and `wifeName` fields (from 2.4 above):

```js
export async function searchFamilies(term) {
  if (!term) return []
  const end = term + '\uf8ff'
  const [byHusb, byWife] = await Promise.all([
    getDocs(query(
      collection(db, `trees/${TREE_ID}/families`),
      where('husbName', '>=', term),
      where('husbName', '<', end),
      orderBy('husbName'),
      limit(50)
    )),
    getDocs(query(
      collection(db, `trees/${TREE_ID}/families`),
      where('wifeName', '>=', term),
      where('wifeName', '<', end),
      orderBy('wifeName'),
      limit(50)
    )),
  ])
  const all = [
    ...byHusb.docs.map(d => ({ id: d.id, ...d.data() })),
    ...byWife.docs.map(d => ({ id: d.id, ...d.data() })),
  ]
  return Object.values(Object.fromEntries(all.map(f => [f.id, f])))
}
```

Requires `husbName` and `wifeName` fields (from improvement 2.4).

---

## Priority 3 — Larger work

### 3.1 Living/deceased breakdown on dashboard

**Problem:** The dashboard shows only total counts. The most useful stat for a genealogist is how many people are marked as living (and therefore hidden from the public view).

**Fix — data model:** Store `livingCount` in the tree metadata document at migration time:

```js
const livingCount = Object.values(data.indis).filter(i => !i.death?.date && !i.death?.place).length

await setDoc(doc(db, 'trees', TREE_ID), {
  individualsCount: Object.keys(data.indis).length,
  livingCount,
  familiesCount:    Object.keys(data.fams).length,
  // ...
})
```

**Fix — dashboard UI:**

```html
<div class="admin-stat-card">
  <div class="admin-stat-label">Living</div>
  <div class="admin-stat-value">{{ meta.livingCount?.toLocaleString() ?? '—' }}</div>
</div>
<div class="admin-stat-card">
  <div class="admin-stat-label">Deceased</div>
  <div class="admin-stat-value">
    {{ ((meta.individualsCount ?? 0) - (meta.livingCount ?? 0)).toLocaleString() }}
  </div>
</div>
```

Also add a "View tree" button:

```html
<div class="admin-action-row">
  <a :href="`/?indi=${firstIndiId}`" class="admin-btn-primary" target="_blank">
    View Tree ↗
  </a>
  <a href="/admin/individuals" class="admin-btn-outline">Browse Individuals</a>
  <a href="/admin/families"    class="admin-btn-outline">Browse Families</a>
</div>
```

This requires storing `firstIndiId` in the tree metadata (the ID of the root/default individual), or using `getFirstIndividual()` at dashboard load time.

---

### 3.2 Import freshness warning

**Problem:** If the Firestore data is stale (re-migration overdue), there is no visual cue.

**Fix:** In `AdminDashboardApp.vue`, check if `importedAt` is more than 30 days ago:

```js
const isStale = computed(() => {
  if (!meta.value?.importedAt) return false
  const d = meta.value.importedAt.toDate?.() ?? new Date(meta.value.importedAt)
  return (Date.now() - d.getTime()) > 30 * 24 * 60 * 60 * 1000
})
```

```html
<div v-if="isStale" class="admin-warning-banner">
  Data was last imported {{ formatDate(meta.importedAt) }}. Consider re-importing.
</div>
```

---

### 3.3 Skeleton loading states

**Problem:** Pages show a CSS spinner, then snap to full content. This is jarring.

**Fix:** Replace the `v-if="loading"` spinner block with skeleton rows that mirror the table structure:

```html
<div v-if="loading" class="admin-table-wrap">
  <table class="admin-table">
    <thead>...</thead>
    <tbody>
      <tr v-for="n in 10" :key="n" class="admin-skeleton-row">
        <td><div class="admin-skeleton-cell"></div></td>
        <td><div class="admin-skeleton-cell"></div></td>
        <td><div class="admin-skeleton-cell admin-skeleton-cell--sm"></div></td>
        <td><div class="admin-skeleton-cell admin-skeleton-cell--sm"></div></td>
      </tr>
    </tbody>
  </table>
</div>
```

CSS:
```css
.admin-skeleton-cell {
  height: 14px;
  border-radius: 4px;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
}

@keyframes skeleton-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

### 3.4 Breadcrumbs

**Problem:** Deep pages (individual edit) show only a "← Back" link. There is no sense of where you are in the admin hierarchy.

**Fix:** Add a `AdminBreadcrumbs.vue` component:

```vue
<template>
  <nav class="admin-breadcrumbs">
    <a href="/admin/dashboard">Dashboard</a>
    <span v-for="(crumb, i) in crumbs" :key="i" class="admin-breadcrumb-sep">
      <span> / </span>
      <a v-if="crumb.href" :href="crumb.href">{{ crumb.label }}</a>
      <span v-else>{{ crumb.label }}</span>
    </span>
  </nav>
</template>

<script setup>
defineProps({ crumbs: Array })
</script>
```

Usage in `AdminIndividualEditApp.vue`:
```html
<AdminBreadcrumbs :crumbs="[
  { label: 'Individuals', href: '/admin/individuals' },
  { label: form?.firstName + ' ' + form?.lastName },
]" />
```

---

## Implementation order recommendation

1. **1.1** Auto-dismiss banner
2. **1.2** Clickable rows
3. **1.3** Fix sidebar active state
4. **1.4** View on tree link
5. **2.3** Swap birth place for death date (trivial column swap)
6. **2.1** Add gender field
7. **1.5** Show total count (requires verifying migration writes counts)
8. **2.4** Denormalized names in families (requires re-migration)
9. **2.5** Family search (depends on 2.4)
10. **1.6** Link family IDs in edit form
11. **2.2** Living filter (requires index or client-side tradeoff decision)
12. **3.1** Dashboard living breakdown
13. **3.2** Freshness warning
14. **3.3** Skeleton loading
15. **3.4** Breadcrumbs
