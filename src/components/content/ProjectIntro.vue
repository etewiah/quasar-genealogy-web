<template>
  <div class="ProjectIntro row no-flashing-caret">
    <div class="q-mx-md col-xs-12 intro-cont q-mt-md">
      <div class="row max-ctr q-pb-lg">
        <div class="col-sm-12 text-center">
          <div class="q-pb-sm q-mt-none q-pt-lg q-mr-none">
            <h2 class="proj-intro-main q-mb-none text-h4"
                style="margin-top: 0px">
              <span style="color: black"
                    class="hhwyf">Genealogy site built with <a href="https://quasar.dev/">Quasar</a> and <a
                   href="https://vuejs.org/">Vue</a>.</span>
            </h2>
          </div>
        </div>
        <div class="col-xs-12 col-md-8 offset-md-2">
          <div class="proj-intro-content-inner q-mt-none q-pt-lg q-mr-md">
            <p class="text-subtitle1 text-left">
              This is a hosted demo of the tool who's source code that can be found here: <a
                 href="https://github.com/etewiah/quasar-genealogy-web">https://github.com/etewiah/quasar-genealogy-web</a>
            </p>
            <p class="text-subtitle1 text-left">
              It is a tool for exploring genealogical trees, allowing users to navigate through the
              family's hierarchical structure.
            </p>
            <p class="text-subtitle1 text-left">
              It uses the fantastic topola library (<a
                 href="https://github.com/PeWu/topola">https://github.com/PeWu/topola</a>) and
              can be considered a more basic version of (<a
                 href="https://github.com/PeWu/topola-viewer">https://github.com/PeWu/topola-viewer</a>)
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="col-xs-12 links-list">
      <q-list padding
              class="justify-center flex items-center"
              style="max-width: 100vw">
        <q-item clickable
                v-ripple>
          <q-item-section>
            <q-item-label class="text-h6"
                          lines="1"
                          style="">
              <router-link class=""
                           :to="{ name: 'rTopolaStaticDataPage', params: {} }">
                Demo With Kennedys Family Tree
              </router-link>
            </q-item-label>
          </q-item-section>
        </q-item>

      </q-list>
    </div>
  </div>
</template>
<script>
import { defineComponent, ref } from "vue"
export default defineComponent({
  name: "ProjectIntro",
})
</script>
<style scoped></style>
