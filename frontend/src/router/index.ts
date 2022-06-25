import Vue from 'vue';
import VueRouter, { NavigationGuardNext, Route, RouteConfig } from 'vue-router';
import { getModule } from 'vuex-module-decorators';

import store, { App } from '@/store';
import MainMenu from '../views/MainMenu.vue';
import { auth } from './auth';
import { mainMenu } from './main-menu';
import { game } from './game';
import { scenario } from './scenario';
import { Role } from './roles';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  ...auth,
  ...game,
  ...scenario,
  {
    path: '/',
    name: 'MainMenu',
    component: MainMenu,
    children: mainMenu
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

const app = getModule(App, store);

const redirectFromAuthForLoggedIn = (to: Route, next: NavigationGuardNext<Vue>) => {
  // Redirect logged in user from pages intended for unregistered
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
