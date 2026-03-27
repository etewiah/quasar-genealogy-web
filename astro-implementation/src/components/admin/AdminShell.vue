<template>
  <div v-if="!authed" class="admin-loading">
    <p>Redirecting to login…</p>
  </div>

  <div v-else class="admin-shell">
    <nav class="admin-nav" :class="{ open: navOpen }">
      <div class="admin-nav-brand">
        <span>Family Tree Admin</span>
        <button class="admin-nav-close" @click="navOpen = false" aria-label="Close menu">✕</button>
      </div>

      <a href="/admin/dashboard"   class="admin-nav-item" :class="{ active: isActive('/admin/dashboard') }">
        <svg viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
        Dashboard
      </a>
      <a href="/admin/individuals" class="admin-nav-item" :class="{ active: isActive('/admin/individuals') }">
        <svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
        Individuals
      </a>
      <a href="/admin/families"    class="admin-nav-item" :class="{ active: isActive('/admin/families') }">
        <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
        Families
      </a>

      <div class="admin-nav-footer">
        <button class="admin-logout-btn" @click="handleLogout">Sign out</button>
      </div>
    </nav>

    <div v-if="navOpen" class="admin-nav-overlay" @click="navOpen = false"></div>

    <div class="admin-main">
      <header class="admin-topbar">
        <button class="admin-menu-btn" @click="navOpen = true" aria-label="Open menu">
          <svg viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
        </button>
        <a href="/" class="admin-site-link">← View site</a>
      </header>
      <div class="admin-content">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '../../composables/useAuth.js'

const { isAuthed, logout } = useAuth()
const authed = ref(isAuthed())
const navOpen = ref(false)

if (!authed.value) {
  window.location.href = '/admin/login'
}

function isActive(path) {
  return window.location.pathname.startsWith(path)
}

function handleLogout() {
  logout()
  window.location.href = '/admin/login'
}
</script>
