import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateContractDto {
  @IsOptional() @IsString() code?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsInt() municipalityId?: number;
  @IsOptional() @IsInt() departmentId?: number | null; // null = disconnect
  @IsOptional() @IsDateString() startDate?: string | null;
  @IsOptional() @IsDateString() endDate?: string | null;
  @IsOptional() @IsNumber() monthlyValue?: number;
  @IsOptional() @IsBoolean() active?: boolean;

  // Novo: URL/Path do PDF do contrato
  @IsOptional()
  @IsString()
  attachmentUrl?: string | null;

  // Agora inclui PENDENTE
  @IsOptional()
  @IsString()
  @IsIn(['ATIVO', 'ENCERRADO', 'SUSPENSO', 'PENDENTE'])
  status?: 'ATIVO' | 'ENCERRADO' | 'SUSPENSO' | 'PENDENTE';
}
