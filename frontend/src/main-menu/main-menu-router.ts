import { RouteConfig } from 'vue-router';

import MainMenuHome from './MainMenuHome.vue';
import MainMenuPlay from './MainMenuPlay.vue';
import MainMenuServer from './MainMenuServer.vue';
import ServerBrowser from './play/ServerBrowser.vue';

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
