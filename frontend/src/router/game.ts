import { RouteConfig } from 'vue-router';

import GameLobby from '@/views/game/GameLobby.vue';
import GameView from '@/views/game/GameView.vue';

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
