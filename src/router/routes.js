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

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
