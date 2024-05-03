<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat
               dense
               round
               icon="menu"
               aria-label="Menu"
               @click="toggleLeftDrawer" />

        <q-toolbar-title>
          Quasar Topola Viewer App
        </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen"
              show-if-above
              bordered>
      <q-list>
        <q-item-label header>
          Settings
        </q-item-label>
        <TopolaSettings :topolaRenderer="topolaConfig.topolaRenderer"
                        :topolaChartType="topolaChartType"
                        :topolaConfig="topolaConfig"
                        @triggerLayoutChanged="triggerLayoutChanged"
                        @triggerRendererChanged="triggerRendererChanged"
                        @triggerChartTypeChanged="triggerChartTypeChanged"></TopolaSettings>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view :topolaRenderer="topolaConfig.topolaRenderer"
                   :topolaChartType="topolaChartType"
                   :topolaConfig="topolaConfig" />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import TopolaSettings from 'components/TopolaSettings.vue'
// import EssentialLink from 'components/EssentialLink.vue'
import useLocalDataForTopola from "src/compose/useLocalDataForTopola.js"

defineOptions({
  name: 'MainLayout'
})

const { getLocalTopolaConfig } = useLocalDataForTopola()
let topolaConfig = ref(getLocalTopolaConfig())
var topolaChartType = ref(topolaConfig.value.topolaChartType)
// var topolaRenderer = ref(topolaConfig.value.topolaRenderer)
// var chartIsHorizontal = ref(topolaConfig.value.chartIsHorizontal)
var triggerLayoutChanged = function (horizontalOrNot) {
  topolaConfig.value.chartIsHorizontal = horizontalOrNot
  // chartIsHorizontal.value = horizontalOrNot
}
var triggerRendererChanged = function (newRenderer) {
  topolaConfig.value.topolaRenderer = newRenderer
  // topolaRenderer.value = newRenderer
}
var triggerChartTypeChanged = function (newCT) {
  topolaChartType.value = newCT
}

// const linksList = [
//   {
//     title: 'Docs',
//     caption: 'quasar.dev',
//     icon: 'school',
//     link: 'https://quasar.dev'
//   },
//   {
//     title: 'Github',
//     caption: 'github.com/quasarframework',
//     icon: 'code',
//     link: 'https://github.com/quasarframework'
//   },
//   {
//     title: 'Discord Chat Channel',
//     caption: 'chat.quasar.dev',
//     icon: 'chat',
//     link: 'https://chat.quasar.dev'
//   },
//   {
//     title: 'Forum',
//     caption: 'forum.quasar.dev',
//     icon: 'record_voice_over',
//     link: 'https://forum.quasar.dev'
//   },
//   {
//     title: 'Twitter',
//     caption: '@quasarframework',
//     icon: 'rss_feed',
//     link: 'https://twitter.quasar.dev'
//   },
//   {
//     title: 'Facebook',
//     caption: '@QuasarFramework',
//     icon: 'public',
//     link: 'https://facebook.quasar.dev'
//   },
//   {
//     title: 'Quasar Awesome',
//     caption: 'Community Quasar projects',
//     icon: 'favorite',
//     link: 'https://awesome.quasar.dev'
//   }
// ]

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
