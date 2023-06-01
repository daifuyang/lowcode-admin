export default [
  {
    path: '/admin',
    layout: false,
    routes: [
      {
        name: 'login',
        path: '/admin/login',
        component: './admin/Login',
      },
      {
        component: './404',
      },
    ],
  },
  {
    path: '/',
    redirect: '/workspace',
  },
  {
    path: '/workspace',
    name: 'workspace',
    icon: 'smile',
    component: './Workspace',
  },
  {
    path: '/:siteId/',
    name: 'site',
    component: '@/layouts/BasicLayout',
    routes: [
      {
        path: './',
        redirect: '/:siteId/admin/form',
      },
      {
        path: 'admin',
        redirect: '/:siteId/admin/form',
      },
      {
        path: '/:siteId/admin/form',
        exact: true,
        component: './admin/Form',
      },
      {
        path: '/:siteId/admin/form/:id',
        component: './admin/Form',
      },
      {
        component: './404',
      },
    ],
  },
  {
    component: './404',
  },
];
