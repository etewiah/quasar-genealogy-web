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
            <p class="text-subtitle1 text-left">
              I considered using this library (<a
                 href="https://github.com/donatso/family-chart">https://github.com/donatso/family-chart</a>) but it
              wasn't obvious to me how to use it with gedcom data.
            </p>
            <p class="text-subtitle1 text-left">
              A big shortcoming of the project right now is that all the data comes from a gedcom file that is needs to
              be saved along with the code. The next improvement I'd like to make is to have a backend where the data
              can be saved and manipulated.
            </p>
            <p class="text-subtitle1 text-left">
              I would like to have been able to use the gramps web api as the backend: (<a
                 href="https://github.com/gramps-project/gramps-web-api">https://github.com/gramps-project/gramps-web-api</a>).
              Unfortunately my experience on the backend is with Ruby on Rails. I tried to use the database schema from
              gramps for a new Rails project but they have made what sounds like a bad decision to direcly serialize
              python objects into the database as blobs. As well as making the API slow it makes it pretty difficult to
              use from non-python projects.
            </p>
            <p class="text-subtitle1 text-left">
              I found this Ruby on Rails app which I might use: (<a
                 href="https://github.com/mrysav/geneac">https://github.com/mrysav/geneac</a>). It currently does
              not have an API but that shouldn't be too hard to implement.
            </p>
            <p class="text-subtitle1 text-left">
              Another option I'm considering is to create my own backend from scratch using this schema: (<a
                 href="https://github.com/sedelmeyer/family-genealogy-database">https://github.com/sedelmeyer/family-genealogy-database</a>).
            </p>
            <p class="text-subtitle1 text-left">
              Once I have a robust backend working I'd like to explore what I can do with a bit of AI and existing
              genealogy records. I have plenty of fun ideas but first I need to get the basics working ;)
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
                Demo With Kennedy Family Tree
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
