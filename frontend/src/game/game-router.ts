import { RouteConfig } from 'vue-router';

import GameLobby from './GameLobby.vue';
import GameView from './GameView.vue';

export const game: Array<RouteConfig> = [
  {
    path: '/game/lobby',
    name: 'GameLobby',
    component: GameLobby
  },
  {
    path: '/game/play',
    name: 'GameView',
    component: GameView
  }
];
