import { Test, TestingModule } from '@nestjs/testing';
import { FilematcherController } from './filematcher.controller';

describe('FilematcherController', () => {
  let controller: FilematcherController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilematcherController],
    }).compile();

    controller = module.get<FilematcherController>(FilematcherController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
