<template>
  <div>
    <div class="q-ma-md col-xs-12">
      <div>Chart Type:</div>
    </div>
    <div class="q-ma-md col-xs-12">
      <div class="q-gutter-sm">
        <q-radio dense
                 @update:model-value="triggerChartTypeChanged"
                 :modelValue="topolaChartType"
                 val="RelativesChart"
                 label="RelativesChart" />
        <q-radio dense
                 @update:model-value="triggerChartTypeChanged"
                 :modelValue="topolaChartType"
                 val="FancyChart"
                 label="FancyChart" />
        <q-radio dense
                 @update:model-value="triggerChartTypeChanged"
                 :modelValue="topolaChartType"
                 val="HourglassChart"
                 label="HourglassChart" />
        <q-radio dense
                 @update:model-value="triggerChartTypeChanged"
                 :modelValue="topolaChartType"
                 val="AncestorChart"
                 label="AncestorChart" />
      </div>
    </div>
    <div class="q-ma-md col-xs-12">
      <div>Renderer:</div>
    </div>
    <div class="q-ma-md col-xs-12">
      <div class="q-gutter-sm">
        <q-radio dense
                 @update:model-value="triggerRendererChanged"
                 :modelValue="topolaRenderer"
                 val="DetailedRenderer"
                 label="DetailedRenderer" />
        <q-radio dense
                 @update:model-value="triggerRendererChanged"
                 :modelValue="topolaRenderer"
                 val="SimpleRenderer"
                 label="SimpleRenderer" />
        <q-radio dense
                 @update:model-value="triggerRendererChanged"
                 :modelValue="topolaRenderer"
                 val="CircleRenderer"
                 label="CircleRenderer" />
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data: () => ({
    // topolaChartType: "HourglassChart",
    // topolaRenderer: "DetailedRenderer",
  }),
  methods: {
    triggerRendererChanged(newRenderer) {
      this.$emit("triggerRendererChanged", newRenderer)
    },
    triggerChartTypeChanged(newRenderer) {
      this.$emit("triggerChartTypeChanged", newRenderer)
    }
  },
  props: {
    topolaRenderer: {
      type: String,
      required: false,
      default: "DetailedRenderer"
    },
    topolaChartType: {
      type: String,
      required: false,
      default: "HourglassChart"
    },
  },
  mounted() { },
}
</script>
