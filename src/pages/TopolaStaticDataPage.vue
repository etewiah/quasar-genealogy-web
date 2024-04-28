<template>
  <q-page class="flex flex-center">
    <TopolaWrapper :topolaData="topolaData"
                   chartType="RelativesChart"
                   renderer="DetailedRenderer" />
  </q-page>
</template>

<script setup>
import TopolaWrapper from 'components/TopolaWrapper.vue'
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
