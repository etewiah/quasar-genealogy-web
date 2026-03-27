<template>
  <q-page class="q-pa-lg">
    <div class="row items-center q-mb-md">
      <div class="text-h5 col">Individuals</div>
    </div>

    <!-- Search -->
    <q-input
      v-model="searchTerm"
      placeholder="Search by first or last name…"
      outlined
      dense
      clearable
      class="q-mb-md"
      style="max-width: 420px"
      @update:model-value="onSearch"
    >
      <template #prepend><q-icon name="search" /></template>
    </q-input>

    <!-- Table -->
    <q-card>
      <q-table
        :rows="rows"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :rows-per-page-options="[]"
        hide-bottom
        flat
        @row-click="(_, row) => goToEdit(row.id)"
      >
        <template #body-cell-living="{ value }">
          <q-td>
            <q-badge :color="value ? 'orange' : 'grey'" :label="value ? 'Living' : 'Deceased'" />
          </q-td>
        </template>
        <template #body-cell-actions="{ row }">
          <q-td class="text-right">
            <q-btn
              flat dense round
              icon="edit"
              size="sm"
              @click.stop="goToEdit(row.id)"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Pagination (only shown when not searching) -->
    <div v-if="!searchTerm" class="row justify-between items-center q-mt-md">
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
    <div v-else class="text-caption text-grey q-mt-sm">
      {{ rows.length }} result{{ rows.length !== 1 ? 's' : '' }} found
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getIndividualsPage, searchIndividuals } from 'src/compose/useAdminFirestore'

defineOptions({ name: 'AdminIndividualsPage' })

const router = useRouter()

const rows = ref([])
const loading = ref(false)
const hasMore = ref(false)
const currentPage = ref(1)
const pageHistory = ref([])   // stack of cursor docs for previous pages
const lastDoc = ref(null)
const searchTerm = ref('')
let searchTimer = null

const columns = [
  { name: 'lastName',   label: 'Last Name',   field: 'lastName',  align: 'left', sortable: false },
  { name: 'firstName',  label: 'First Name',  field: 'firstName', align: 'left', sortable: false },
  { name: 'birth',      label: 'Birth',       field: r => r.birth?.date ?? '',  align: 'left' },
  { name: 'birthPlace', label: 'Birth Place', field: r => r.birth?.place ?? '', align: 'left' },
  { name: 'living',     label: 'Status',      field: 'living',    align: 'left' },
  { name: 'actions',    label: '',            field: 'id',        align: 'right' },
]

onMounted(() => loadPage())

async function loadPage(cursor = null) {
  loading.value = true
  try {
    const result = await getIndividualsPage(cursor)
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

function onSearch(term) {
  clearTimeout(searchTimer)
  if (!term) {
    currentPage.value = 1
    pageHistory.value = []
    loadPage()
    return
  }
  searchTimer = setTimeout(async () => {
    loading.value = true
    try {
      rows.value = await searchIndividuals(term.trim())
    } finally {
      loading.value = false
    }
  }, 300)
}

function goToEdit(id) {
  router.push({ name: 'rAdminIndividualEdit', params: { id } })
}
</script>
