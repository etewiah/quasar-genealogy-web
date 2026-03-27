<template>
  <AdminShell>
    <h2 class="admin-page-title">Individuals</h2>

    <div class="admin-search-row">
      <input
        v-model="searchTerm"
        type="search"
        placeholder="Search by first or last name…"
        class="admin-search-input"
        @input="onSearch"
      />
    </div>

    <div v-if="loading" class="admin-spinner-inline"></div>

    <div v-else>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Last Name</th>
              <th>First Name</th>
              <th>Birth Date</th>
              <th>Birth Place</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.id">
              <td>{{ row.lastName }}</td>
              <td>{{ row.firstName }}</td>
              <td>{{ row.birth?.date ?? '' }}</td>
              <td>{{ row.birth?.place ?? '' }}</td>
              <td>
                <span class="admin-badge" :class="row.living ? 'admin-badge--living' : 'admin-badge--deceased'">
                  {{ row.living ? 'Living' : 'Deceased' }}
                </span>
              </td>
              <td class="admin-table-actions">
                <a :href="`/admin/individual-edit?id=${row.id}`" class="admin-table-edit-btn">Edit</a>
              </td>
            </tr>
            <tr v-if="rows.length === 0">
              <td colspan="6" class="admin-table-empty">No results found.</td>
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
import { getIndividualsPage, searchIndividuals } from '../../composables/useAdminFirestore.js'

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
    const result = await getIndividualsPage(cursor)
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
    try { rows.value = await searchIndividuals(term) }
    finally { loading.value = false }
  }, 300)
}
</script>
