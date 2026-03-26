<template>
  <div class="topola-settings">
    <!-- Chart Type -->
    <div class="settings-group">
      <span class="settings-group-label">Chart Type:</span>
      <label v-for="opt in chartTypeOptions" :key="opt.value" class="radio-item">
        <input
          type="radio"
          name="chartType"
          :value="opt.value"
          :checked="topolaConfig.topolaChartType === opt.value"
          @change="triggerChartTypeChanged(opt.value)"
        />
        {{ opt.label }}
      </label>
    </div>

    <!-- Orientation -->
    <div class="settings-group">
      <span class="settings-group-label">Orientation:</span>
      <label class="radio-item">
        <input
          type="radio"
          name="orientation"
          :checked="topolaConfig.chartIsHorizontal === true"
          @change="triggerLayoutChanged(true)"
        />
        Horizontal
      </label>
      <label class="radio-item">
        <input
          type="radio"
          name="orientation"
          :checked="topolaConfig.chartIsHorizontal === false"
          @change="triggerLayoutChanged(false)"
        />
        Vertical
      </label>
    </div>

    <!-- Colors -->
    <div class="settings-group">
      <span class="settings-group-label">Colors:</span>
      <label class="radio-item">
        <input
          type="radio"
          name="colors"
          :checked="topolaConfig.chartColors === 'COLOR_BY_GENERATION'"
          @change="triggerChartColorsChanged('COLOR_BY_GENERATION')"
        />
        By Generation
      </label>
      <label class="radio-item">
        <input
          type="radio"
          name="colors"
          :checked="topolaConfig.chartColors === 'COLOR_BY_SEX'"
          @change="triggerChartColorsChanged('COLOR_BY_SEX')"
        />
        By Sex
      </label>
    </div>
  </div>
</template>

<script>
import useLocalConfig from '../composables/useLocalConfig.js'

export default {
  setup() {
    const { updateLocalConfig } = useLocalConfig()
    return { updateLocalConfig }
  },
  props: {
    topolaConfig: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      chartTypeOptions: [
        { value: 'AncestorChart',   label: 'Ancestors' },
        { value: 'DescendantChart', label: 'Descendants' },
        { value: 'KinshipChart',    label: 'Kinship' },
        { value: 'RelativesChart',  label: 'Relatives' },
        { value: 'HourglassChart',  label: 'Hourglass' },
      ],
    }
  },
  methods: {
    triggerChartTypeChanged(val) {
      this.updateLocalConfig('topolaChartType', val)
      this.$emit('triggerChartTypeChanged', val)
    },
    triggerLayoutChanged(val) {
      this.updateLocalConfig('chartIsHorizontal', val)
      this.$emit('triggerLayoutChanged', val)
    },
    triggerRendererChanged(val) {
      this.updateLocalConfig('topolaRenderer', val)
      this.$emit('triggerRendererChanged', val)
    },
    triggerChartColorsChanged(val) {
      this.updateLocalConfig('chartColors', val)
      this.$emit('triggerChartColorsChanged', val)
    },
  },
}
</script>
