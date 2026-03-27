<template>
  <div class="admin-login-page">
    <div class="admin-login-card">
      <h1 class="admin-login-title">Family Tree Admin</h1>
      <p class="admin-login-sub">Enter the admin password to continue</p>

      <form @submit.prevent="handleLogin" class="admin-login-form">
        <div class="admin-field">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            autofocus
            placeholder="••••••••"
          />
        </div>

        <div v-if="errorMsg" class="admin-error-banner">{{ errorMsg }}</div>

        <button type="submit" class="admin-btn-primary">Sign In</button>
      </form>

      <a href="/" class="admin-back-link">← Back to site</a>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '../../composables/useAuth.js'

const { isAuthed, login } = useAuth()

// Already authed — skip login
if (isAuthed()) window.location.href = '/admin/dashboard'

const password = ref('')
const errorMsg = ref('')

function handleLogin() {
  errorMsg.value = ''
  try {
    login(password.value)
    window.location.href = '/admin/dashboard'
  } catch (e) {
    errorMsg.value = e.message
  }
}
</script>
