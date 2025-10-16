// src/travel-expenses/dto/create-travel-expense.dto.ts
import { IsOptional, IsString, IsDateString, IsIn, IsDefined } from 'class-validator';

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
  currency?: string; // default 'BRL' no service/schema

  // Aceita número (ex.: 1234.56) ou string BR (ex.: "1.234,56").
  // A validação de formato/valor (> 0) é feita no service via toCentsSmart().
  @IsDefined()
  amount!: number | string;

  @IsOptional() @IsString()
  receiptUrl?: string;
}
