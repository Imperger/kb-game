import { Test, TestingModule } from '@nestjs/testing';
import { ConfigHelperService } from './config-helper.service';

describe('ConfigService', () => {
  let service: ConfigHelperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigHelperService]
    }).compile();

    service = module.get<ConfigHelperService>(ConfigHelperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
