<template>
  <div>
    <div class="q-ma-md col-xs-12">
      <div>Chart Type:</div>
    </div>
    <div class="q-ma-md col-xs-12">
      <div class="q-gutter-sm">
        <q-radio dense
                 @update:model-value="triggerChartTypeChanged"
                 :modelValue="topolaConfig.topolaChartType"
                 val="AncestorChart"
                 label="AncestorChart" />
        <q-radio dense
                 @update:model-value="triggerChartTypeChanged"
                 :modelValue="topolaConfig.topolaChartType"
                 val="KinshipChart"
                 label="KinshipChart" />
        <q-radio dense
                 @update:model-value="triggerChartTypeChanged"
                 :modelValue="topolaConfig.topolaChartType"
                 val="DescendantChart"
                 label="DescendantChart" />
        <q-radio dense
                 @update:model-value="triggerChartTypeChanged"
                 :modelValue="topolaConfig.topolaChartType"
                 val="RelativesChart"
                 label="RelativesChart" />
        <q-radio dense
                 @update:model-value="triggerChartTypeChanged"
                 :modelValue="topolaConfig.topolaChartType"
                 val="FancyChart"
                 label="FancyChart" />
        <q-radio dense
                 @update:model-value="triggerChartTypeChanged"
                 :modelValue="topolaConfig.topolaChartType"
                 val="HourglassChart"
                 label="HourglassChart" />
      </div>
    </div>
    <div class="q-ma-md col-xs-12">
      <div>Renderer:</div>
    </div>
    <div class="q-ma-md col-xs-12">
      <div class="q-gutter-sm">
        <q-radio dense
                 @update:model-value="triggerRendererChanged"
                 :modelValue="topolaConfig.topolaRenderer"
                 val="DetailedRenderer"
                 label="DetailedRenderer" />
        <q-radio dense
                 @update:model-value="triggerRendererChanged"
                 :modelValue="topolaConfig.topolaRenderer"
                 val="SimpleRenderer"
                 label="SimpleRenderer" />
        <q-radio dense
                 @update:model-value="triggerRendererChanged"
                 :modelValue="topolaConfig.topolaRenderer"
                 val="CircleRenderer"
                 label="CircleRenderer" />
      </div>
    </div>
    <div class="q-ma-md col-xs-12">
      <div>Orientation:</div>
    </div>
    <div class="q-ma-md col-xs-12">
      <div class="q-gutter-sm">
        <q-radio dense
                 @update:model-value="triggerLayoutChanged"
                 :modelValue="topolaConfig.chartIsHorizontal"
                 :val="true"
                 label="Horizontal" />
        <q-radio dense
                 @update:model-value="triggerLayoutChanged"
                 :modelValue="topolaConfig.chartIsHorizontal"
                 :val="false"
                 label="Vertical" />
      </div>
    </div>

    <div class="q-ma-md col-xs-12">
      <div>Colors:</div>
    </div>
    <div class="q-ma-md col-xs-12">
      <div class="q-gutter-sm">
        <q-radio dense
                 @update:model-value="triggerChartColorsChanged"
                 :modelValue="topolaConfig.chartColors"
                 val="COLOR_BY_GENERATION"
                 label="By Generation" />
        <q-radio dense
                 @update:model-value="triggerChartColorsChanged"
                 :modelValue="topolaConfig.chartColors"
                 val="COLOR_BY_SEX"
                 label="By Sex" />
      </div>
    </div>
  </div>
</template>
<script>
import useLocalDataForTopola from "src/compose/useLocalDataForTopola.js"
export default {
  setup(props) {
    const { updateLocalConfig } = useLocalDataForTopola()
    return {
      updateLocalConfig,
    }
  },
  data: () => ({
    // topolaChartType: "HourglassChart",
  }),
  methods: {
    triggerChartColorsChanged(newChartColors) {
      this.updateLocalConfig("chartColors", newChartColors)
      this.$emit("triggerChartColorsChanged", newChartColors)
    },

    triggerLayoutChanged(horizontalOrNot) {
      this.updateLocalConfig("chartIsHorizontal", horizontalOrNot)
      this.$emit("triggerLayoutChanged", horizontalOrNot)
    },
    triggerRendererChanged(newRenderer) {
      this.updateLocalConfig("topolaRenderer", newRenderer)
      this.$emit("triggerRendererChanged", newRenderer)
    },
    triggerChartTypeChanged(newCT) {
      this.updateLocalConfig("topolaChartType", newCT)
      this.$emit("triggerChartTypeChanged", newCT)
    }
  },
  props: {
    topolaConfig: {
      type: Object,
    },
    // topolaChartType: {
    //   type: String,
    //   required: false,
    //   default: "HourglassChart"
    // },
  },
  mounted() { },
}
</script>
