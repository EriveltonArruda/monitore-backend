import { Test, TestingModule } from '@nestjs/testing';
import { TravelExpensesController } from './travel-expenses.controller';
import { TravelExpensesService } from './travel-expenses.service';

describe('TravelExpensesController', () => {
  let controller: TravelExpensesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TravelExpensesController],
      providers: [TravelExpensesService],
    }).compile();

    controller = module.get<TravelExpensesController>(TravelExpensesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
