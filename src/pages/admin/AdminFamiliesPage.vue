<template>
  <q-page class="q-pa-lg">
    <div class="text-h5 q-mb-md">Families</div>

    <q-card>
      <q-table
        :rows="rows"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :rows-per-page-options="[]"
        hide-bottom
        flat
      >
        <template #body-cell-children="{ value }">
          <q-td>{{ value?.length ?? 0 }}</q-td>
        </template>
      </q-table>
    </q-card>

    <div class="row justify-between items-center q-mt-md">
      <q-btn
        outline
        icon="chevron_left"
        label="Previous"
        :disable="pageHistory.length === 0"
        @click="prevPage"
      />
      <span class="text-caption text-grey">Page {{ currentPage }}</span>
      <q-btn
        outline
        icon-right="chevron_right"
        label="Next"
        :disable="!hasMore"
        @click="nextPage"
      />
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getFamiliesPage } from 'src/compose/useAdminFirestore'

defineOptions({ name: 'AdminFamiliesPage' })

const rows = ref([])
const loading = ref(false)
const hasMore = ref(false)
const currentPage = ref(1)
const pageHistory = ref([])
const lastDoc = ref(null)

const columns = [
  { name: 'id',       label: 'ID',       field: 'id',       align: 'left' },
  { name: 'husb',     label: 'Husband',  field: 'husb',     align: 'left' },
  { name: 'wife',     label: 'Wife',     field: 'wife',     align: 'left' },
  { name: 'children', label: 'Children', field: 'children', align: 'left' },
]

onMounted(() => loadPage())

async function loadPage(cursor = null) {
  loading.value = true
  try {
    const result = await getFamiliesPage(cursor)
    rows.value = result.items
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
  const prevCursor = pageHistory.value[pageHistory.value.length - 1] ?? null
  await loadPage(prevCursor)
}
</script>
