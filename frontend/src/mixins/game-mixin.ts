import { Component, Vue } from 'vue-property-decorator';
import { GameClient } from '../game/gameplay/game-client';

let gameClient: GameClient | null = null;

@Component
export default class GameMixin extends Vue {
  get gameClient (): GameClient {
    if (!gameClient) {
      gameClient = new GameClient();
    }

    return gameClient;
  }
}
