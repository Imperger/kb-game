import { Test, TestingModule } from '@nestjs/testing';
import { SpawnerController } from './spawner.controller';

describe('Spawner Controller', () => {
  let controller: SpawnerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpawnerController],
    }).compile();

    controller = module.get<SpawnerController>(SpawnerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
