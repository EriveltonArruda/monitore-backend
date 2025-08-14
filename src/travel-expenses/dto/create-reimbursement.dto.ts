import { IsNumber, IsOptional, IsString, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReimbursementDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0.01, { message: 'Valor do reembolso deve ser maior que zero' })
  amount!: number; // em reais

  @IsOptional()
  @IsDateString()
  reimbursedAt?: string; // yyyy-mm-dd

  @IsOptional()
  @IsString()
  bankAccount?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
