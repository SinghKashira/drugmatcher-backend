import { Test, TestingModule } from '@nestjs/testing';
import { FilematcherService } from './filematcher.service';

describe('FilematcherService', () => {
  let service: FilematcherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FilematcherService],
    }).compile();

    service = module.get<FilematcherService>(FilematcherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
