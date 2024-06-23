import { Test, TestingModule } from '@nestjs/testing';
import { LoadFileService } from './load-file.service';

describe('LoadFileService', () => {
  let service: LoadFileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoadFileService],
    }).compile();

    service = module.get<LoadFileService>(LoadFileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
