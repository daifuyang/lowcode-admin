﻿export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: './admin/Login',
      },
      {
        component: './404',
      },
    ],
  },
  {
    path: '/404',
    layout: false,
    component: './404',
  },
  {
    path: '/:siteId/login',
    layout: false,
    component: './ram/Login',
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
        component: './Layout404',
      },
    ],
  },
  {
    component: './404',
  },
];
