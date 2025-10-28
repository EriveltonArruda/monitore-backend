// src/contracts/dto/find-contracts.dto.ts
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
  municipalityId?: string | number;

  @IsOptional()
  @IsNumberString()
  departmentId?: string | number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsBooleanString()
  active?: string;

  @IsOptional()
  @IsString()
  endFrom?: string; // YYYY-MM-DD

  @IsOptional()
  @IsString()
  endTo?: string;   // YYYY-MM-DD

  @IsOptional()
  @IsNumberString()
  dueInDays?: string | number;

  @IsOptional()
  @IsBooleanString()
  expiredOnly?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc';
}
