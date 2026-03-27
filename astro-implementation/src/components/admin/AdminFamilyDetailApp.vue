<template>
  <AdminShell>
    <AdminBreadcrumbs :crumbs="[{ label: 'Families', href: '/admin/families' }, { label: id }]" />

    <div class="admin-page-header">
      <h2 class="admin-page-title">Family {{ id }}</h2>
      <a
        v-if="detail?.husb"
        :href="`/?indi=${encodeURIComponent(detail.husb.id)}`"
        target="_blank"
        class="admin-view-link"
      >View on tree ↗</a>
    </div>

    <!-- Skeleton -->
    <div v-if="loading">
      <div class="admin-form-card" v-for="n in 3" :key="n">
        <div class="admin-skeleton-cell admin-skeleton-cell--title"></div>
        <div class="admin-skeleton-cell" style="width:60%;margin-top:12px"></div>
        <div class="admin-skeleton-cell" style="width:40%;margin-top:8px"></div>
      </div>
    </div>

    <div v-else-if="detail">

      <!-- Marriage -->
      <div class="admin-form-card">
        <h3 class="admin-section-title">Marriage</h3>
        <dl class="admin-dl">
          <dt>Date</dt>
          <dd>{{ marriageDate || '—' }}</dd>
          <dt>Place</dt>
          <dd>{{ detail.family.marriage?.place || '—' }}</dd>
        </dl>
      </div>

      <!-- Spouses -->
      <div class="admin-family-spouses">
        <div class="admin-form-card admin-family-spouse-card">
          <h3 class="admin-section-title">Husband</h3>
          <template v-if="detail.husb">
            <div class="admin-family-member-name">
              {{ fullName(detail.husb) }}
            </div>
            <div class="admin-family-member-dates">
              {{ lifespan(detail.husb) }}
            </div>
            <div class="admin-family-member-actions">
              <a :href="`/admin/individual-edit?id=${detail.husb.id}`" class="admin-btn-outline admin-btn--sm">
                Edit
              </a>
              <a :href="`/?indi=${encodeURIComponent(detail.husb.id)}`" target="_blank" class="admin-view-link">
                View ↗
              </a>
            </div>
          </template>
          <p v-else class="admin-family-member-none">
            {{ detail.family.husb ? detail.family.husb : 'None' }}
          </p>
        </div>

        <div class="admin-family-spouse-card admin-form-card">
          <h3 class="admin-section-title">Wife</h3>
          <template v-if="detail.wife">
            <div class="admin-family-member-name">
              {{ fullName(detail.wife) }}
            </div>
            <div class="admin-family-member-dates">
              {{ lifespan(detail.wife) }}
            </div>
            <div class="admin-family-member-actions">
              <a :href="`/admin/individual-edit?id=${detail.wife.id}`" class="admin-btn-outline admin-btn--sm">
                Edit
              </a>
              <a :href="`/?indi=${encodeURIComponent(detail.wife.id)}`" target="_blank" class="admin-view-link">
                View ↗
              </a>
            </div>
          </template>
          <p v-else class="admin-family-member-none">
            {{ detail.family.wife ? detail.family.wife : 'None' }}
          </p>
        </div>
      </div>

      <!-- Children -->
      <div class="admin-form-card">
        <h3 class="admin-section-title">
          Children
          <span class="admin-section-count">{{ detail.children.length }}</span>
        </h3>

        <div v-if="detail.children.length === 0" class="admin-family-member-none">
          No children recorded.
        </div>

        <div v-else class="admin-table-wrap" style="margin-top:12px;margin-bottom:0">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Birth</th>
                <th>Death</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="child in detail.children"
                :key="child.id"
                class="admin-table-row--clickable"
                @click="goToEdit(child.id)"
              >
                <td>{{ fullName(child) || child.id }}</td>
                <td>{{ dateText(child.birth?.date) || '—' }}</td>
                <td>{{ dateText(child.death?.date) || '—' }}</td>
                <td>
                  <span
                    v-if="'living' in child"
                    class="admin-badge"
                    :class="child.living ? 'admin-badge--living' : 'admin-badge--deceased'"
                  >{{ child.living ? 'Living' : 'Deceased' }}</span>
                </td>
                <td class="admin-table-actions" @click.stop>
                  <a :href="`/admin/individual-edit?id=${child.id}`" class="admin-table-edit-btn">Edit</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Record info -->
      <div class="admin-form-card admin-form-card--muted">
        <h3 class="admin-section-title">Record info</h3>
        <dl class="admin-dl admin-dl--sm">
          <dt>Family ID</dt><dd>{{ id }}</dd>
          <dt>Husband ID</dt><dd>{{ detail.family.husb ?? 'none' }}</dd>
          <dt>Wife ID</dt><dd>{{ detail.family.wife ?? 'none' }}</dd>
        </dl>
      </div>

    </div>

    <div v-else class="admin-error-banner">Family not found.</div>
  </AdminShell>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminShell from './AdminShell.vue'
import AdminBreadcrumbs from './AdminBreadcrumbs.vue'
import { getFamilyDetail } from '../../composables/useAdminFirestore.js'

const id      = new URLSearchParams(window.location.search).get('id') ?? ''
const detail  = ref(null)
const loading = ref(true)

const marriageDate = computed(() => {
  const d = detail.value?.family?.marriage?.date
  if (!d) return ''
  return typeof d === 'string' ? d : (d.text ?? '')
})

onMounted(async () => {
  try { detail.value = await getFamilyDetail(id) }
  finally { loading.value = false }
})

function fullName(indi) {
  if (!indi) return ''
  return [indi.firstName, indi.lastName].filter(Boolean).join(' ')
}

function dateText(d) {
  if (!d) return ''
  return typeof d === 'string' ? d : (d.text ?? '')
}

function lifespan(indi) {
  const b = dateText(indi.birth?.date)
  const d = dateText(indi.death?.date)
  if (!b && !d) return ''
  if (!d) return `b. ${b}`
  if (!b) return `d. ${d}`
  return `${b} – ${d}`
}

function goToEdit(indiId) {
  window.location.href = `/admin/individual-edit?id=${encodeURIComponent(indiId)}`
}
</script>
