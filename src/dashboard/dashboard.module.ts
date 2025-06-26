import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule], // Importa o Prisma para que o Service possa usá-lo
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
