import { Module } from '@nestjs/common';
import { ReceivablesService } from './receivables.service';
import { ReceivablesController } from './receivables.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ReceivablesController],
  providers: [ReceivablesService],
})
export class ReceivablesModule { }
