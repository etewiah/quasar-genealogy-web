<template>
  <q-page class="flex">
    <div class="row max-ctr"
         style="">
      <div class="q-my-lg q-mx-md col-xs-12">
        <TopolaIndividual :topolaJsonData="topolaJsonData" />
      </div>
      <div class="q-my-lg q-mx-md col-xs-12">
        <TopolaWrapper :topolaData="topolaJsonData"
                       :focusedIndiForGraph="focusedIndiForGraph"
                       :chartIsHorizontal="chartIsHorizontal"
                       :chartType="topolaChartType"
                       :renderer="topolaRenderer" />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import TopolaWrapper from 'components/TopolaWrapper.vue'
import TopolaIndividual from 'components/TopolaIndividual.vue'
// import topolaJsonData from 'src/data/MinimalExampleData.json'
// import topolaJsonData from 'src/data/private/borthwicks-reg.json' // 'src/data/KennedyFamilyData.json'
// import topolaGedcomData from 'src/data/KennedyFamilyData.ged.js'
import topolaGedcomData from 'src/data/private/CampbellsData.ged.js';
import * as topola from 'topola';
import { parse as parseGedcom, toD3Force, toDot } from 'parse-gedcom';

import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()

defineOptions({
  name: 'TopolaStaticDataPage'
})

const props = defineProps({
  chartIsHorizontal: {
    type: Boolean,
    required: true
  },
  topolaRenderer: {
    type: String,
    required: false,
    default: "DetailedRenderer"
  },
  topolaChartType: {
    type: String,
    required: false,
    default: "HourglassChart"
  },
})
// let gedComObject = parseGedcom(topolaGedcomData)
// gedComObject is a not very useful array
let currentPersonID = route.query.personID
const allJsonData = topola.gedcomToJson(topolaGedcomData);
let focusedIndiForGraph = allJsonData.indis.find(individual => individual.id === currentPersonID);

// Filter families to include only those where the individual is a spouse or child
const relatedFamilies = allJsonData.fams.filter(family => {
  // Check if individual is husband, wife, or child in the family
  return family.husb === currentPersonID || family.wife === currentPersonID || family.children.includes(currentPersonID);
});

// Sometimes a focused Individual has an empty fams array even though
// I could find relatedFamilies
if (focusedIndiForGraph.fams.length < 1 && relatedFamilies.length > 0) {
  // I tried fixing that by just setting the fams array like so:
  // focusedIndiForGraph.fams = relatedFamilies.map(family => family.id)
  // Unfortunately that cause topola to throw an error when rendering..

  // Decided to instead cheat by setting someone else in the family
  // as the focused individual for the graph in that case:
  // Get the IDs of all family members
  const familyMemberIds = [...relatedFamilies[0].children, relatedFamilies[0].husb, relatedFamilies[0].wife];

  // Find an individual in the family who is not the current focusedIndiForGraph
  const otherIndividual = familyMemberIds.find(memberId => memberId !== focusedIndiForGraph.id);

  // And set as focusedIndiForGraph
  focusedIndiForGraph = allJsonData.indis.find(individual => individual.id === otherIndividual);
}
const topolaJsonData = allJsonData

</script>
