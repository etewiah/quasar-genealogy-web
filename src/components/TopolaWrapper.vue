<template>
  <div>
    <div id="topola-chart"></div>
    <svg></svg>
  </div>
</template>
<script>
import { onMounted, ref, toRefs } from 'vue';
import * as topola from 'topola';

export default {
  props: {
    topolaData: {
      type: Object,
      required: true
    },
    chartType: {
      type: String,
      required: true,
      validator: function (value) {
        return ['FancyChart', 'RelativesChart', 'HourglassChart'].includes(value);
      }
    },
    renderer: {
      type: String,
      required: true
    }
  },

  setup(props) {
    onMounted(() => {
      const chart = topola.createChart({
        json: props.topolaData,
        chartType: topola[props.chartType],
        renderer: topola[props.renderer],
      });
      chart.render(document.getElementById('topola-chart'));
    });
  }
}
</script>
