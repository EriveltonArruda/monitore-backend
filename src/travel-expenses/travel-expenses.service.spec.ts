import { Test, TestingModule } from '@nestjs/testing';
import { TravelExpensesService } from './travel-expenses.service';

describe('TravelExpensesService', () => {
  let service: TravelExpensesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TravelExpensesService],
    }).compile();

    service = module.get<TravelExpensesService>(TravelExpensesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
