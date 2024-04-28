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
        return ['AncestorChart', 'FancyChart', 'RelativesChart', 'HourglassChart'].includes(value);
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
    renderer: {
      handler: function (newVal) {
        if (newVal && newVal.length > 0) {
          this.$refs.graphElement.innerHTML = ""
          this.updateChart()
        }
      },
    },
  },
  methods: {
    topolaIndiCallback(info, moreInfor) { },
    // topolaFamCallback(info, info2) { },
    topolaHrefFunc(idInfo) { },
    updateChart() {
      const chart = topola.createChart({
        json: this.$props.topolaData,
        animate: true,
        svgSelector: '#graph',
        chartType: topola[this.$props.chartType],
        renderer: topola[this.$props.renderer],
        indiUrl: '/#static-data?tree=tree381&personID=${id}',
        famUrl: '/#static-data?tree=tree381&familyID=${id}',
        indiHrefFunc: this.topolaHrefFunc,
        famHrefFunc: this.topolaHrefFunc,
        // indiHrefFunc?: (id: string) => string;
        // famHrefFunc?: (id: string) => string;
        horizontal: true,
        colors: topola.ChartColors.COLOR_BY_SEX,
        // AncestorChart CircleRenderer
        indiCallback: this.topolaIndiCallback,
        // famCallback: this.topolaFamCallback,
        // indiCallback?: (id: IndiInfo) => void;
        // famCallback?: (id: FamInfo) => void;
        updateSvgSize: true,
      });
      chart.render();
    }
  },
  mounted() {
    this.updateChart()
  },
}
</script>
