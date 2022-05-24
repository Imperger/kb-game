import { RouteConfig } from 'vue-router';

import MainMenuHome from '@/views/main-menu/MainMenuHome.vue';
import MainMenuPlay from '@/views/main-menu/MainMenuPlay.vue';

export const mainMenu: Array<RouteConfig> = [
  {
    path: 'home',
    name: 'MainMenuHome',
    component: MainMenuHome
  },
  {
    path: 'play',
    name: 'MainMenuPlay',
    component: MainMenuPlay
  }
];
