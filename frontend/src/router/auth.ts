import { RouteConfig } from 'vue-router';

import Register from '../views/Register.vue';
import Login from '../views/Login.vue';

export const auth: Array<RouteConfig> = [
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/registration/confirm/:code',
    name: 'RegistrationConfirm',
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    component: () => import(/* webpackChunkName: "RegistrationConfirm" */ '../views/RegistrationConfirm.vue'),
    props: true
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  }
];
