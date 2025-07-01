import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { AccountsPayableService } from './accounts-payable.service';
import { CreateAccountsPayableDto } from './dto/create-accounts-payable.dto';
import { UpdateAccountsPayableDto } from './dto/update-accounts-payable.dto';

@Controller('accounts-payable')
export class AccountsPayableController {
  constructor(private readonly accountsPayableService: AccountsPayableService) {}

  @Post()
  create(@Body() createAccountsPayableDto: CreateAccountsPayableDto) {
    return this.accountsPayableService.create(createAccountsPayableDto);
  }

  @Get()
  findAll() {
    return this.accountsPayableService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.accountsPayableService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateAccountsPayableDto: UpdateAccountsPayableDto) {
    return this.accountsPayableService.update(id, updateAccountsPayableDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.accountsPayableService.remove(id);
  }
}