// src/travel-expenses/dto/create-reimbursement.dto.ts
import { IsDefined, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateReimbursementDto {
  @IsDefined({ message: 'amount é obrigatório' })
  amount!: number | string; // aceita "1.234,56", "1234.56" ou number

  @IsOptional()
  @IsDateString({}, { message: 'reimbursedAt deve estar em formato ISO (yyyy-mm-dd)' })
  reimbursedAt?: string;

  @IsOptional()
  @IsString()
  bankAccount?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
