<template>
  <div class="admin-login-page">
    <div class="admin-login-card">
      <h1 class="admin-login-title">Family Tree Admin</h1>
      <p class="admin-login-sub">Sign in to manage your tree</p>

      <form @submit.prevent="handleLogin" class="admin-login-form">
        <div class="admin-field">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            autofocus
            placeholder="you@example.com"
          />
        </div>

        <div class="admin-field">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="••••••••"
          />
        </div>

        <div v-if="errorMsg" class="admin-error-banner">{{ errorMsg }}</div>

        <button type="submit" class="admin-btn-primary" :disabled="loading">
          {{ loading ? 'Signing in…' : 'Sign In' }}
        </button>
      </form>

      <a href="/" class="admin-back-link">← Back to site</a>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAuth } from '../../composables/useAuth.js'

const { user, authReady, login } = useAuth()

const email    = ref('')
const password = ref('')
const loading  = ref(false)
const errorMsg = ref('')

// Already signed in — go to dashboard
watch([authReady, user], ([ready, u]) => {
  if (ready && u) window.location.href = '/admin/dashboard'
})

async function handleLogin() {
  errorMsg.value = ''
  loading.value = true
  try {
    await login(email.value, password.value)
    window.location.href = '/admin/dashboard'
  } catch (e) {
    errorMsg.value = friendlyError(e.code)
  } finally {
    loading.value = false
  }
}

function friendlyError(code) {
  const map = {
    'auth/invalid-credential':     'Incorrect email or password.',
    'auth/user-not-found':         'No account found with that email.',
    'auth/wrong-password':         'Incorrect password.',
    'auth/too-many-requests':      'Too many attempts. Try again later.',
    'auth/network-request-failed': 'Network error. Check your connection.',
  }
  return map[code] ?? 'Sign in failed. Please try again.'
}
</script>
