<template>
  <q-page class="flex flex-center">
    <div class="row">
      <div class="col-sm-12">
        <ProjectIntro></ProjectIntro>
      </div>
      <div class="col-sm-12">
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
  </q-page>
</template>

<script setup>
import ProjectIntro from 'components/content/ProjectIntro.vue'
defineOptions({
  name: 'IndexPage'
});
</script>
