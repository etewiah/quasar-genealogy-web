<template>
  <AdminShell>
    <h2 class="admin-page-title">Families</h2>

    <div v-if="loading" class="admin-spinner-inline"></div>

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
              <td>{{ row.husb ?? '—' }}</td>
              <td>{{ row.wife ?? '—' }}</td>
              <td>{{ row.children?.length ?? 0 }}</td>
            </tr>
            <tr v-if="rows.length === 0">
              <td colspan="4" class="admin-table-empty">No families found.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="admin-pagination">
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
    </div>
  </AdminShell>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AdminShell from './AdminShell.vue'
import { getFamiliesPage } from '../../composables/useAdminFirestore.js'

const rows        = ref([])
const loading     = ref(false)
const hasMore     = ref(false)
const currentPage = ref(1)
const pageHistory = ref([])
const lastDoc     = ref(null)

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
</script>
