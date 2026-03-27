<template>
  <AdminShell>
    <h2 class="admin-page-title">Families</h2>

    <div class="admin-search-row">
      <input
        v-model="searchTerm"
        type="search"
        placeholder="Search by husband or wife name…"
        class="admin-search-input"
        @input="onSearch"
      />
    </div>

    <!-- Skeleton loading -->
    <div v-if="loading" class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Husband</th>
            <th>Wife</th>
            <th>Children</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="n in 10" :key="n" class="admin-skeleton-row">
            <td><div class="admin-skeleton-cell admin-skeleton-cell--sm"></div></td>
            <td><div class="admin-skeleton-cell"></div></td>
            <td><div class="admin-skeleton-cell"></div></td>
            <td><div class="admin-skeleton-cell admin-skeleton-cell--badge"></div></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Husband</th>
              <th>Wife</th>
              <th>Children</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.id">
              <td><code>{{ row.id }}</code></td>
              <td>{{ row.husbName ?? row.husb ?? '—' }}</td>
              <td>{{ row.wifeName ?? row.wife ?? '—' }}</td>
              <td>{{ row.children?.length ?? 0 }}</td>
            </tr>
            <tr v-if="rows.length === 0">
              <td colspan="4" class="admin-table-empty">
                <template v-if="searchTerm">No families match "{{ searchTerm }}".</template>
                <template v-else>No families found.</template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination — hidden during search -->
      <div v-if="!searchTerm" class="admin-pagination">
        <button
          class="admin-btn-outline"
          :disabled="pageHistory.length === 0"
          @click="prevPage"
        >← Previous</button>
        <span class="admin-page-indicator">Page {{ currentPage }}</span>
        <button
          class="admin-btn-outline"
          :disabled="!hasMore"
          @click="nextPage"
        >Next →</button>
      </div>

      <div v-else class="admin-search-count">
        {{ rows.length }} result{{ rows.length !== 1 ? 's' : '' }}
      </div>
    </div>
  </AdminShell>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AdminShell from './AdminShell.vue'
import { getFamiliesPage, searchFamilies } from '../../composables/useAdminFirestore.js'

const rows        = ref([])
const loading     = ref(false)
const hasMore     = ref(false)
const currentPage = ref(1)
const pageHistory = ref([])
const lastDoc     = ref(null)
const searchTerm  = ref('')
let searchTimer   = null

onMounted(() => loadPage())

async function loadPage(cursor = null) {
  loading.value = true
  try {
    const result = await getFamiliesPage(cursor)
    rows.value    = result.items
    lastDoc.value = result.lastDoc
    hasMore.value = result.hasMore
  } finally {
    loading.value = false
  }
}

async function nextPage() {
  pageHistory.value.push(lastDoc.value)
  currentPage.value++
  await loadPage(lastDoc.value)
}

async function prevPage() {
  pageHistory.value.pop()
  currentPage.value--
  const prev = pageHistory.value[pageHistory.value.length - 1] ?? null
  await loadPage(prev)
}

function onSearch() {
  clearTimeout(searchTimer)
  const term = searchTerm.value.trim()
  if (!term) {
    currentPage.value = 1
    pageHistory.value = []
    loadPage()
    return
  }
  searchTimer = setTimeout(async () => {
    loading.value = true
    try { rows.value = await searchFamilies(term) }
    finally { loading.value = false }
  }, 300)
}
</script>
