<template>
  <q-page class="flex">
    <div class="row max-ctr"
         style="">
      <!-- <div>
      </div> -->
      <div class="q-my-lg q-mx-md col-xs-12">
        <TopolaWrapper :topolaData="topolaJsonData"
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
// import TopolaSettings from 'components/TopolaSettings.vue'
// import topolaJsonData from 'src/data/MinimalExampleData.json'
import topolaJsonData from 'src/data/KennedyFamilyData.json'
// import topolaGedcomData from 'src/data/KennedyFamilyData.ged.js'
import * as topola from 'topola';
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
// var triggerLayoutChanged = function (horizontalOrNot) {
//   chartIsHorizontal.value = horizontalOrNot
// }
// var triggerRendererChanged = function (newRenderer) {
//   topolaRenderer.value = newRenderer
// }
// var triggerChartTypeChanged = function (newCT) {
//   topolaChartType.value = newCT
// }
// const topolaData = topola.gedcomToJson(topolaGedcomData);
</script>
