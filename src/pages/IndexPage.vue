<template>
  <q-page class="flex flex-center">
    <div class="row">
      <div class="col-sm-12">
        <ProjectIntro></ProjectIntro>
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
