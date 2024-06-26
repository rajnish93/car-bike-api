import { Test, TestingModule } from '@nestjs/testing';
import { LoadFileController } from './load-file.controller';
import { LoadFileService } from './load-file.service';

describe('LoadFileController', () => {
  let controller: LoadFileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoadFileController],
      providers: [LoadFileService],
    }).compile();

    controller = module.get<LoadFileController>(LoadFileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
