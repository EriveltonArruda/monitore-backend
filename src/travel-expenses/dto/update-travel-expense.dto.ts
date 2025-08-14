import { PartialType } from '@nestjs/mapped-types';
import { CreateTravelExpenseDto } from './create-travel-expense.dto';
import { IsIn, IsNumber, Min, IsOptional } from 'class-validator';
import { Type, Transform } from 'class-transformer';

const STATUSES = ['PENDENTE', 'PARCIAL', 'REEMBOLSADO'] as const;

export class UpdateTravelExpenseDto extends PartialType(CreateTravelExpenseDto) {
  // Se vier "", null, etc., convertemos para undefined e a validação ignora
  @IsOptional()
  @Transform(({ value }) => (value === '' || value == null ? undefined : value))
  @IsIn(STATUSES as unknown as string[], { message: 'Status inválido' })
  status?: typeof STATUSES[number];

  // Permitir troca do valor total (opcional)
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;
}
