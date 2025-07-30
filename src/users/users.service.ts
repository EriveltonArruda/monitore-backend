// Este é o "cérebro". Ele contém a lógica de negócio e a comunicação com o banco.

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  // Cria um novo usuário, criptografando a senha antes de salvar.
  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    return this.prisma.user.create({
      data: { ...createUserDto, password: hashedPassword },
      select: { id: true, name: true, email: true } // Nunca retorna a senha
    });
  }

  async findAll(params: { page: number, limit: number, search?: string }) {
    const { page, limit, search } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      // Filtra por nome OU email (sensível a SQLite, tire o 'mode' se der erro)
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } }
      ];
    }

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        select: { id: true, name: true, email: true, createdAt: true, updatedAt: true },
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data: users, total };
  }

  // Busca um usuário pelo email, usado no processo de login.
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  // Busca um usuário pelo ID, usado para verificar se ele existe antes de deletar/atualizar.
  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuário com ID #${id} não encontrado.`);
    }
    return user;
  }

  // Altera a senha de um usuário específico.
  async changePassword(id: number, changePasswordDto: ChangePasswordDto) {
    await this.findOne(id);
    const hashedPassword = await bcrypt.hash(changePasswordDto.password, 10);
    return this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
      select: { id: true, name: true, email: true }
    });
  }

  // Remove um usuário do banco de dados.
  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.user.delete({ where: { id } });
  }
}