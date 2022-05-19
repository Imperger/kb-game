import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import MainMenu from '../views/MainMenu.vue';
import { auth } from './auth';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  ...auth,
  {
    path: '/',
    name: 'MainMenu',
    component: MainMenu
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

export default router;
