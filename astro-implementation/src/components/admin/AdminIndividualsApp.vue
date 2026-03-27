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

    <div v-if="!searchTerm" class="admin-filter-bar">
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

    <!-- Skeleton loading -->
    <div v-if="loading" class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Last Name</th>
            <th>First Name</th>
            <th>Birth Date</th>
            <th>Death Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="n in 10" :key="n" class="admin-skeleton-row">
            <td><div class="admin-skeleton-cell"></div></td>
            <td><div class="admin-skeleton-cell"></div></td>
            <td><div class="admin-skeleton-cell admin-skeleton-cell--sm"></div></td>
            <td><div class="admin-skeleton-cell admin-skeleton-cell--sm"></div></td>
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
              <th>Last Name</th>
              <th>First Name</th>
              <th>Birth Date</th>
              <th>Death Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in rows"
              :key="row.id"
              class="admin-table-row--clickable"
              @click="goToEdit(row.id)"
            >
              <td>{{ row.lastName }}</td>
              <td>{{ row.firstName }}</td>
              <td>{{ row.birth?.date ?? '' }}</td>
              <td>{{ row.death?.date ?? '' }}</td>
              <td>
                <span
                  class="admin-badge"
                  :class="row.living ? 'admin-badge--living' : 'admin-badge--deceased'"
                >
                  {{ row.living ? 'Living' : 'Deceased' }}
                </span>
              </td>
            </tr>
            <tr v-if="rows.length === 0">
              <td colspan="5" class="admin-table-empty">
                <template v-if="searchTerm">No individuals match "{{ searchTerm }}".</template>
                <template v-else>No individuals found.</template>
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
        <span class="admin-page-indicator">
          Page {{ currentPage }}
          <span v-if="totalCount !== null" class="admin-count-hint">
            · {{ totalCount.toLocaleString() }} total
          </span>
        </span>
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
import {
  getIndividualsPage, searchIndividuals, getTreeMetadata,
} from '../../composables/useAdminFirestore.js'

const rows         = ref([])
const loading      = ref(false)
const hasMore      = ref(false)
const currentPage  = ref(1)
const pageHistory  = ref([])
const lastDoc      = ref(null)
const searchTerm   = ref('')
const livingFilter = ref(null)
const totalCount   = ref(null)
let searchTimer    = null

onMounted(async () => {
  const [, meta] = await Promise.all([
    loadPage(),
    getTreeMetadata(),
  ])
  totalCount.value = meta?.individualsCount ?? null
})

async function loadPage(cursor = null) {
  loading.value = true
  try {
    const result = await getIndividualsPage(cursor, livingFilter.value)
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

function setFilter(value) {
  livingFilter.value = value
  currentPage.value  = 1
  pageHistory.value  = []
  loadPage()
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

function goToEdit(id) {
  window.location.href = `/admin/individual-edit?id=${encodeURIComponent(id)}`
}
</script>
