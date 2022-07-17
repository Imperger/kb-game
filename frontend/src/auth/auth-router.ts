import { RouteConfig } from 'vue-router';

import Register from './Register.vue';
import Login from './Login.vue';
import { Role } from '@/router/roles';

export const auth: Array<RouteConfig> = [
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { role: Role.Noname }
  },
  {
    path: '/registration/confirm/:code',
    name: 'RegistrationConfirm',
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    component: () => import(/* webpackChunkName: "RegistrationConfirm" */ './RegistrationConfirm.vue'),
    props: true
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { role: Role.Noname }
  }
];
