<template>
  <q-page class="flex">
    <div class="row max-ctr"
         style="">
      <div>
        <TopolaSettings :topolaRenderer="topolaRenderer"
                        :topolaChartType="topolaChartType"
                        @triggerRendererChanged="triggerRendererChanged"
                        @triggerChartTypeChanged="triggerChartTypeChanged"></TopolaSettings>
      </div>
      <div class="q-my-lg q-mx-md col-xs-12">
        <TopolaWrapper :topolaData="topolaData"
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
import topolaGedcomData from 'src/data/KennedyFamilyData.ged.js'
import * as topola from 'topola';

defineOptions({
  name: 'TopolaStaticDataPage'
});
var topolaChartType = ref('HourglassChart')
var topolaRenderer = ref('DetailedRenderer')

var triggerRendererChanged = function (newRenderer) {
  topolaRenderer.value = newRenderer
}
var triggerChartTypeChanged = function (newCT) {
  topolaChartType.value = newCT
}
const topolaData = topola.gedcomToJson(topolaGedcomData);
</script>
