<template>
  <q-page class="flex">
    <!-- Loading state -->
    <div v-if="loading" class="full-width flex flex-center q-pa-xl">
      <q-spinner size="3em" color="primary" />
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="full-width flex flex-center q-pa-xl">
      <q-banner class="bg-negative text-white" rounded>
        Failed to load family tree: {{ error }}
      </q-banner>
    </div>

    <!-- Chart -->
    <div v-else class="row max-ctr">
      <div class="q-my-lg q-mx-md col-xs-12">
        <TopolaIndividual :topolaJsonData="topolaJsonData" />
      </div>
      <div class="q-my-lg q-mx-md col-xs-12">
        <TopolaWrapper :topolaData="topolaJsonData"
                       :topolaConfig="topolaConfig"
                       :focusedIndiForGraph="focusedIndiForGraph" />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import TopolaWrapper from 'components/TopolaWrapper.vue'
import TopolaIndividual from 'components/TopolaIndividual.vue'
import { getFocusedDataFromFirestore, getFirstIndividual } from 'src/compose/useFirestoreData'

defineOptions({ name: 'TopolaStaticDataPage' })

const props = defineProps({
  topolaConfig: { type: Object },
})

const route = useRoute()

const topolaJsonData = ref(null)
const focusedIndiForGraph = ref(null)
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    let personId = route.query.personID

    // If no personID in URL, find the first individual in the tree
    if (!personId) {
      const first = await getFirstIndividual()
      personId = first.id
    }

    const data = await getFocusedDataFromFirestore(personId)

    focusedIndiForGraph.value = data.indis.find(i => i.id === personId) ?? data.indis[0]
    topolaJsonData.value = data
  } catch (e) {
    console.error('[TopolaStaticDataPage]', e)
    error.value = e.message
  } finally {
    loading.value = false
  }
})
</script>
