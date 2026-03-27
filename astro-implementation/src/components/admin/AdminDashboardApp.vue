<template>
  <AdminShell>
    <h2 class="admin-page-title">Dashboard</h2>

    <div v-if="loading" class="admin-stat-row">
      <div v-for="n in 4" :key="n" class="admin-stat-card">
        <div class="admin-skeleton-cell admin-skeleton-cell--label"></div>
        <div class="admin-skeleton-cell admin-skeleton-cell--value"></div>
      </div>
    </div>

    <div v-else-if="meta">
      <div v-if="isStale" class="admin-warning-banner">
        Data was last imported {{ formatDate(meta.importedAt) }}. Consider re-running the migration script.
      </div>

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
          <div class="admin-stat-label">Living</div>
          <div class="admin-stat-value admin-stat-value--living">
            {{ meta.livingCount?.toLocaleString() ?? '—' }}
          </div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-label">Deceased</div>
          <div class="admin-stat-value">
            {{ deceasedCount?.toLocaleString() ?? '—' }}
          </div>
        </div>
      </div>

      <div class="admin-info-card">
        <h3 class="admin-section-title">Import details</h3>
        <dl class="admin-dl">
          <dt>Tree ID</dt>
          <dd><code>{{ meta.id }}</code></dd>
          <dt>Source file</dt>
          <dd>{{ meta.sourceFile ?? '—' }}</dd>
          <dt>Imported at</dt>
          <dd>{{ formatDate(meta.importedAt) }}</dd>
        </dl>
      </div>

      <div class="admin-action-row">
        <a
          v-if="firstIndiId"
          :href="`/?indi=${encodeURIComponent(firstIndiId)}`"
          target="_blank"
          class="admin-btn-primary"
        >View Tree ↗</a>
        <a href="/admin/individuals" class="admin-btn-outline">Browse Individuals</a>
        <a href="/admin/families"    class="admin-btn-outline">Browse Families</a>
      </div>
    </div>

    <div v-else class="admin-error-banner">Failed to load tree metadata.</div>
  </AdminShell>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminShell from './AdminShell.vue'
import { getTreeMetadata, getFirstIndividualId } from '../../composables/useAdminFirestore.js'

const meta        = ref(null)
const firstIndiId = ref(null)
const loading     = ref(true)

const deceasedCount = computed(() => {
  if (meta.value?.individualsCount == null || meta.value?.livingCount == null) return null
  return meta.value.individualsCount - meta.value.livingCount
})

const isStale = computed(() => {
  if (!meta.value?.importedAt) return false
  const d = meta.value.importedAt.toDate?.() ?? new Date(meta.value.importedAt)
  return (Date.now() - d.getTime()) > 30 * 24 * 60 * 60 * 1000
})

onMounted(async () => {
  try {
    ;[meta.value, firstIndiId.value] = await Promise.all([
      getTreeMetadata(),
      getFirstIndividualId(),
    ])
  } finally {
    loading.value = false
  }
})

function formatDate(ts) {
  if (!ts) return '—'
  const d = ts.toDate?.() ?? new Date(ts)
  return d.toLocaleString()
}
</script>
