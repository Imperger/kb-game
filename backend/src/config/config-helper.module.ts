import { Module } from '@nestjs/common';
import { ConfigHelperService } from './config-helper.service';

@Module({
  providers: [ConfigHelperService],
  exports: [ConfigHelperService]
})
export class ConfigHelperModule {}
