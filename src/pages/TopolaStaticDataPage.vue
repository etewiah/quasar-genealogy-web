<template>
  <q-page class="flex">
    <div class="row max-ctr"
         style="">
      <div>
        <div>
          <div class="q-ma-md col-xs-12">
            <div>Chart Type:</div>
          </div>
          <div class="q-ma-md col-xs-12">
            <div class="q-gutter-sm">
              <q-radio dense
                       v-model="topolaChartType"
                       val="RelativesChart"
                       label="RelativesChart" />
              <q-radio dense
                       v-model="topolaChartType"
                       val="FancyChart"
                       label="FancyChart" />
              <q-radio dense
                       v-model="topolaChartType"
                       val="HourglassChart"
                       label="HourglassChart" />
              <q-radio dense
                       v-model="topolaChartType"
                       val="AncestorChart"
                       label="AncestorChart" />
            </div>
          </div>
          <div class="q-ma-md col-xs-12">
            <div>Renderer:</div>
          </div>
          <div class="q-ma-md col-xs-12">
            <div class="q-gutter-sm">
              <q-radio dense
                       v-model="topolaRenderer"
                       val="DetailedRenderer"
                       label="DetailedRenderer" />
              <q-radio dense
                       v-model="topolaRenderer"
                       val="SimpleRenderer"
                       label="SimpleRenderer" />
              <q-radio dense
                       v-model="topolaRenderer"
                       val="CircleRenderer"
                       label="CircleRenderer" />
            </div>
          </div>
        </div>
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
// import topolaJsonData from 'src/data/MinimalExampleData.json'
import topolaGedcomData from 'src/data/KennedyFamilyData.ged.js'
import * as topola from 'topola';

defineOptions({
  name: 'TopolaStaticDataPage'
});
var topolaChartType = ref('HourglassChart')
var topolaRenderer = ref('SimpleRenderer')
const topolaData = topola.gedcomToJson(topolaGedcomData);
</script>
