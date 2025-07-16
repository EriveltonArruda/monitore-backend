import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAccountsPayableDto } from './dto/create-accounts-payable.dto';
import { UpdateAccountsPayableDto } from './dto/update-accounts-payable.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AccountsPayableService {
  constructor(private prisma: PrismaService) { }

  create(createAccountsPayableDto: CreateAccountsPayableDto) {
    return this.prisma.accountPayable.create({
      data: createAccountsPayableDto,
    });
  }

  // O método agora é 'async' e retorna um objeto paginado
  async findAll(params: { page: number, limit: number }) {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [accounts, total] = await this.prisma.$transaction([
      this.prisma.accountPayable.findMany({
        orderBy: { dueDate: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.accountPayable.count(),
    ]);

    return {
      data: accounts,
      total,
    };
  }

  async findOne(id: number) {
    const account = await this.prisma.accountPayable.findUnique({ where: { id } });
    if (!account) {
      throw new NotFoundException(`Conta com ID #${id} não encontrada.`);
    }
    return account;
  }

  async update(id: number, updateAccountsPayableDto: UpdateAccountsPayableDto) {
    await this.findOne(id);

    const dataToUpdate: any = { ...updateAccountsPayableDto };
    if (updateAccountsPayableDto.dueDate) {
      dataToUpdate.dueDate = new Date(updateAccountsPayableDto.dueDate);
    }

    return this.prisma.accountPayable.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.accountPayable.delete({
      where: { id },
    });
  }
}