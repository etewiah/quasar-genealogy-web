<template>
  <div>
    <div id="topola-chart"></div>
    <svg></svg>
  </div>
</template>

<script setup>
defineOptions({
  name: 'TopolaExample'
})

import * as topola from 'topola';
import { ref, onMounted } from 'vue'

const props = defineProps({
  topolaData: {
    type: Object,
    default: () => { },
  },

})

onMounted(() => {
  const chart = topola.createChart({
    json: props.topolaData,
    chartType: topola.HourglassChart,
    renderer: topola.DetailedRenderer,
  });
  chart.render(document.getElementById('topola-chart'));
});
</script>
