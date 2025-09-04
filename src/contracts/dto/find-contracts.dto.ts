import { IsBooleanString, IsIn, IsNumberString, IsOptional, IsString } from 'class-validator';

export class FindContractsDto {
  @IsOptional()
  @IsNumberString()
  page?: string | number;

  @IsOptional()
  @IsNumberString()
  limit?: string | number;

  @IsOptional()
  @IsNumberString()
  municipalityId?: string | number; // <— era @IsInt()

  @IsOptional()
  @IsNumberString()
  departmentId?: string | number;   // <— era @IsInt()

  @IsOptional()
  @IsString()
  search?: string;

  // 'true' | 'false'
  @IsOptional()
  @IsBooleanString()
  active?: string;

  @IsOptional()
  @IsString()
  endFrom?: string; // YYYY-MM-DD

  @IsOptional()
  @IsString()
  endTo?: string;   // YYYY-MM-DD

  // próximos X dias para vencer
  @IsOptional()
  @IsNumberString()
  dueInDays?: string | number;       // <— era @IsInt()

  // apenas expirados
  @IsOptional()
  @IsBooleanString()
  expiredOnly?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc';
}
