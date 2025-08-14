import { IsOptional, IsString, IsNumber, IsDateString, IsIn, Min } from 'class-validator';
import { Type } from 'class-transformer';

const CATEGORIES = ['TRANSPORTE', 'HOSPEDAGEM', 'ALIMENTACAO', 'OUTROS'] as const;

export class CreateTravelExpenseDto {
  @IsOptional() @IsString()
  employeeName?: string;

  @IsOptional() @IsString()
  department?: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsIn(CATEGORIES as unknown as string[])
  category?: typeof CATEGORIES[number];

  @IsOptional() @IsString()
  city?: string;

  @IsOptional() @IsString()
  state?: string;

  @IsOptional() @IsDateString()
  expenseDate?: string; // yyyy-mm-dd

  @IsOptional() @IsString()
  currency?: string; // default BRL no service/schema

  @Type(() => Number)
  @IsNumber()
  @Min(0.01, { message: 'Valor deve ser maior que zero' })
  amount!: number; // obrigatório (em reais, ex: 123.45)

  @IsOptional() @IsString()
  receiptUrl?: string;
}
