import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAccountsPayableDto } from './dto/create-accounts-payable.dto';
import { UpdateAccountsPayableDto } from './dto/update-accounts-payable.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

// A interface de parâmetros agora inclui os filtros de data
interface FindAllAccountsParams {
  page: number;
  limit: number;
  month?: number;
  year?: number;
}

@Injectable()
export class AccountsPayableService {
  constructor(private prisma: PrismaService) { }

  create(createAccountsPayableDto: CreateAccountsPayableDto) {
    const { installmentType } = createAccountsPayableDto;

    // Se for pagamento único, zera as parcelas
    if (installmentType === 'UNICA') {
      createAccountsPayableDto.installments = null;
      createAccountsPayableDto.currentInstallment = null;
    }

    return this.prisma.accountPayable.create({
      data: createAccountsPayableDto,
    });
  }

  async findAll(params: FindAllAccountsParams) {
    const { page, limit, month, year } = params;
    const skip = (page - 1) * limit;

    // Construímos a cláusula 'where' dinamicamente
    const where: Prisma.AccountPayableWhereInput = {};

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0); // O dia 0 do próximo mês é o último dia do mês atual
      where.dueDate = {
        gte: startDate, // Maior ou igual ao primeiro dia do mês
        lte: endDate,   // Menor ou igual ao último dia do mês
      };
    }

    const [accounts, total] = await this.prisma.$transaction([
      this.prisma.accountPayable.findMany({
        where,
        orderBy: { dueDate: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.accountPayable.count({ where }),
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
    const existingAccount = await this.findOne(id);

    const dataToUpdate: any = { ...updateAccountsPayableDto };

    // Converte a data se necessário
    if (updateAccountsPayableDto.dueDate) {
      dataToUpdate.dueDate = new Date(updateAccountsPayableDto.dueDate);
    }

    // Verifica se o status foi alterado para "PAGO"
    const statusUpdatedToPaid = updateAccountsPayableDto.status === 'PAGO';

    // Atualiza a parcela atual para "PAGO"
    const updatedAccount = await this.prisma.accountPayable.update({
      where: { id },
      data: dataToUpdate,
    });

    // Se for parcelado, status foi alterado para PAGO e ainda restam parcelas...
    if (
      statusUpdatedToPaid &&
      existingAccount.installmentType === 'PARCELADO' &&
      existingAccount.currentInstallment &&
      existingAccount.installments &&
      existingAccount.currentInstallment < existingAccount.installments
    ) {
      const nextInstallment = existingAccount.currentInstallment + 1;

      // Calcula a nova data de vencimento adicionando um mês
      const currentDueDate = new Date(existingAccount.dueDate);
      const nextDueDate = new Date(currentDueDate.setMonth(currentDueDate.getMonth() + 1));

      // Cria a nova parcela no banco de dados
      await this.prisma.accountPayable.create({
        data: {
          name: existingAccount.name,
          category: existingAccount.category,
          value: existingAccount.value,
          dueDate: nextDueDate,
          status: 'A_PAGAR',
          installmentType: 'PARCELADO',
          installments: existingAccount.installments,
          currentInstallment: nextInstallment,
        },
      });
    }

    return updatedAccount;
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.accountPayable.delete({
      where: { id },
    });
  }
}