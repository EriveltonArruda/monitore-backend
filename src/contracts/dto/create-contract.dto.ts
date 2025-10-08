import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateContractDto {
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  municipalityId: number;

  @IsOptional()
  @IsInt()
  departmentId?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  monthlyValue?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  // ⬇️ agora inclui PENDENTE
  @IsOptional()
  @IsString()
  @IsIn(['ATIVO', 'ENCERRADO', 'SUSPENSO', 'PENDENTE'])
  status?: 'ATIVO' | 'ENCERRADO' | 'SUSPENSO' | 'PENDENTE';
}
