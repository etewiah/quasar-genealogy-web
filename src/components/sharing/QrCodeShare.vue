<template>
  <div class="text-center q-py-xl q-mb-xl">
    <q-no-ssr>
      <div class="text-subtitle1 q-py-md">
        Scan code below to navigate to this page from another device
      </div>
      <!-- <div>Text content for QRCode</div>
    <input v-model="text" type="text" /> -->
      <img v-if="urlForQr"
           class="mt-6 mb-2 rounded border"
           :src="qrCodeToShow"
           :alt="qrCodeTitle" />
    </q-no-ssr>
  </div>
</template>
<script>
import { useQRCode } from "@vueuse/integrations/useQRCode"
import { ref } from "vue"
export default {
  setup() {
    const qrText = ref("https://propertysquares.com")
    const qrCodeToShow = useQRCode(qrText, {
      errorCorrectionLevel: "H",
      margin: 3,
    })
    return { qrText, qrCodeToShow }
  },
  data() {
    return {}
  },
  props: {
    urlProp: {
      type: String,
    },
    qrCodeTitle: {
      type: String,
    },
  },
  watch: {
    urlForQr: {
      immediate: true,
      handler(newVal, oldVal) {
        if (newVal && newVal.length > 0) {
          this.qrText = newVal
        }
      },
    },
  },
  computed: {
    urlForQr() {
      let origin = ""
      if (typeof window !== "undefined") {
        origin = window.location.origin
      }
      // TODO - figure out way of ensuring origin is available - even when server rendered
      return this.urlProp || `${origin}${this.$route.href}`
    },
  },
}
</script>
