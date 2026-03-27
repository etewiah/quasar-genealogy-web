# Admin Interface

The admin interface is a password-protected section of the Astro implementation that lets you browse and edit the genealogy data stored in Firestore.

## Pages

| Route | File | Purpose |
|---|---|---|
| `/admin/login` | `pages/admin/login.astro` | Password gate |
| `/admin/` | `pages/admin/index.astro` | Redirects → `/admin/dashboard` |
| `/admin/dashboard` | `pages/admin/dashboard.astro` | Stats overview |
| `/admin/individuals` | `pages/admin/individuals.astro` | Paginated individual list + search |
| `/admin/individual-edit?id=X` | `pages/admin/individual-edit.astro` | Edit one individual |
| `/admin/families` | `pages/admin/families.astro` | Paginated family list |

## Authentication

Authentication uses a simple password stored in the `PUBLIC_MGMT_PASSWORD` environment variable. No user accounts, no Firebase Auth SDK.

- On login: checks `password === PUBLIC_MGMT_PASSWORD`, then sets `sessionStorage.admin_authed = '1'`
- On every admin page: `AdminShell.vue` reads sessionStorage; redirects to `/admin/login` if not authed
- On logout: clears the sessionStorage key

This approach avoids async state resolution complexity and the Firebase Auth SDK's heavyweight initialization.

## Vue component architecture

Each admin page is a static Astro page that mounts a single Vue app via an inline `<script>` block:

```astro
<script>
import { createApp } from 'vue'
import AdminDashboardApp from '../../components/admin/AdminDashboardApp.vue'
createApp(AdminDashboardApp).mount('#app')
</script>
```

`AdminShell.vue` is a shared wrapper component used by every Vue app. It handles:
- Auth guard (immediate redirect if not authed)
- Sidebar navigation with active-state highlighting
- Mobile hamburger menu + overlay

See [architecture.md](architecture.md) for full details.

## Data access

All Firestore queries go through `src/composables/useAdminFirestore.js`. The composable exports:

| Function | Description |
|---|---|
| `getTreeMetadata()` | Reads the `trees/campbells` document |
| `getIndividualsPage(cursorDoc)` | 25-per-page cursor pagination, ordered by lastName/firstName |
| `searchIndividuals(term)` | Prefix search on firstName OR lastName |
| `getIndividual(id)` | Single individual by document ID |
| `updateIndividual(id, updates)` | Partial update + `updatedAt` timestamp |
| `getFamiliesPage(cursorDoc)` | 25-per-page cursor pagination, ordered by doc ID |

See [architecture.md](architecture.md) for query patterns and Firestore index requirements.
