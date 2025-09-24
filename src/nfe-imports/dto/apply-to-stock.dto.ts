import { IsArray, IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class ApplyToStockDto {
  @IsArray()
  mappings: Array<{
    itemId: number;      // id do NfeItem
    productId: number;   // id do Product escolhido
    unitPrice?: number;  // opcional: sobrescrever preço unitário
  }>;

  @IsOptional()
  @IsNumber()
  userId?: number; // ajuste para pegar do token depois

  @IsOptional()
  @IsNumber()
  overrideAllUnitPrice?: number;

  @IsOptional()
  @IsBoolean()
  setCostPriceFromItem?: boolean;

  @IsOptional()
  @IsBoolean()
  updateProductStockMirror?: boolean;
}
