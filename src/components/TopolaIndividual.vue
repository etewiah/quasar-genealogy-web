<template>
  <div v-if="currentPerson">
    <div>Focus on</div>
    <div class="text-subtitle1"> {{ currentPerson.firstName }} {{ currentPerson.lastName }}</div>
    <!-- <div>{{ currentPerson }}</div> -->
  </div>
</template>
<script>
export default {
  watch: {
    "$route.query.personID": {
      immediate: true,
      handler: function (newVal) {
        if (newVal && newVal.length > 0) {
          this.updateCurrentUser()
        }
      },
    },
  },
  data: () => ({
    currentPerson: null
  }),
  methods: {
    updateCurrentUser() {
      let currentPersonID = this.$route.query.personID
      this.currentPerson = this.topolaJsonData.indis.find(individual => individual.id === currentPersonID);
    }
  },
  props: {
    topolaJsonData: {
      type: Object,
      required: false,
    },
  },
}
</script>
