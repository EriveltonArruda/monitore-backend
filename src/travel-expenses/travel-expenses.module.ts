import { Module } from '@nestjs/common';
import { TravelExpensesService } from './travel-expenses.service';
import { TravelExpensesController } from './travel-expenses.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule], // <-- garante PrismaService no contexto deste módulo
  controllers: [TravelExpensesController],
  providers: [TravelExpensesService],
})
export class TravelExpensesModule { }
