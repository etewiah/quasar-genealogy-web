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

function intersection(arr1, arr2) {
  // Convert arrays to sets to remove duplicates
  const set1 = new Set(arr1);
  const set2 = new Set(arr2);
  // Create a new Set that contains only elements that are present in both sets
  const intersectionSet = new Set([...set1].filter(num => set2.has(num)));

  // Convert the Set back to an array and return
  return [...intersectionSet];
}
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

let selectedFamilyMembers = null
// Sometimes a focused Individual has an empty fams array even though
// I could find relatedFamilies
if (focusedIndiForGraph.fams.length < 1 && relatedFamilies.length > 0) {
  // I tried fixing that by just setting the fams array like so:
  // focusedIndiForGraph.fams = relatedFamilies.map(family => family.id)
  // Unfortunately that cause topola to throw an error when rendering..

  // Decided to instead cheat by setting someone else in the family
  // as the focused individual for the graph in that case:
  // Get the IDs of all family members
  const selectedFamilyMemberIds = [...relatedFamilies[0].children, relatedFamilies[0].husb, relatedFamilies[0].wife];

  // Find an individual in the family who is not the current focusedIndiForGraph
  const otherIndividual = selectedFamilyMemberIds.find(memberId => memberId !== focusedIndiForGraph.id);
  // And set as focusedIndiForGraph
  focusedIndiForGraph = allJsonData.indis.find(individual => individual.id === otherIndividual);

  selectedFamilyMembers = allJsonData.indis.filter(individual => {
    return selectedFamilyMemberIds.includes(individual.id)
  })
  // .find(individual => individual.id === currentPersonID);

}

var stripFamIdsFromIndi = function (famIdsToKeep, Indi) {
  if (!famIdsToKeep.includes(Indi.famc)) {
    Indi.famc = null
  }
  Indi.fams = intersection(Indi.fams, famIdsToKeep)
  return Indi
}
// var stripIndiIdsFromFam = function (indiIdsToKeep, fam) {
//   if (!indiIdsToKeep.includes(fam.husb)) {
//     fam.husb = null
//   }
//   if (!indiIdsToKeep.includes(fam.wife)) {
//     fam.wife = null
//   }
//   fam.children = intersection(fam.children, indiIdsToKeep)
//   return fam
// }
const topolaJsonData = {}
let relatedFamilyIds = relatedFamilies.map(family => family.id)
let focusedIndividualIds = []
relatedFamilies.forEach(family => {
  let currFamilyMemberIds = [...family.children, family.husb, family.wife];
  let mergedSet = new Set([...focusedIndividualIds, ...currFamilyMemberIds]);
  focusedIndividualIds = [...mergedSet]
})
let focusedIndividuals = allJsonData.indis.filter(individual => {
  return focusedIndividualIds.includes(individual.id)
})
// let familyMemberIds = selectedFamilyMembers.map(indiv => indiv.id)
// focusedIndiForGraph = stripFamIdsFromIndi(relatedFamilyIds, focusedIndiForGraph)
// let cleanedRelatedFamilies = []
// relatedFamilies.forEach(family => {
//   let cleanedRelatedFamily = stripIndiIdsFromFam(familyMemberIds, family)
//   cleanedRelatedFamilies.push(cleanedRelatedFamily)
// })

let cleanedRelatedIndivs = []
focusedIndividuals.forEach(indiv => {
  let cleandIndiv = stripFamIdsFromIndi(relatedFamilyIds, indiv)
  cleanedRelatedIndivs.push(cleandIndiv)
})
topolaJsonData["indis"] = cleanedRelatedIndivs // [focusedIndiForGraph]// selectedFamilyMembers || allJsonData["indis"]
topolaJsonData["fams"] = relatedFamilies // cleanedRelatedFamilies || allJsonData["fams"]

</script>
