<template>
  <div>
    <div id="topola-chart"></div>
  </div>
</template>

<script setup>
defineOptions({
  name: 'TopolaExample'
})

import * as topola from 'topola';
import { ref, onMounted } from 'vue'

const data = {
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

onMounted(() => {
  const chart = topola.createChart({
    json: data,
    chartType: topola.HourglassChart,
    renderer: topola.DetailedRenderer,
  });
  chart.render(document.getElementById('topola-chart'));
});
</script>
