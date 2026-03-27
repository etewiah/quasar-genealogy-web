<template>
  <div class="fullscreen flex flex-center bg-grey-2">
    <q-card style="min-width: 360px" class="q-pa-md">
      <q-card-section>
        <div class="text-h6">Admin Sign In</div>
        <div class="text-caption text-grey">Family Tree Admin</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="handleLogin" class="q-gutter-md">
          <q-input
            v-model="password"
            label="Password"
            type="password"
            outlined
            autofocus
            :rules="[val => !!val || 'Password is required']"
          />
          <q-banner v-if="errorMessage" class="bg-negative text-white" rounded>
            {{ errorMessage }}
          </q-banner>
          <q-btn
            type="submit"
            label="Sign In"
            color="primary"
            class="full-width"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from 'src/compose/useAuth'

defineOptions({ name: 'AdminLoginPage' })

const router = useRouter()
const { login } = useAuth()

const password = ref('')
const errorMessage = ref('')

function handleLogin() {
  errorMessage.value = ''
  try {
    login(password.value)
    router.push({ name: 'rAdminDashboard' })
  } catch (e) {
    errorMessage.value = e.message
  }
}
</script>
