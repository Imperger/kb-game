import { RouteConfig } from 'vue-router';

import PlayerStatsViewer from './PlayerStatsViewer.vue';

export const playerStats: Array<RouteConfig> = [
  {
    path: '/player/:nickname',
    name: 'PlayerStatsViewer',
    component: PlayerStatsViewer,
    props: true
  }
];
