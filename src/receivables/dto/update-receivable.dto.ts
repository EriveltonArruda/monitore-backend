import { IsDateString, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateReceivableDto {
  @IsOptional()
  @IsInt()
  contractId?: number;

  @IsOptional()
  @IsString()
  noteNumber?: string | null;

  @IsOptional()
  @IsDateString()
  issueDate?: string | null;

  @IsOptional()
  @IsNumber()
  grossAmount?: number | null;

  @IsOptional()
  @IsNumber()
  netAmount?: number | null;

  @IsOptional()
  @IsString()
  periodLabel?: string | null;

  @IsOptional()
  @IsDateString()
  periodStart?: string | null;

  @IsOptional()
  @IsDateString()
  periodEnd?: string | null;

  @IsOptional()
  @IsDateString()
  deliveryDate?: string | null;

  @IsOptional()
  @IsDateString()
  receivedAt?: string | null;

  @IsOptional()
  @IsString()
  status?: string;
}
