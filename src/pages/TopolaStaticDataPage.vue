<template>
  <q-page class="flex">
    <div class="row max-ctr"
         style="">
      <div class="q-my-lg q-mx-md col-xs-12">
        <TopolaIndividual :topolaJsonData="topolaJsonData" />
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
import TopolaIndividual from 'components/TopolaIndividual.vue'
// import topolaJsonData from 'src/data/MinimalExampleData.json'
import topolaJsonData from 'src/data/KennedyFamilyData.json'
// import topolaGedcomData from 'src/data/KennedyFamilyData.ged.js'
import * as topola from 'topola';
// import { useRouter, useRoute } from 'vue-router'
// const router = useRouter()
// const route = useRoute()

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
// const topolaData = topola.gedcomToJson(topolaGedcomData);
</script>
