// src/travel-expenses/dto/create-advance.dto.ts
import { IsDefined, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateAdvanceDto {
  @IsDefined({ message: 'amount é obrigatório' })
  amount!: number | string;

  @IsOptional()
  @IsDateString({}, { message: 'issuedAt deve estar em formato ISO (yyyy-mm-dd)' })
  issuedAt?: string;

  @IsOptional()
  @IsString()
  method?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
