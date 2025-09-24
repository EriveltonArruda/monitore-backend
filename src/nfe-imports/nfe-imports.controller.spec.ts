import { Test, TestingModule } from '@nestjs/testing';
import { NfeImportsController } from './nfe-imports.controller';
import { NfeImportsService } from './nfe-imports.service';

describe('NfeImportsController', () => {
  let controller: NfeImportsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NfeImportsController],
      providers: [NfeImportsService],
    }).compile();

    controller = module.get<NfeImportsController>(NfeImportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
