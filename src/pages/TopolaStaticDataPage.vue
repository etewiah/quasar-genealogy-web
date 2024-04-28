<template>
  <q-page class="flex">
    <div class="row max-ctr"
         style="">
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
        </div>
      </div>
      <div class="q-my-lg q-mx-md col-xs-12">
        <TopolaWrapper :topolaData="topolaData"
                       :chartType="topolaChartType"
                       renderer="DetailedRenderer" />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import TopolaWrapper from 'components/TopolaWrapper.vue'
defineOptions({
  name: 'TopolaStaticDataPage'
});
var topolaChartType = ref('HourglassChart')
const topolaData = {
  indis: [
    {
      id: 'I1',
      firstName: 'John',
      lastName: 'Smith',
      famc: 'F1',
    },
    {
      id: 'I2',
      firstName: 'Peter',
      lastName: 'Smith',
      fams: ['F1'],
    },
    {
      id: 'I3',
      firstName: 'Laura',
      lastName: 'Abbot',
      fams: ['F1'],
    },
  ],
  fams: [
    {
      id: 'F1',
      husb: 'I2',
      wife: 'I3',
      children: ['I1'],
    },
  ],
};
</script>
