<template>
  <div>
    <div id="topola-chart">
      <svg ref="graphElement" id="graph" />
    </div>
  </div>
</template>

<script>
// Adapted from TopolaWrapper.vue in the Quasar project.
//
// Key changes from the original:
//  - Removed the $route.query.personID watcher. In the Astro version navigation
//    causes a full page reload, so the component always mounts fresh with the
//    correct focusedIndiForGraph prop. No route watching is needed.
//  - Removed vue-json-pretty debug panels (showRawData was always false).
//  - Removed @quasar/extras; no Quasar UI components used here.
//
// Everything else — chart init, topolaConfig deep watch, updateChart() —
// is unchanged from the original.

import * as topola from 'topola'

export default {
  props: {
    focusedIndiForGraph: {
      type: Object,
      default: null,
    },
    topolaData: {
      type: Object,
      required: true,
    },
    topolaConfig: {
      type: Object,
      required: true,
    },
  },
  data: () => ({
    topolaChart: null,
    topolaChartData: {},
  }),
  watch: {
    topolaConfig: {
      deep: true,
      handler() {
        this.updateChart()
      },
    },
  },
  methods: {
    topolaIndiCallback() {},
    topolaHrefFunc() {},

    updateChart() {
      let focusDetails = {}
      if (this.focusedIndiForGraph) {
        focusDetails.startIndi = this.focusedIndiForGraph.id
      }
      if (this.topolaChart.options.horizontal !== this.topolaConfig.chartIsHorizontal) {
        // Horizontal toggle can be applied without clearing the SVG
        this.topolaChart.options.horizontal = this.topolaConfig.chartIsHorizontal
        this.topolaChart.render(focusDetails)
      } else {
        // All other changes require a full SVG reset
        this.$refs.graphElement.innerHTML = ''
        this.topolaChart.options.chartType = topola[this.topolaConfig.topolaChartType]
        this.topolaChart.options.renderer = topola[this.topolaConfig.topolaRenderer]
        this.topolaChart.options.colors = topola.ChartColors[this.topolaConfig.chartColors]
        this.topolaChart.render(focusDetails)
      }
    },

    initiateChart() {
      this.$refs.graphElement.innerHTML = ''
      let focusDetails = {}
      if (this.focusedIndiForGraph) {
        focusDetails.startIndi = this.focusedIndiForGraph.id
      }
      this.topolaChartData = {
        json: this.topolaData,
        animate: true,
        svgSelector: '#graph',
        chartType: topola[this.topolaConfig.topolaChartType],
        renderer: topola[this.topolaConfig.topolaRenderer],
        // topola replaces ${id} internally when generating anchor hrefs
        indiUrl: '/static-data?personID=${id}',
        famUrl: '/static-data?familyID=${id}',
        indiHrefFunc: this.topolaHrefFunc,
        famHrefFunc: this.topolaHrefFunc,
        horizontal: this.topolaConfig.chartIsHorizontal,
        colors: topola.ChartColors[this.topolaConfig.chartColors],
        indiCallback: this.topolaIndiCallback,
        updateSvgSize: true,
      }
      this.topolaChart = topola.createChart(this.topolaChartData)
      this.topolaChart.render(focusDetails)
    },
  },
  mounted() {
    this.initiateChart()
  },
}
</script>
