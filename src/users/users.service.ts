import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { ChangePasswordDto } from './dto/change-password.dto'; // Importamos o novo DTO

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
      // Excluímos o campo de senha da resposta por segurança
      select: { id: true, name: true, email: true, createdAt: true, updatedAt: true }
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      }
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // Este método busca um usuário para garantir que ele existe antes de uma ação.
  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true }
    });
    if (!user) {
      throw new NotFoundException(`Usuário com ID #${id} não encontrado.`);
    }
    return user;
  }

  // NOVO MÉTODO: Altera a senha de um usuário.
  async changePassword(id: number, changePasswordDto: ChangePasswordDto) {
    await this.findOne(id); // Garante que o usuário existe

    const hashedPassword = await bcrypt.hash(changePasswordDto.password, 10);

    return this.prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
      select: { id: true, name: true, email: true } // Retorna o usuário sem a senha
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Reutiliza o findOne para checar a existência
    return this.prisma.user.delete({
      where: { id },
    });
  }
}