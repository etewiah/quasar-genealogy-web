<template>
  <div class="social-sharing-comp">
    <!-- <q-no-ssr></q-no-ssr> -->
    <!-- <q-page-sticky expand position="bottom"> </q-page-sticky> -->
    <div class="text-subtitle1 q-pa-md text-center">
      {{ socialSharingPrompt || "Share this with your friends" }}
    </div>
    <div class="mt-6 flex justify-center">
      <div class="q-pa-sm ssc-fb">
        <a class="fb-share-link transform border-solid border border-white rounded-full w-12 h-12 flex justify-center items-center"
           target="_blank"
           rel="nofollow noreferrer"
           :href="`//www.facebook.com/sharer/sharer.php?u=${urlToShare}`">
          <q-icon :name="mdiFacebook"
                  class="text-white"
                  style="font-size: 2rem; padding: 8px" />
        </a>
      </div>
      <div class="q-pa-sm ssc-tw">
        <a class="tw-share-link hover:scale-125 border-none rounded-full w-12 h-12 flex justify-center items-center"
           target="_blank"
           rel="nofollow noreferrer"
           :href="`https://twitter.com/intent/tweet?text=${titleToUse} ${urlToShare}`">
          <q-icon :name="mdiTwitter"
                  class="text-white"
                  style="font-size: 2rem; padding: 8px" />
        </a>
      </div>
      <div class="q-pa-sm ssc-wap">
        <a class="whatsapp-share-link hover:scale-125 border-none rounded-full flex justify-center items-center"
           target="_blank"
           rel="nofollow noreferrer"
           :href="`https://wa.me/?text=${titleToUse} ${urlToShare}`">
          <q-icon :name="mdiWhatsapp"
                  class="text-white"
                  style="font-size: 2rem; padding: 8px" />
        </a>
      </div>
      <div class="q-pa-sm ssc-ln">
        <a class="linked-in-share-link hover:scale-125 transform border-none rounded-full flex justify-center items-center"
           target="_blank"
           rel="nofollow noreferrer"
           :href="`//www.linkedin.com/shareArticle?mini=true&url=${urlToShare}&title=${titleToUse}`">
          <q-icon :name="mdiLinkedin"
                  class="text-white"
                  style="font-size: 2rem; padding: 8px" />
        </a>
      </div>
      <div class="q-pa-sm ssc-email">
        <a class="email-share-link hover:scale-125 transform border-none rounded-full flex justify-center items-center"
           target="_blank"
           rel="nofollow noreferrer"
           :href="`mailto:?subject=${titleToUse}&body=${urlToShare}`">
          <q-icon :name="mdiEmailBox"
                  class="text-white"
                  style="font-size: 2rem; padding: 8px" />
        </a>
      </div>
    </div>
  </div>
</template>
<script>
// import { ref, toRef, watch } from "vue"
import {
  mdiTwitter,
  mdiLinkedin,
  mdiEmailBox,
  mdiFacebook,
  mdiWhatsapp,
} from "@quasar/extras/mdi-v5"
export default {
  created() {
    this.mdiTwitter = mdiTwitter
    this.mdiLinkedin = mdiLinkedin
    this.mdiEmailBox = mdiEmailBox
    this.mdiFacebook = mdiFacebook
    this.mdiWhatsapp = mdiWhatsapp
  },
  data() {
    return {}
  },
  props: {
    urlProp: {
      type: String,
    },
    socialSharingTitle: {
      type: String,
    },
    socialSharingPrompt: {
      type: String,
    },
  },
  watch: {},
  computed: {
    titleToUse() {
      return this.socialSharingTitle || "Check this out:"
    },
    urlToShare() {
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
<style scoped>
.whatsapp-share-link {
  background-color: #00bf8f !important;
}

.fb-share-link {
  background-color: #3b5998;
}

.linked-in-share-link {
  background-color: #007bb5;
}

.tw-share-link {
  background-color: #55acee;
}

.email-share-link {
  background-color: #00bf8f;
}

.rounded-full {
  border-radius: 9999px;
}
</style>
