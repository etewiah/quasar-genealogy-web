<template>
  <q-page class="flex">
    <div class="row max-ctr"
         style="">
      <div>
        <TopolaSettings :topolaRenderer="topolaRenderer"
                        :topolaChartType="topolaChartType"
                        :chartIsHorizontal="chartIsHorizontal"
                        @triggerLayoutChanged="triggerLayoutChanged"
                        @triggerRendererChanged="triggerRendererChanged"
                        @triggerChartTypeChanged="triggerChartTypeChanged"></TopolaSettings>
      </div>
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
import TopolaSettings from 'components/TopolaSettings.vue'
// import topolaJsonData from 'src/data/MinimalExampleData.json'
import topolaJsonData from 'src/data/KennedyFamilyData.json'
// import topolaGedcomData from 'src/data/KennedyFamilyData.ged.js'
import * as topola from 'topola';
import useLocalDataForTopola from "src/compose/useLocalDataForTopola.js"
defineOptions({
  name: 'TopolaStaticDataPage'
})

const { getLocalTopolaConfig } = useLocalDataForTopola()
let topolaConfig = getLocalTopolaConfig()
var topolaChartType = ref(topolaConfig.topolaChartType)
var topolaRenderer = ref(topolaConfig.topolaRenderer)
var chartIsHorizontal = ref(topolaConfig.chartIsHorizontal)
var triggerLayoutChanged = function (horizontalOrNot) {
  chartIsHorizontal.value = horizontalOrNot
}
var triggerRendererChanged = function (newRenderer) {
  topolaRenderer.value = newRenderer
}
var triggerChartTypeChanged = function (newCT) {
  topolaChartType.value = newCT
}
// const topolaData = topola.gedcomToJson(topolaGedcomData);
</script>
