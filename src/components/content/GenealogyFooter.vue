<template>
  <q-footer v-if="timeToShowFooter"
            elevated
            class="gipeties-hunt-foot text-white"
            style="">
    <q-toolbar class="max-ctr text-center ">
      <q-toolbar-title>
        <a class=""
           target="_blank"
           rel="nofollow noreferrer"
           href="https://twitter.com/africajam">
          <q-icon :name="mdiTwitter"
                  class="text-white"
                  style="font-size: 2rem; padding: 8px" />
        </a>
        <a class=""
           target="_blank"
           rel="nofollow noreferrer"
           href="https://github.com/etewiah">
          <q-icon :name="mdiGithub"
                  class="text-white"
                  style="font-size: 2rem; padding: 8px" />
        </a>
      </q-toolbar-title>

    </q-toolbar>
  </q-footer>
</template>
<script>
import { defineComponent, ref } from "vue"
import {
  mdiGithub,
  mdiYoutube,
  mdiTwitter
} from "@quasar/extras/mdi-v5"
export default defineComponent({
  created() {
    this.mdiGithub = mdiGithub
    this.mdiYoutube = mdiYoutube
    this.mdiTwitter = mdiTwitter
  },
  components: {
  },
  name: "GenealogyFooter",
  mounted() {
    setTimeout(() => {
      // footer sometimes loading before rest of page
      // This avoids that
      this.timeToShowFooter = true
      // TODO - investigate if this is affecting pagespeed
      // might want to wrap in a q-no-ssr tag
    }, 500)
  },
  data() {
    return {
      timeToShowFooter: false,
    }
  },
  computed: {},
})
</script>
