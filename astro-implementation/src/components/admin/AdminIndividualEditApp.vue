<template>
  <AdminShell>
    <AdminBreadcrumbs :crumbs="breadcrumbs" />

    <div class="admin-page-header">
      <h2 class="admin-page-title">Edit Individual</h2>
      <a
        v-if="form"
        :href="`/static-data?personID=${encodeURIComponent(form.id)}`"
        target="_blank"
        class="admin-view-link"
      >View on tree ↗</a>
    </div>

    <div v-if="loading" class="admin-edit-form">
      <div v-for="n in 4" :key="n" class="admin-form-card">
        <div class="admin-skeleton-cell admin-skeleton-cell--title"></div>
        <div class="admin-field-row">
          <div class="admin-field">
            <div class="admin-skeleton-cell admin-skeleton-cell--label"></div>
            <div class="admin-skeleton-cell admin-skeleton-cell--input"></div>
          </div>
          <div class="admin-field">
            <div class="admin-skeleton-cell admin-skeleton-cell--label"></div>
            <div class="admin-skeleton-cell admin-skeleton-cell--input"></div>
          </div>
        </div>
      </div>
    </div>

    <form v-else-if="form" @submit.prevent="handleSave" class="admin-edit-form">
      <div class="admin-form-card">
        <h3 class="admin-section-title">Name</h3>
        <div class="admin-field-row">
          <div class="admin-field">
            <label>First name</label>
            <input v-model="form.firstName" type="text" />
          </div>
          <div class="admin-field">
            <label>Last name</label>
            <input v-model="form.lastName" type="text" />
          </div>
        </div>
      </div>

      <div class="admin-form-card">
        <h3 class="admin-section-title">Identity</h3>
        <div class="admin-field">
          <label>Gender</label>
          <select v-model="form.sex" class="admin-select">
            <option value="">Not specified</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="U">Unknown</option>
          </select>
        </div>
      </div>

      <div class="admin-form-card">
        <h3 class="admin-section-title">Birth</h3>
        <div class="admin-field-row">
          <div class="admin-field">
            <label>Date <span class="admin-field-hint">(e.g. 12 JAN 1920)</span></label>
            <input v-model="form.birth.date" type="text" />
          </div>
          <div class="admin-field">
            <label>Place</label>
            <input v-model="form.birth.place" type="text" />
          </div>
        </div>
      </div>

      <div class="admin-form-card">
        <h3 class="admin-section-title">Death</h3>
        <div class="admin-field-row">
          <div class="admin-field">
            <label>Date</label>
            <input v-model="form.death.date" type="text" />
          </div>
          <div class="admin-field">
            <label>Place</label>
            <input v-model="form.death.place" type="text" />
          </div>
        </div>
      </div>

      <div class="admin-form-card">
        <h3 class="admin-section-title">Privacy</h3>
        <label class="admin-toggle-label">
          <input v-model="form.living" type="checkbox" class="admin-toggle" />
          <span>Mark as living <span class="admin-field-hint">(hides from public view)</span></span>
        </label>
      </div>

      <div class="admin-form-card admin-form-card--muted">
        <h3 class="admin-section-title">Record info</h3>
        <dl class="admin-dl admin-dl--sm">
          <dt>ID</dt>
          <dd>{{ form.id }}</dd>
          <dt>Parent family</dt>
          <dd>
            <a v-if="form.famc" href="/admin/families" class="admin-link">{{ form.famc }}</a>
            <span v-else>none</span>
          </dd>
          <dt>Spouse families</dt>
          <dd>
            <template v-if="form.fams?.length">
              <span v-for="(fid, i) in form.fams" :key="fid">
                <a href="/admin/families" class="admin-link">{{ fid }}</a>
                <span v-if="i < form.fams.length - 1">, </span>
              </span>
            </template>
            <span v-else>none</span>
          </dd>
        </dl>
      </div>

      <div v-if="saveError" class="admin-error-banner">{{ saveError }}</div>
      <div v-if="saved" class="admin-success-banner">Changes saved.</div>

      <div class="admin-form-actions">
        <button type="submit" class="admin-btn-primary" :disabled="saving">
          {{ saving ? 'Saving…' : 'Save Changes' }}
        </button>
        <a href="/admin/individuals" class="admin-btn-outline">Cancel</a>
      </div>
    </form>

    <div v-else class="admin-error-banner">Individual not found.</div>
  </AdminShell>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminShell from './AdminShell.vue'
import AdminBreadcrumbs from './AdminBreadcrumbs.vue'
import { getIndividual, updateIndividual } from '../../composables/useAdminFirestore.js'

const id = new URLSearchParams(window.location.search).get('id') ?? ''

const form      = ref(null)
const loading   = ref(true)
const saving    = ref(false)
const saveError = ref('')
const saved     = ref(false)

const breadcrumbs = computed(() => {
  const name = form.value
    ? [form.value.firstName, form.value.lastName].filter(Boolean).join(' ') || id
    : id
  return [
    { label: 'Individuals', href: '/admin/individuals' },
    { label: name },
  ]
})

// Stored dates come from GEDCOM as { year, month, day, confirmed } — or,
// for dates GEDCOM couldn't fully parse, { text }. This form edits a single
// plain-text field, so we convert structured -> text on load and try to
// parse text -> structured on save (falling back to { text } so nothing
// the user typed is ever lost).
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

function dateToText(val) {
  if (!val) return ''
  if (typeof val === 'string') return val
  if (val.text) return val.text
  const { day, month, year } = val
  return [day, month && MONTHS[month - 1], year].filter(Boolean).join(' ')
}

function textToDate(text) {
  const trimmed = (text ?? '').trim()
  if (!trimmed) return null
  const full = trimmed.match(/^(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{3,4})$/)
  if (full) {
    const monthIndex = MONTHS.indexOf(full[2].toUpperCase().slice(0, 3))
    if (monthIndex !== -1) {
      return { day: Number(full[1]), month: monthIndex + 1, year: Number(full[3]) }
    }
  }
  if (/^\d{3,4}$/.test(trimmed)) return { year: Number(trimmed) }
  return { text: trimmed }
}

onMounted(async () => {
  try {
    const indi = await getIndividual(id)
    form.value = {
      ...indi,
      sex:   indi.sex ?? '',
      birth: { place: '', ...indi.birth, date: dateToText(indi.birth?.date) },
      death: { place: '', ...indi.death, date: dateToText(indi.death?.date) },
    }
  } finally {
    loading.value = false
  }
})

async function handleSave() {
  saveError.value = ''
  saved.value = false
  saving.value = true
  try {
    await updateIndividual(id, {
      firstName: form.value.firstName,
      lastName:  form.value.lastName,
      sex:       form.value.sex,
      birth:     { date: textToDate(form.value.birth.date), place: form.value.birth.place },
      death:     { date: textToDate(form.value.death.date), place: form.value.death.place },
      living:    form.value.living,
    })
    saved.value = true
    setTimeout(() => { saved.value = false }, 3000)
  } catch (e) {
    saveError.value = e.message
  } finally {
    saving.value = false
  }
}
</script>
