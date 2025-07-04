import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/prisma/prisma.module'; // 1. Importamos o PrismaModule

@Module({
  imports: [PrismaModule], // 2. Adicionamos o PrismaModule aos imports
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // 3. Exportamos o UsersService para o AuthModule poder usá-lo
})
export class UsersModule {}