<template>
  <q-page class="q-pa-lg" style="max-width: 640px">
    <div class="row items-center q-mb-lg">
      <q-btn flat round dense icon="arrow_back" :to="{ name: 'rAdminIndividuals' }" class="q-mr-sm" />
      <div class="text-h5">Edit Individual</div>
    </div>

    <div v-if="loading" class="flex flex-center q-pa-xl">
      <q-spinner size="3em" color="primary" />
    </div>

    <div v-else-if="form">
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-subtitle2 q-mb-md">Name</div>
          <div class="row q-gutter-md">
            <q-input v-model="form.firstName" label="First name" outlined class="col" />
            <q-input v-model="form.lastName"  label="Last name"  outlined class="col" />
          </div>
        </q-card-section>
      </q-card>

      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-subtitle2 q-mb-md">Birth</div>
          <div class="row q-gutter-md">
            <q-input v-model="form.birth.date"  label="Date (e.g. 12 JAN 1920)" outlined class="col" />
            <q-input v-model="form.birth.place" label="Place"                   outlined class="col" />
          </div>
        </q-card-section>
      </q-card>

      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-subtitle2 q-mb-md">Death</div>
          <div class="row q-gutter-md">
            <q-input v-model="form.death.date"  label="Date" outlined class="col" />
            <q-input v-model="form.death.place" label="Place" outlined class="col" />
          </div>
        </q-card-section>
      </q-card>

      <q-card class="q-mb-lg">
        <q-card-section>
          <div class="text-subtitle2 q-mb-sm">Privacy</div>
          <q-toggle v-model="form.living" label="Mark as living (hides from public view)" />
        </q-card-section>
      </q-card>

      <!-- Read-only metadata -->
      <q-card class="q-mb-lg bg-grey-1">
        <q-card-section>
          <div class="text-subtitle2 q-mb-sm">Record info</div>
          <div class="text-caption text-grey">
            ID: {{ form.id }}<br>
            Parent family: {{ form.famc ?? 'none' }}<br>
            Spouse families: {{ form.fams?.join(', ') || 'none' }}
          </div>
        </q-card-section>
      </q-card>

      <q-banner v-if="saveError" class="bg-negative text-white q-mb-md" rounded>
        {{ saveError }}
      </q-banner>

      <div class="row q-gutter-md">
        <q-btn
          color="primary"
          label="Save Changes"
          :loading="saving"
          @click="handleSave"
        />
        <q-btn
          outline
          label="Cancel"
          :to="{ name: 'rAdminIndividuals' }"
        />
      </div>
    </div>

    <q-banner v-else class="bg-negative text-white" rounded>
      Individual not found.
    </q-banner>

    <!-- Save success notification -->
    <q-dialog v-model="savedDialog">
      <q-card>
        <q-card-section class="row items-center">
          <q-icon name="check_circle" color="positive" size="2em" class="q-mr-sm" />
          <span>Changes saved.</span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" v-close-popup />
          <q-btn flat label="Back to list" color="primary" v-close-popup :to="{ name: 'rAdminIndividuals' }" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getIndividual, updateIndividual } from 'src/compose/useAdminFirestore'

defineOptions({ name: 'AdminIndividualEditPage' })

const route = useRoute()
const id = route.params.id

const form = ref(null)
const loading = ref(true)
const saving = ref(false)
const saveError = ref('')
const savedDialog = ref(false)

onMounted(async () => {
  try {
    const indi = await getIndividual(id)
    // Ensure nested objects exist so v-model bindings don't error
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
  saving.value = true
  try {
    await updateIndividual(id, {
      firstName: form.value.firstName,
      lastName:  form.value.lastName,
      birth:     { date: form.value.birth.date, place: form.value.birth.place },
      death:     { date: form.value.death.date, place: form.value.death.place },
      living:    form.value.living,
    })
    savedDialog.value = true
  } catch (e) {
    saveError.value = e.message
  } finally {
    saving.value = false
  }
}
</script>
