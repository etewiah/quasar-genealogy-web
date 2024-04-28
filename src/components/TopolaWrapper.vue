<template>
  <div>
    <div id="topola-chart">
      <svg ref="graphElement"
           id="graph" />
    </div>
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
  watch: {
    chartType: {
      handler: function (newVal) {
        if (newVal && newVal.length > 0) {
          this.$refs.graphElement.innerHTML = ""
          this.updateChart()
        }
      },
    },
  },
  methods: {
    updateChart() {
      const chart = topola.createChart({
        json: this.$props.topolaData,
        svgSelector: '#graph',
        chartType: topola[this.$props.chartType],
        renderer: topola[this.$props.renderer],
      });
      chart.render();
    }
  },
  mounted() {
    this.updateChart()
  },
}
</script>
