import { Module } from '@nestjs/common';
import { NfeImportsService } from './nfe-imports.service';
import { NfeImportsController } from './nfe-imports.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [NfeImportsController],
  providers: [NfeImportsService, PrismaService],
})
export class NfeImportsModule { }
