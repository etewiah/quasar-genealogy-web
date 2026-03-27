<template>
  <AdminShell>
    <h2 class="admin-page-title">Dashboard</h2>

    <div v-if="loading" class="admin-spinner-inline"></div>

    <div v-else-if="meta">
      <div class="admin-stat-row">
        <div class="admin-stat-card">
          <div class="admin-stat-label">Individuals</div>
          <div class="admin-stat-value">{{ meta.individualsCount?.toLocaleString() ?? '—' }}</div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-label">Families</div>
          <div class="admin-stat-value">{{ meta.familiesCount?.toLocaleString() ?? '—' }}</div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-label">Tree ID</div>
          <div class="admin-stat-value admin-stat-value--sm">{{ meta.id }}</div>
        </div>
      </div>

      <div class="admin-info-card">
        <h3 class="admin-section-title">Import details</h3>
        <dl class="admin-dl">
          <dt>Source file</dt>
          <dd>{{ meta.sourceFile ?? '—' }}</dd>
          <dt>Imported at</dt>
          <dd>{{ formatDate(meta.importedAt) }}</dd>
        </dl>
      </div>

      <div class="admin-action-row">
        <a href="/admin/individuals" class="admin-btn-outline">Browse Individuals</a>
        <a href="/admin/families"    class="admin-btn-outline">Browse Families</a>
      </div>
    </div>

    <div v-else class="admin-error-banner">Failed to load tree metadata.</div>
  </AdminShell>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AdminShell from './AdminShell.vue'
import { getTreeMetadata } from '../../composables/useAdminFirestore.js'

const meta    = ref(null)
const loading = ref(true)

onMounted(async () => {
  try { meta.value = await getTreeMetadata() }
  finally { loading.value = false }
})

function formatDate(ts) {
  if (!ts) return '—'
  const d = ts.toDate?.() ?? new Date(ts)
  return d.toLocaleString()
}
</script>
