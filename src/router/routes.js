const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'rLandingPage',
        component: () => import('pages/IndexPage.vue'),
      },
      {
        path: 'static-data',
        name: 'rTopolaStaticDataPage',
        component: () => import('pages/TopolaStaticDataPage.vue'),
      },
    ],
  },

  // ─── Admin ──────────────────────────────────────────────────────────────────

  {
    path: '/admin/login',
    name: 'rAdminLogin',
    component: () => import('pages/admin/AdminLoginPage.vue'),
  },
  {
    path: '/admin',
    component: () => import('layouts/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/admin/dashboard' },
      {
        path: 'dashboard',
        name: 'rAdminDashboard',
        component: () => import('pages/admin/AdminDashboardPage.vue'),
      },
      {
        path: 'individuals',
        name: 'rAdminIndividuals',
        component: () => import('pages/admin/AdminIndividualsPage.vue'),
      },
      {
        path: 'individuals/:id/edit',
        name: 'rAdminIndividualEdit',
        component: () => import('pages/admin/AdminIndividualEditPage.vue'),
      },
      {
        path: 'families',
        name: 'rAdminFamilies',
        component: () => import('pages/admin/AdminFamiliesPage.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
