<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-grey-9">
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="drawerOpen = !drawerOpen" />
        <q-toolbar-title>Family Tree Admin</q-toolbar-title>
        <q-btn flat dense round icon="public" :to="{ name: 'rLandingPage' }" title="View site" />
        <q-btn flat dense round icon="logout" @click="handleLogout" title="Sign out" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="drawerOpen" show-if-above bordered>
      <q-list padding>
        <q-item-label header class="text-weight-bold">Admin</q-item-label>

        <q-item clickable :to="{ name: 'rAdminDashboard' }" active-class="bg-grey-3">
          <q-item-section avatar><q-icon name="dashboard" /></q-item-section>
          <q-item-section>Dashboard</q-item-section>
        </q-item>

        <q-item clickable :to="{ name: 'rAdminIndividuals' }" active-class="bg-grey-3">
          <q-item-section avatar><q-icon name="people" /></q-item-section>
          <q-item-section>Individuals</q-item-section>
        </q-item>

        <q-item clickable :to="{ name: 'rAdminFamilies' }" active-class="bg-grey-3">
          <q-item-section avatar><q-icon name="family_restroom" /></q-item-section>
          <q-item-section>Families</q-item-section>
        </q-item>
      </q-list>

      <q-separator />

      <div class="q-pa-md text-caption text-grey">
        Signed in as<br>
        <strong>{{ user?.email }}</strong>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from 'src/compose/useAuth'

defineOptions({ name: 'AdminLayout' })

const router = useRouter()
const { user, logout } = useAuth()
const drawerOpen = ref(false)

async function handleLogout() {
  await logout()
  router.push({ name: 'rAdminLogin' })
}
</script>
