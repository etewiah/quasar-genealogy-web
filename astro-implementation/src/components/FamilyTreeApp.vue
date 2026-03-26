<template>
  <div class="family-tree-app">
    <!-- Settings toggle — floated to page top-right via the header slot -->
    <div class="app-toolbar">
      <button class="btn-icon settings-toggle" @click="settingsOpen = !settingsOpen" title="Settings">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.92c.04-.34.07-.69.07-1.08 0-.39-.03-.74-.07-1.08l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.7-.07 1.08 0 .38.03.74.07 1.08L2.46 14.79c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.58 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.71z"/>
        </svg>
      </button>
    </div>

    <!-- Settings drawer -->
    <div v-if="settingsOpen" class="settings-drawer">
      <h3>Settings</h3>
      <TopolaSettings
        :topolaConfig="topolaConfig"
        @triggerChartTypeChanged="triggerChartTypeChanged"
        @triggerLayoutChanged="triggerLayoutChanged"
        @triggerRendererChanged="triggerRendererChanged"
        @triggerChartColorsChanged="triggerChartColorsChanged"
      />
    </div>

    <div v-if="topolaJsonData" class="page-container">
      <!-- Individual detail panel -->
      <TopolaIndividual :currentPerson="focusedIndi" />

      <!-- Chart -->
      <div class="chart-area">
        <TopolaChart
          :topolaData="topolaJsonData"
          :focusedIndiForGraph="focusedIndi"
          :topolaConfig="topolaConfig"
        />
      </div>

      <!-- Sharing -->
      <SocialSharing />
      <QrCodeShare />
    </div>

    <div v-else class="page-container">
      <p>Loading family tree…</p>
    </div>
  </div>
</template>

<script>
// FamilyTreeApp is the root Vue island for the /static-data page.
//
// It replaces the combination of:
//   - MainLayout.vue (topolaConfig state + settings drawer)
//   - TopolaStaticDataPage.vue (data loading + filtering)
//
// Because this component uses client:only="vue" in Astro, it runs exclusively
// in the browser. window and localStorage are always available here.
//
// Navigation model: clicking a person in the chart causes a full-page navigation
// to /static-data?personID=X (Astro file-based routing). On each load this
// component reads the personID from window.location.search, filters the dataset,
// and mounts fresh. No Vue Router or route-watching is needed.

import kennedyData from '../data/KennedyFamilyData.json'
import useTopolaData from '../composables/useTopolaData.js'
import useLocalConfig from '../composables/useLocalConfig.js'

import TopolaChart from './TopolaChart.vue'
import TopolaIndividual from './TopolaIndividual.vue'
import TopolaSettings from './TopolaSettings.vue'
import SocialSharing from './sharing/SocialSharing.vue'
import QrCodeShare from './sharing/QrCodeShare.vue'

export default {
  components: {
    TopolaChart,
    TopolaIndividual,
    TopolaSettings,
    SocialSharing,
    QrCodeShare,
  },
  data() {
    return {
      topolaJsonData: null,
      focusedIndi: null,
      topolaConfig: null,
      settingsOpen: false,
    }
  },
  methods: {
    triggerChartTypeChanged(val) {
      this.topolaConfig = { ...this.topolaConfig, topolaChartType: val }
    },
    triggerLayoutChanged(val) {
      this.topolaConfig = { ...this.topolaConfig, chartIsHorizontal: val }
    },
    triggerRendererChanged(val) {
      this.topolaConfig = { ...this.topolaConfig, topolaRenderer: val }
    },
    triggerChartColorsChanged(val) {
      this.topolaConfig = { ...this.topolaConfig, chartColors: val }
    },
  },
  mounted() {
    const { getFocusedData, cleanUpTopolaJson } = useTopolaData()
    const { getLocalTopolaConfig } = useLocalConfig()

    // Resolve the focused individual from the URL query param
    const personID = new URLSearchParams(window.location.search).get('personID')
    this.focusedIndi =
      kennedyData.indis.find((i) => i.id === personID) || kennedyData.indis[0]

    // Filter the full dataset to the focused person's immediate family
    const unfilteredData = getFocusedData(kennedyData, this.focusedIndi)
    this.topolaJsonData = cleanUpTopolaJson(unfilteredData)

    // Load persisted chart config from localStorage
    this.topolaConfig = getLocalTopolaConfig()
  },
}
</script>

<style scoped>
.app-toolbar {
  position: fixed;
  top: 0;
  right: 0;
  height: 56px;
  display: flex;
  align-items: center;
  padding-right: 12px;
  z-index: 101;
}
.settings-toggle {
  background: transparent;
  color: #fff;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}
.settings-toggle:hover {
  background: rgba(255, 255, 255, 0.15);
}
.settings-toggle svg {
  width: 22px;
  height: 22px;
  fill: #fff;
}
</style>
