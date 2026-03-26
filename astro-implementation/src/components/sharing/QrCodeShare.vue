<template>
  <div class="qr-section">
    <div class="qr-label">Scan code below to navigate to this page from another device</div>
    <img
      v-if="qrDataUrl"
      :src="qrDataUrl"
      alt="QR code for this page"
      width="180"
      height="180"
    />
  </div>
</template>

<script>
// Adapted from QrCodeShare.vue in the Quasar project.
// Key changes:
//  - Replaced @vueuse/integrations/useQRCode with direct use of the qrcode library.
//  - Replaced $route.href with window.location.href.

import QRCode from 'qrcode'

export default {
  props: {
    urlProp: { type: String, default: null },
  },
  data() {
    return {
      qrDataUrl: '',
    }
  },
  computed: {
    urlForQr() {
      if (this.urlProp) return this.urlProp
      if (typeof window !== 'undefined') return window.location.href
      return ''
    },
  },
  watch: {
    urlForQr: {
      immediate: true,
      async handler(newVal) {
        if (newVal) {
          this.qrDataUrl = await QRCode.toDataURL(newVal, {
            errorCorrectionLevel: 'H',
            margin: 3,
          })
        }
      },
    },
  },
}
</script>
