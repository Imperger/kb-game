import { RouteConfig } from 'vue-router';

import GameLobby from './GameLobby.vue';
import QuickGameLobby from './QuickGameLobby.vue';
import GameView from './GameView.vue';

export const game: Array<RouteConfig> = [
  {
    path: '/game/lobby',
    name: 'GameLobby',
    component: GameLobby
  },
  {
    path: '/game/q_lobby',
    name: 'QuickGameLobby',
    component: QuickGameLobby
  },
  {
    path: '/game/play',
    name: 'GameView',
    component: GameView
  }
];
