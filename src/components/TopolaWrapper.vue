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
    focusedIndiForGraph: {
      type: Object
    },
    topolaData: {
      type: Object,
      required: true
    },
    chartType: {
      type: String,
      required: true,
      validator: function (value) {
        return ['AncestorChart', 'DescendantChart', 'KinshipChart',
          'FancyChart', 'RelativesChart', 'HourglassChart'].includes(value);
      }
    },
    // renderer: {
    //   type: String,
    //   required: true
    // },
    topolaConfig: {
      type: Object,
    },
    // chartIsHorizontal: {
    //   type: Boolean,
    //   default: true
    // }
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
    // chartIsHorizontal: {
    //   handler: function (newVal) {
    //     this.updateChart()
    //   },
    // },
    topolaConfig: {
      deep: true,
      handler: function (newVal) {
        this.updateChart()
      },
    },
    // renderer: {
    //   handler: function (newVal) {
    //     if (newVal && newVal.length > 0) {
    //       this.updateChart()
    //     }
    //   },
    // },
  },
  computed: {
  },
  data: () => ({
    topolaChart: null,
    topolaChartData: {}
  }),
  methods: {
    topolaIndiCallback(info, moreInfor) { },
    // topolaFamCallback(info, info2) { },
    topolaHrefFunc(idInfo) { },
    updateChart() {
      // this.$refs.graphElement.innerHTML = ""
      let focusDetails = {}
      if (this.focusedIndiForGraph) {
        focusDetails.startIndi = this.focusedIndiForGraph.id
      }
      if (this.topolaChart.options.horizontal !== this.topolaConfig.chartIsHorizontal) {
        this.topolaChart.options.horizontal = this.topolaConfig.chartIsHorizontal
        this.topolaChart.render(focusDetails);
      } else {
        this.$refs.graphElement.innerHTML = ""
        this.topolaChart.options.chartType = topola[this.$props.chartType]
        this.topolaChart.options.renderer = topola[this.topolaConfig.topolaRenderer]
        this.topolaChart.render(focusDetails);
      }

    },
    initiateChart() {
      this.$refs.graphElement.innerHTML = ""
      // let currentPersonID = this.$route.query.personID
      let focusDetails = {}
      if (this.focusedIndiForGraph) {
        focusDetails.startIndi = this.focusedIndiForGraph.id
      }
      // let startFam = this.topolaData.fams[1]
      // 'json', 'animate', 'svgSelector', 'chartType', 'renderer', 'indiUrl', 'famUrl', 'indiHrefFunc', 'famHrefFunc', 'horizontal', 'colors', 'indiCallback', 'updateSvgSize'
      this.topolaChartData = {
        json: this.topolaData,
        animate: true,
        svgSelector: '#graph',
        // startFam: startFam,
        chartType: topola[this.$props.chartType],
        renderer: topola[this.topolaConfig.topolaRenderer],
        indiUrl: '/static-data?personID=${id}',
        famUrl: '/static-data?familyID=${id}',
        indiHrefFunc: this.topolaHrefFunc,
        famHrefFunc: this.topolaHrefFunc,
        // indiHrefFunc?: (id: string) => string;
        // famHrefFunc?: (id: string) => string;
        horizontal: this.topolaConfig.chartIsHorizontal,
        colors: topola.ChartColors[this.topolaConfig.chartColors],
        // colors: topola.ChartColors.COLOR_BY_GENERATION,
        // AncestorChart CircleRenderer
        indiCallback: this.topolaIndiCallback,
        // famCallback: this.topolaFamCallback,
        // indiCallback?: (id: IndiInfo) => void;
        // famCallback?: (id: FamInfo) => void;
        updateSvgSize: true,
      }
      this.topolaChart = topola.createChart(this.topolaChartData);
      this.topolaChart.render(focusDetails);
    }
  },
  mounted() {
    this.initiateChart()
  },
}
</script>
