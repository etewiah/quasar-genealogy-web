<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>
          <q-btn stretch
                 :to="{ name: 'rLandingPage', params: {} }"
                 flat
                 label="Home"
                 no-caps />
          <q-btn stretch
                 :to="{ name: 'rTopolaStaticDataPage', params: {} }"
                 flat
                 label="Kennedy Demo"
                 no-caps />

        </q-toolbar-title>
        <q-btn v-if="showSettingsMenu"
               flat
               dense
               round
               icon="settings"
               aria-label="Menu"
               @click="toggleRightDrawer" />
        <!-- <div>Quasar v{{ $q.version }}</div> -->
      </q-toolbar>
    </q-header>
    <q-page-container>
      <router-view :topolaConfig="topolaConfig" />
    </q-page-container>
    <q-drawer v-model="rightDrawerOpen"
              side="right"
              bordered>
      <q-list>
        <q-item-label header>
          Settings
        </q-item-label>
        <TopolaSettings :topolaConfig="topolaConfig"
                        @triggerChartColorsChanged="triggerChartColorsChanged"
                        @triggerLayoutChanged="triggerLayoutChanged"
                        @triggerRendererChanged="triggerRendererChanged"
                        @triggerChartTypeChanged="triggerChartTypeChanged"></TopolaSettings>
      </q-list>
    </q-drawer>
    <SocialSharing></SocialSharing>
    <QrCodeShare></QrCodeShare>
    <GenealogyFooter></GenealogyFooter>
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
import TopolaSettings from 'components/TopolaSettings.vue'
import QrCodeShare from 'components/sharing/QrCodeShare.vue'
import SocialSharing from 'components/sharing/SocialSharing.vue'
import GenealogyFooter from 'components/content/GenealogyFooter.vue'
import useLocalDataForTopola from "src/compose/useLocalDataForTopola.js"
defineOptions({
  name: 'MainLayout'
})

const showSettingsMenu = computed(() => {
  return ['rTopolaStaticDataPage'].includes(route.name)
})

const { getLocalTopolaConfig } = useLocalDataForTopola()
let topolaConfig = ref(getLocalTopolaConfig())
// var topolaChartType = ref(topolaConfig.value.topolaChartType)
var triggerLayoutChanged = function (horizontalOrNot) {
  topolaConfig.value.chartIsHorizontal = horizontalOrNot
}
var triggerChartColorsChanged = function (newChartColors) {
  topolaConfig.value.chartColors = newChartColors
}
var triggerRendererChanged = function (newRenderer) {
  topolaConfig.value.topolaRenderer = newRenderer
}
var triggerChartTypeChanged = function (newCT) {
  topolaConfig.value.topolaChartType = newCT
  // topolaChartType.value = newCT
}

const rightDrawerOpen = ref(false)

function toggleRightDrawer() {
  rightDrawerOpen.value = !rightDrawerOpen.value
}
</script>
