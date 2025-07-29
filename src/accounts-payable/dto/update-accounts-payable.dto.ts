import { PartialType } from '@nestjs/mapped-types';
import { CreateAccountsPayableDto } from './create-accounts-payable.dto';
import {
  IsInt,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsString,
  IsNumberString
} from 'class-validator';

export class UpdateAccountsPayableDto extends PartialType(CreateAccountsPayableDto) {
  // Sobrescreve os campos para garantir validação clara
  @IsInt()
  @IsOptional()
  installments?: number | null;

  @IsInt()
  @IsOptional()
  currentInstallment?: number | null;

  // ✅ Campo adicional para edição da recorrência
  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  // ✅ Permite editar a data final da recorrência
  @IsDateString()
  @IsOptional()
  recurringUntil?: Date;

  @IsOptional()
  @IsNumberString()
  paymentAmount?: string | number;
  bankAccount?: string;
  paidAt?: Date;
}
