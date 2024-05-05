<template>
  <q-page class="flex">
    <div class="row max-ctr"
         style="">
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
import TopolaWrapper from 'components/TopolaWrapper.vue'
import TopolaIndividual from 'components/TopolaIndividual.vue'
// import topolaJsonData from 'src/data/MinimalExampleData.json'
// import topolaJsonData from 'src/data/private/borthwicks-reg.json' // 'src/data/KennedyFamilyData.json'
// import topolaGedcomData from 'src/data/KennedyFamilyData.ged.js'
import topolaGedcomData from 'src/data/private/Campbells-Dowdalls-Borthwicks.ged.js';
import * as topola from 'topola';
// import { parse as parseGedcom, toD3Force, toDot } from 'parse-gedcom';
import { useRoute } from 'vue-router'
import useTopolaData from 'src/compose/useTopolaData';

defineOptions({
  name: 'TopolaStaticDataPage'
});

const props = defineProps({
  topolaConfig: {
    type: Object,
  },
});

// Convert GEDCOM data to JSON format
const allJsonData = topola.gedcomToJson(topolaGedcomData)

const { getFocusedData, cleanUpTopolaJson } = useTopolaData()

// Find the current person's ID
const route = useRoute()
let currentPersonID = route.query.personID
let focusedIndiForGraph = allJsonData.indis.find(
  (individual) => individual.id === currentPersonID
)
// If current person is not found, use the first individual in the data
if (!focusedIndiForGraph) {
  focusedIndiForGraph = allJsonData.indis[0]
}

let showGrandchildren = false
const unstripedTopolaJsonData = getFocusedData(allJsonData, focusedIndiForGraph, showGrandchildren);
const topolaJsonData = cleanUpTopolaJson(unstripedTopolaJsonData);

</script>
