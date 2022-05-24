import Vue from 'vue';
import VueRouter, { NavigationGuardNext, Route, RouteConfig } from 'vue-router';
import { getModule } from 'vuex-module-decorators';

import store, { App } from '@/store';
import MainMenu from '../views/MainMenu.vue';
import { auth } from './auth';
import { mainMenu } from './main-menu';
import { Role } from './roles';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  ...auth,
  {
    path: '/',
    name: 'MainMenu',
    component: MainMenu,
    children: mainMenu
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

const app = getModule(App, store);

const redirectFromAuthForLoggedIn = (to: Route, next: NavigationGuardNext<Vue>) => {
  if (to.meta?.role === Role.Noname && app.loggedIn) {
    next({ name: 'MainMenu' });
  }
};

router.beforeEach(async (to: Route, from: Route, next) => {
  try {
    await app.waitInitializationFor(3000);

    redirectFromAuthForLoggedIn(to, next);

    next();
  } catch (e) {
    next({ name: 'Login' });
  }
});

export default router;
