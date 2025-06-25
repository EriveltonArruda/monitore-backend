// src/prisma/prisma.module.ts
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService], // Registra a "ferramenta" na caixa.
  exports: [PrismaService],   // Deixa a "ferramenta" visível para quem importar esta caixa.
})
export class PrismaModule { }