<template>
  <AdminShell>
    <div class="admin-page-header">
      <a href="/admin/individuals" class="admin-back-link">← Back to Individuals</a>
      <h2 class="admin-page-title">Edit Individual</h2>
    </div>

    <div v-if="loading" class="admin-spinner-inline"></div>

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
          <dt>ID</dt><dd>{{ form.id }}</dd>
          <dt>Parent family</dt><dd>{{ form.famc ?? 'none' }}</dd>
          <dt>Spouse families</dt><dd>{{ form.fams?.join(', ') || 'none' }}</dd>
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
import { ref, onMounted } from 'vue'
import AdminShell from './AdminShell.vue'
import { getIndividual, updateIndividual } from '../../composables/useAdminFirestore.js'

const id = new URLSearchParams(window.location.search).get('id') ?? ''

const form      = ref(null)
const loading   = ref(true)
const saving    = ref(false)
const saveError = ref('')
const saved     = ref(false)

onMounted(async () => {
  try {
    const indi = await getIndividual(id)
    form.value = {
      ...indi,
      birth: { date: '', place: '', ...indi.birth },
      death: { date: '', place: '', ...indi.death },
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
      birth:     { date: form.value.birth.date, place: form.value.birth.place },
      death:     { date: form.value.death.date, place: form.value.death.place },
      living:    form.value.living,
    })
    saved.value = true
  } catch (e) {
    saveError.value = e.message
  } finally {
    saving.value = false
  }
}
</script>
