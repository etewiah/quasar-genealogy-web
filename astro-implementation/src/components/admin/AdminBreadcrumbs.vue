<template>
  <nav class="admin-breadcrumbs">
    <a href="/admin/dashboard">Dashboard</a>
    <span v-for="(crumb, i) in crumbs" :key="i">
      <span class="admin-breadcrumb-sep"> / </span>
      <a v-if="crumb.href" :href="crumb.href">{{ crumb.label }}</a>
      <span v-else class="admin-breadcrumb-current">{{ crumb.label }}</span>
    </span>
  </nav>
</template>

<script setup>
defineProps({ crumbs: { type: Array, default: () => [] } })
</script>
