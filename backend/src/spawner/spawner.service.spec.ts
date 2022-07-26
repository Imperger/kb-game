import { Test, TestingModule } from '@nestjs/testing';
import { SpawnerService } from './spawner.service';

describe('SpawnerService', () => {
  let service: SpawnerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SpawnerService]
    }).compile();

    service = module.get<SpawnerService>(SpawnerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
