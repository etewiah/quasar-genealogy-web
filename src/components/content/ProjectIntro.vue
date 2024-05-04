<template>
  <div class="ProjectIntro row no-flashing-caret">
    <div class="q-mx-md col-xs-12 intro-cont q-mt-md">
      <div class="row max-ctr q-pb-lg">
        <div class="col-sm-12 text-center">
          <div class="q-pb-sm q-mt-none q-pt-lg q-mr-none">
            <h2 class="proj-intro-main q-mb-none text-h4"
                style="margin-top: 0px">
              <span style="color: black"
                    class="hhwyf">A shared space for digging into our genealogy</span>
            </h2>
          </div>
        </div>
        <div class="col-xs-12 col-md-8 offset-md-2">
          <div class="proj-intro-content-inner q-mt-none q-pt-lg q-mr-md">
            <div class="text-h6 text-left">
              This project is currently mainly about displaying gedcom data.
            </div>

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
                Topola example with static data
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
