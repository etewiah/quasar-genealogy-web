<template>
  <div v-if="currentPerson">
    <div>Focus on</div>
    <div class="text-h6"> {{ fullPersonName }}</div>
    <div class="text-subtitle1"> {{ birthInformation }}</div>
    <div class="text-subtitle1"> {{ notesAboutPerson }}</div>
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
  computed: {
    birthInformation() {
      if (this.currentPerson.birth.place) {
        let birthInformation = `${this.currentPerson.firstName} ${this.currentPerson.lastName} was born in ${this.currentPerson.birth.place}`
        if (this.currentPerson.death.place) {
          birthInformation = `${birthInformation} and died in ${this.currentPerson.death.place}`
        }
        return birthInformation
      } else {
        return ""
      }
    },
    notesAboutPerson() {
      return ""
      // Disabling for now
      // if (this.currentPerson.notes) {
      //   let notesAboutPerson = ""
      //   this.currentPerson.notes.forEach(personNote => {
      //     notesAboutPerson = `${notesAboutPerson} ${personNote}`
      //   });
      //   return notesAboutPerson
      // } else {
      //   return ""
      // }
    },
    fullPersonName() {
      return `${this.currentPerson.firstName} ${this.currentPerson.lastName}`
    }
  },
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
