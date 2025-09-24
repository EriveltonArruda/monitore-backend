import { Test, TestingModule } from '@nestjs/testing';
import { NfeImportsService } from './nfe-imports.service';

describe('NfeImportsService', () => {
  let service: NfeImportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NfeImportsService],
    }).compile();

    service = module.get<NfeImportsService>(NfeImportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
