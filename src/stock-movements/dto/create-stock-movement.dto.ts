import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

const allowedMovementTypes = ['ENTRADA', 'SAIDA', 'AJUSTE'];

export class CreateStockMovementDto {
  @IsInt()
  @IsPositive()
  productId: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(allowedMovementTypes)
  type: string;

  @IsInt()
  @Min(0) // Permitindo 0 para o caso de ajuste
  quantity: number;

  @IsString()
  @IsNotEmpty()
  details: string; // O antigo "motivo"

  // --- NOVOS CAMPOS ---
  @IsString()
  @IsOptional()
  relatedParty?: string; // Para Cliente ou Fornecedor

  @IsNumber()
  @IsOptional()
  @Min(0)
  unitPriceAtMovement?: number;

  @IsString()
  @IsOptional()
  notes?: string; // Para Observações

  @IsString()
  @IsOptional()
  document?: string;
  
  // Opcional, vamos assumir o usuário 1 por padrão no service
  userId?: number; 
}
