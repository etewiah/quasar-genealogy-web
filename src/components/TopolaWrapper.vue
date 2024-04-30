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
    },
    chartIsHorizontal: {
      type: Boolean,
      default: true
    }
  },
  watch: {
    "$route.query.personID": {
      handler: function (newVal) {
        if (newVal && newVal.length > 0) {
          this.updateChart()
        }
      },
    },
    chartType: {
      handler: function (newVal) {
        if (newVal && newVal.length > 0) {
          this.updateChart()
        }
      },
    },
    chartIsHorizontal: {
      handler: function (newVal) {
        this.updateChart()
      },
    },
    renderer: {
      handler: function (newVal) {
        if (newVal && newVal.length > 0) {
          this.updateChart()
        }
      },
    },
  },
  computed: {
  },
  methods: {
    topolaIndiCallback(info, moreInfor) { },
    // topolaFamCallback(info, info2) { },
    topolaHrefFunc(idInfo) { },
    updateChart() {
      this.$refs.graphElement.innerHTML = ""
      let currentPersonID = this.$route.query.personID
      let focusDetails = {}
      if (currentPersonID) {
        focusDetails.startIndi = currentPersonID
      }
      const chart = topola.createChart({
        json: this.topolaData,
        animate: true,
        svgSelector: '#graph',
        chartType: topola[this.$props.chartType],
        renderer: topola[this.$props.renderer],
        indiUrl: '/#static-data?personID=${id}',
        famUrl: '/#static-data?familyID=${id}',
        indiHrefFunc: this.topolaHrefFunc,
        famHrefFunc: this.topolaHrefFunc,
        // indiHrefFunc?: (id: string) => string;
        // famHrefFunc?: (id: string) => string;
        horizontal: this.chartIsHorizontal,
        // colors: topola.ChartColors.COLOR_BY_SEX,
        colors: topola.ChartColors.COLOR_BY_GENERATION,
        // AncestorChart CircleRenderer
        indiCallback: this.topolaIndiCallback,
        // famCallback: this.topolaFamCallback,
        // indiCallback?: (id: IndiInfo) => void;
        // famCallback?: (id: FamInfo) => void;
        updateSvgSize: true,
      });
      chart.render(focusDetails);
    }
  },
  mounted() {
    this.updateChart()
  },
}
</script>
