import { PartialType } from '@nestjs/mapped-types';
import { CreateAccountsPayableDto } from './create-accounts-payable.dto';
import { IsInt, IsOptional } from 'class-validator';

export class UpdateAccountsPayableDto extends PartialType(CreateAccountsPayableDto) {
  @IsInt()
  @IsOptional()
  installments?: number | null;

  @IsInt()
  @IsOptional()
  currentInstallment?: number | null;
}