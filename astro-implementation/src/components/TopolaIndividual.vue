<template>
  <div v-if="currentPerson" class="focused-individual">
    <div class="label">Focused on</div>
    <div class="text-h6">{{ fullPersonName }}</div>
    <div class="text-subtitle1">{{ birthInformation }}</div>
  </div>
</template>

<script>
// Adapted from the Quasar version.
// Key change: receives `currentPerson` directly as a prop instead of looking
// it up via $route.query.personID — navigation in the Astro version causes a
// full page reload, so the parent (FamilyTreeApp) resolves the person once on
// mount and passes it down as a prop.
export default {
  props: {
    currentPerson: {
      type: Object,
      default: null,
    },
  },
  computed: {
    fullPersonName() {
      if (!this.currentPerson) return ''
      return `${this.currentPerson.firstName} ${this.currentPerson.lastName}`
    },
    birthInformation() {
      if (!this.currentPerson?.birth?.place) return ''
      let info = `${this.currentPerson.firstName} ${this.currentPerson.lastName} was born in ${this.currentPerson.birth.place}`
      if (this.currentPerson.death?.place) {
        info += ` and died in ${this.currentPerson.death.place}`
      }
      return info
    },
  },
}
</script>
