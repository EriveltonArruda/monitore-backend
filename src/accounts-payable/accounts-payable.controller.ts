import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { AccountsPayableService } from './accounts-payable.service';
import { CreateAccountsPayableDto } from './dto/create-accounts-payable.dto';
import { UpdateAccountsPayableDto } from './dto/update-accounts-payable.dto';

@Controller('accounts-payable')
export class AccountsPayableController {
  constructor(private readonly accountsPayableService: AccountsPayableService) { }

  // ✅ Criação de conta a pagar
  // Aceita campos de recorrência: isRecurring, recurringUntil
  @Post()
  create(@Body() createAccountsPayableDto: CreateAccountsPayableDto) {
    return this.accountsPayableService.create(createAccountsPayableDto);
  }

  // ✅ Listagem paginada com filtro opcional por mês e ano
  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.accountsPayableService.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      month: month ? Number(month) : undefined,
      year: year ? Number(year) : undefined,
    });
  }

  // ✅ Detalhamento de uma conta por ID
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.accountsPayableService.findOne(id);
  }

  // ✅ Atualização de uma conta
  // Aceita alterações de recorrência, além dos campos normais
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAccountsPayableDto: UpdateAccountsPayableDto,
  ) {
    return this.accountsPayableService.update(id, updateAccountsPayableDto);
  }

  // ✅ Exclusão de conta e pagamentos vinculados
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.accountsPayableService.remove(id);
  }
}
