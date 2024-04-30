import { LocalStorage } from 'quasar'
export default function () {
  function updateLocalConfig(confKey, confValue) {
    let localConf = getLocalTopolaConfig() || {}
    localConf[confKey] = confValue
    LocalStorage.set('topola-config', localConf)
    return ''
  }
  function getLocalTopolaConfig() {
    let topolaConfig = LocalStorage.getItem('topola-config')
    return (
      topolaConfig || {
        topolaChartType: 'HourglassChart',
        topolaRenderer: 'DetailedRenderer',
      }
    )
  }

  return {
    getLocalTopolaConfig,
    updateLocalConfig,
  }
}
