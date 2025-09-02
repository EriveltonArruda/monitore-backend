// DTO de query para o relatório "Vencido / Pago / Aberto"
import { IsOptional, IsISO8601, IsIn, IsString } from 'class-validator';

export class GetPayablesStatusQueryDto {
  @IsOptional() @IsISO8601() from?: string; // YYYY-MM-DD
  @IsOptional() @IsISO8601() to?: string;   // YYYY-MM-DD

  // Filtros opcionais para alinhar com a listagem
  @IsOptional()
  @IsIn(['A_PAGAR', 'PAGO', 'VENCIDO', 'TODOS'])
  status?: string;

  @IsOptional()
  @IsString()
  category?: string; // "TODAS" = sem filtro
}
