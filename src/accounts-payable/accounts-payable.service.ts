import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAccountsPayableDto } from './dto/create-accounts-payable.dto';
import { UpdateAccountsPayableDto } from './dto/update-accounts-payable.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

interface FindAllAccountsParams {
  page: number;
  limit: number;
  month?: number;
  year?: number;
}

@Injectable()
export class AccountsPayableService {
  constructor(private prisma: PrismaService) { }

  // Criação de uma nova conta a pagar
  create(createAccountsPayableDto: CreateAccountsPayableDto) {
    const { installmentType, dueDate } = createAccountsPayableDto;

    if (installmentType === 'UNICA') {
      createAccountsPayableDto.installments = null;
      createAccountsPayableDto.currentInstallment = null;
    }

    // Remove hora da data de vencimento
    if (dueDate) {
      const parsed = new Date(dueDate);
      parsed.setHours(0, 0, 0, 0);
      createAccountsPayableDto.dueDate = parsed;
    }

    return this.prisma.accountPayable.create({
      data: createAccountsPayableDto,
    });
  }

  // Busca paginada com filtros de mês e ano
  async findAll(params: FindAllAccountsParams) {
    const { page, limit, month, year } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.AccountPayableWhereInput = {};

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      endDate.setHours(23, 59, 59, 999);

      where.dueDate = {
        gte: startDate,
        lte: endDate,
      };
    }

    const [accounts, total] = await this.prisma.$transaction([
      this.prisma.accountPayable.findMany({
        where,
        orderBy: { dueDate: 'asc' },
        skip,
        take: limit,
        include: {
          payments: true, // Inclui os pagamentos
        },
      }),
      this.prisma.accountPayable.count({ where }),
    ]);

    return {
      data: accounts,
      total,
    };
  }

  // Busca única por ID
  async findOne(id: number) {
    const account = await this.prisma.accountPayable.findUnique({
      where: { id },
    });

    if (!account) {
      throw new NotFoundException(`Conta com ID #${id} não encontrada.`);
    }

    return account;
  }

  // Atualiza a conta e, se necessário, registra pagamento e gera próxima parcela
  async update(id: number, updateAccountsPayableDto: UpdateAccountsPayableDto) {
    const existingAccount = await this.findOne(id);

    const dataToUpdate: any = { ...updateAccountsPayableDto };

    // Remove a hora da data de vencimento
    if (updateAccountsPayableDto.dueDate) {
      const parsed = new Date(updateAccountsPayableDto.dueDate);
      parsed.setHours(0, 0, 0, 0);
      dataToUpdate.dueDate = parsed;
    }

    const statusUpdatedToPaid = updateAccountsPayableDto.status === 'PAGO';

    // Atualiza a conta sem tentar salvar o campo paidAt (isso é feito na tabela payments)
    const updatedAccount = await this.prisma.accountPayable.update({
      where: { id },
      data: dataToUpdate,
    });

    // Se marcada como paga, registra um pagamento com data/hora atual
    if (statusUpdatedToPaid) {
      await this.prisma.payment.create({
        data: {
          accountId: id,
          paidAt: new Date(),
          amount: updatedAccount.value, // usa o valor da conta atualizada
        },
      });
    }

    // Se for parcelado e ainda tiver parcelas restantes, cria a próxima parcela
    if (
      statusUpdatedToPaid &&
      existingAccount.installmentType === 'PARCELADO' &&
      existingAccount.currentInstallment &&
      existingAccount.installments &&
      existingAccount.currentInstallment < existingAccount.installments
    ) {
      const nextInstallment = existingAccount.currentInstallment + 1;

      const currentDueDate = new Date(existingAccount.dueDate);
      const nextDueDate = new Date(currentDueDate.setMonth(currentDueDate.getMonth() + 1));
      nextDueDate.setHours(0, 0, 0, 0); // Garante que vem sem hora

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

  // Remoção de conta
  async remove(id: number) {
    await this.findOne(id);

    // Apaga todos os pagamentos vinculados à conta
    await this.prisma.payment.deleteMany({
      where: { accountId: id },
    });

    // Agora pode apagar a conta com segurança
    return this.prisma.accountPayable.delete({
      where: { id },
    });
  }

  // Registro de pagamento com data e hora (não utilizado diretamente no update)
  async registerPayment(accountId: number, paidAt: Date) {
    const account = await this.prisma.accountPayable.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new NotFoundException('Conta a pagar não encontrada.');
    }

    if (account.status !== 'PAGO') {
      await this.prisma.accountPayable.update({
        where: { id: accountId },
        data: { status: 'PAGO' },
      });
    }

    return this.prisma.payment.create({
      data: {
        accountId,
        paidAt,
      },
    });
  }
}
