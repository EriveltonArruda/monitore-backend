// src/travel-expenses/dto/create-return.dto.ts
import { IsDefined, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateReturnDto {
  @IsDefined({ message: 'amount é obrigatório' })
  amount!: number | string;

  @IsOptional()
  @IsDateString({}, { message: 'returnedAt deve estar em formato ISO (yyyy-mm-dd)' })
  returnedAt?: string;

  @IsOptional()
  @IsString()
  method?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
