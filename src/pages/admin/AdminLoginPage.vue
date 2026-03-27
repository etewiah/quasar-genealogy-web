<template>
  <q-page class="flex flex-center bg-grey-2">
    <q-card style="min-width: 360px" class="q-pa-md">
      <q-card-section>
        <div class="text-h6">Admin Sign In</div>
        <div class="text-caption text-grey">Family Tree Admin</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="handleLogin" class="q-gutter-md">
          <q-input
            v-model="email"
            label="Email"
            type="email"
            outlined
            autofocus
            :rules="[val => !!val || 'Email is required']"
          />
          <q-input
            v-model="password"
            label="Password"
            type="password"
            outlined
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
            :loading="loading"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from 'src/compose/useAuth'

defineOptions({ name: 'AdminLoginPage' })

const router = useRouter()
const { login } = useAuth()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

async function handleLogin() {
  errorMessage.value = ''
  loading.value = true
  try {
    await login(email.value, password.value)
    router.push({ name: 'rAdminDashboard' })
  } catch (e) {
    errorMessage.value = friendlyError(e.code)
  } finally {
    loading.value = false
  }
}

function friendlyError(code) {
  const map = {
    'auth/invalid-credential':    'Incorrect email or password.',
    'auth/user-not-found':        'No account found with that email.',
    'auth/wrong-password':        'Incorrect password.',
    'auth/too-many-requests':     'Too many attempts. Try again later.',
    'auth/network-request-failed': 'Network error. Check your connection.',
  }
  return map[code] ?? 'Sign in failed. Please try again.'
}
</script>
