import { RouteConfig } from 'vue-router';

import MainMenuHome from '@/views/main-menu/MainMenuHome.vue';
import MainMenuPlay from '@/views/main-menu/MainMenuPlay.vue';
import MainMenuServer from '@/views/main-menu/MainMenuServer.vue';
import ServerBrowser from '@/views/server-browser/ServerBrowser.vue';

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
  },
  {
    path: 'play/server_browser',
    name: 'MainMenuServerBrowser',
    component: ServerBrowser
  },
  {
    path: 'server',
    name: 'MainMenuServer',
    component: MainMenuServer
  }
];
