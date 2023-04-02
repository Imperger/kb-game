import { Module } from '@nestjs/common';

import { EloCalculatorService } from './elo-calculator.service';
import { exponentialDistribution } from './score-distribution/exponential-distribution';

@Module({
  providers: [
    {
      provide: EloCalculatorService,
      useFactory: () =>
        new EloCalculatorService(400, 32, exponentialDistribution)
    }
  ],
  exports: [EloCalculatorService]
})
export class ScoringModule {}
