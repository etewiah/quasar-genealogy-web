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
import { ref } from 'vue'
import TopolaWrapper from 'components/TopolaWrapper.vue'
import TopolaIndividual from 'components/TopolaIndividual.vue'
// import topolaJsonData from 'src/data/MinimalExampleData.json'
// import topolaJsonData from 'src/data/private/borthwicks-reg.json' // 'src/data/KennedyFamilyData.json'
// import topolaGedcomData from 'src/data/KennedyFamilyData.ged.js'
import topolaGedcomData from 'src/data/private/Campbells-Dowdalls-Borthwicks.ged.js';
import * as topola from 'topola';
import { parse as parseGedcom, toD3Force, toDot } from 'parse-gedcom';

import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()

defineOptions({
  name: 'TopolaStaticDataPage'
})

const props = defineProps({
  topolaConfig: {
    type: Object,
  },
  // topolaRenderer: {
  //   type: String,
  //   required: false,
  //   default: "DetailedRenderer"
  // },
  // topolaChartType: {
  //   type: String,
  //   required: false,
  //   default: "HourglassChart"
  // },
})
// Function to find the intersection of two arrays
function intersection(arr1, arr2) {
  // Convert arrays to sets to remove duplicates
  const set1 = new Set(arr1);
  const set2 = new Set(arr2);

  // Create a new Set that contains only elements that are present in both sets
  const intersectionSet = new Set([...set1].filter(num => set2.has(num)));

  // Convert the Set back to an array and return
  return [...intersectionSet];
}

// Convert GEDCOM data to JSON format
const allJsonData = topola.gedcomToJson(topolaGedcomData);

// Find the current person's ID
let currentPersonID = route.query.personID;
let focusedIndiForGraph = allJsonData.indis.find(individual => individual.id === currentPersonID);

// If current person is not found, use the first individual in the data
if (!focusedIndiForGraph) {
  focusedIndiForGraph = allJsonData.indis[0];
  currentPersonID = focusedIndiForGraph.id;
}

// Filter families to include only those where the individual is mentioned
const relatedFamilies = allJsonData.fams.filter(family => {
  return family.husb === currentPersonID || family.wife === currentPersonID || family.children.includes(currentPersonID);
});

// If focused individual has no family association, choose someone else in the family
// let selectedFamilyMembers = null;
if (focusedIndiForGraph.fams.length < 1 && relatedFamilies.length > 0) {
  const selectedFamilyMemberIds = [...relatedFamilies[0].children, relatedFamilies[0].husb, relatedFamilies[0].wife];
  const otherIndividual = selectedFamilyMemberIds.find(memberId => memberId !== focusedIndiForGraph.id);
  focusedIndiForGraph = allJsonData.indis.find(individual => individual.id === otherIndividual);
  // selectedFamilyMembers = allJsonData.indis.filter(individual => selectedFamilyMemberIds.includes(individual.id));
}

// Function to filter out family IDs from an individual's associations
function stripFamIdsFromIndi(famIdsToKeep, Indi) {
  if (!famIdsToKeep.includes(Indi.famc)) {
    Indi.famc = null;
  }
  Indi.fams = intersection(Indi.fams, famIdsToKeep);
  return Indi;
}

// Extract related family IDs
let relatedFamilyIds = relatedFamilies.map(family => family.id);

// Extract individual IDs of all related individuals
let focusedIndividualIds = [];
relatedFamilies.forEach(family => {
  let currFamilyMemberIds = [...family.children, family.husb, family.wife];
  let mergedSet = new Set([...focusedIndividualIds, ...currFamilyMemberIds]);
  focusedIndividualIds = [...mergedSet];
});

// Filter individuals based on related individual IDs
let focusedIndividuals = allJsonData.indis.filter(individual => focusedIndividualIds.includes(individual.id));

// Clean individual data
let cleanedRelatedIndivs = [];
focusedIndividuals.forEach(indiv => {
  let cleandIndiv = stripFamIdsFromIndi(relatedFamilyIds, indiv);
  cleanedRelatedIndivs.push(cleandIndiv);
});

// Prepare JSON data
const topolaJsonData = {
  "indis": cleanedRelatedIndivs,
  "fams": relatedFamilies
};

</script>
