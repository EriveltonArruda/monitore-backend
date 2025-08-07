import { IsString, IsNotEmpty, IsInt, IsNumber, IsOptional, Min, IsPositive } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional() // O '?' torna o campo opcional
  sku?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsNumber()
  @Min(0)
  stockQuantity: number;

  // >>> REMOVIDO salePrice <<<

  @IsNumber()
  @IsOptional()
  @Min(0)
  costPrice?: number;

  // --- AQUI VÊM AS RELAÇÕES ---

  @IsInt()
  @IsPositive() // Garante que o ID é um número inteiro positivo
  categoryId: number;

  @IsInt()
  @IsPositive()
  @IsOptional() // Fornecedor é opcional
  supplierId?: number;
}
