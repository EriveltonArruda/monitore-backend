import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAccountsPayableDto } from './dto/create-accounts-payable.dto';
import { UpdateAccountsPayableDto } from './dto/update-accounts-payable.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AccountsPayableService {
  constructor(private prisma: PrismaService) {}

  create(createAccountsPayableDto: CreateAccountsPayableDto) {
    // Ao criar, o DTO já garante que o dueDate é uma string de data válida,
    // e o Prisma consegue lidar com essa conversão na criação.
    return this.prisma.accountPayable.create({
      data: createAccountsPayableDto,
    });
  }

  findAll() {
    return this.prisma.accountPayable.findMany({
        orderBy: { dueDate: 'asc' }
    });
  }

  async findOne(id: number) {
    const account = await this.prisma.accountPayable.findUnique({ where: { id } });
    if (!account) {
      throw new NotFoundException(`Conta com ID #${id} não encontrada.`);
    }
    return account;
  }

  async update(id: number, updateAccountsPayableDto: UpdateAccountsPayableDto) {
    await this.findOne(id); // Garante que a conta existe

    // CORREÇÃO APLICADA AQUI:
    // Desestruturamos o DTO para separar a data dos outros dados.
    const { dueDate, ...restData } = updateAccountsPayableDto;

    // Criamos o objeto de dados para atualização.
    const dataToUpdate: any = { ...restData };

    // Se a data de vencimento foi enviada, nós a convertemos para um objeto Date
    // que o Prisma entende e aceita para a atualização.
    if (dueDate) {
      dataToUpdate.dueDate = new Date(dueDate);
    }
    
    return this.prisma.accountPayable.update({
      where: { id },
      data: dataToUpdate, // Usamos os dados já tratados
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.accountPayable.delete({
      where: { id },
    });
  }
}
