<template>
  <q-page class="flex flex-center">
    <TopolaExample :topolaData="topolaData" />
    <!-- <img alt="Quasar logo"
         src="~assets/quasar-logo-vertical.svg"
         style="width: 200px; height: 200px"> -->
  </q-page>
</template>

<script setup>
import TopolaExample from 'components/TopolaExample.vue'
defineOptions({
  name: 'TopolaStaticDataPage'
});

const topolaData = {
  indis: [
    {
      id: 'I1',
      firstName: 'John',
      lastName: 'Smith',
      famc: 'F1',
    },
    {
      id: 'I2',
      firstName: 'Peter',
      lastName: 'Smith',
      fams: ['F1'],
    },
    {
      id: 'I3',
      firstName: 'Laura',
      lastName: 'Abbot',
      fams: ['F1'],
    },
  ],
  fams: [
    {
      id: 'F1',
      husb: 'I2',
      wife: 'I3',
      children: ['I1'],
    },
  ],
};
</script>
