<template>
  <q-page class="q-pa-lg">
    <div class="text-h5 q-mb-lg">Dashboard</div>

    <div v-if="loading" class="flex flex-center q-pa-xl">
      <q-spinner size="3em" color="primary" />
    </div>

    <div v-else-if="meta">
      <div class="row q-gutter-md q-mb-xl">
        <q-card class="stat-card">
          <q-card-section>
            <div class="text-caption text-grey">Individuals</div>
            <div class="text-h4 text-weight-bold text-primary">
              {{ meta.individualsCount?.toLocaleString() ?? '—' }}
            </div>
          </q-card-section>
        </q-card>

        <q-card class="stat-card">
          <q-card-section>
            <div class="text-caption text-grey">Families</div>
            <div class="text-h4 text-weight-bold text-primary">
              {{ meta.familiesCount?.toLocaleString() ?? '—' }}
            </div>
          </q-card-section>
        </q-card>

        <q-card class="stat-card">
          <q-card-section>
            <div class="text-caption text-grey">Tree ID</div>
            <div class="text-h6 text-weight-bold">{{ meta.id }}</div>
          </q-card-section>
        </q-card>
      </div>

      <q-card class="q-mb-md" style="max-width: 480px">
        <q-card-section>
          <div class="text-subtitle2 q-mb-sm">Import Details</div>
          <q-list dense>
            <q-item v-if="meta.sourceFile">
              <q-item-section side><q-icon name="description" /></q-item-section>
              <q-item-section>
                <q-item-label caption>Source file</q-item-label>
                <q-item-label>{{ meta.sourceFile }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="meta.importedAt">
              <q-item-section side><q-icon name="schedule" /></q-item-section>
              <q-item-section>
                <q-item-label caption>Imported at</q-item-label>
                <q-item-label>{{ formatDate(meta.importedAt) }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <div class="row q-gutter-md">
        <q-btn
          outline
          color="primary"
          icon="people"
          label="Browse Individuals"
          :to="{ name: 'rAdminIndividuals' }"
        />
        <q-btn
          outline
          color="primary"
          icon="family_restroom"
          label="Browse Families"
          :to="{ name: 'rAdminFamilies' }"
        />
      </div>
    </div>

    <q-banner v-else class="bg-negative text-white" rounded>
      Failed to load tree metadata.
    </q-banner>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getTreeMetadata } from 'src/compose/useAdminFirestore'

defineOptions({ name: 'AdminDashboardPage' })

const meta = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    meta.value = await getTreeMetadata()
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

<style scoped>
.stat-card {
  min-width: 160px;
}
</style>
