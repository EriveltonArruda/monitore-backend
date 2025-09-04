import { IsDateString, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateReceivableDto {
  @IsInt()
  contractId: number;

  @IsOptional()
  @IsString()
  noteNumber?: string;

  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @IsOptional()
  @IsNumber()
  grossAmount?: number;

  @IsOptional()
  @IsNumber()
  netAmount?: number;

  @IsOptional()
  @IsString()
  periodLabel?: string; // "AGOSTO/2025"

  @IsOptional()
  @IsDateString()
  periodStart?: string;

  @IsOptional()
  @IsDateString()
  periodEnd?: string;

  @IsOptional()
  @IsDateString()
  deliveryDate?: string;

  @IsOptional()
  @IsDateString()
  receivedAt?: string;

  @IsOptional()
  @IsString()
  status?: string; // A_RECEBER | ATRASADO | RECEBIDO
}
