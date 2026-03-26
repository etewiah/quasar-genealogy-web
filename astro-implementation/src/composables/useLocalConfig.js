// Replaces useLocalDataForTopola.js from the Quasar project.
// Uses the browser's native localStorage instead of Quasar's LocalStorage wrapper.

const STORAGE_KEY = 'topola-config'

const DEFAULTS = {
  topolaChartType: 'HourglassChart',
  topolaRenderer: 'DetailedRenderer',
  chartColors: 'COLOR_BY_GENERATION',
  chartIsHorizontal: false,
}

export default function () {
  function getLocalTopolaConfig() {
    if (typeof localStorage === 'undefined') {
      return { ...DEFAULTS }
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : { ...DEFAULTS }
    } catch {
      return { ...DEFAULTS }
    }
  }

  function updateLocalConfig(confKey, confValue) {
    const localConf = getLocalTopolaConfig()
    localConf[confKey] = confValue
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localConf))
    }
    return ''
  }

  return {
    getLocalTopolaConfig,
    updateLocalConfig,
  }
}
