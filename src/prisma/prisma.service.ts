// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  // Esta função garante que a conexão com o banco será feita
  // assim que o módulo for iniciado.
  async onModuleInit() {
    await this.$connect();
  }
}