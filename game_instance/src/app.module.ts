import { Module } from '@nestjs/common';

import { CustomGameModule } from './custom-game/custom-game.module';
import { QuickGameModule } from './quick-game/quick-game.module';

function InjectGameModule() {
  switch (process.env.GAME_TYPE?.toLowerCase()) {
    case 'custom':
      return CustomGameModule;
    case 'quick':
      return QuickGameModule;
    default:
      throw new Error('Unknown game type');
  }
}

@Module({
  imports: [InjectGameModule()],
})
export class AppModule {}
